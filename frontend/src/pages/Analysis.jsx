import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, RefreshCw } from 'lucide-react';
import { fetchSensitivityAnalysis, fetchModelMetrics } from '../api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Analysis() {
  const [formData, setFormData] = useState({
    crop_type: 'Wheat', soil_type: 'Loam', soil_ph: 6.5,
    nitrogen: 120, phosphorus: 60, potassium: 40,
    temperature: 22.0, rainfall: 650, humidity: 65.0,
    irrigation_level: 'Medium', sunshine_hours: 8.0,
    variable_name: 'rainfall'
  });
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);

  const crops = ['Wheat','Rice','Maize','Cotton','Sugarcane','Soybean','Tomato','Potato','Barley','Chickpea','Groundnut','Coffee','Tea','Onion','Garlic','Mustard','Sunflower','Apple','Banana','Watermelon'];

  const loadSensitivity = async (payload) => {
    setLoading(true);
    try {
      const res = await fetchSensitivityAnalysis(payload);
      setChartData({
        labels: res.points.map(p => p.value),
        datasets: [{
          label: `${payload.crop_type} Yield (kg/acre) vs ${payload.variable_name.toUpperCase()}`,
          data: res.points.map(p => p.predicted_yield),
          borderColor: '#059669', backgroundColor: 'rgba(16,185,129,0.15)',
          fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
          pointBackgroundColor: '#047857', pointBorderColor: '#ffffff'
        }]
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadSensitivity(formData);
    fetchModelMetrics().then(setMetricsData).catch(() => null);
  }, []);

  const handleChange = e => {
    const newForm = { ...formData, [e.target.name]: e.target.value };
    setFormData(newForm);
    loadSensitivity(newForm);
  };

  const modelMetrics = metricsData?.metrics || {
    "Linear Regression": { MAE: 1107.57, RMSE: 1978.66, R2: 0.717 },
    "Decision Tree": { MAE: 788.41, RMSE: 1633.48, R2: 0.8071 },
    "Gradient Boosting": { MAE: 725.22, RMSE: 1293.40, R2: 0.8791 },
    "Random Forest Regressor": { MAE: 573.54, RMSE: 1141.16, R2: 0.9059 }
  };

  const tooltipDefaults = {
    backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#34d399',
    bodyColor: '#ffffff', borderColor: '#cbd5e1', borderWidth: 1
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: '#475569', font: { family: 'Inter', size: 11 } } }, tooltip: tooltipDefaults },
    scales: {
      x: { title: { display: true, text: formData.variable_name.toUpperCase(), color: '#475569' }, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' } },
      y: { title: { display: true, text: 'Yield (kg/acre)', color: '#475569' }, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' } }
    }
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { color: '#475569', font: { size: 11 } } }, tooltip: tooltipDefaults },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#475569' } }
    }
  };

  const mlBarData = {
    labels: Object.keys(modelMetrics),
    datasets: [
      { label: 'R² Score (%)', data: Object.values(modelMetrics).map(m => (m.R2 * 100).toFixed(1)), backgroundColor: 'rgba(16,185,129,0.8)', borderColor: '#059669', borderWidth: 1.5, borderRadius: 8 },
      { label: 'MAE (Lower Better)', data: Object.values(modelMetrics).map(m => m.MAE), backgroundColor: 'rgba(245,158,11,0.8)', borderColor: '#d97706', borderWidth: 1.5, borderRadius: 8 }
    ]
  };

  return (
    <div className="space-y-5">
      <div className="glass-panel p-5 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" /> Weather & Soil Sensitivity Analytics
        </h2>
        <p className="text-slate-600 text-sm mt-1">Interactive non-linear yield sensitivity curves across weather and soil variables.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">Simulation Parameters</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop</label>
            <select name="crop_type" value={formData.crop_type} onChange={handleChange} className="w-full">
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Variable to Sweep</label>
            <select name="variable_name" value={formData.variable_name} onChange={handleChange} className="w-full">
              <option value="rainfall">Annual Rainfall (mm)</option>
              <option value="temperature">Temperature (°C)</option>
              <option value="nitrogen">Nitrogen N (kg/ha)</option>
              <option value="soil_ph">Soil pH</option>
            </select>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-emerald-700 block">How to read:</span>
            <p>The curve sweeps the selected variable while holding all other parameters constant, showing the ML model's non-linear yield response.</p>
          </div>
        </div>

        {/* Sensitivity Chart */}
        <div className="lg:col-span-8 glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">{formData.crop_type} Yield — {formData.variable_name.toUpperCase()} Curve</h3>
            {loading && <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />}
          </div>
          <div className="h-64 md:h-72 w-full">
            {chartData ? <Line data={chartData} options={lineOptions} /> : <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
