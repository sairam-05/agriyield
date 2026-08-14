import React, { useState } from 'react';
import { 
  Sprout, 
  LayoutDashboard, 
  TrendingUp, 
  Compass, 
  Droplet, 
  BarChart3, 
  History, 
  FileText,
  ShieldAlert,
  Menu,
  X,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'prediction', label: 'Yield Prediction', icon: TrendingUp },
  { id: 'recommendation', label: 'Crop Recommendation', icon: Compass },
  { id: 'optimization', label: 'Resource Advisor', icon: Droplet },
  { id: 'risk', label: 'Risk Field', icon: ShieldAlert },
  { id: 'analysis', label: 'Weather & Soil', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
  { id: 'reports', label: 'Reports', icon: FileText }
];

export default function Navbar({ activeTab, setActiveTab, healthStatus, user, onOpenAuth, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOnline = healthStatus?.status === 'online';

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop / Tablet Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 lg:px-8 py-3 mb-5 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <button onClick={() => handleNav('dashboard')} className="flex items-center gap-3 flex-shrink-0 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">AgriYield <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI</span></span>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">v1.1</span>
              </div>
              <p className="text-xs text-slate-500 leading-tight">Crop Yield & Resource Optimization</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 min-w-0 flex-1 overflow-x-auto scrollbar-none py-0.5 px-1 scroll-smooth">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Auth & API Status */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isOnline ? 'API Online' : 'Offline'}</span>
            </div>

            {/* Auth Button / Profile Pill */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="font-bold hidden sm:inline text-slate-800">{user.full_name}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-red-300 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 bg-white shadow-xl mx-3 p-3 rounded-2xl border border-slate-200 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            {user && (
              <div className="p-3 mb-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Logged in as <strong>{user.full_name}</strong></span>
                </div>
                <button 
                  onClick={() => { onLogout(); setMobileOpen(false); }}
                  className="text-red-600 font-bold"
                >
                  Sign Out
                </button>
              </div>
            )}

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {!user && (
              <button
                onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                className="w-full mt-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Register
              </button>
            )}

            <div className="pt-2 px-4 pb-1 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 mt-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {isOnline ? `Backend Online · ${healthStatus?.best_model_name || 'Random Forest'}` : 'Backend Offline'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
