import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Search, Trash2, Eye, Sprout, Filter, RefreshCw, UserCheck, Shield, LogIn } from 'lucide-react';
import { fetchHistory, deleteHistoryItem } from '../api';

export default function History({ onSelectHistoryItem, setActiveTab, user, onOpenAuth }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try { 
      const data = await fetchHistory(); 
      setHistory(data); 
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [user]);

  const handleDelete = async (id, displayId, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete prediction record #${displayId}?`)) return;
    try { 
      await deleteHistoryItem(id); 
      await loadData(); 
    } catch (err) { 
      alert('Failed to delete record'); 
    }
  };

  const filtered = history.filter(item => {
    const q = searchTerm.toLowerCase();
    return (item.crop_type.toLowerCase().includes(q) || item.soil_type.toLowerCase().includes(q) || item.recommended_crop.toLowerCase().includes(q))
      && (cropFilter === 'All' || item.crop_type === cropFilter);
  });

  return (
    <div className="space-y-5">
      {/* User Status Banner */}
      <div className="glass-panel p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Personal History Log</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Private Account
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Showing reports and predictions exclusively for <strong>{user.full_name}</strong>
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
                <h3 className="font-bold text-slate-900 text-sm">Guest Log Mode</h3>
                <p className="text-xs text-slate-600">
                  Sign in to keep individual prediction reports saved under your private account.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Sync</span>
            </button>
          </div>
        )}
      </div>

      <div className="glass-panel p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-teal-600" /> Prediction History Log
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {user ? `Showing ${history.length} saved records for ${user.full_name}.` : 'Deleting any record auto-adjusts sequential IDs. Times shown in IST.'}
            </p>
          </div>
          <button onClick={loadData} className="btn-secondary text-xs self-start sm:self-auto cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="glass-panel p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search crop or soil..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs text-slate-700 font-semibold flex-shrink-0">Filter:</span>
          <select value={cropFilter} onChange={e => setCropFilter(e.target.value)} className="text-xs flex-1">
            <option value="All">All Crops</option>
            {[...new Set(history.map(h => h.crop_type))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-panel p-4 md:p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading user history...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-left text-xs md:text-sm text-slate-700 min-w-[580px]">
              <thead className="text-xs uppercase bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-3 py-2.5">ID</th>
                  <th className="px-3 py-2.5">Crop</th>
                  <th className="px-3 py-2.5 hidden sm:table-cell">Soil / pH</th>
                  <th className="px-3 py-2.5 hidden md:table-cell">NPK</th>
                  <th className="px-3 py-2.5 hidden md:table-cell">Temp</th>
                  <th className="px-3 py-2.5">Yield (kg/ac)</th>
                  <th className="px-3 py-2.5 hidden lg:table-cell">Rec. Crop</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((row, idx) => {
                  const displayNum = row.display_id || (filtered.length - idx);
                  const isUnsuitable = row.is_temperature_suitable === false;
                  return (
                    <tr key={row.id} onClick={() => { if (onSelectHistoryItem) onSelectHistoryItem({ ...row, display_id: displayNum }); setActiveTab('reports'); }} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-3 py-2.5 font-mono text-emerald-700 font-bold text-xs">#{displayNum}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">{row.crop_type}</td>
                      <td className="px-3 py-2.5 hidden sm:table-cell text-xs text-slate-600">{row.soil_type} (pH {row.soil_ph})</td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-xs text-slate-600">{row.nitrogen}-{row.phosphorus}-{row.potassium}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded-md border text-xs font-bold ${
                          isUnsuitable 
                            ? 'bg-amber-50 text-amber-900 border-amber-300' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {row.temperature !== undefined && row.temperature !== null ? `${row.temperature}°C` : '22°C'}
                          {isUnsuitable ? ' ⚠️' : ''}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-extrabold text-emerald-700">{row.predicted_yield_kg_acre}</td>
                      <td className="px-3 py-2.5 hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">{row.recommended_crop}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={e => { e.stopPropagation(); if (onSelectHistoryItem) onSelectHistoryItem({ ...row, display_id: displayNum }); setActiveTab('reports'); }} className="p-1.5 rounded-lg bg-slate-100 text-emerald-700 hover:bg-emerald-50 border border-slate-200 cursor-pointer" title="View Report"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={e => handleDelete(row.id, displayNum, e)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Sprout className="w-8 h-8 text-emerald-600/40 mx-auto mb-2" />
            <p className="font-bold text-slate-900">No Matching History Records</p>
            <p className="text-xs mt-1">
              {user ? `Run yield predictions while signed in as ${user.full_name} to populate your personal log.` : 'Run predictions to build your history log, or Sign In to sync existing user reports.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
