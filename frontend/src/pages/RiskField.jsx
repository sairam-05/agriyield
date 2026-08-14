import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Droplet, 
  Thermometer, 
  Search, 
  Filter, 
  Sparkles, 
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Bug,
  Leaf,
  Sprout
} from 'lucide-react';
import { fetchRiskAnalysis } from '../api';

export default function RiskField({ predictionResult, setActiveTab, onSelectCropForPrediction }) {
  const [formData, setFormData] = useState({
    crop_type: predictionResult?.crop_type || 'Wheat',
    soil_type: predictionResult?.soil_type || 'Loam',
    soil_ph: predictionResult?.soil_ph || 6.5,
    nitrogen: predictionResult?.nitrogen || 120,
    phosphorus: predictionResult?.phosphorus || 60,
    potassium: predictionResult?.potassium || 40,
    temperature: predictionResult?.temperature || 22.0,
    rainfall: predictionResult?.rainfall || 650,
    humidity: predictionResult?.humidity || 65.0,
    irrigation_level: predictionResult?.irrigation_level || 'Medium',
    sunshine_hours: predictionResult?.sunshine_hours || 8.0
  });

  const [riskData, setRiskData] = useState(predictionResult || null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const cropsList = ['Wheat','Rice','Maize','Cotton','Sugarcane','Soybean','Tomato','Potato','Barley','Chickpea','Groundnut','Coffee','Tea','Onion','Garlic','Mustard','Sunflower','Apple','Banana','Watermelon'];

  useEffect(() => {
    if (predictionResult) {
      setRiskData(predictionResult);
    } else {
      runRiskAnalysis(formData);
    }
  }, [predictionResult]);

  const runRiskAnalysis = async (payload) => {
    setLoading(true);
    try {
      const res = await fetchRiskAnalysis(payload);
      setRiskData(res);
    } catch (err) {
      console.error('Risk analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runRiskAnalysis(formData);
  };

  const targetRiskPercent = riskData?.target_crop_risk_percent ?? 25.0;
  const targetRiskLevel = riskData?.target_crop_risk_level || (targetRiskPercent > 50 ? 'High Risk' : 'Low Risk');
  const targetDiseases = riskData?.target_crop_diseases || [];

  const recCrop = riskData?.recommended_crop || 'Onion';
  const recRiskPercent = riskData?.recommended_crop_risk_percent ?? 15.0;
  const recRiskLevel = riskData?.recommended_crop_risk_level || 'Low Risk';
  const recDiseases = riskData?.recommended_crop_diseases || [];

  const riskMatrix = riskData?.all_crops_risk_matrix || [];

  const filteredMatrix = riskMatrix.filter(item => {
    const matchesSearch = item.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primary_diseases.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = riskFilter === 'All' || item.risk_level === riskFilter;
    return matchesSearch && matchesFilter;
  });

  const getRiskBadgeColor = (level, percent) => {
    if (percent >= 75 || level === 'Severe Risk') return 'bg-red-100 text-red-800 border-red-300';
    if (percent >= 50 || level === 'High Risk') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (percent >= 25 || level === 'Moderate Risk') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white shadow-lg border border-teal-800/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Agronomic Disease & Risk Intelligence
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-extrabold text-white">Crop Risk Field & Pathology Solution Center</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Evaluate real-time disease probabilities, environmental infection vectors, and organic & chemical solutions across all 20 crop varieties.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('prediction')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sprout className="w-4 h-4" /> Run New Prediction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="lg:col-span-4 glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Bug className="w-4 h-4 text-emerald-600" /> Field & Climate Parameters
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop Variety</label>
            <select name="crop_type" value={formData.crop_type} onChange={handleChange} className="w-full">
              {cropsList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Temp (°C)</label>
              <input type="number" step="0.5" min="-10" max="60" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Humidity (%)</label>
              <input type="number" step="0.5" min="0" max="100" name="humidity" value={formData.humidity} onChange={handleChange} className="w-full" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rainfall (mm)</label>
              <input type="number" step="1" min="0" max="5000" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil pH</label>
              <input type="number" step="0.1" min="3.5" max="10.0" name="soil_ph" value={formData.soil_ph} onChange={handleChange} className="w-full" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary justify-center text-xs py-2.5">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{loading ? 'Evaluating Pathology Risk...' : 'Analyze Risk Field'}</span>
          </button>
        </form>

        {/* Current Risk Diagnostics */}
        <div className="lg:col-span-8 space-y-4">
          {/* Target vs Recommended Risk Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Crop Risk Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">EXPECTED CROP RISK</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-black ${getRiskBadgeColor(targetRiskLevel, targetRiskPercent)}`}>
                  {targetRiskPercent}% {targetRiskLevel}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{formData.crop_type}</h3>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      targetRiskPercent > 60 ? 'bg-red-500' : targetRiskPercent > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${targetRiskPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-slate-600 pt-1">
                <strong>Primary Pathogen Vectors:</strong> {targetDiseases.length > 0 ? targetDiseases.map(d => d.name.split('(')[0]).join(', ') : 'Low Disease Risk'}
              </div>
            </div>

            {/* Recommended Crop Risk Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">RECOMMENDED CROP RISK</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-black ${getRiskBadgeColor(recRiskLevel, recRiskPercent)}`}>
                  {recRiskPercent}% {recRiskLevel}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-900">{recCrop}</h3>
                <div className="w-full bg-emerald-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${recRiskPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-emerald-800 pt-1">
                <strong>Safety Advantage:</strong> {targetRiskPercent > recRiskPercent ? `${(targetRiskPercent - recRiskPercent).toFixed(1)}% lower risk than ${formData.crop_type}` : 'Optimal disease resistance'}
              </div>
            </div>
          </div>

          {/* Disease Solution Cards */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Disease Pathology Diagnostics & Treatment Solutions for {formData.crop_type}
            </h3>

            {targetDiseases.length > 0 ? (
              <div className="space-y-4">
                {targetDiseases.map((disease, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Bug className="w-4 h-4 text-slate-700" />
                        <h4 className="font-extrabold text-sm text-slate-900">{disease.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-300">
                          🔬 Category: {disease.disease_type || 'Fungal Pathology'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-extrabold ${getRiskBadgeColor(disease.risk_level, disease.probability_percent)}`}>
                        {disease.probability_percent}% Probability ({disease.risk_level})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Visual Symptoms:</strong> {disease.symptoms}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                        <span className="font-bold text-emerald-900 uppercase flex items-center gap-1.5 text-[11px]">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Organic & Biological Solution
                        </span>
                        <p className="text-emerald-950 font-medium leading-relaxed">{disease.organic_solution}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 space-y-1">
                        <span className="font-bold text-teal-900 uppercase flex items-center gap-1.5 text-[11px]">
                          <FlaskConical className="w-3.5 h-3.5 text-teal-600" /> Chemical Treatment Dose
                        </span>
                        <p className="text-teal-950 font-medium leading-relaxed">{disease.chemical_solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                No severe disease pathogens detected for current environmental parameters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 20 Crop Risk Breakdown Matrix */}
      <div className="glass-panel p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" /> All 20 Crops Disease Risk Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative pathology risk percentages under your field's exact weather and soil profile.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search crop or disease..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-8 text-xs py-1.5 w-48" 
              />
            </div>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="text-xs py-1.5">
              <option value="All">All Risk Levels</option>
              <option value="Low Risk">Low Risk (&lt;25%)</option>
              <option value="Moderate Risk">Moderate Risk (25-50%)</option>
              <option value="High Risk">High Risk (50-75%)</option>
              <option value="Severe Risk">Severe Risk (&gt;75%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-left text-xs md:text-sm text-slate-700 min-w-[620px]">
            <thead className="text-xs uppercase bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-3 py-2.5">Crop Variety</th>
                <th className="px-3 py-2.5">Risk Level</th>
                <th className="px-3 py-2.5">Disease Risk Gauge</th>
                <th className="px-3 py-2.5 hidden md:table-cell">Disease Categories & Types</th>
                <th className="px-3 py-2.5 hidden lg:table-cell">Primary Susceptible Diseases</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {row.crop_type}
                    {row.crop_type === formData.crop_type && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Target</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-md border text-xs font-bold ${getRiskBadgeColor(row.risk_level, row.risk_percent)}`}>
                      {row.risk_percent}% {row.risk_level}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 w-36">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          row.risk_percent > 60 ? 'bg-red-500' : row.risk_percent > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${row.risk_percent}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell text-xs">
                    <div className="flex items-center gap-1 flex-wrap">
                      {(row.disease_types || ['Fungal Pathology']).map((type, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                          🔬 {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-slate-600">
                    {row.primary_diseases.join(', ')}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, crop_type: row.crop_type }));
                        runRiskAnalysis({ ...formData, crop_type: row.crop_type });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Analyze Diseases
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
