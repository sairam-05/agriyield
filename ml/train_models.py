import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier

def train_and_evaluate_models():
    dataset_path = 'ml/data/dataset.csv'
    if not os.path.exists(dataset_path):
        from generate_dataset import generate_agricultural_dataset
        generate_agricultural_dataset()
        
    df = pd.read_csv(dataset_path)
    
    # Feature columns and targets
    feature_cols = [
        'year', 'crop_type', 'soil_type', 'soil_ph', 'nitrogen', 'phosphorus',
        'potassium', 'temperature', 'rainfall', 'humidity',
        'irrigation_level', 'sunshine_hours'
    ]
    target_col = 'yield_kg_acre'
    
    X = df[feature_cols]
    y = df[target_col]
    
    categorical_cols = ['crop_type', 'soil_type', 'irrigation_level']
    numerical_cols = ['year', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'rainfall', 'humidity', 'sunshine_hours']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ]
    )
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        'Linear Regression': LinearRegression(),
        'Decision Tree': DecisionTreeRegressor(random_state=42, max_depth=12),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
    }
    
    results = {}
    fitted_pipelines = {}
    best_model_name = None
    best_r2 = -float('inf')
    
    for name, model in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))
        
        results[name] = {
            'MAE': round(mae, 2),
            'MSE': round(mse, 2),
            'RMSE': round(rmse, 2),
            'R2': round(r2, 4)
        }
        fitted_pipelines[name] = pipeline
        
        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name
            
    print("Model Evaluation Results:")
    for name, metrics in results.items():
        print(f" - {name}: R2={metrics['R2']}, RMSE={metrics['RMSE']}, MAE={metrics['MAE']}")
    print(f"\nBest Model Selected: {best_model_name} (R2={best_r2:.4f})")
    
    os.makedirs('ml/models', exist_ok=True)
    best_pipeline = fitted_pipelines[best_model_name]
    joblib.dump(best_pipeline, 'ml/models/best_crop_yield_model.pkl')
    
    metadata = {
        'best_model_name': best_model_name,
        'metrics': results,
        'feature_columns': feature_cols,
        'categorical_columns': categorical_cols,
        'numerical_columns': numerical_cols
    }
    
    with open('ml/models/metrics.json', 'w') as f:
        json.dump(metadata, f, indent=4)
        
    # Crop Recommendation Classifier
    X_rec = df[['year', 'soil_type', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'rainfall', 'humidity', 'sunshine_hours']]
    y_rec = df['crop_type']
    
    rec_preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), ['year', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'rainfall', 'humidity', 'sunshine_hours']),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), ['soil_type'])
        ]
    )
    
    rec_pipeline = Pipeline(steps=[
        ('preprocessor', rec_preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    rec_pipeline.fit(X_rec, y_rec)
    
    joblib.dump(rec_pipeline, 'ml/models/crop_recommender.pkl')
    print("Crop Recommender Classifier saved.")

if __name__ == '__main__':
    train_and_evaluate_models()
