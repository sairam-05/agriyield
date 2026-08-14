import numpy as np
import pandas as pd
import os

def generate_agricultural_dataset(num_samples=6000, seed=42):
    np.random.seed(seed)
    
    crops_info = {
        'Wheat': {'base_yield': 2200, 'opt_temp': 20, 'opt_rain': 600, 'opt_ph': 6.5, 'opt_N': 120, 'opt_P': 60, 'opt_K': 40},
        'Rice': {'base_yield': 2600, 'opt_temp': 27, 'opt_rain': 1400, 'opt_ph': 6.2, 'opt_N': 140, 'opt_P': 50, 'opt_K': 50},
        'Maize': {'base_yield': 2800, 'opt_temp': 24, 'opt_rain': 800, 'opt_ph': 6.8, 'opt_N': 150, 'opt_P': 65, 'opt_K': 60},
        'Cotton': {'base_yield': 1200, 'opt_temp': 28, 'opt_rain': 750, 'opt_ph': 7.2, 'opt_N': 110, 'opt_P': 55, 'opt_K': 45},
        'Sugarcane': {'base_yield': 32000, 'opt_temp': 30, 'opt_rain': 1800, 'opt_ph': 6.8, 'opt_N': 220, 'opt_P': 80, 'opt_K': 90},
        'Soybean': {'base_yield': 1400, 'opt_temp': 25, 'opt_rain': 700, 'opt_ph': 6.6, 'opt_N': 40, 'opt_P': 60, 'opt_K': 50},
        'Tomato': {'base_yield': 14000, 'opt_temp': 23, 'opt_rain': 650, 'opt_ph': 6.5, 'opt_N': 160, 'opt_P': 90, 'opt_K': 120},
        'Potato': {'base_yield': 11000, 'opt_temp': 18, 'opt_rain': 550, 'opt_ph': 5.8, 'opt_N': 130, 'opt_P': 75, 'opt_K': 110},
        'Barley': {'base_yield': 1900, 'opt_temp': 19, 'opt_rain': 500, 'opt_ph': 7.0, 'opt_N': 90, 'opt_P': 45, 'opt_K': 35},
        'Chickpea': {'base_yield': 1100, 'opt_temp': 22, 'opt_rain': 450, 'opt_ph': 7.5, 'opt_N': 25, 'opt_P': 50, 'opt_K': 30},
        'Groundnut': {'base_yield': 1600, 'opt_temp': 26, 'opt_rain': 600, 'opt_ph': 6.5, 'opt_N': 30, 'opt_P': 50, 'opt_K': 45},
        'Coffee': {'base_yield': 900, 'opt_temp': 21, 'opt_rain': 1600, 'opt_ph': 6.0, 'opt_N': 150, 'opt_P': 40, 'opt_K': 120},
        'Tea': {'base_yield': 1100, 'opt_temp': 20, 'opt_rain': 1800, 'opt_ph': 5.2, 'opt_N': 140, 'opt_P': 35, 'opt_K': 70},
        'Onion': {'base_yield': 9500, 'opt_temp': 20, 'opt_rain': 650, 'opt_ph': 6.8, 'opt_N': 100, 'opt_P': 50, 'opt_K': 80},
        'Garlic': {'base_yield': 5200, 'opt_temp': 18, 'opt_rain': 550, 'opt_ph': 6.6, 'opt_N': 90, 'opt_P': 45, 'opt_K': 60},
        'Mustard': {'base_yield': 1350, 'opt_temp': 19, 'opt_rain': 400, 'opt_ph': 7.0, 'opt_N': 80, 'opt_P': 40, 'opt_K': 30},
        'Sunflower': {'base_yield': 1500, 'opt_temp': 25, 'opt_rain': 600, 'opt_ph': 6.8, 'opt_N': 90, 'opt_P': 60, 'opt_K': 40},
        'Apple': {'base_yield': 8500, 'opt_temp': 15, 'opt_rain': 800, 'opt_ph': 6.2, 'opt_N': 100, 'opt_P': 40, 'opt_K': 100},
        'Banana': {'base_yield': 28000, 'opt_temp': 27, 'opt_rain': 1700, 'opt_ph': 6.5, 'opt_N': 200, 'opt_P': 60, 'opt_K': 250},
        'Watermelon': {'base_yield': 16000, 'opt_temp': 28, 'opt_rain': 500, 'opt_ph': 6.8, 'opt_N': 110, 'opt_P': 70, 'opt_K': 100}
    }
    
    soil_types = ['Loam', 'Clay Loam', 'Alluvial', 'Black Soil', 'Red Soil', 'Sandy Loam', 'Peaty', 'Saline', 'Silt Loam', 'Laterite']
    irrigation_levels = ['Low', 'Medium', 'High']
    years = [2020, 2021, 2022, 2023, 2024, 2025, 2026]
    
    records = []
    crops_list = list(crops_info.keys())
    
    for _ in range(num_samples):
        crop = np.random.choice(crops_list)
        info = crops_info[crop]
        
        soil_type = np.random.choice(soil_types)
        irrigation = np.random.choice(irrigation_levels)
        year = int(np.random.choice(years))
        
        ph = round(np.random.uniform(4.5, 8.8), 2)
        N = max(10, int(np.random.normal(info['opt_N'], 35)))
        P = max(10, int(np.random.normal(info['opt_P'], 25)))
        K = max(10, int(np.random.normal(info['opt_K'], 25)))
        
        temperature = round(np.random.uniform(10.0, 40.0), 1)
        rainfall = max(150, int(np.random.normal(info['opt_rain'], 350)))
        humidity = round(np.random.uniform(30.0, 95.0), 1)
        sunshine_hours = round(np.random.uniform(4.0, 12.0), 1)
        
        # Agronomic yield logic
        temp_diff = abs(temperature - info['opt_temp'])
        temp_factor = max(0.4, 1.0 - 0.025 * (temp_diff ** 1.3))
        
        ph_diff = abs(ph - info['opt_ph'])
        ph_factor = max(0.5, 1.0 - 0.25 * (ph_diff ** 1.5))
        
        irr_bonus = {'Low': 0.85, 'Medium': 1.0, 'High': 1.12}[irrigation]
        effective_water = rainfall * irr_bonus
        water_ratio = effective_water / info['opt_rain']
        if water_ratio < 1.0:
            water_factor = max(0.4, water_ratio ** 0.8)
        else:
            water_factor = max(0.6, 1.0 - 0.15 * (water_ratio - 1.0))
            
        n_fac = min(1.15, (N / info['opt_N']) ** 0.5)
        p_fac = min(1.12, (P / info['opt_P']) ** 0.4)
        k_fac = min(1.10, (K / info['opt_K']) ** 0.4)
        npk_factor = min(n_fac, p_fac, k_fac) * 0.7 + (n_fac + p_fac + k_fac) / 3 * 0.3
        
        soil_mult = {
            'Loam': 1.05, 'Clay Loam': 1.02, 'Alluvial': 1.08,
            'Black Soil': 1.00, 'Red Soil': 0.92, 'Sandy Loam': 0.88,
            'Peaty': 0.95, 'Saline': 0.75, 'Silt Loam': 1.04, 'Laterite': 0.85
        }[soil_type]
        
        sun_factor = min(1.1, max(0.8, sunshine_hours / 8.0))
        
        # Slight technological yield progression over years (2020 to 2026)
        year_trend = 1.0 + (year - 2020) * 0.012
        
        calculated_yield = info['base_yield'] * temp_factor * ph_factor * water_factor * npk_factor * soil_mult * sun_factor * year_trend
        noise = np.random.normal(1.0, 0.06)
        yield_kg_acre = max(80.0, round(calculated_yield * noise, 2))
        yield_tons_ha = round(yield_kg_acre * 0.00247105, 3)
        
        records.append({
            'year': year,
            'crop_type': crop,
            'soil_type': soil_type,
            'soil_ph': ph,
            'nitrogen': N,
            'phosphorus': P,
            'potassium': K,
            'temperature': temperature,
            'rainfall': rainfall,
            'humidity': humidity,
            'irrigation_level': irrigation,
            'sunshine_hours': sunshine_hours,
            'yield_kg_acre': yield_kg_acre,
            'yield_tons_ha': yield_tons_ha
        })
        
    df = pd.DataFrame(records)
    
    os.makedirs('ml/data', exist_ok=True)
    df.to_csv('ml/data/dataset.csv', index=False)
    print(f"Generated enhanced dataset with {len(df)} samples across years 2020-2026 at ml/data/dataset.csv")

if __name__ == '__main__':
    generate_agricultural_dataset()
