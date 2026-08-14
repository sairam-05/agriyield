import React, { useState } from 'react';
import { Compass, Sprout, CheckCircle2, Award, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { recommendCrops } from '../api';

export default function Recommendation({ setActiveTab, onSelectCropForPrediction }) {
  const [formData, setFormData] = useState({
    soil_type: 'Loam', soil_ph: 6.5,
    nitrogen: 120, phosphorus: 60, potassium: 40,
    temperature: 24.0, rainfall: 700, humidity: 65.0, sunshine_hours: 8.0
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const soilTypes = ['Loam','Clay Loam','Alluvial','Black Soil','Red Soil','Sandy Loam','Peaty','Saline','Silt Loam','Laterite'];

  const handleChange = e => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try { const res = await recommendCrops(formData); setResult(res); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="glass-panel p-5 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-6 h-6 text-teal-600" /> AI Crop Selection Advisor
        </h2>
        <p className="text-slate-600 text-sm mt-1">Analyzes your soil and climate parameters to rank suitability across all 20 crop varieties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form onSubmit={handleSubmit} className="lg:col-span-4 glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Field & Weather Profile</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type (10 Types)</label>
            <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="w-full">
              {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['soil_ph','Soil pH',0.1],['temperature','Temp (°C)',0.5],['rainfall','Rainfall (mm)',1],['humidity','Humidity (%)',0.5]].map(([name,label,step])=>(
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                <input type="number" step={step} name={name} value={formData[name]} onChange={handleChange} className="w-full" required />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[['nitrogen','N (kg/ha)'],['phosphorus','P (kg/ha)'],['potassium','K (kg/ha)']].map(([name,label])=>(
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                <input type="number" name={name} value={formData[name]} onChange={handleChange} className="w-full" required />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary justify-center text-sm py-2.5 cursor-pointer">
            {loading
              ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin"/>Evaluating...</span>
              : <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-300"/>Rank Recommended Crops</span>}
          </button>
        </form>

        <div className="lg:col-span-8 space-y-4">
          {result ? (
            <>
              <div className="glass-panel p-4 bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 flex items-center justify-between text-white shadow-md">
                <div>
                  <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">#1 Best Match</span>
                  <h3 className="text-xl md:text-2xl font-black text-white">{result.top_recommended}</h3>
                </div>
                <Award className="w-8 h-8 text-amber-300" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommendations.map((item, idx) => (
                  <div key={idx} className="glass-panel p-4 glass-panel-hover flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-emerald-600" />{item.crop_type}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.suitability_score}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${Math.min(100, item.suitability_score)}%` }} />
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      {item.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /><span>{r}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { if (onSelectCropForPrediction) onSelectCropForPrediction(item.crop_type, formData); setActiveTab('prediction'); }} className="w-full btn-secondary text-xs py-1.5 justify-center cursor-pointer">
                      Predict Yield for {item.crop_type} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="glass-panel p-8 text-center text-slate-500 border-dashed border-slate-300">
              <Compass className="w-10 h-10 text-emerald-600/40 mx-auto mb-2" />
              <p className="font-bold text-slate-900">No Recommendations Yet</p>
              <p className="text-xs mt-1">Submit your field parameters to rank crop suitability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
