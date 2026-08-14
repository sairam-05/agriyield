import React from 'react';

export default function MetricCard({ title, value, unit, subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-200 text-emerald-700',
    amber: 'from-amber-500/10 to-yellow-500/5 border-amber-200 text-amber-700',
    teal: 'from-teal-500/10 to-cyan-500/5 border-teal-200 text-teal-700',
    blue: 'from-blue-500/10 to-indigo-500/5 border-blue-200 text-blue-700'
  };

  return (
    <div className={`glass-panel glass-panel-hover p-4 md:p-5 bg-gradient-to-br ${colorMap[color]} border relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <div className="flex flex-wrap items-baseline gap-1 mt-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</span>
            {unit && <span className="text-xs md:text-sm font-bold text-emerald-700">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-2 md:p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex-shrink-0">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
}
