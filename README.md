# 🌾 AI-Powered Crop Yield Prediction & Optimization System

A full-stack agricultural AI system built with **React (Vite)**, **FastAPI**, **SQLite**, and **Scikit-Learn**. The application predicts crop yield using trained ML regression models, provides crop suitability rankings, optimizes fertilizer NPK and irrigation schedules, and logs history with downloadable reports.

---

## 🚀 Quick Start & Localhost Links

The application is **currently running locally**:

* 🌐 **Frontend Dashboard (React SPA)**: [http://localhost:5173](http://localhost:5173)
* ⚡ **Backend API & Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* 🏥 **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🌟 Core Features

1. 📊 **Interactive Agricultural Dashboard**
   - KPI metrics cards: Total predictions, Average predicted yield (`kg/acre` & `tons/ha`), best model R² score.
   - ML model evaluation comparison bar chart comparing **Linear Regression**, **Decision Tree**, **Random Forest Regressor**, and **Gradient Boosting**.
   - Quick preset launchers (Optimal Wheat, Rice High Moisture, Sugarcane Commercial, Cool Season Potato).

2. 🌾 **Crop Yield Prediction Engine**
   - Real-time prediction input parameters: Crop type, Soil type, Soil pH, Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Rainfall, Humidity, Irrigation level, Sunshine hours.
   - Instant inference powered by trained Scikit-Learn Random Forest Regressor ($R^2 = 95.08\%$).
   - Yield outputs in dual units (`kg/acre` and `tons/ha`).
   - Agronomical condition assessment pills for temperature, moisture, soil pH, and NPK balance.

3. 🎯 **Crop Recommendation Engine**
   - Ranks top 6 recommended crops based on field soil composition and climate parameters.
   - Displays match percentage suitability scores (0-100%) and agronomical compatibility reasons.

4. 💧 **Precision Resource Optimization Advisor**
   - NPK nutrient status indicators: **Deficient**, **Optimal**, or **Excess**.
   - Actionable dosage corrections for Urea, DAP, and MOP.
   - Hydrology advisor analyzing crop water requirements vs effective rainfall/irrigation.
   - Potential yield boost calculation (+X%) and sustainability rating.

5. ☀️ **Weather & Soil Sensitivity Analysis**
   - Interactive sensitivity line charts displaying non-linear yield response curves when sweeping rainfall, temperature, soil pH, or nitrogen levels.

6. 📜 **Prediction History Log**
   - SQLite database persistence using SQLAlchemy ORM.
   - Search by crop, filter by crop type, view full details, or delete records.

7. 📄 **Summary Report Generator**
   - Generates executive agricultural summary reports.
   - Includes full breakdown of inputs, yield predictions, fertilizer schedules, and irrigation plans.
   - Built-in PDF print and JSON export support.

---

## 🤖 Machine Learning Pipeline & Model Comparison

Models were trained and evaluated on an agricultural dataset of 3,000 samples incorporating agronomical equations (Liebig's Law of Minimums, quadratic heat stress curves, water adequacy ratios).

| Model | MAE (kg/acre) | RMSE (kg/acre) | $R^2$ Score | Selection Status |
| :--- | :---: | :---: | :---: | :---: |
| **Linear Regression** | 1178.92 | 2059.77 | $78.19\%$ | Evaluated |
| **Decision Tree** | 639.57 | 1389.75 | $90.07\%$ | Evaluated |
| **Gradient Boosting** | 614.90 | 1148.88 | $93.21\%$ | Evaluated |
| **Random Forest Regressor** | **472.01** | **978.31** | **$95.08\%$** | **SELECTED BEST MODEL** |

Saved artifacts in `ml/models/`:
- `best_crop_yield_model.pkl`: Trained Random Forest Pipeline (Scaler + OneHotEncoder + Regressor)
- `crop_recommender.pkl`: Crop Suitability Classifier
- `metrics.json`: Comparative evaluation metrics

---

## 📁 Project Architecture

```
proj/
├── ml/
│   ├── generate_dataset.py     # Synthetic agricultural data generator
│   ├── train_models.py         # ML training & model comparison script
│   ├── data/dataset.csv        # Agricultural dataset (3,000 samples)
│   └── models/                 # Model artifacts (.pkl, metrics.json)
├── backend/
│   ├── main.py                 # FastAPI REST API endpoints
│   ├── database.py             # SQLite setup & SQLAlchemy connection
│   ├── models.py               # Database schemas (PredictionRecord)
│   ├── schemas.py              # Pydantic validation schemas
│   └── ml_engine.py            # ML loader, inference & optimization engine
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, MetricCard
│   │   ├── pages/              # Dashboard, Prediction, Recommendation, Optimization, Analysis, History, Reports
│   │   ├── api.js              # API client
│   │   ├── App.jsx             # React App container
│   │   └── index.css           # Modern agricultural glassmorphic styling
│   ├── index.html
│   └── vite.config.js
└── requirements.txt            # Python dependencies
```

---

## 🛠️ How to Run Locally (Manual Step-by-Step)

If you ever restart the servers manually:

### 1. Backend Setup & Run
```bash
# Install dependencies
pip install -r requirements.txt

# Train models (if not already trained)
python ml/generate_dataset.py
python ml/train_models.py

# Launch FastAPI server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup & Run
```bash
cd frontend
npm install
npx vite --host 0.0.0.0 --port 5173
```
