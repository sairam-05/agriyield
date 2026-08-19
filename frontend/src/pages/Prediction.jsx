import React, { useState, useEffect } from 'react';
import { TrendingUp, Sprout, FlaskConical, Thermometer, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Sparkles, ShieldAlert, Bug, Droplet, Clock, BarChart3 } from 'lucide-react';
import { predictYield } from '../api';

const CROP_SEASON_MAP = {
  Wheat: { type: 'Seasonal Crop', season: 'Rabi (Winter Season)' },
  Rice: { type: 'Seasonal Crop', season: 'Kharif (Monsoon Season)' },
  Maize: { type: 'Seasonal Crop', season: 'Kharif / Rabi Season' },
  Cotton: { type: 'Seasonal Crop', season: 'Kharif (Monsoon Season)' },
  Sugarcane: { type: 'Perennial Crop', season: 'Perennial (Annual Crop)' },
  Soybean: { type: 'Seasonal Crop', season: 'Kharif (Monsoon Season)' },
  Tomato: { type: 'Seasonal Crop', season: 'Rabi / Kharif Season' },
  Potato: { type: 'Seasonal Crop', season: 'Rabi (Winter Season)' },
  Barley: { type: 'Seasonal Crop', season: 'Rabi (Winter Season)' },
  Chickpea: { type: 'Seasonal Crop', season: 'Rabi (Winter Season)' },
  Groundnut: { type: 'Seasonal Crop', season: 'Kharif (Monsoon Season)' },
  Coffee: { type: 'Perennial Plantation', season: 'Perennial (Year-Round)' },
  Tea: { type: 'Perennial Plantation', season: 'Perennial (Year-Round)' },
  Onion: { type: 'Seasonal Crop', season: 'Rabi / Late Kharif' },
  Garlic: { type: 'Seasonal Crop', season: 'Rabi (Winter Season)' },
  Mustard: { type: 'Seasonal Crop', season: 'Rabi (Winter Season)' },
  Sunflower: { type: 'Seasonal Crop', season: 'Zaid / Rabi Season' },
  Apple: { type: 'Perennial Fruit Tree', season: 'Perennial (Horticultural)' },
  Banana: { type: 'Perennial Crop', season: 'Perennial (Year-Round)' },
  Watermelon: { type: 'Seasonal Crop', season: 'Zaid (Summer Season)' }
};

export default function Prediction({ initialPreset, setActiveTab, setSelectedPrediction }) {
  const [formData, setFormData] = useState({
    crop_type: 'Wheat', soil_type: 'Loam', soil_ph: 6.5,
    nitrogen: 120, phosphorus: 60, potassium: 40,
    temperature: 22.0, rainfall: 650, humidity: 65.0,
    irrigation_level: 'Medium', sunshine_hours: 8.0
  });

  const runPrediction = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictYield(payload);
      setResult(res);
      if (setSelectedPrediction) setSelectedPrediction({ ...payload, ...res });
    } catch (err) {
      setError(err.message || 'Prediction request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPreset) {
      const presetData = {
        ...formData,
        crop_type: initialPreset.crop || formData.crop_type,
        soil_type: initialPreset.soil || formData.soil_type,
        soil_ph: initialPreset.ph ?? formData.soil_ph,
        nitrogen: initialPreset.N ?? formData.nitrogen,
        phosphorus: initialPreset.P ?? formData.phosphorus,
        potassium: initialPreset.K ?? formData.potassium,
        temperature: initialPreset.temp ?? formData.temperature,
        rainfall: initialPreset.rain ?? formData.rainfall,
        humidity: initialPreset.hum ?? formData.humidity
      };
      setFormData(presetData);
      runPrediction(presetData);
    } else {
      runPrediction(formData);
    }
  }, [initialPreset]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const crops = ['Wheat','Rice','Maize','Cotton','Sugarcane','Soybean','Tomato','Potato','Barley','Chickpea','Groundnut','Coffee','Tea','Onion','Garlic','Mustard','Sunflower','Apple','Banana','Watermelon'];
  const soilTypes = ['Loam','Clay Loam','Alluvial','Black Soil','Red Soil','Sandy Loam','Peaty','Saline','Silt Loam','Laterite'];

  const handleChange = e => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);
    if (val !== '' && !Number.isNaN(val)) {
      runPrediction(updated);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    runPrediction(formData);
  };

  // Calculate pH Bio-Availability & Leaching Dynamics based on Soil pH & Rainfall
  const ph = formData.soil_ph || 6.5;
  const rain = formData.rainfall || 650;

  // Nitrogen (N)
  const nAvail = ph < 5.5 ? 65 : (ph <= 7.5 ? 95 : 75);
  const nLoss = rain < 400 ? 5 : (rain <= 800 ? 12 : Math.min(48, Math.round(12 + (rain - 800) * 0.04)));
  const nEff = (formData.nitrogen || 0) * (nAvail / 100) * (1 - nLoss / 100);

  // Phosphorus (P) - Highly pH sensitive!
  const pAvail = ph < 6.0 ? Math.max(30, Math.round(30 + (ph - 3.5) * 22)) : (ph <= 7.2 ? 98 : Math.max(35, Math.round(98 - (ph - 7.2) * 28)));
  const pLoss = rain < 500 ? 3 : Math.min(25, Math.round(3 + (rain - 500) * 0.02));
  const pEff = (formData.phosphorus || 0) * (pAvail / 100) * (1 - pLoss / 100);

  // Potassium (K)
  const kAvail = ph < 5.5 ? 70 : 92;
  const kLoss = rain < 450 ? 6 : (rain <= 850 ? 15 : Math.min(45, Math.round(15 + (rain - 850) * 0.035)));
  const kEff = (formData.potassium || 0) * (kAvail / 100) * (1 - kLoss / 100);

  // Summaries
  const phSummaryText = ph < 5.8 ? `Acidic Soil (pH ${ph}): Severe Phosphorus fixation by Iron/Aluminum. Lime application recommended.` : (
    ph > 7.8 ? `Alkaline Soil (pH ${ph}): Calcium-P fixation & Ammonia volatilization active. Gypsum / sulfur recommended.` : `Optimal Soil pH (${ph}): High nutrient solubility & minimal nutrient fixation.`
  );

  const rainSummaryText = rain > 900 ? `High Rainfall (${rain} mm): Elevated Nitrogen leaching & Potassium runoff risk.` : (
    rain < 450 ? `Low Rainfall (${rain} mm): Minimal leaching risk, but root absorption is moisture-limited.` : `Moderate Rainfall (${rain} mm): Ideal balance of moisture and low leaching losses.`
  );

  return (
    <div className="space-y-5">
      <div className="glass-panel p-5 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" /> Crop Yield Prediction Engine
        </h2>
        <p className="text-slate-600 text-sm mt-1">Select from 20 crop varieties and 10 soil types to execute ML regression yield forecasting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass-panel p-5 md:p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" /> Field & Agronomic Parameters
          </h3>

          {/* Crop, Seasonality & Soil */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type (20 Varieties)</label>
              <select name="crop_type" value={formData.crop_type} onChange={handleChange} className="w-full">
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Is Seasonal Crop?</label>
              <select name="is_seasonal_crop" value={formData.is_seasonal_crop || 'Yes'} onChange={handleChange} className="w-full">
                <option value="Yes">Yes (Seasonal Crop)</option>
                <option value="No">No (Perennial Crop)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type (10 Types)</label>
              <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="w-full">
                {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* NPK & pH */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" /> Soil Nutrients & pH
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              {[
                ['soil_ph','Soil pH','3.5-10.0',0.1,3.5,10.0],
                ['nitrogen','Nitrogen (N)','0-500 kg/ha',1,0,500],
                ['phosphorus','Phosphorus (P)','0-300 kg/ha',1,0,300],
                ['potassium','Potassium (K)','0-300 kg/ha',1,0,300]
              ].map(([name,label,range,step,min,max])=>(
                <div key={name} className="flex flex-col justify-end">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 leading-tight min-h-[32px] flex items-end">
                    <span>{label} <span className="text-[10px] text-slate-400 font-normal block sm:inline">({range})</span></span>
                  </label>
                  <input type="number" step={step} min={min} max={max} name={name} value={formData[name]} onChange={handleChange} className="w-full" required />
                </div>
              ))}
            </div>
          </div>

          {/* Climate */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" /> Climate & Hydrology
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              {[
                ['temperature','Temperature (°C)',0.5,-10,60],
                ['rainfall','Rainfall (mm)',1,0,5000],
                ['humidity','Humidity (%)',0.5,0,100]
              ].map(([name,label,step,min,max])=>(
                <div key={name} className="flex flex-col justify-end">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 min-h-[24px] flex items-end">{label}</label>
                  <input type="number" step={step} min={min} max={max} name={name} value={formData[name]} onChange={handleChange} className="w-full" required />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /><span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full btn-primary justify-center text-sm md:text-base py-3 cursor-pointer">
            {loading
              ? <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Running ML Inference...</span>
              : <span className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" /> Predict Crop Yield</span>}
          </button>

          {/* N-P-K Bio-Availability Bar Chart (X-Axis: Soil pH, Y-Axis: N, P, K Bio-Availability kg/ha) */}
          <div className="p-4 md:p-5 rounded-2xl bg-slate-900 text-white shadow-md space-y-4 border border-slate-800 mt-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> N-P-K Bio-Availability vs Soil pH Spectrum
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <span className="font-semibold text-white">X-Axis:</span> Soil pH (3.5 – 10.0) | <span className="font-semibold text-white">Y-Axis:</span> Available Nutrients (kg/ha)
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  📍 Selected pH: {formData.soil_ph}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs flex-wrap bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span> Nitrogen (N)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span> Phosphorus (P)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                <span className="w-3 h-3 rounded-xs bg-cyan-500 inline-block"></span> Potassium (K)
              </span>
            </div>

            {/* Vertical Bar Chart Container */}
            <div className="pt-6 pb-2 px-1">
              <div className="relative h-60 flex items-end justify-between border-b border-l border-slate-700 gap-1 sm:gap-2 pl-9 pr-2 pb-1">
                {/* Y-Axis Gridlines & Values */}
                {[0, 50, 100, 150, 200].map(yVal => (
                  <div key={yVal} className="absolute left-0 w-full flex items-center text-[10px] text-slate-500 border-b border-slate-800/80 pointer-events-none" style={{ bottom: `${(yVal / 200) * 100}%` }}>
                    <span className="w-7 -ml-8 text-right font-mono text-[9px] text-slate-400">{yVal}</span>
                  </div>
                ))}

                {/* X-Axis Columns for pH values 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.0 */}
                {[3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.0].map(pHVal => {
                  // Calculate N, P, K availability for this pH
                  const nP = pHVal < 5.5 ? 0.65 : (pHVal <= 7.5 ? 0.95 : 0.75);
                  const pP = pHVal < 6.0 ? Math.max(0.3, 0.3 + (pHVal - 3.5) * 0.22) : (pHVal <= 7.2 ? 0.98 : Math.max(0.35, 0.98 - (pHVal - 7.2) * 0.28));
                  const kP = pHVal < 5.5 ? 0.70 : 0.92;

                  const nBio = (formData.nitrogen || 0) * nP;
                  const pBio = (formData.phosphorus || 0) * pP;
                  const kBio = (formData.potassium || 0) * kP;

                  const maxY = 200;
                  const nH = Math.min(100, (nBio / maxY) * 100);
                  const pH = Math.min(100, (pBio / maxY) * 100);
                  const kH = Math.min(100, (kBio / maxY) * 100);

                  const isCurrent = Math.abs(formData.soil_ph - pHVal) < 0.5;

                  return (
                    <div key={pHVal} className={`flex-1 flex flex-col items-center justify-end h-full relative group transition-all rounded-lg p-0.5 ${isCurrent ? 'bg-emerald-500/15 border border-emerald-400/50 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800/40'}`}>
                      
                      {/* Active Pin indicator */}
                      {isCurrent && (
                        <div className="absolute -top-7 bg-emerald-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md">
                          📍 pH {formData.soil_ph}
                        </div>
                      )}

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-8 hidden group-hover:flex flex-col gap-0.5 bg-slate-950 text-white text-[10px] p-2 rounded-lg border border-slate-700 shadow-xl z-20 whitespace-nowrap pointer-events-none">
                        <span className="font-bold text-emerald-400 border-b border-slate-800 pb-1">Soil pH {pHVal} Availability</span>
                        <span className="text-emerald-300">N: {nBio.toFixed(1)} kg/ha</span>
                        <span className="text-amber-300">P: {pBio.toFixed(1)} kg/ha</span>
                        <span className="text-cyan-300">K: {kBio.toFixed(1)} kg/ha</span>
                      </div>

                      {/* 3 Grouped Bars for N, P, K */}
                      <div className="flex items-end justify-center gap-0.5 w-full h-full pt-4">
                        <div className="w-1.5 sm:w-2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xs transition-all duration-500 shadow-xs" style={{ height: `${nH}%` }} title={`N: ${nBio.toFixed(1)} kg/ha`}></div>
                        <div className="w-1.5 sm:w-2 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-xs transition-all duration-500 shadow-xs" style={{ height: `${pH}%` }} title={`P: ${pBio.toFixed(1)} kg/ha`}></div>
                        <div className="w-1.5 sm:w-2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-xs transition-all duration-500 shadow-xs" style={{ height: `${kH}%` }} title={`K: ${kBio.toFixed(1)} kg/ha`}></div>
                      </div>

                      {/* X-Axis Label */}
                      <div className="mt-2 text-center">
                        <span className={`text-[10px] font-bold block ${isCurrent ? 'text-emerald-300 font-extrabold scale-110' : 'text-slate-400'}`}>
                          {pHVal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Label */}
              <div className="text-center mt-3 text-xs font-bold text-slate-400 flex items-center justify-center gap-1 uppercase tracking-wider">
                <span>Soil pH Scale (X-Axis)</span>
              </div>
            </div>

            {/* pH Bio-Availability Summary */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-2.5 text-xs">
              <span className="text-emerald-400 text-base shrink-0 mt-0.5">💡</span>
              <div>
                <span className="font-bold text-slate-200 block text-xs">
                  Agronomic Insights for pH {formData.soil_ph}:
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {formData.soil_ph < 6.0 
                    ? `At pH ${formData.soil_ph}, Phosphorus (P) availability drops significantly due to Iron & Aluminum acid fixation. Nitrification of Nitrogen is also suppressed.`
                    : (formData.soil_ph > 7.8 
                        ? `At pH ${formData.soil_ph}, Phosphorus forms insoluble Calcium compounds, while Nitrogen faces ammonia volatilization loss.`
                        : `pH ${formData.soil_ph} lies in the ideal agronomic sweet spot (6.0 - 7.5), maximizing bio-availability for Nitrogen, Phosphorus, and Potassium simultaneously.`)}
                </p>
              </div>
            </div>
          </div>

          {/* VISUAL N-P-K FERTILIZER ADVISORY Component (Environmentally & Edaphically Dynamic) */}
          {(() => {
            // Environmentally & Soil Type Adjusted Target Calculation
            const temp = formData.temperature || 22.0;
            const hum = formData.humidity || 65.0;
            const rain = formData.rainfall || 650.0;
            const ph = formData.soil_ph || 6.5;
            const soil = formData.soil_type || 'Loam';

            const baseN = result?.npk_analysis?.base_target?.N || 120;
            const baseP = result?.npk_analysis?.base_target?.P || 60;
            const baseK = result?.npk_analysis?.base_target?.K || 40;

            const temp_n_mult = temp > 30.0 ? 1.12 : (temp < 15.0 ? 0.92 : 1.0);
            const temp_k_mult = temp > 32.0 ? 1.15 : 1.0;
            const hum_k_mult = hum < 50.0 ? 1.10 : 1.0;
            const hum_p_mult = hum > 80.0 ? 1.10 : 1.0;
            const rain_n_mult = rain > 1000.0 ? 1.30 : (rain > 800.0 ? 1.20 : (rain < 400.0 ? 0.90 : 1.0));
            const rain_k_mult = rain > 1000.0 ? 1.25 : (rain > 800.0 ? 1.15 : (rain < 400.0 ? 0.92 : 1.0));
            const ph_p_mult = ph < 5.8 ? 1.30 : (ph > 7.8 ? 1.25 : 1.0);
            const ph_n_mult = ph > 7.8 ? 1.15 : (ph < 5.5 ? 1.08 : 1.0);

            const SOIL_MULT = {
              'Sandy Loam': { N: 1.15, P: 1.00, K: 1.15 },
              'Saline':     { N: 1.10, P: 1.05, K: 1.10 },
              'Peaty':      { N: 0.85, P: 1.10, K: 1.20 },
              'Laterite':   { N: 1.10, P: 1.30, K: 1.15 },
              'Black Soil': { N: 0.95, P: 1.15, K: 0.95 },
              'Clay Loam':  { N: 0.95, P: 1.12, K: 0.95 },
              'Red Soil':   { N: 1.12, P: 1.15, K: 1.05 },
              'Silt Loam':  { N: 1.00, P: 1.00, K: 1.00 },
              'Alluvial':   { N: 1.00, P: 1.00, K: 1.00 },
              'Loam':       { N: 1.00, P: 1.00, K: 1.00 }
            }[soil] || { N: 1.0, P: 1.0, K: 1.0 };

            const targetN = Math.round(baseN * temp_n_mult * rain_n_mult * ph_n_mult * SOIL_MULT.N);
            const targetP = Math.round(baseP * hum_p_mult * ph_p_mult * SOIL_MULT.P);
            const targetK = Math.round(baseK * temp_k_mult * hum_k_mult * rain_k_mult * SOIL_MULT.K);

            const currN = formData.nitrogen ?? 120;
            const currP = formData.phosphorus ?? 60;
            const currK = formData.potassium ?? 40;

            const adjN = Math.round(targetN - currN);
            const adjP = Math.round(targetP - currP);
            const adjK = Math.round(targetK - currK);

            const npk = {
              target: { N: targetN, P: targetP, K: targetK },
              current: { N: currN, P: currP, K: currK },
              adjustments: { N: adjN, P: adjP, K: adjK }
            };

            const nutrients = [
              { 
                label: 'Nitrogen (N)', 
                short: 'N',
                target: targetN, 
                current: currN, 
                adj: adjN,
                color: 'emerald',
                dose: adjN > 0 ? `Apply +${adjN} kg N (~${Math.round(adjN * 2.17)} kg Urea/ha)` : (adjN < -5 ? `Reduce Nitrogen by ${Math.abs(adjN)} kg/ha` : 'Optimal Level')
              },
              { 
                label: 'Phosphorus (P)', 
                short: 'P',
                target: targetP, 
                current: currP, 
                adj: adjP,
                color: 'teal',
                dose: adjP > 0 ? `Apply +${adjP} kg P (~${Math.round(adjP * 2.17)} kg DAP/ha)` : (adjP < -5 ? `Reduce Phosphatic by ${Math.abs(adjP)} kg/ha` : 'Optimal Level')
              },
              { 
                label: 'Potassium (K)', 
                short: 'K',
                target: targetK, 
                current: currK, 
                adj: adjK,
                color: 'blue',
                dose: adjK > 0 ? `Apply +${adjK} kg K (~${Math.round(adjK * 1.67)} kg MOP/ha)` : (adjK < -5 ? `Reduce Potash by ${Math.abs(adjK)} kg/ha` : 'Optimal Level')
              }
            ];

            return (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/80 shadow-xs space-y-3 mt-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-extrabold text-emerald-900 uppercase flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-emerald-600" /> Visual N-P-K Fertilizer Advisory
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px]">
                    Environmentally & Soil-Adjusted Target: {npk.target.N}-{npk.target.P}-{npk.target.K} kg/ha
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {nutrients.map((n) => {
                    const pct = Math.min(100, Math.max(8, Math.round((n.current / n.target) * 100)));
                    const isDeficient = n.adj > 0;
                    const isExcess = n.adj < -5;

                    return (
                      <div key={n.short} className="p-3 rounded-lg bg-white/90 border border-slate-200/80 space-y-2 flex flex-col justify-between shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{n.label}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            isDeficient 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : isExcess 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-teal-100 text-teal-800 border border-teal-300'
                          }`}>
                            {isDeficient ? `+${n.adj} kg/ha` : isExcess ? `${n.adj} kg/ha` : 'Optimal'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                            <span>Soil: <strong>{n.current}</strong> kg/ha</span>
                            <span>Target: <strong>{n.target}</strong> kg/ha</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDeficient ? 'bg-emerald-500' : isExcess ? 'bg-amber-500' : 'bg-teal-500'
                              }`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>

                        <div className="text-[10px] font-bold text-slate-700 pt-0.5 border-t border-slate-100 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          {n.dose}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200 text-emerald-950 text-xs font-medium leading-relaxed">
                  💡 <strong>Dynamic Field Action Plan:</strong> Target NPK for {formData.crop_type} under current conditions ({soil} Soil, pH {ph}, Rain {rain}mm, Temp {temp}°C, Humidity {hum}%): <strong>{targetN}-{targetP}-{targetK} kg/ha</strong>. 
                  Adjustments: N: {adjN > 0 ? `+${adjN} kg/ha` : (adjN < -5 ? `${adjN} kg/ha` : 'Optimal')}, P: {adjP > 0 ? `+${adjP} kg/ha` : (adjP < -5 ? `${adjP} kg/ha` : 'Optimal')}, K: {adjK > 0 ? `+${adjK} kg/ha` : (adjK < -5 ? `${adjK} kg/ha` : 'Optimal')}.
                </div>
              </div>
            );
          })()}
        </form>

        {/* Result */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="glass-panel p-5 space-y-4 bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Inference Result
                </span>
                <span className="text-xs font-bold text-slate-500">ID: #{result.display_id || result.id || 'Live'}</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Expected {formData.crop_type} Yield</p>
                    {result.target_crop_match_score && (
                      <span className="px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold shadow-2xs bg-emerald-100 border-emerald-300 text-emerald-900">
                        {result.target_crop_match_score}% match
                      </span>
                    )}
                  </div>
                  <div className="my-1">
                    <span className="text-4xl md:text-5xl font-black text-slate-900">{result.predicted_yield_kg_acre}</span>
                    <span className="text-base md:text-lg font-bold text-emerald-700 ml-2">kg / acre</span>
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-900">
                    ≈ <span className="text-slate-900 font-extrabold">{result.predicted_yield_tons_ha}</span> tons / ha
                  </div>
                </div>

                {result.estimated_gross_income_inr && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Market Price</span>
                        <span className="text-sm font-black text-slate-900">₹{result.market_price_inr_kg} <span className="text-[10px] font-semibold text-slate-500">/ kg</span></span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Est. Gross Revenue</span>
                        <span className="text-sm font-black text-emerald-700">₹{result.estimated_gross_income_inr.toLocaleString('en-IN')} <span className="text-[10px] font-semibold text-emerald-800">/ ac</span></span>
                      </div>
                    </div>
                    {result.target_crop_water_req_l_acre && (
                      <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-900 flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-cyan-600" /> Water Required / Acre:
                        </span>
                        <span className="font-black text-cyan-950">
                          {result.target_crop_water_req_l_acre.toLocaleString('en-IN')} Liters <span className="text-[10px] text-cyan-700 font-semibold">({result.target_crop_water_req_mm} mm equiv.)</span>
                        </span>
                      </div>
                    )}
                    <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Crop Growth Duration:
                      </span>
                      <span className="font-black text-amber-950">
                        {result.target_crop_duration_days || '120 - 135 Days'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        ⚡ Seasonality Yield Factor:
                      </span>
                      <span className={`font-black text-[11px] px-2.5 py-0.5 rounded-full border ${
                        formData.is_seasonal_crop === 'No' 
                          ? 'bg-amber-100 text-amber-900 border-amber-300' 
                          : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      }`}>
                        {result.seasonality_impact_note || (formData.is_seasonal_crop === 'No' ? 'Off-Season Cultivation (-22% Yield Impact)' : 'Optimal In-Season Peak (+5% Yield Boost)')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-teal-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Sprout className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-teal-800 uppercase">
                        {result.is_temperature_suitable === false ? `Recommended Crop for ${formData.temperature}°C` : 'Top Recommended Crop'}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="text-base font-extrabold text-slate-900">{result.recommended_crop}</span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold">
                          {result.confidence_score}% match
                        </span>
                      </div>
                    </div>
                  </div>
                  {result.recommended_crop_yield_kg_acre && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Projected Yield</span>
                      <span className="text-sm font-black text-emerald-700">{result.recommended_crop_yield_kg_acre} <span className="text-xs font-bold">kg/ac</span></span>
                    </div>
                  )}
                </div>

                {result.recommended_crop_income_inr && (
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-slate-600">
                        <span className="font-semibold">Mandi Rate:</span> <strong>₹{result.recommended_crop_market_price_inr_kg}/kg</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-600">Est. Revenue: </span>
                        <strong className="text-emerald-700 font-extrabold">₹{result.recommended_crop_income_inr.toLocaleString('en-IN')}/ac</strong>
                        {result.recommended_crop_income_inr > (result.estimated_gross_income_inr || 0) && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            +₹{(result.recommended_crop_income_inr - result.estimated_gross_income_inr).toLocaleString('en-IN')} gain
                          </span>
                        )}
                      </div>
                    </div>
                    {result.recommended_crop_water_req_l_acre && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-950">
                        <span className="font-bold text-[11px] flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-teal-600" /> Water Required / Acre:
                        </span>
                        <span className="font-black text-xs">
                          {result.recommended_crop_water_req_l_acre.toLocaleString('en-IN')} Liters <span className="text-[10px] text-teal-700 font-semibold">({result.recommended_crop_water_req_mm} mm equiv.)</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-950">
                      <span className="font-bold text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Crop Growth Duration:
                      </span>
                      <span className="font-black text-xs">
                        {result.recommended_crop_duration_days || '120 - 150 Days'}
                      </span>
                    </div>
                  </div>
                )}
              </div>


              {/* Disease Pathology & Risk Summary Card */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Disease & Pathology Risk Assessment
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[11px]">
                    {result.target_crop_risk_percent || 25}% Risk ({result.target_crop_risk_level || 'Evaluated'})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white/80 border border-amber-200/80">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{result.crop_type} Risk</span>
                    <span className="font-extrabold text-slate-900">{result.target_crop_risk_percent || 25}% ({result.target_crop_risk_level || 'Evaluated'})</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 border border-amber-200/80">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{result.recommended_crop} Risk</span>
                    <span className="font-extrabold text-emerald-700">{result.recommended_crop_risk_percent || 15}% ({result.recommended_crop_risk_level || 'Low Risk'})</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (setSelectedPrediction) setSelectedPrediction({ ...result, ...formData });
                    setActiveTab('risk');
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Bug className="w-4 h-4" /> View In-Depth Risk Field Report & Solutions <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(result.factor_impacts).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500 block capitalize">{key.replace('_impact','').replace('_',' ')}:</span>
                    <span className="font-bold text-emerald-700">{val}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setActiveTab('optimization')} className="w-full btn-secondary justify-center text-xs py-2.5 cursor-pointer">
                Optimize Resources for {formData.crop_type} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="glass-panel p-8 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-slate-300 min-h-64">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Sprout className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Awaiting Parameters</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-xs">Fill in the form and click "Predict Crop Yield" to run the ML model.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
