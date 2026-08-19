from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class YieldPredictionInput(BaseModel):
    crop_type: str = Field(..., example="Wheat")
    is_seasonal_crop: Optional[str] = Field("Yes", example="Yes")
    soil_type: str = Field(..., example="Loam")
    soil_ph: float = Field(..., ge=3.5, le=10.0, example=6.5)
    nitrogen: float = Field(..., ge=0.0, le=500.0, example=120.0)
    phosphorus: float = Field(..., ge=0.0, le=300.0, example=60.0)
    potassium: float = Field(..., ge=0.0, le=300.0, example=40.0)
    temperature: float = Field(..., ge=-10.0, le=60.0, example=22.5)
    rainfall: float = Field(..., ge=0.0, le=5000.0, example=650.0)
    humidity: float = Field(..., ge=0.0, le=100.0, example=65.0)
    irrigation_level: Optional[str] = Field("Medium", example="Medium")
    sunshine_hours: Optional[float] = Field(8.0, ge=0.0, le=24.0, example=8.0)

class DiseaseDetail(BaseModel):
    name: str
    disease_type: str
    probability_percent: float
    risk_level: str
    symptoms: str
    organic_solution: str
    chemical_solution: str

class CropRiskItem(BaseModel):
    crop_type: str
    risk_percent: float
    risk_level: str
    primary_diseases: List[str]
    disease_types: List[str]

class YieldPredictionResponse(BaseModel):
    id: Optional[int] = None
    display_id: Optional[int] = None
    crop_type: str
    predicted_yield_kg_acre: float
    predicted_yield_tons_ha: float
    target_crop_match_score: Optional[float] = None
    is_temperature_suitable: Optional[bool] = True
    temperature_warning: Optional[str] = None
    target_crop_risk_percent: Optional[float] = None
    target_crop_risk_level: Optional[str] = None
    target_crop_diseases: Optional[List[DiseaseDetail]] = None
    target_crop_water_req_l_acre: Optional[float] = None
    target_crop_water_req_l_ha: Optional[float] = None
    target_crop_water_req_mm: Optional[float] = None
    target_crop_duration_days: Optional[str] = None
    target_crop_season_type: Optional[str] = None
    target_crop_season_name: Optional[str] = None
    seasonality_impact_note: Optional[str] = None
    market_price_inr_kg: Optional[float] = None
    estimated_gross_income_inr: Optional[float] = None
    recommended_crop: str
    recommended_crop_yield_kg_acre: Optional[float] = None
    recommended_crop_market_price_inr_kg: Optional[float] = None
    recommended_crop_income_inr: Optional[float] = None
    recommended_crop_water_req_l_acre: Optional[float] = None
    recommended_crop_water_req_l_ha: Optional[float] = None
    recommended_crop_water_req_mm: Optional[float] = None
    recommended_crop_duration_days: Optional[str] = None
    recommended_crop_risk_percent: Optional[float] = None
    recommended_crop_risk_level: Optional[str] = None
    recommended_crop_diseases: Optional[List[DiseaseDetail]] = None
    confidence_score: float
    fertilizer_recommendation: str
    irrigation_recommendation: str
    optimization_summary: str
    factor_impacts: Dict[str, str]
    npk_analysis: Optional[Dict[str, Any]] = None
    all_crops_risk_matrix: Optional[List[CropRiskItem]] = None
    created_at: Optional[datetime] = None

class CropRecommendationInput(BaseModel):
    soil_type: str = Field(..., example="Loam")
    soil_ph: float = Field(..., ge=3.5, le=10.0, example=6.5)
    nitrogen: float = Field(..., ge=0.0, le=500.0, example=100.0)
    phosphorus: float = Field(..., ge=0.0, le=300.0, example=50.0)
    potassium: float = Field(..., ge=0.0, le=300.0, example=40.0)
    temperature: float = Field(..., ge=-10.0, le=60.0, example=24.0)
    rainfall: float = Field(..., ge=0.0, le=5000.0, example=700.0)
    humidity: float = Field(..., ge=0.0, le=100.0, example=60.0)
    sunshine_hours: float = Field(..., ge=0.0, le=24.0, example=8.0)

class CropSuitabilityItem(BaseModel):
    crop_type: str
    suitability_score: float
    expected_yield_kg_acre: float
    reasons: List[str]

class CropRecommendationResponse(BaseModel):
    top_recommended: str
    recommendations: List[CropSuitabilityItem]

class ResourceOptInput(BaseModel):
    crop_type: str
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    rainfall: float
    irrigation_level: str

class NPKAnalysis(BaseModel):
    element: str
    current: float
    optimal: float
    status: str
    recommendation: str

class WaterAnalysis(BaseModel):
    current_water_estimate: float
    crop_water_requirement: float
    status: str
    recommendation: str

class ResourceOptResponse(BaseModel):
    crop_type: str
    npk_analysis: List[NPKAnalysis]
    water_analysis: WaterAnalysis
    potential_yield_increase_percent: float
    sustainability_rating: str

class SensitivityInput(BaseModel):
    crop_type: str
    soil_type: str
    soil_ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    rainfall: float
    humidity: float
    irrigation_level: str
    sunshine_hours: float
    variable_name: str

class SensitivityDataPoint(BaseModel):
    value: float
    predicted_yield: float

class SensitivityResponse(BaseModel):
    variable_name: str
    crop_type: str
    points: List[SensitivityDataPoint]

# Authentication Schemas
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, example="John Farmer")
    email: str = Field(..., example="john@example.com")
    password: str = Field(..., min_length=6, example="secret123")

class UserLogin(BaseModel):
    email: str = Field(..., example="john@example.com")
    password: str = Field(..., example="secret123")

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

