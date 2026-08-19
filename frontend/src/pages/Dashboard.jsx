import React, { useEffect, useState } from 'react';
import { 
  Sprout, TrendingUp, Award, Layers, ArrowUpRight,
  Sparkles, Clock, Cpu, LogIn, Shield
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { fetchDashboardSummary, fetchModelMetrics } from '../api';

const defaultPresets = [
  { title: 'Optimal Wheat', crop: 'Wheat', soil: 'Loam', ph: 6.5, N: 120, P: 60, K: 40, temp: 21, rain: 620, hum: 60, irr: 'Medium', sun: 8.5 },
  { title: 'High Moisture Rice', crop: 'Rice', soil: 'Clay Loam', ph: 6.2, N: 140, P: 50, K: 50, temp: 27, rain: 1450, hum: 75, irr: 'High', sun: 7.0 },
  { title: 'Sugarcane Commercial', crop: 'Sugarcane', soil: 'Alluvial', ph: 6.8, N: 220, P: 80, K: 90, temp: 30, rain: 1800, hum: 70, irr: 'High', sun: 9.5 },
  { title: 'Cool Season Potato', crop: 'Potato', soil: 'Loam', ph: 5.8, N: 130, P: 75, K: 110, temp: 18, rain: 550, hum: 65, irr: 'Medium', sun: 7.5 },
  { title: 'Highland Coffee', crop: 'Coffee', soil: 'Laterite', ph: 6.0, N: 150, P: 40, K: 120, temp: 21, rain: 1600, hum: 80, irr: 'Medium', sun: 6.5 },
  { title: 'Orchard Apple', crop: 'Apple', soil: 'Silt Loam', ph: 6.2, N: 100, P: 40, K: 100, temp: 15, rain: 800, hum: 65, irr: 'Medium', sun: 8.0 },
  { title: 'Tropical Banana', crop: 'Banana', soil: 'Alluvial', ph: 6.5, N: 200, P: 60, K: 250, temp: 27, rain: 1700, hum: 78, irr: 'High', sun: 9.0 },
  { title: 'Dryland Maize', crop: 'Maize', soil: 'Black Soil', ph: 6.8, N: 150, P: 65, K: 60, temp: 25, rain: 780, hum: 58, irr: 'Medium', sun: 9.0 },
  { title: 'Desert Cotton', crop: 'Cotton', soil: 'Black Soil', ph: 7.2, N: 110, P: 55, K: 45, temp: 30, rain: 700, hum: 50, irr: 'High', sun: 10.0 },
  { title: 'Green Tea Plantation', crop: 'Tea', soil: 'Peaty', ph: 5.2, N: 140, P: 35, K: 70, temp: 20, rain: 1800, hum: 85, irr: 'Medium', sun: 6.0 },
  { title: 'Monsoon Soybean', crop: 'Soybean', soil: 'Clay Loam', ph: 6.6, N: 40, P: 60, K: 50, temp: 26, rain: 700, hum: 72, irr: 'Low', sun: 8.5 },
  { title: 'Hot Season Watermelon', crop: 'Watermelon', soil: 'Sandy Loam', ph: 6.8, N: 110, P: 70, K: 100, temp: 30, rain: 500, hum: 55, irr: 'High', sun: 11.0 },
];

export default function Dashboard({ setActiveTab, onSelectPreset, user, onOpenAuth }) {
  const [summary, setSummary] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sumRes, metRes] = await Promise.all([
        fetchDashboardSummary().catch(() => null),
        fetchModelMetrics().catch(() => null)
      ]);
      setSummary(sumRes);
      setMetricsData(metRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-emerald-100 border border-white/30 flex items-center gap-1.5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Real-time Agricultural Intelligence
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-extrabold text-white">Smart Farming & Crop Yield Optimization</h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Predict harvest yields across 20 crop types and 10 soil classifications powered by trained ML models.
            </p>
          </div>
          <button onClick={() => setActiveTab('prediction')} className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap w-full md:w-auto">
            <span>Run New Prediction</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <MetricCard title="Total Predictions" value={summary?.total_predictions ?? 0} subtitle={user ? `Saved for ${user.full_name}` : 'Sign in to save'} icon={Layers} color="emerald" />
        <MetricCard
          title="Best Model Accuracy"
          value={`${((metricsData?.metrics?.[metricsData?.best_model_name]?.R2 ?? 0.9059) * 100).toFixed(1)}%`}
          unit="R²"
          subtitle={metricsData?.best_model_name || 'Random Forest'}
          icon={Award}
          color="amber"
        />
        <MetricCard title="Supported" value="20 Crops" subtitle="10 Soil Types" icon={Cpu} color="blue" />
      </div>

      {/* Quick Scenario Presets */}
      <div className="glass-panel p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Quick Scenario Presets
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a pre-configured crop and climate profile to quickly populate the yield prediction form.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {defaultPresets.map((p, idx) => (
            <div
              key={idx}
              onClick={() => { if (onSelectPreset) onSelectPreset(p); setActiveTab('prediction'); }}
              className="p-3.5 rounded-xl border bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group hover:-translate-y-0.5 active:scale-95"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5 truncate">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{p.crop} • {p.soil}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">{p.temp}°C</span>
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-medium">{p.rain}mm</span>
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">pH {p.ph}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="glass-panel p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            Recent Yield Predictions Log {user && <span className="text-xs font-semibold text-emerald-700">({user.full_name})</span>}
          </h3>
          {user && (
            <button onClick={() => setActiveTab('history')} className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer">
              View All →
            </button>
          )}
        </div>

        {user ? (
          summary?.recent_predictions && summary.recent_predictions.length > 0 ? (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-left text-xs md:text-sm text-slate-700 min-w-[560px]">
                <thead className="text-xs uppercase bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="px-3 py-2.5">ID</th>
                    <th className="px-3 py-2.5">Crop</th>
                    <th className="px-3 py-2.5 hidden sm:table-cell">Soil</th>
                    <th className="px-3 py-2.5 hidden md:table-cell">Temp</th>
                    <th className="px-3 py-2.5">Yield (kg/acre)</th>
                    <th className="px-3 py-2.5 hidden md:table-cell">Rec. Crop</th>
                    <th className="px-3 py-2.5 hidden lg:table-cell">Time (IST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {summary.recent_predictions.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-emerald-700 font-bold text-xs">#{row.display_id || row.id}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{row.crop_type}</td>
                      <td className="px-3 py-2.5 hidden sm:table-cell text-slate-600">{row.soil_type}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-xs font-semibold text-slate-700">
                        {row.temperature !== undefined && row.temperature !== null ? `${row.temperature}°C` : '22°C'}
                      </td>
                      <td className="px-3 py-2.5 font-extrabold text-emerald-700">{row.predicted_yield_kg_acre}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">{row.recommended_crop}</span>
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-slate-500">{row.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Sprout className="w-8 h-8 text-emerald-600/40 mx-auto mb-2" />
              No predictions saved yet — run a prediction while signed in to build your personal log!
            </div>
          )
        ) : (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <Shield className="w-8 h-8 text-emerald-600 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Sign In to Save / Access Previous Data</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Sign in or create an account to record new yield predictions and access your previous data logs.
              </p>
            </div>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register Account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
