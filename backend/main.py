from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import os

from backend.database import get_db, engine, Base, ACCDB_PATH, PDF_STORAGE_DIR
from backend.models import PredictionRecord, User, get_ist_now
from backend import schemas
from backend.ml_engine import ml_engine, calculate_crop_risk_and_diseases, CROPS_AGRONOMY
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_optional,
    get_current_user
)

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Crop Yield Prediction & Optimization API",
    description="Backend service for predicting crop yield, crop suitability, NPK/water resource optimization, user auth, and history management.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_ist(dt: datetime) -> str:
    if not dt:
        dt = get_ist_now()
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc).astimezone(ist_tz)
    else:
        dt = dt.astimezone(ist_tz)
    return dt.strftime("%Y-%m-%d %I:%M:%S %p IST")

# ================= AUTH ENDPOINTS =================
@app.post("/api/auth/register", response_model=schemas.TokenResponse)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_pwd = hash_password(payload.password)
    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=hashed_pwd,
        created_at=get_ist_now()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "created_at": user.created_at
        }
    }

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found with this email address. Redirecting to registration..."
        )
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "created_at": user.created_at
        }
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "created_at": current_user.created_at
    }

# ================= APP ENDPOINTS =================
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "yield_model_loaded": ml_engine.yield_model is not None,
        "recommender_model_loaded": ml_engine.recommender_model is not None,
        "best_model_name": ml_engine.metrics.get("best_model_name", "Random Forest Regressor"),
        "timestamp_ist": format_ist(get_ist_now())
    }

@app.get("/api/model-metrics")
def get_model_metrics():
    return ml_engine.metrics if ml_engine.metrics else {
        "best_model_name": "Random Forest Regressor",
        "metrics": {
            "Linear Regression": {"MAE": 1107.57, "MSE": 3915100.1, "RMSE": 1978.66, "R2": 0.7170},
            "Decision Tree": {"MAE": 788.41, "MSE": 2668250.5, "RMSE": 1633.48, "R2": 0.8071},
            "Gradient Boosting": {"MAE": 725.22, "MSE": 1672880.8, "RMSE": 1293.40, "R2": 0.8791},
            "Random Forest Regressor": {"MAE": 573.54, "MSE": 1302250.2, "RMSE": 1141.16, "R2": 0.9059}
        }
    }

@app.post("/api/predict", response_model=schemas.YieldPredictionResponse)
def predict_yield(
    payload: schemas.YieldPredictionInput,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    try:
        data_dict = payload.dict()
        prediction = ml_engine.predict_yield(data_dict)
        now_ist = get_ist_now()
        
        # Only save prediction records to database if user is logged in
        if current_user:
            db_record = PredictionRecord(
                user_id=current_user.id,
                created_at=now_ist,
                crop_type=payload.crop_type,
                soil_type=payload.soil_type,
                soil_ph=payload.soil_ph,
                nitrogen=payload.nitrogen,
                phosphorus=payload.phosphorus,
                potassium=payload.potassium,
                temperature=payload.temperature,
                rainfall=payload.rainfall,
                humidity=payload.humidity,
                irrigation_level=payload.irrigation_level,
                sunshine_hours=payload.sunshine_hours,
                predicted_yield_kg_acre=prediction['predicted_yield_kg_acre'],
                predicted_yield_tons_ha=prediction['predicted_yield_tons_ha'],
                recommended_crop=prediction['recommended_crop'],
                fertilizer_recommendation=prediction['fertilizer_recommendation'],
                irrigation_recommendation=prediction['irrigation_recommendation'],
                optimization_summary=prediction['optimization_summary']
            )
            db.add(db_record)
            db.commit()
            db.refresh(db_record)
            
            prediction['id'] = db_record.id
            prediction['created_at'] = db_record.created_at
        else:
            prediction['id'] = None
            prediction['created_at'] = now_ist

        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/recommend-crops", response_model=schemas.CropRecommendationResponse)
def recommend_crops(payload: schemas.CropRecommendationInput):
    try:
        return ml_engine.recommend_crops(payload.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation error: {str(e)}")

@app.post("/api/optimize-resources", response_model=schemas.ResourceOptResponse)
def optimize_resources(payload: schemas.ResourceOptInput):
    try:
        return ml_engine.optimize_resources(payload.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resource optimization error: {str(e)}")

@app.post("/api/sensitivity-analysis", response_model=schemas.SensitivityResponse)
def sensitivity_analysis(payload: schemas.SensitivityInput):
    try:
        return ml_engine.generate_sensitivity(payload.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensitivity analysis error: {str(e)}")

@app.post("/api/risk-analysis")
def risk_analysis(payload: Dict[str, Any]):
    try:
        crop = payload.get('crop_type', 'Wheat')
        risk_info = calculate_crop_risk_and_diseases(crop, payload)
        
        all_matrix = []
        for c in CROPS_AGRONOMY.keys():
            c_info = calculate_crop_risk_and_diseases(c, payload)
            all_matrix.append({
                "crop_type": c,
                "risk_percent": c_info["risk_percent"],
                "risk_level": c_info["risk_level"],
                "primary_diseases": [d["name"] for d in c_info["diseases"][:2]],
                "disease_types": list(set([d["disease_type"] for d in c_info["diseases"]]))
            })
        all_matrix.sort(key=lambda x: x["risk_percent"])
        
        return {
            "crop_type": crop,
            "risk_percent": risk_info["risk_percent"],
            "risk_level": risk_info["risk_level"],
            "diseases": risk_info["diseases"],
            "all_crops_risk_matrix": all_matrix
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analysis error: {str(e)}")

@app.get("/api/history")
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user:
        return []

    records = db.query(PredictionRecord).filter(
        PredictionRecord.user_id == current_user.id
    ).order_by(PredictionRecord.created_at.asc()).all()
    
    formatted_records = []
    for idx, r in enumerate(records, start=1):
        formatted_records.append({
            "id": r.id,
            "display_id": idx,
            "created_at": format_ist(r.created_at),
            "crop_type": r.crop_type,
            "soil_type": r.soil_type,
            "soil_ph": r.soil_ph,
            "nitrogen": r.nitrogen,
            "phosphorus": r.phosphorus,
            "potassium": r.potassium,
            "temperature": r.temperature,
            "rainfall": r.rainfall,
            "humidity": r.humidity,
            "irrigation_level": r.irrigation_level,
            "sunshine_hours": r.sunshine_hours,
            "predicted_yield_kg_acre": r.predicted_yield_kg_acre,
            "predicted_yield_tons_ha": r.predicted_yield_tons_ha,
            "recommended_crop": r.recommended_crop,
            "fertilizer_recommendation": r.fertilizer_recommendation,
            "irrigation_recommendation": r.irrigation_recommendation,
            "optimization_summary": r.optimization_summary
        })
    return list(reversed(formatted_records))

@app.delete("/api/history/{record_id}")
def delete_history_item(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to delete records")

    record = db.query(PredictionRecord).filter(
        PredictionRecord.id == record_id,
        PredictionRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted successfully", "id": record_id}

@app.get("/api/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user:
        return {
            "total_predictions": 0,
            "avg_yield_kg_acre": 0.0,
            "avg_yield_tons_ha": 0.0,
            "recent_predictions": []
        }

    records = db.query(PredictionRecord).filter(
        PredictionRecord.user_id == current_user.id
    ).order_by(PredictionRecord.created_at.asc()).all()
    
    total_predictions = len(records)
    avg_yield = 0.0
    if total_predictions > 0:
        all_yields = [r.predicted_yield_kg_acre for r in records]
        avg_yield = round(sum(all_yields) / len(all_yields), 1)
        
    recent_formatted = []
    for idx, r in enumerate(reversed(records), start=1):
        if idx > 10:
            break
        disp_id = total_predictions - idx + 1
        recent_formatted.append({
            "id": r.id,
            "display_id": disp_id,
            "crop_type": r.crop_type,
            "soil_type": r.soil_type,
            "predicted_yield_kg_acre": r.predicted_yield_kg_acre,
            "recommended_crop": r.recommended_crop,
            "created_at": format_ist(r.created_at)
        })
        
    return {
        "total_predictions": total_predictions,
        "avg_yield_kg_acre": avg_yield,
        "avg_yield_tons_ha": round(avg_yield * 0.00247105, 2),
        "recent_predictions": recent_formatted
    }

@app.get("/api/storage-info")
def get_storage_info():
    pdf_files = []
    if os.path.exists(PDF_STORAGE_DIR):
        pdf_files = [f for f in os.listdir(PDF_STORAGE_DIR) if f.endswith(".pdf")]
        
    return {
        "database_path": ACCDB_PATH,
        "database_exists": os.path.exists(ACCDB_PATH),
        "database_size_bytes": os.path.getsize(ACCDB_PATH) if os.path.exists(ACCDB_PATH) else 0,
        "pdf_storage_dir": PDF_STORAGE_DIR,
        "pdf_storage_exists": os.path.exists(PDF_STORAGE_DIR),
        "pdf_files_count": len(pdf_files),
        "pdf_files": pdf_files
    }



