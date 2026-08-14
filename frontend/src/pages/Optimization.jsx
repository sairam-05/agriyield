import React, { useState } from 'react';
import { Droplet, Sprout, TrendingUp, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { optimizeResources } from '../api';

export default function Optimization() {
  const [formData, setFormData] = useState({
    crop_type: 'Wheat', soil_ph: 6.5,
    nitrogen: 80, phosphorus: 35, potassium: 30,
    rainfall: 450, irrigation_level: 'Low'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const crops = ['Wheat','Rice','Maize','Cotton','Sugarcane','Soybean','Tomato','Potato','Barley','Chickpea','Groundnut','Coffee','Tea','Onion','Garlic','Mustard','Sunflower','Apple','Banana','Watermelon'];

  const handleChange = e => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try { const res = await optimizeResources(formData); setResult(res); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="glass-panel p-5 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Droplet className="w-6 h-6 text-amber-600" /> Precision Resource Optimization
        </h2>
        <p className="text-slate-600 text-sm mt-1">Calculate optimal NPK ratios and irrigation schedules for 20 crop varieties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form onSubmit={handleSubmit} className="lg:col-span-4 glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Target Crop & Current Inputs</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop (20 Varieties)</label>
            <select name="crop_type" value={formData.crop_type} onChange={handleChange} className="w-full">
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil pH</label>
              <input type="number" step="0.1" name="soil_ph" value={formData.soil_ph} onChange={handleChange} className="w-full" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation Level</label>
              <select name="irrigation_level" value={formData.irrigation_level} onChange={handleChange} className="w-full">
                {['Low','Medium','High'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['nitrogen','N (kg/ha)'],['phosphorus','P (kg/ha)'],['potassium','K (kg/ha)']].map(([name,label])=>(
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
                <input type="number" name={name} value={formData[name]} onChange={handleChange} className="w-full" required />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Rainfall (mm)</label>
            <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full" required />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary justify-center text-sm py-2.5 cursor-pointer">
            {loading
              ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin"/>Calculating...</span>
              : <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-300"/>Optimize NPK & Water</span>}
          </button>
        </form>

        <div className="lg:col-span-8 space-y-4">
          {result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 border border-emerald-600 text-white shadow-md">
                  <p className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider">Yield Boost Potential</p>
                  <p className="text-2xl md:text-4xl font-black text-white mt-1.5 drop-shadow-xs">+{result.potential_yield_increase_percent}%</p>
                  <p className="text-xs font-semibold text-emerald-100 mt-1">By correcting NPK & water deficits</p>
                </div>
                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-teal-700 via-emerald-800 to-teal-800 border border-teal-600 text-white shadow-md">
                  <p className="text-xs font-extrabold text-teal-100 uppercase tracking-wider">Sustainability Rating</p>
                  <p className="text-xl md:text-3xl font-black text-white mt-1.5 drop-shadow-xs">{result.sustainability_rating}</p>
                  <p className="text-xs font-semibold text-teal-100 mt-1">Resource Efficiency Score</p>
                </div>
              </div>

              <div className="glass-panel p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Sprout className="w-4 h-4 text-emerald-600" /> NPK Nutrient Balance
                </h3>
                {result.npk_analysis.map((elem, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{elem.element}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          elem.status==='Deficient' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          elem.status==='Excess' ? 'bg-red-100 text-red-800 border border-red-300' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>{elem.status}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{elem.recommendation}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-slate-500 block font-semibold">Current / Target</span>
                      <span className="text-sm font-extrabold text-emerald-700">{elem.current} / {elem.optimal} kg/ha</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-panel p-5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                  <Droplet className="w-4 h-4 text-teal-600" /> Irrigation Recommendation
                </h3>
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-teal-800 uppercase">{result.water_analysis.status}</span>
                    <p className="text-sm text-slate-700 mt-1">{result.water_analysis.recommendation}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-500 block font-semibold">Supply / Demand</span>
                    <span className="text-sm font-extrabold text-teal-700">{result.water_analysis.current_water_estimate} / {result.water_analysis.crop_water_requirement} mm</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-8 text-center text-slate-500 border-dashed border-slate-300">
              <Droplet className="w-10 h-10 text-amber-500/40 mx-auto mb-2" />
              <p className="font-bold text-slate-900">No Resource Plan Yet</p>
              <p className="text-xs mt-1">Click "Optimize NPK & Water" to get recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
