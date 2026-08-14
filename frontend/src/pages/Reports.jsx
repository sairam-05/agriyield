import React, { useState, useEffect } from 'react';
import { FileText, Printer, Sprout, FlaskConical, Droplet, UserCheck, LogIn, Shield, History as HistoryIcon, AlertCircle, TrendingUp } from 'lucide-react';
import { fetchHistory } from '../api';

export default function Reports({ selectedPrediction: initialSelected, setActiveTab, user, onOpenAuth }) {
  const [activeReport, setActiveReport] = useState(initialSelected);
  const [loadingHistory, setLoadingHistory] = useState(!initialSelected);

  useEffect(() => {
    if (initialSelected) {
      setActiveReport(initialSelected);
      setLoadingHistory(false);
    } else {
      setLoadingHistory(true);
      fetchHistory()
        .then(data => {
          if (data && data.length > 0) {
            setActiveReport(data[0]);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [initialSelected]);

  // Loading state while auto-fetching latest history
  if (loadingHistory) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 no-print">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-500">Loading Latest Prediction Report...</p>
      </div>
    );
  }

  // If no prediction report is available in history or props
  if (!activeReport) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-5 no-print">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900">No Prediction Reports Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            You don't have any saved prediction records yet. Run your first yield prediction to generate a comprehensive executive PDF report.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <button
            onClick={() => setActiveTab && setActiveTab('prediction')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            <Sprout className="w-4 h-4" /> Run Your First Yield Prediction
          </button>
        </div>
      </div>
    );
  }

  const report = activeReport;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Individual User Status Banner — hidden on print */}
      <div className="glass-panel p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Individual User Report</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Verified Account
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Belongs exclusively to <strong>{user.full_name}</strong> ({user.email})
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Guest Report View</h3>
                <p className="text-xs text-slate-600">
                  Sign in to lock predictions and reports to your personal user profile.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Action header — hidden on print */}
      <div className="glass-panel p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" /> Agricultural Summary Report
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Executive report for {report.crop_type} harvest prediction.
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-primary text-sm self-start sm:self-auto cursor-pointer">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Printable report — designed to fit A4 single page */}
      <div className="printable-report glass-panel p-5 md:p-7 space-y-5 border border-slate-200 bg-white text-slate-900 shadow-md">

        {/* Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">AgriYield AI Executive Report</h1>
              <p className="text-xs font-bold text-emerald-700">AI Crop Yield Prediction & Resource Optimization</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 sm:text-right">
            <p className="font-mono text-emerald-800 font-bold">Report ID: #{report.display_id || report.id || 1}</p>
            <p>Generated (IST): {report.created_at || 'Just now'}</p>
            <p className="text-emerald-700 font-bold mt-0.5">
              Owner: {user ? `${user.full_name} (${user.email})` : 'Individual User Preview'}
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="summary-box p-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">TARGET CROP EVALUATION</span>
            <div className="flex items-center gap-2">
              {report.target_crop_match_score && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-xs font-bold border border-white/30">
                  {report.target_crop_match_score}% Suitability Match
                </span>
              )}
              <span className="report-header-badge px-3 py-0.5 rounded-full bg-white text-emerald-900 text-sm font-black">
                {report.crop_type}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-emerald-100 uppercase block font-medium">PREDICTED YIELD</span>
              <span className="text-2xl md:text-3xl font-black text-white">{report.predicted_yield_kg_acre} <span className="text-sm text-emerald-200">kg / acre</span></span>
            </div>
            <div>
              <span className="text-xs text-emerald-100 uppercase block font-medium">METRIC EQUIVALENT</span>
              <span className="text-2xl md:text-3xl font-black text-white">{report.predicted_yield_tons_ha} <span className="text-sm text-teal-200">tons / ha</span></span>
            </div>
          </div>
          <div className="text-xs text-emerald-50 border-t border-white/20 pt-2">
            <strong>Summary:</strong> {report.optimization_summary}
          </div>
        </div>

        {/* 1. Market Rates & Economic Revenue Forecast */}
        <div>
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> 1. MARKET RATES & FINANCIAL REVENUE FORECAST
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="data-box p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-semibold uppercase text-[10px]">Current Mandi Price</span>
              <span className="text-base font-black text-slate-900">₹{report.market_price_inr_kg || 20} <span className="text-[10px] text-slate-500 font-normal">/ kg</span></span>
            </div>
            <div className="data-box p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 block font-semibold uppercase text-[10px]">Est. Target Gross Revenue</span>
              <span className="text-base font-black text-emerald-700">₹{(report.estimated_gross_income_inr || (report.predicted_yield_kg_acre * 22.5)).toLocaleString('en-IN')} <span className="text-[10px] text-emerald-800 font-normal">/ ac</span></span>
            </div>
            <div className="data-box p-3 rounded-xl bg-teal-50 border border-teal-200">
              <span className="text-teal-800 block font-semibold uppercase text-[10px]">Recommended ({report.recommended_crop}) Income</span>
              <span className="text-base font-black text-teal-800">
                ₹{(report.recommended_crop_income_inr || (report.recommended_crop_yield_kg_acre ? report.recommended_crop_yield_kg_acre * 22.0 : report.predicted_yield_kg_acre * 25.0)).toLocaleString('en-IN')} <span className="text-[10px] text-teal-700 font-normal">/ ac</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Input Conditions Grid */}
        <div>
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-emerald-600" /> 2. INPUT ENVIRONMENTAL & SOIL CONDITIONS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              ['Soil Type', report.soil_type],
              ['Soil pH', report.soil_ph],
              ['Nitrogen (N)', `${report.nitrogen} kg/ha`],
              ['P / K Nutrients', `P:${report.phosphorus} / K:${report.potassium} kg/ha`],
              ['Temperature', `${report.temperature} °C`],
              ['Annual Rainfall', `${report.rainfall} mm`],
              ['Humidity', `${report.humidity} %`],
              ['Irrigation / Sun', `${report.irrigation_level} / ${report.sunshine_hours} hrs`],
            ].map(([label, val]) => (
              <div key={label} className="data-box p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-semibold">{label}</span>
                <span className="font-bold text-slate-900">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Agronomic Factor Diagnostics */}
        {report.factor_impacts && (
          <div>
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" /> 3. AGRONOMIC FACTOR DIAGNOSTICS & STRESS ANALYSIS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(report.factor_impacts).map(([key, status]) => (
                <div key={key} className="data-box p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block font-semibold uppercase text-[10px]">{key.replace('_impact', '').replace('_', ' ')} Status</span>
                  <span className={`font-bold text-xs ${status.includes('Not Suitable') || status.includes('Stress') || status.includes('Deficient') ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Actionable Field Recommendations */}
        <div>
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-emerald-600" /> 4. ACTIONABLE ADVISORY RECOMMENDATIONS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="data-box p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
              <h4 className="font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-600" /> FERTILIZER ADJUSTMENT
              </h4>
              <p className="text-slate-700 leading-relaxed font-medium">{report.fertilizer_recommendation}</p>
            </div>
            <div className="data-box p-3.5 rounded-lg bg-teal-50 border border-teal-200 space-y-1">
              <h4 className="font-bold text-teal-800 uppercase flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-teal-600" /> IRRIGATION SCHEDULE
              </h4>
              <p className="text-slate-700 leading-relaxed font-medium">{report.irrigation_recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
