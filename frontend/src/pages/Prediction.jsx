import React, { useState, useEffect } from 'react';
import { TrendingUp, Sprout, FlaskConical, Thermometer, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Sparkles, ShieldAlert, Bug } from 'lucide-react';
import { predictYield } from '../api';

export default function Prediction({ initialPreset, setActiveTab, setSelectedPrediction }) {
  const [formData, setFormData] = useState({
    crop_type: 'Wheat', soil_type: 'Loam', soil_ph: 6.5,
    nitrogen: 120, phosphorus: 60, potassium: 40,
    temperature: 22.0, rainfall: 650, humidity: 65.0,
    irrigation_level: 'Medium', sunshine_hours: 8.0
  });

  useEffect(() => {
    if (initialPreset) {
      setFormData(prev => ({
        ...prev,
        crop_type: initialPreset.crop || prev.crop_type,
        soil_type: initialPreset.soil || prev.soil_type,
        soil_ph: initialPreset.ph ?? prev.soil_ph,
        nitrogen: initialPreset.N ?? prev.nitrogen,
        phosphorus: initialPreset.P ?? prev.phosphorus,
        potassium: initialPreset.K ?? prev.potassium,
        temperature: initialPreset.temp ?? prev.temperature,
        rainfall: initialPreset.rain ?? prev.rainfall,
        humidity: initialPreset.hum ?? prev.humidity,
        irrigation_level: initialPreset.irr || prev.irrigation_level,
        sunshine_hours: initialPreset.sun ?? prev.sunshine_hours
      }));
    }
  }, [initialPreset]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const crops = ['Wheat','Rice','Maize','Cotton','Sugarcane','Soybean','Tomato','Potato','Barley','Chickpea','Groundnut','Coffee','Tea','Onion','Garlic','Mustard','Sunflower','Apple','Banana','Watermelon'];
  const soilTypes = ['Loam','Clay Loam','Alluvial','Black Soil','Red Soil','Sandy Loam','Peaty','Saline','Silt Loam','Laterite'];
  const irrigationLevels = ['Low','Medium','High'];

  const handleChange = e => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await predictYield(formData);
      setResult(res);
      if (setSelectedPrediction) setSelectedPrediction({ ...formData, ...res });
    } catch (err) {
      setError(err.message || 'Prediction request failed');
    } finally { setLoading(false); }
  };

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

          {/* Crop & Soil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type (20 Varieties)</label>
              <select name="crop_type" value={formData.crop_type} onChange={handleChange} className="w-full">
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
              {[
                ['temperature','Temperature (°C)',0.5,-10,60],
                ['rainfall','Rainfall (mm)',1,0,5000],
                ['humidity','Humidity (%)',0.5,0,100],
                ['sunshine_hours','Sunshine (hrs/day)',0.5,0,24]
              ].map(([name,label,step,min,max])=>(
                <div key={name} className="flex flex-col justify-end">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 min-h-[24px] flex items-end">{label}</label>
                  <input type="number" step={step} min={min} max={max} name={name} value={formData[name]} onChange={handleChange} className="w-full" required />
                </div>
              ))}
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-semibold text-slate-700 mb-1 min-h-[24px] flex items-end">Irrigation Level</label>
                <select name="irrigation_level" value={formData.irrigation_level} onChange={handleChange} className="w-full">
                  {irrigationLevels.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
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

              {result.is_temperature_suitable === false && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
                    <span className="text-base">⚠️</span> Not Suitable for {formData.temperature}°C Temperature
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-amber-900">
                    {result.temperature_warning}
                  </p>
                </div>
              )}

              <div className={`p-5 rounded-2xl bg-white border shadow-sm space-y-3 ${result.is_temperature_suitable === false ? 'border-amber-200 bg-amber-50/30' : 'border-emerald-200'}`}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Expected {formData.crop_type} Yield</p>
                    {result.target_crop_match_score && (
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold shadow-2xs ${
                        result.is_temperature_suitable === false 
                          ? 'bg-amber-100 border-amber-300 text-amber-900' 
                          : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      }`}>
                        {result.target_crop_match_score}% match {result.is_temperature_suitable === false ? '(Unsuitable Temp)' : ''}
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
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Market Price</span>
                      <span className="text-sm font-black text-slate-900">₹{result.market_price_inr_kg} <span className="text-[10px] font-semibold text-slate-500">/ kg</span></span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Est. Gross Revenue</span>
                      <span className="text-sm font-black text-emerald-700">₹{result.estimated_gross_income_inr.toLocaleString('en-IN')} <span className="text-[10px] font-semibold text-emerald-800">/ ac</span></span>
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
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
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
                )}
              </div>

              {result.fertilizer_recommendation && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-1">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-emerald-600" /> Fertilizer Recommendation (N-P-K)
                  </h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{result.fertilizer_recommendation}</p>
                </div>
              )}

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
