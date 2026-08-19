import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "models")
YIELD_MODEL_PATH = os.path.join(MODELS_DIR, "best_crop_yield_model.pkl")
RECOMMENDER_MODEL_PATH = os.path.join(MODELS_DIR, "crop_recommender.pkl")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")

# Standard Crop Agronomic Profiles (20 Crop Types)
CROPS_AGRONOMY = {
    'Wheat': {'base_yield': 2200, 'opt_temp': 20, 'opt_rain': 600, 'opt_ph': 6.5, 'opt_N': 120, 'opt_P': 60, 'opt_K': 40, 'price_inr_kg': 22.75, 'duration_days': '120 - 135 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi (Winter Season)'},
    'Rice': {'base_yield': 2600, 'opt_temp': 27, 'opt_rain': 1400, 'opt_ph': 6.2, 'opt_N': 140, 'opt_P': 50, 'opt_K': 50, 'price_inr_kg': 23.00, 'duration_days': '120 - 150 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Kharif (Monsoon Season)'},
    'Maize': {'base_yield': 2800, 'opt_temp': 24, 'opt_rain': 800, 'opt_ph': 6.8, 'opt_N': 150, 'opt_P': 65, 'opt_K': 60, 'price_inr_kg': 20.90, 'duration_days': '90 - 110 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Kharif / Rabi Season'},
    'Cotton': {'base_yield': 1200, 'opt_temp': 28, 'opt_rain': 750, 'opt_ph': 7.2, 'opt_N': 110, 'opt_P': 55, 'opt_K': 45, 'price_inr_kg': 71.20, 'duration_days': '150 - 180 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Kharif (Monsoon Season)'},
    'Sugarcane': {'base_yield': 32000, 'opt_temp': 30, 'opt_rain': 1800, 'opt_ph': 6.8, 'opt_N': 220, 'opt_P': 80, 'opt_K': 90, 'price_inr_kg': 3.40, 'duration_days': '300 - 360 Days', 'season_type': 'Perennial Crop', 'season_name': 'Perennial (Annual Crop)'},
    'Soybean': {'base_yield': 1400, 'opt_temp': 25, 'opt_rain': 700, 'opt_ph': 6.6, 'opt_N': 40, 'opt_P': 60, 'opt_K': 50, 'price_inr_kg': 48.92, 'duration_days': '90 - 110 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Kharif (Monsoon Season)'},
    'Tomato': {'base_yield': 14000, 'opt_temp': 23, 'opt_rain': 650, 'opt_ph': 6.5, 'opt_N': 160, 'opt_P': 90, 'opt_K': 120, 'price_inr_kg': 18.00, 'duration_days': '90 - 120 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi / Kharif Season'},
    'Potato': {'base_yield': 11000, 'opt_temp': 18, 'opt_rain': 550, 'opt_ph': 5.8, 'opt_N': 130, 'opt_P': 75, 'opt_K': 110, 'price_inr_kg': 15.00, 'duration_days': '80 - 100 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi (Winter Season)'},
    'Barley': {'base_yield': 1900, 'opt_temp': 19, 'opt_rain': 500, 'opt_ph': 7.0, 'opt_N': 90, 'opt_P': 45, 'opt_K': 35, 'price_inr_kg': 18.50, 'duration_days': '100 - 120 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi (Winter Season)'},
    'Chickpea': {'base_yield': 1100, 'opt_temp': 22, 'opt_rain': 450, 'opt_ph': 7.5, 'opt_N': 25, 'opt_P': 50, 'opt_K': 30, 'price_inr_kg': 54.40, 'duration_days': '100 - 120 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi (Winter Season)'},
    'Groundnut': {'base_yield': 1600, 'opt_temp': 26, 'opt_rain': 600, 'opt_ph': 6.5, 'opt_N': 30, 'opt_P': 50, 'opt_K': 45, 'price_inr_kg': 67.80, 'duration_days': '100 - 130 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Kharif (Monsoon Season)'},
    'Coffee': {'base_yield': 900, 'opt_temp': 21, 'opt_rain': 1600, 'opt_ph': 6.0, 'opt_N': 150, 'opt_P': 40, 'opt_K': 120, 'price_inr_kg': 210.00, 'duration_days': '240 - 300 Days', 'season_type': 'Perennial Plantation', 'season_name': 'Perennial (Year-Round)'},
    'Tea': {'base_yield': 1100, 'opt_temp': 20, 'opt_rain': 1800, 'opt_ph': 5.2, 'opt_N': 140, 'opt_P': 35, 'opt_K': 70, 'price_inr_kg': 180.00, 'duration_days': '180 - 240 Days', 'season_type': 'Perennial Plantation', 'season_name': 'Perennial (Year-Round)'},
    'Onion': {'base_yield': 9500, 'opt_temp': 20, 'opt_rain': 650, 'opt_ph': 6.8, 'opt_N': 100, 'opt_P': 50, 'opt_K': 80, 'price_inr_kg': 22.00, 'duration_days': '120 - 150 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi / Late Kharif'},
    'Garlic': {'base_yield': 5200, 'opt_temp': 18, 'opt_rain': 550, 'opt_ph': 6.6, 'opt_N': 90, 'opt_P': 45, 'opt_K': 60, 'price_inr_kg': 120.00, 'duration_days': '130 - 150 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi (Winter Season)'},
    'Mustard': {'base_yield': 1350, 'opt_temp': 19, 'opt_rain': 400, 'opt_ph': 7.0, 'opt_N': 80, 'opt_P': 40, 'opt_K': 30, 'price_inr_kg': 56.50, 'duration_days': '100 - 115 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Rabi (Winter Season)'},
    'Sunflower': {'base_yield': 1500, 'opt_temp': 25, 'opt_rain': 600, 'opt_ph': 6.8, 'opt_N': 90, 'opt_P': 60, 'opt_K': 40, 'price_inr_kg': 72.80, 'duration_days': '90 - 105 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Zaid / Rabi Season'},
    'Apple': {'base_yield': 8500, 'opt_temp': 15, 'opt_rain': 800, 'opt_ph': 6.2, 'opt_N': 100, 'opt_P': 40, 'opt_K': 100, 'price_inr_kg': 65.00, 'duration_days': '150 - 180 Days', 'season_type': 'Perennial Fruit Tree', 'season_name': 'Perennial (Horticultural)'},
    'Banana': {'base_yield': 28000, 'opt_temp': 27, 'opt_rain': 1700, 'opt_ph': 6.5, 'opt_N': 200, 'opt_P': 60, 'opt_K': 250, 'price_inr_kg': 16.00, 'duration_days': '300 - 365 Days', 'season_type': 'Perennial Crop', 'season_name': 'Perennial (Year-Round)'},
    'Watermelon': {'base_yield': 16000, 'opt_temp': 28, 'opt_rain': 500, 'opt_ph': 6.8, 'opt_N': 110, 'opt_P': 70, 'opt_K': 100, 'price_inr_kg': 12.00, 'duration_days': '80 - 100 Days', 'season_type': 'Seasonal Crop', 'season_name': 'Zaid (Summer Season)'}
}

SOIL_TYPES_LIST = ['Loam', 'Clay Loam', 'Alluvial', 'Black Soil', 'Red Soil', 'Sandy Loam', 'Peaty', 'Saline', 'Silt Loam', 'Laterite']

# Disease & Risk Knowledge Base for 20 Crops
CROP_DISEASES_DATABASE = {
    'Wheat': [
        {
            'name': 'Yellow Rust (Puccinia striiformis)',
            'disease_type': 'Fungal Rust',
            'base_prob': 18.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': False,
            'symptoms': 'Bright yellow pustules forming linear stripes along leaf veins.',
            'organic_solution': 'Spray Neem oil extract (5ml/L) and ensure wide row spacing for canopy aeration.',
            'chemical_solution': 'Apply Propiconazole 25% EC @ 1ml/L water or Tebuconazole @ 1.5ml/L at first symptom.'
        },
        {
            'name': 'Powdery Mildew (Blumeria graminis)',
            'disease_type': 'Powdery Mildew',
            'base_prob': 15.0, 'humidity_sensitive': True, 'temp_sensitive': False, 'moisture_sensitive': False,
            'symptoms': 'White powdery fungal patches appearing on lower leaves and stems.',
            'organic_solution': 'Foliar spray of Potassium Bicarbonate (3g/L) or diluted milk whey solution.',
            'chemical_solution': 'Apply Hexaconazole 5% EC @ 2ml/L or Wettable Sulphur 80% WP @ 3g/L.'
        }
    ],
    'Rice': [
        {
            'name': 'Rice Blast (Magnaporthe oryzae)',
            'disease_type': 'Fungal Blast / Neck Rot',
            'base_prob': 22.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Spindle-shaped lesions with grey centers on leaves and neck rot on panicles.',
            'organic_solution': 'Apply Pseudomonas fluorescens bio-fungicide @ 10g/L and avoid excess nitrogen.',
            'chemical_solution': 'Foliar spray of Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L.'
        },
        {
            'name': 'Bacterial Leaf Blight (Xanthomonas oryzae)',
            'disease_type': 'Bacterial Blight',
            'base_prob': 19.0, 'humidity_sensitive': True, 'temp_sensitive': False, 'moisture_sensitive': True,
            'symptoms': 'Water-soaked wavy yellowish lesions starting from leaf tips.',
            'organic_solution': 'Spray Fresh Cow Dung Extract filtrate (5%) or Neem cake soil incorporation.',
            'chemical_solution': 'Spray Copper Oxychloride 50% WP @ 2.5g/L mixed with Streptocycline @ 6g per 60L water.'
        }
    ],
    'Maize': [
        {
            'name': 'Northern Corn Leaf Blight (Exserohilum turcicum)',
            'disease_type': 'Fungal Leaf Blight',
            'base_prob': 17.0, 'humidity_sensitive': True, 'temp_sensitive': False, 'moisture_sensitive': True,
            'symptoms': 'Long elliptical greyish-green lesions on leaves.',
            'organic_solution': 'Incorporate Trichoderma viride into soil and rotate with leguminous crops.',
            'chemical_solution': 'Spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin @ 1ml/L at early infection stage.'
        },
        {
            'name': 'Charcoal Stalk Rot (Macrophomina phaseolina)',
            'disease_type': 'Fungal Stalk Rot',
            'base_prob': 14.0, 'humidity_sensitive': False, 'temp_sensitive': True, 'moisture_sensitive': False,
            'symptoms': 'Internal stalk disintegration with minute black sclerotia inside pith.',
            'organic_solution': 'Apply bio-agent Trichoderma harzianum @ 5kg/ha blended with FYM.',
            'chemical_solution': 'Seed treatment with Carbendazim 50% WP @ 2g/kg seed before sowing.'
        }
    ],
    'Cotton': [
        {
            'name': 'Fusarium Wilt (Fusarium oxysporum)',
            'disease_type': 'Vascular Wilt',
            'base_prob': 20.0, 'humidity_sensitive': False, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Yellowing and drooping of leaves with brown vascular discoloration in stems.',
            'organic_solution': 'Soil drenching with Trichoderma viride and farmyard manure soil enrichment.',
            'chemical_solution': 'Soil drench with Carbendazim 12% + Mancozeb 63% WP @ 2g/L water.'
        },
        {
            'name': 'Cotton Leaf Curl Virus (CLCuV)',
            'disease_type': 'Viral Leaf Curl',
            'base_prob': 16.0, 'humidity_sensitive': False, 'temp_sensitive': True, 'moisture_sensitive': False,
            'symptoms': 'Upward curling of leaf margins and enation on lower leaf surface.',
            'organic_solution': 'Control whitefly vector using yellow sticky traps and Neem seed kernel extract (5%).',
            'chemical_solution': 'Spray Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.2g/L.'
        }
    ],
    'Sugarcane': [
        {
            'name': 'Red Rot (Colletotrichum falcatum)',
            'disease_type': 'Fungal Stalk Rot',
            'base_prob': 25.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Reddening of internal stalk tissue with transverse white patches and alcohol odor.',
            'organic_solution': 'Hot water sett treatment at 50°C for 2 hours before planting.',
            'chemical_solution': 'Dipper sett treatment in Carbendazim 50% WP @ 1g/L for 15 minutes.'
        },
        {
            'name': 'Sugarcane Smut (Sporisorium scitamineum)',
            'disease_type': 'Fungal Smut',
            'base_prob': 18.0, 'humidity_sensitive': False, 'temp_sensitive': True, 'moisture_sensitive': False,
            'symptoms': 'Black whip-like structure emerging from apex of infected canes.',
            'organic_solution': 'Rogue out infected smut whips using plastic bags to avoid spore dispersal.',
            'chemical_solution': 'Spray Propiconazole 25% EC @ 1ml/L on standing cane canopy.'
        }
    ],
    'Soybean': [
        {
            'name': 'Soybean Rust (Phakopsora pachyrhizi)',
            'disease_type': 'Fungal Rust',
            'base_prob': 21.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Tan to reddish-brown lesions with pustules on underside of lower leaves.',
            'organic_solution': 'Spray bio-control agent Bacillus subtilis @ 5g/L at flowering.',
            'chemical_solution': 'Spray Hexaconazole 5% EC @ 1ml/L or Tebuconazole + Trifloxystrobin @ 0.7g/L.'
        }
    ],
    'Tomato': [
        {
            'name': 'Early Blight (Alternaria solani)',
            'disease_type': 'Fungal Blight',
            'base_prob': 24.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Concentric target-board ring dark spots on older leaves.',
            'organic_solution': 'Spray Copper Sulfate + Lime (Bordeaux mixture 1%) or Neem oil (5ml/L).',
            'chemical_solution': 'Spray Chlorothalonil 75% WP @ 2g/L or Mancozeb @ 2.5g/L.'
        },
        {
            'name': 'Late Blight (Phytophthora infestans)',
            'disease_type': 'Fungal Blight',
            'base_prob': 22.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Water-soaked dark brown spots with white fungal mold under leaves.',
            'organic_solution': 'Prune lower leaves for ground aeration and spray Trichoderma harzianum.',
            'chemical_solution': 'Spray Cymoxanil + Mancozeb @ 2g/L or Metalaxyl + Mancozeb @ 2.5g/L.'
        }
    ],
    'Potato': [
        {
            'name': 'Potato Late Blight (Phytophthora infestans)',
            'disease_type': 'Fungal Mildew & Blight',
            'base_prob': 26.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Rapid blackening of foliage with fuzzy white mildew growth beneath wet leaves.',
            'organic_solution': 'Earthing up soil to cover tubers and spraying Bio-fungicide Pseudomonas fluorescens.',
            'chemical_solution': 'Foliar spray of Dimethomorph 50% WP @ 1g/L or Metalaxyl-MZ @ 2.5g/L.'
        }
    ],
    'Barley': [
        {
            'name': 'Net Blotch (Pyrenophora teres)',
            'disease_type': 'Fungal Foliar Blotch',
            'base_prob': 16.0, 'humidity_sensitive': True, 'temp_sensitive': False, 'moisture_sensitive': False,
            'symptoms': 'Dark brown net-like crisscross bar lines on leaves.',
            'organic_solution': 'Seed dressing with Trichoderma viride @ 4g/kg seed.',
            'chemical_solution': 'Foliar spray of Propiconazole 25% EC @ 1ml/L.'
        }
    ],
    'Chickpea': [
        {
            'name': 'Ascochyta Blight (Ascochyta rabiei)',
            'disease_type': 'Fungal Blight',
            'base_prob': 19.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Circular necrotic lesions with dark pycnidia rings on leaves and stems.',
            'organic_solution': 'Use resistant cultivars and spray Trichoderma harzianum formulation.',
            'chemical_solution': 'Seed treatment with Thiophanate-methyl @ 2g/kg and foliar spray of Chlorothalonil @ 2g/L.'
        }
    ],
    'Groundnut': [
        {
            'name': 'Tikka Leaf Spot (Cercospora arachidicola)',
            'disease_type': 'Fungal Leaf Spot',
            'base_prob': 23.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': False,
            'symptoms': 'Small dark brown circular spots surrounded by yellow halos on leaves.',
            'organic_solution': 'Foliar spray of 5% Neem seed kernel extract at 30 & 50 days after sowing.',
            'chemical_solution': 'Spray Carbendazim 50% WP @ 1g/L or Mancozeb @ 2g/L.'
        }
    ],
    'Coffee': [
        {
            'name': 'Coffee Leaf Rust (Hemileia vastatrix)',
            'disease_type': 'Fungal Rust',
            'base_prob': 28.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Powdery orange-yellow spots on lower leaf surfaces causing severe defoliation.',
            'organic_solution': 'Prune shade trees for sunlight penetration and apply Bordeaux mixture (0.5%).',
            'chemical_solution': 'Spray Copper Oxychloride 50% WP @ 3g/L or Cyproconazole @ 0.5ml/L.'
        }
    ],
    'Tea': [
        {
            'name': 'Blister Blight (Exobasidium vexans)',
            'disease_type': 'Fungal Blister Blight',
            'base_prob': 27.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Translucent pale-yellow blister spots on young tender shoots.',
            'organic_solution': 'Apply bio-control agent Trichoderma harzianum @ 2g/L after pluckings.',
            'chemical_solution': 'Spray Copper Oxychloride @ 2.1g/L + Nickel Chloride @ 2.1g/L formulation.'
        }
    ],
    'Onion': [
        {
            'name': 'Purple Blotch (Alternaria porri)',
            'disease_type': 'Fungal Purple Blotch',
            'base_prob': 21.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Small water-soaked sunken lesions turning purple with yellow margins.',
            'organic_solution': 'Spray Neem oil (3ml/L) blended with sticky sticker agent.',
            'chemical_solution': 'Spray Mancozeb 75% WP @ 2.5g/L or Difenoconazole @ 1ml/L.'
        },
        {
            'name': 'Stemphylium Leaf Blight (Stemphylium vesicarium)',
            'disease_type': 'Fungal Leaf Blight',
            'base_prob': 18.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': False,
            'symptoms': 'Elongated light-yellowish brown spots on leaves with dark spore masses.',
            'organic_solution': 'Ensure proper field drainage and foliar spray of Trichoderma harzianum @ 5g/L.',
            'chemical_solution': 'Foliar spray of Tebuconazole 25.9% EC @ 1ml/L or Propiconazole @ 1ml/L.'
        }
    ],
    'Garlic': [
        {
            'name': 'Downy Mildew (Peronospora destructor)',
            'disease_type': 'Downy Mildew',
            'base_prob': 20.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Pale-green elongated spots covered with violet furry mold growth.',
            'organic_solution': 'Foliar spray of Trichoderma harzianum and avoiding overhead irrigation.',
            'chemical_solution': 'Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L.'
        }
    ],
    'Mustard': [
        {
            'name': 'Alternaria Blight (Alternaria brassicae)',
            'disease_type': 'Fungal Foliar Blight',
            'base_prob': 22.0, 'humidity_sensitive': True, 'temp_sensitive': False, 'moisture_sensitive': True,
            'symptoms': 'Concentric ring brown circular lesions on leaves, pods, and stems.',
            'organic_solution': 'Spray Garlic bulb extract (5%) or Neem cake soil amendment.',
            'chemical_solution': 'Foliar spray of Mancozeb 75% WP @ 2g/L or Iprodione @ 2g/L.'
        }
    ],
    'Sunflower': [
        {
            'name': 'Alternaria Leaf Blight (Alternaria helianthi)',
            'disease_type': 'Fungal Leaf Blight',
            'base_prob': 18.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': False,
            'symptoms': 'Dark brown necrotic spots with yellow halos on leaf blades.',
            'organic_solution': 'Seed treatment with Pseudomonas fluorescens @ 10g/kg seed.',
            'chemical_solution': 'Spray Ziram 80% WP @ 2g/L or Mancozeb @ 2.5g/L.'
        }
    ],
    'Apple': [
        {
            'name': 'Apple Scab (Venturia inaequalis)',
            'disease_type': 'Fungal Fruit & Leaf Scab',
            'base_prob': 29.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Olive-green velvety spots turning scabby and dark on leaves and fruits.',
            'organic_solution': 'Prune canopy and spray Lime Sulphur solution (1%) during pink bud stage.',
            'chemical_solution': 'Spray Myclobutanil 10% WP @ 0.4g/L or Captan 50% WP @ 2.5g/L.'
        }
    ],
    'Banana': [
        {
            'name': 'Sigatoka Leaf Spot (Mycosphaerella musicola)',
            'disease_type': 'Fungal Leaf Spot',
            'base_prob': 25.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Dark reddish-brown streaks expanding into oblong leaf spots with grey centers.',
            'organic_solution': 'De-leafing infected leaves and spraying Mineral oil emulsion (1%).',
            'chemical_solution': 'Spray Propiconazole 25% EC @ 1ml/L or Carbendazim @ 1g/L.'
        }
    ],
    'Watermelon': [
        {
            'name': 'Anthracnose (Colletotrichum orbiculare)',
            'disease_type': 'Fungal Anthracnose',
            'base_prob': 20.0, 'humidity_sensitive': True, 'temp_sensitive': True, 'moisture_sensitive': True,
            'symptoms': 'Sunken water-soaked circular dark lesions on leaves and melon rind.',
            'organic_solution': 'Crop rotation and foliar spray of Trichoderma harzianum.',
            'chemical_solution': 'Spray Chlorothalonil 75% WP @ 2g/L or Copper Oxychloride @ 2.5g/L.'
        }
    ]
}

def calculate_crop_risk_and_diseases(crop: str, env_data: Dict[str, Any]) -> Dict[str, Any]:
    temp = float(env_data.get('temperature', 22.0))
    rain = float(env_data.get('rainfall', 600.0))
    hum = float(env_data.get('humidity', 60.0))
    ph = float(env_data.get('soil_ph', 6.5))
    
    agronomy = CROPS_AGRONOMY.get(crop, CROPS_AGRONOMY['Wheat'])
    temp_gap = abs(temp - agronomy['opt_temp'])
    rain_gap = abs(rain - agronomy['opt_rain'])
    
    # Calculate Risk Score (0-95%)
    base_risk = 12.0
    if hum > 70: base_risk += (hum - 70) * 0.9
    if temp_gap > 4: base_risk += temp_gap * 3.5
    if rain > agronomy['opt_rain'] + 300: base_risk += 18.0
    elif rain < agronomy['opt_rain'] - 300: base_risk += 14.0
    if abs(ph - agronomy['opt_ph']) > 0.8: base_risk += 10.0
    
    final_risk = round(min(95.0, max(8.0, base_risk)), 1)
    
    if final_risk < 25: risk_level = "Low Risk"
    elif final_risk < 50: risk_level = "Moderate Risk"
    elif final_risk < 75: risk_level = "High Risk"
    else: risk_level = "Severe Risk"
    
    diseases = CROP_DISEASES_DATABASE.get(crop, CROP_DISEASES_DATABASE['Wheat'])
    evaluated_diseases = []
    
    for d in diseases:
        prob = d['base_prob']
        if hum > 70 and d['humidity_sensitive']: prob += (hum - 70) * 0.8
        if temp_gap > 5 and d['temp_sensitive']: prob += temp_gap * 2.5
        if rain > 1000 and d['moisture_sensitive']: prob += 15.0
        d_prob = round(min(92.0, max(5.0, prob)), 1)
        
        d_level = "Low" if d_prob < 30 else ("Moderate" if d_prob < 55 else ("High" if d_prob < 75 else "Severe"))
        
        evaluated_diseases.append({
            "name": d['name'],
            "disease_type": d.get('disease_type', 'Fungal Pathology'),
            "probability_percent": d_prob,
            "risk_level": d_level,
            "symptoms": d['symptoms'],
            "organic_solution": d['organic_solution'],
            "chemical_solution": d['chemical_solution']
        })
        
    return {
        "risk_percent": final_risk,
        "risk_level": risk_level,
        "diseases": evaluated_diseases
    }

class MLEngine:
    def __init__(self):
        self.yield_model = None
        self.recommender_model = None
        self.metrics = {}
        self.load_models()

    def load_models(self):
        if os.path.exists(YIELD_MODEL_PATH):
            try:
                self.yield_model = joblib.load(YIELD_MODEL_PATH)
            except Exception as e:
                print(f"Error loading yield model: {e}")
                
        if os.path.exists(RECOMMENDER_MODEL_PATH):
            try:
                self.recommender_model = joblib.load(RECOMMENDER_MODEL_PATH)
            except Exception as e:
                print(f"Error loading recommender model: {e}")
                
        if os.path.exists(METRICS_PATH):
            try:
                with open(METRICS_PATH, 'r') as f:
                    self.metrics = json.load(f)
            except Exception as e:
                print(f"Error loading metrics: {e}")

    def predict_yield(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.yield_model:
            self.load_models()
            
        data_to_predict = input_data.copy()
        if 'year' not in data_to_predict:
            data_to_predict['year'] = 2026
        if 'sunshine_hours' not in data_to_predict or data_to_predict['sunshine_hours'] is None:
            data_to_predict['sunshine_hours'] = 8.0
        if 'irrigation_level' not in data_to_predict or not data_to_predict['irrigation_level']:
            data_to_predict['irrigation_level'] = 'Medium'
            
        feature_data = data_to_predict.copy()
        if 'is_seasonal_crop' in feature_data:
            del feature_data['is_seasonal_crop']
        df_input = pd.DataFrame([feature_data])
        
        crop = input_data.get('crop_type', 'Wheat')
        info = CROPS_AGRONOMY.get(crop, CROPS_AGRONOMY['Wheat'])

        is_seasonal_input = input_data.get('is_seasonal_crop', 'Yes')
        natural_type = info.get('season_type', 'Seasonal Crop')

        if natural_type == 'Seasonal Crop':
            if is_seasonal_input == 'No':
                seasonality_factor = 0.78  # 22% off-season yield penalty
                seasonality_note = "Off-Season Cultivation (-22% Yield Penalty)"
            else:
                seasonality_factor = 1.05  # 5% peak in-season yield boost
                seasonality_note = "Optimal In-Season Peak (+5% Yield Boost)"
        else:
            if is_seasonal_input == 'Yes':
                seasonality_factor = 0.88  # Short seasonal cycle for perennial crop
                seasonality_note = "Short Seasonal Cycle (-12% Yield Penalty)"
            else:
                seasonality_factor = 1.0
                seasonality_note = "Full Perennial Growth Cycle (Standard Yield)"

        predicted_kg = info['base_yield'] * 0.95
        if self.yield_model:
            try:
                predicted_kg = float(self.yield_model.predict(df_input)[0])
            except Exception as err:
                print(f"Model inference warning: {err}")
                predicted_kg = info['base_yield'] * 0.95
            
        predicted_kg = max(50.0, round(predicted_kg * seasonality_factor, 2))
        predicted_tons_ha = round(predicted_kg * 0.00247105, 3)
        
        # Calculate current crop market price and gross income estimate
        market_price = float(info.get('price_inr_kg', 20.0))
        estimated_income = round(predicted_kg * market_price, 2)
        
        # Temperature suitability validation
        temp_diff = abs(input_data['temperature'] - info['opt_temp'])
        is_temperature_suitable = temp_diff <= 6.5
        
        if is_temperature_suitable:
            temp_status = "Optimal Temperature" if temp_diff <= 3 else (
                "Slight Heat Stress" if input_data['temperature'] > info['opt_temp'] else "Slight Cold Stress"
            )
            temperature_warning = None
        else:
            stress_type = "Severe Cold Stress / Frost Risk" if input_data['temperature'] < info['opt_temp'] else "Severe Heat Stress / Scorching Risk"
            temp_status = f"Not Suitable ({input_data['temperature']}°C)"
            temperature_warning = f"{input_data['temperature']}°C is NOT suitable for {crop} cultivation (Requires ideal ~{info['opt_temp']}°C). {stress_type} will severely impair crop growth."
        
        water_status = "Adequate" if abs(input_data['rainfall'] - info['opt_rain']) <= 200 else (
            "Water Excess / Flood Risk" if input_data['rainfall'] > info['opt_rain'] else "Moisture Deficit"
        )
        
        ph_status = "Optimal Soil pH" if abs(input_data['soil_ph'] - info['opt_ph']) <= 0.5 else (
            "Alkaline Soil Stress" if input_data['soil_ph'] > info['opt_ph'] else "Acidic Soil Stress"
        )
        
        n_ratio = input_data['nitrogen'] / info['opt_N']
        n_status = "Balanced Nitrogen" if 0.85 <= n_ratio <= 1.15 else ("Nitrogen Deficient" if n_ratio < 0.85 else "Excess Nitrogen")
        
        p_ratio = input_data['phosphorus'] / info['opt_P']
        p_status = "Balanced Phosphorus" if 0.85 <= p_ratio <= 1.15 else ("Phosphorus Deficient" if p_ratio < 0.85 else "Excess Phosphorus")
        
        k_ratio = input_data['potassium'] / info['opt_K']
        k_status = "Balanced Potassium" if 0.85 <= k_ratio <= 1.15 else ("Potassium Deficient" if k_ratio < 0.85 else "Excess Potassium")
        
        factor_impacts = {
            "temperature_impact": temp_status,
            "moisture_impact": water_status,
            "soil_ph_impact": ph_status,
            "seasonality_impact": seasonality_note,
            "nitrogen_impact": n_status,
            "phosphorus_impact": p_status,
            "potassium_impact": k_status
        }
        
        # Calculate suitability percentage match for the target crop including seasonality alignment
        t_match = max(0.0, 1.0 - temp_diff / 15.0)
        r_match = max(0.0, 1.0 - abs(input_data['rainfall'] - info['opt_rain']) / 1000.0)
        ph_match = max(0.0, 1.0 - abs(input_data['soil_ph'] - info['opt_ph']) / 3.0)
        season_match = 1.0 if seasonality_factor >= 1.0 else max(0.4, seasonality_factor)
        target_agronomic_fit = (t_match * 0.35 + r_match * 0.35 + ph_match * 0.15 + season_match * 0.15)
        target_crop_match_score = round(min(99.0, max(15.0, target_agronomic_fit * 100.0)), 1)
        
        # Calculate best recommended crop ensuring higher or optimal yield for current temperature and parameters
        rec_crop, rec_yield_kg, confidence = self.get_best_crop(input_data, predicted_kg)
        
        rec_info = CROPS_AGRONOMY.get(rec_crop, CROPS_AGRONOMY['Wheat'])
        rec_market_price = float(rec_info.get('price_inr_kg', 20.0))
        rec_income = round(rec_yield_kg * rec_market_price, 2)
        
        # Calculate Dynamic N-P-K Targets based on Temperature, Humidity, Rainfall & Soil pH
        base_target_N = float(info['opt_N'])
        base_target_P = float(info['opt_P'])
        base_target_K = float(info['opt_K'])

        temp = float(input_data.get('temperature', 22.0))
        hum = float(input_data.get('humidity', 65.0))
        rain = float(input_data.get('rainfall', 650.0))
        ph = float(input_data.get('soil_ph', 6.5))

        # 1. Temperature Impact (Volatilization & Osmotic Stress)
        temp_n_mult = 1.12 if temp > 30.0 else (0.92 if temp < 15.0 else 1.0)
        temp_k_mult = 1.15 if temp > 32.0 else 1.0

        # 2. Humidity Impact (Transpiration & Turgor Support)
        hum_k_mult = 1.10 if hum < 50.0 else 1.0
        hum_p_mult = 1.10 if hum > 80.0 else 1.0

        # 3. Rainfall Leaching Impact (Nitrate & Potash Runoff)
        rain_n_mult = 1.30 if rain > 1000.0 else (1.20 if rain > 800.0 else (0.90 if rain < 400.0 else 1.0))
        rain_k_mult = 1.25 if rain > 1000.0 else (1.15 if rain > 800.0 else (0.92 if rain < 400.0 else 1.0))

        # 4. Soil pH Fixation Impact (Acid Al/Fe Fixation or Alkaline Calcium Fixation)
        ph_p_mult = 1.30 if ph < 5.8 else (1.25 if ph > 7.8 else 1.0)
        ph_n_mult = 1.15 if ph > 7.8 else (1.08 if ph < 5.5 else 1.0)

        # 5. Soil Type Retention & Cation Exchange Capacity (CEC) Impact
        soil_type = input_data.get('soil_type', 'Loam')
        SOIL_NPK_MULTIPLIERS = {
            'Sandy Loam': {'N': 1.15, 'P': 1.00, 'K': 1.15}, # High leaching -> +15% N & K boost
            'Saline':     {'N': 1.10, 'P': 1.05, 'K': 1.10}, # Salinity osmotic stress
            'Peaty':      {'N': 0.85, 'P': 1.10, 'K': 1.20}, # Organic N rich, K deficient -> -15% N, +20% K
            'Laterite':   {'N': 1.10, 'P': 1.30, 'K': 1.15}, # Acid Iron oxide P-fixation -> +30% P
            'Black Soil': {'N': 0.95, 'P': 1.15, 'K': 0.95}, # High clay P-fixation, high N/K retention
            'Clay Loam':  {'N': 0.95, 'P': 1.12, 'K': 0.95}, # Good CEC, moderate P-fixation
            'Red Soil':   {'N': 1.12, 'P': 1.15, 'K': 1.05}, # Low inherent N & P fertility
            'Silt Loam':  {'N': 1.00, 'P': 1.00, 'K': 1.00}, # Ideal balance
            'Alluvial':   {'N': 1.00, 'P': 1.00, 'K': 1.00}, # Fertile riverbed soil
            'Loam':       {'N': 1.00, 'P': 1.00, 'K': 1.00}  # Standard baseline loam
        }
        soil_mult = SOIL_NPK_MULTIPLIERS.get(soil_type, {'N': 1.00, 'P': 1.00, 'K': 1.00})

        # Dynamic Environmentally & Soil-Adjusted Target NPK
        adj_target_N = round(base_target_N * temp_n_mult * rain_n_mult * ph_n_mult * soil_mult['N'], 0)
        adj_target_P = round(base_target_P * hum_p_mult * ph_p_mult * soil_mult['P'], 0)
        adj_target_K = round(base_target_K * temp_k_mult * hum_k_mult * rain_k_mult * soil_mult['K'], 0)

        n_diff = round(adj_target_N - input_data['nitrogen'], 1)
        p_diff = round(adj_target_P - input_data['phosphorus'], 1)
        k_diff = round(adj_target_K - input_data['potassium'], 1)
        
        n_rec = f"N: +{n_diff} kg/ha" if n_diff > 0 else (f"N: Reduce by {abs(n_diff)} kg/ha" if n_diff < -5 else "N: Optimal")
        p_rec = f"P: +{p_diff} kg/ha" if p_diff > 0 else (f"P: Reduce by {abs(p_diff)} kg/ha" if p_diff < -5 else "P: Optimal")
        k_rec = f"K: +{k_diff} kg/ha" if k_diff > 0 else (f"K: Reduce by {abs(k_diff)} kg/ha" if k_diff < -5 else "K: Optimal")
        
        fert_rec = f"Dynamic Target NPK for {crop} ({soil_type} Soil, pH {ph}, Rain {rain}mm, Temp {temp}°C, Humidity {hum}%): {int(adj_target_N)}-{int(adj_target_P)}-{int(adj_target_K)} kg/ha. Required Additions/Adjustments: {n_rec}, {p_rec}, {k_rec}."
        
        irr_rec = "Maintain current irrigation schedule." if input_data['rainfall'] >= info['opt_rain'] else (
            f"Increase irrigation frequency to meet moisture gap of ~{int(info['opt_rain'] - input_data['rainfall'])} mm rainfall equivalent."
        )
        
        if not is_temperature_suitable:
            opt_summary = f"{crop} is NOT suitable for {input_data['temperature']}°C temperature. Recommended suitable crop for {input_data['temperature']}°C: {rec_crop} ({rec_yield_kg} kg/acre, {confidence}% thermal & climate match)."
        elif rec_crop == crop:
            opt_summary = f"Predicted yield is {predicted_kg} kg/acre (Est. Gross Income: Rs. {estimated_income:,.2f}). {crop} is currently the optimal crop choice for your field parameters ({target_crop_match_score}% match)."
        else:
            opt_summary = f"Predicted yield is {predicted_kg} kg/acre (Est. Gross Income: Rs. {estimated_income:,.2f}, {target_crop_match_score}% match). Recommended higher-yielding alternative: {rec_crop} ({rec_yield_kg} kg/acre, Est. Income: Rs. {rec_income:,.2f})."
        
        # Water requirement per acre (1 mm = 4046.86 L/ac) & per hectare (1 mm = 10,000 L/ha)
        target_water_mm = float(info.get('opt_rain', 600))
        target_water_l_acre = round(target_water_mm * 4046.86, 0)
        target_water_l_ha = round(target_water_mm * 10000.0, 0)
        
        rec_water_mm = float(rec_info.get('opt_rain', 600))
        rec_water_l_acre = round(rec_water_mm * 4046.86, 0)
        rec_water_l_ha = round(rec_water_mm * 10000.0, 0)

        # Compute Disease & Risk Evaluation for Target and Recommended Crops
        target_risk = calculate_crop_risk_and_diseases(crop, input_data)
        rec_risk = calculate_crop_risk_and_diseases(rec_crop, input_data)
        
        # Build All Crops Risk Matrix (sorted lowest risk to highest risk)
        risk_matrix = []
        for c in CROPS_AGRONOMY.keys():
            c_risk = calculate_crop_risk_and_diseases(c, input_data)
            risk_matrix.append({
                "crop_type": c,
                "risk_percent": c_risk["risk_percent"],
                "risk_level": c_risk["risk_level"],
                "primary_diseases": [d["name"] for d in c_risk["diseases"][:2]],
                "disease_types": list(set([d["disease_type"] for d in c_risk["diseases"]]))
            })
        risk_matrix.sort(key=lambda x: x["risk_percent"])
        
        return {
            "crop_type": crop,
            "predicted_yield_kg_acre": predicted_kg,
            "predicted_yield_tons_ha": predicted_tons_ha,
            "target_crop_match_score": target_crop_match_score,
            "is_temperature_suitable": is_temperature_suitable,
            "temperature_warning": temperature_warning,
            "target_crop_risk_percent": target_risk["risk_percent"],
            "target_crop_risk_level": target_risk["risk_level"],
            "target_crop_diseases": target_risk["diseases"],
            "target_crop_water_req_l_acre": target_water_l_acre,
            "target_crop_water_req_l_ha": target_water_l_ha,
            "target_crop_water_req_mm": target_water_mm,
            "target_crop_duration_days": info.get('duration_days', '120 - 135 Days'),
            "target_crop_season_type": "Seasonal Crop" if input_data.get('is_seasonal_crop', 'Yes') == 'Yes' else "Perennial Crop",
            "target_crop_season_name": info.get('season_name', 'Rabi (Winter Season)'),
            "seasonality_impact_note": seasonality_note,
            "market_price_inr_kg": market_price,
            "estimated_gross_income_inr": estimated_income,
            "recommended_crop": rec_crop,
            "recommended_crop_yield_kg_acre": rec_yield_kg,
            "recommended_crop_market_price_inr_kg": rec_market_price,
            "recommended_crop_income_inr": rec_income,
            "recommended_crop_water_req_l_acre": rec_water_l_acre,
            "recommended_crop_water_req_l_ha": rec_water_l_ha,
            "recommended_crop_water_req_mm": rec_water_mm,
            "recommended_crop_duration_days": rec_info.get('duration_days', '120 - 150 Days'),
            "recommended_crop_risk_percent": rec_risk["risk_percent"],
            "recommended_crop_risk_level": rec_risk["risk_level"],
            "recommended_crop_diseases": rec_risk["diseases"],
            "confidence_score": confidence,
            "fertilizer_recommendation": fert_rec,
            "irrigation_recommendation": irr_rec,
            "optimization_summary": opt_summary,
            "factor_impacts": factor_impacts,
            "npk_analysis": {
                "target": {"N": float(adj_target_N), "P": float(adj_target_P), "K": float(adj_target_K)},
                "base_target": {"N": float(base_target_N), "P": float(base_target_P), "K": float(base_target_K)},
                "current": {"N": float(input_data['nitrogen']), "P": float(input_data['phosphorus']), "K": float(input_data['potassium'])},
                "adjustments": {"N": n_diff, "P": p_diff, "K": k_diff}
            },
            "all_crops_risk_matrix": risk_matrix
        }

    def get_best_crop(self, input_data: Dict[str, Any], current_yield: float = 0.0) -> tuple:
        current_crop = input_data.get('crop_type', 'Wheat')
        
        # Evaluate Yield Efficiency Index and Agronomic Climate Match across all 20 crops
        crop_scores = []
        for crop_name, info in CROPS_AGRONOMY.items():
            data_test = input_data.copy()
            data_test['crop_type'] = crop_name
            if 'year' not in data_test:
                data_test['year'] = 2026
                
            if self.yield_model:
                try:
                    c_yield = float(self.yield_model.predict(pd.DataFrame([data_test]))[0])
                except Exception:
                    c_yield = info['base_yield']
            else:
                c_yield = info['base_yield']
                
            c_yield = max(50.0, round(c_yield, 2))
            
            # Yield Efficiency: ratio of predicted yield to genetic base potential
            yield_efficiency = c_yield / max(1.0, info['base_yield'])
            
            # Agronomic Match Score based on optimal temperature, rainfall, and pH
            t_match = max(0.0, 1.0 - abs(input_data['temperature'] - info['opt_temp']) / 15.0)
            r_match = max(0.0, 1.0 - abs(input_data['rainfall'] - info['opt_rain']) / 1000.0)
            ph_match = max(0.0, 1.0 - abs(input_data['soil_ph'] - info['opt_ph']) / 3.0)
            agronomic_fit = (t_match * 0.4 + r_match * 0.4 + ph_match * 0.2)
            
            # Combined Suitability Score (0 to 100)
            combined_score = (agronomic_fit * 0.7 + min(1.2, yield_efficiency) * 0.3) * 100.0
            
            crop_scores.append({
                'crop': crop_name,
                'yield': c_yield,
                'efficiency': yield_efficiency,
                'score': round(combined_score, 1)
            })
            
        # Filter ONLY crops that yield STRICTLY HIGHER than the current crop's yield
        higher_yielding = [c for c in crop_scores if c['yield'] > current_yield and c['crop'] != current_crop]
        
        if higher_yielding:
            # Sort by agronomic suitability score first (for realistic climate match), then yield
            higher_yielding.sort(key=lambda x: (x['score'], x['yield']), reverse=True)
            best = higher_yielding[0]
            confidence = min(98.0, max(70.0, best['score']))
            return best['crop'], best['yield'], confidence
        else:
            # Current selected crop is already the highest yielding crop for these field parameters
            return current_crop, current_yield, 99.0

    def recommend_crops(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.recommender_model:
            self.load_models()
            
        data_rec = input_data.copy()
        if 'year' not in data_rec:
            data_rec['year'] = 2026
            
        df_rec = pd.DataFrame([data_rec])
        crops_list = list(CROPS_AGRONOMY.keys())
        recommendations = []
        
        if self.recommender_model:
            try:
                probs = self.recommender_model.predict_proba(df_rec)[0]
                classes = list(self.recommender_model.classes_)
                
                for crop_name in crops_list:
                    if crop_name in classes:
                        idx = classes.index(crop_name)
                        score = round(float(probs[idx] * 100), 1)
                    else:
                        score = 5.0
                    
                    info = CROPS_AGRONOMY[crop_name]
                    reasons = []
                    if abs(input_data['temperature'] - info['opt_temp']) <= 3:
                        reasons.append(f"Ideal temperature range (~{info['opt_temp']}°C)")
                    else:
                        reasons.append(f"Suboptimal temperature (Ideal: {info['opt_temp']}°C)")
                        
                    if abs(input_data['rainfall'] - info['opt_rain']) <= 250:
                        reasons.append(f"Suitable rainfall profile (~{info['opt_rain']} mm)")
                    else:
                        reasons.append(f"Water demand gap (Needs: {info['opt_rain']} mm)")
                        
                    if abs(input_data['soil_ph'] - info['opt_ph']) <= 0.6:
                        reasons.append(f"Compatible soil pH (~{info['opt_ph']})")
                        
                    recommendations.append({
                        "crop_type": crop_name,
                        "suitability_score": max(5.0, score),
                        "expected_yield_kg_acre": info['base_yield'],
                        "reasons": reasons
                    })
            except Exception as e:
                print(f"Recommender prediction exception: {e}")
                
        if not recommendations:
            for crop_name, info in CROPS_AGRONOMY.items():
                t_score = max(0, 100 - abs(input_data['temperature'] - info['opt_temp']) * 6)
                r_score = max(0, 100 - abs(input_data['rainfall'] - info['opt_rain']) * 0.08)
                ph_score = max(0, 100 - abs(input_data['soil_ph'] - info['opt_ph']) * 40)
                final_score = round(t_score * 0.4 + r_score * 0.4 + ph_score * 0.2, 1)
                
                recommendations.append({
                    "crop_type": crop_name,
                    "suitability_score": max(10.0, final_score),
                    "expected_yield_kg_acre": info['base_yield'],
                    "reasons": [
                        f"Temp match: {round(t_score, 0)}%",
                        f"Rainfall match: {round(r_score, 0)}%",
                        f"Soil pH match: {round(ph_score, 0)}%"
                    ]
                })
                
        recommendations.sort(key=lambda x: x['suitability_score'], reverse=True)
        top_crop = recommendations[0]['crop_type']
        
        return {
            "top_recommended": top_crop,
            "recommendations": recommendations[:8] # Top 8 recommendations
        }

    def optimize_resources(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        crop = input_data.get('crop_type', 'Wheat')
        info = CROPS_AGRONOMY.get(crop, CROPS_AGRONOMY['Wheat'])
        
        elements = [
            ('Nitrogen (N)', input_data['nitrogen'], info['opt_N']),
            ('Phosphorus (P)', input_data['phosphorus'], info['opt_P']),
            ('Potassium (K)', input_data['potassium'], info['opt_K'])
        ]
        
        npk_analysis = []
        deficits = 0
        for name, current, optimal in elements:
            ratio = current / optimal
            if ratio < 0.85:
                status = "Deficient"
                diff = round(optimal - current, 1)
                rec = f"Add {diff} kg/ha of {name.split()[0]} fertilizer to reach optimal level ({optimal} kg/ha)."
                deficits += 1
            elif ratio > 1.25:
                status = "Excess"
                diff = round(current - optimal, 1)
                rec = f"Reduce {name.split()[0]} application by {diff} kg/ha to avoid salt toxicity and wasted cost."
            else:
                status = "Optimal"
                rec = f"Maintain current {name.split()[0]} dosage ({current} kg/ha is ideal)."
                
            npk_analysis.append({
                "element": name,
                "current": current,
                "optimal": optimal,
                "status": status,
                "recommendation": rec
            })
            
        irr_mult = {'Low': 0.85, 'Medium': 1.0, 'High': 1.15}.get(input_data['irrigation_level'], 1.0)
        current_water = input_data['rainfall'] * irr_mult
        req_water = info['opt_rain']
        water_ratio = current_water / req_water
        
        if water_ratio < 0.85:
            w_status = "Deficient Water Supply"
            w_rec = f"Increase irrigation by ~{int(req_water - current_water)} mm equivalent to unlock maximum crop transpiration."
            deficits += 1
        elif water_ratio > 1.25:
            w_status = "Excessive Moisture"
            w_rec = f"Ensure field drainage to prevent root rot and anaerobic soil conditions."
        else:
            w_status = "Optimal Moisture"
            w_rec = "Current rainfall and irrigation schedule perfectly matches crop evapotranspiration."
            
        potential_boost = round(min(35.0, deficits * 8.5 + (10 - abs(input_data['soil_ph'] - info['opt_ph']) * 3)), 1)
        sustainability = "High" if deficits == 0 else ("Moderate" if deficits <= 2 else "Needs Attention")
        
        return {
            "crop_type": crop,
            "npk_analysis": npk_analysis,
            "water_analysis": {
                "current_water_estimate": round(current_water, 1),
                "crop_water_requirement": float(req_water),
                "status": w_status,
                "recommendation": w_rec
            },
            "potential_yield_increase_percent": potential_boost,
            "sustainability_rating": sustainability
        }

    def generate_sensitivity(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        var_name = input_data.get('variable_name', 'rainfall')
        crop = input_data.get('crop_type', 'Wheat')
        
        ranges = {
            'rainfall': (100.0, 2000.0),
            'temperature': (10.0, 42.0),
            'nitrogen': (10.0, 250.0),
            'soil_ph': (4.0, 9.0)
        }
        
        min_v, max_v = ranges.get(var_name, (100.0, 2000.0))
        steps = 12
        test_values = np.linspace(min_v, max_v, steps)
        
        points = []
        base_dict = {
            'year': input_data.get('year', 2026),
            'crop_type': crop,
            'soil_type': input_data.get('soil_type', 'Loam'),
            'soil_ph': input_data.get('soil_ph', 6.5),
            'nitrogen': input_data.get('nitrogen', 120.0),
            'phosphorus': input_data.get('phosphorus', 60.0),
            'potassium': input_data.get('potassium', 40.0),
            'temperature': input_data.get('temperature', 22.0),
            'rainfall': input_data.get('rainfall', 650.0),
            'humidity': input_data.get('humidity', 65.0),
            'irrigation_level': input_data.get('irrigation_level', 'Medium'),
            'sunshine_hours': input_data.get('sunshine_hours', 8.0)
        }
        
        for val in test_values:
            current_dict = base_dict.copy()
            current_dict[var_name] = round(float(val), 2)
            res = self.predict_yield(current_dict)
            points.append({
                "value": round(float(val), 1),
                "predicted_yield": res["predicted_yield_kg_acre"]
            })
            
        return {
            "variable_name": var_name,
            "crop_type": crop,
            "points": points
        }

ml_engine = MLEngine()
