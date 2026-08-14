import React, { useState } from 'react';
import { Sprout, LogIn, UserPlus, Lock, Mail, User, ArrowRight, ShieldCheck, TrendingUp, FlaskConical, AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '../api';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser({
          email: formData.email,
          password: formData.password
        });
        onAuthSuccess(res.user);
      } else {
        if (!formData.full_name.trim()) {
          throw new Error("Full Name is required for registration.");
        }
        await registerUser({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password
        });
        const res = await loginUser({
          email: formData.email,
          password: formData.password
        });
        onAuthSuccess(res.user);
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message || "";

      if (status === 404 || detail.includes("Account not found") || detail.includes("not found")) {
        setError(`No account found for "${formData.email}". Redirecting to Create Account...`);
        setTimeout(() => {
          setMode('register');
        }, 1200);
      } else {
        setError(detail || "Authentication failed. Please check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Attempt login demo user
      try {
        const res = await loginUser({ email: "farmer@agriyield.ai", password: "Password123!" });
        onAuthSuccess(res.user);
        return;
      } catch (err) {
        // Register demo user if doesn't exist
        await registerUser({ full_name: "Agronomist Demo", email: "farmer@agriyield.ai", password: "Password123!" });
        const res = await loginUser({ email: "farmer@agriyield.ai", password: "Password123!" });
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError("Failed to initialize demo login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: System Information & Features */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Portal Access</span>
          </div>

          <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sprout className="w-7 h-7 text-slate-950" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">AgriYield AI</h1>
            </div>
            <p className="text-base text-slate-300 font-medium leading-relaxed">
              AI-Powered Crop Yield Prediction & Agronomic Market Intelligence System.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <Sprout className="w-4 h-4" /> Yield Prediction
              </div>
              <p className="text-xs text-slate-400">Random Forest models for 20 crop profiles under custom soil & weather.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase">
                <TrendingUp className="w-4 h-4" /> Market Revenues
              </div>
              <p className="text-xs text-slate-400">Mandi prices per kg and estimated gross income per acre.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <FlaskConical className="w-4 h-4" /> NPK Advisor
              </div>
              <p className="text-xs text-slate-400">Specific numerical fertilizer and irrigation gap adjustments.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" /> Account Logs
              </div>
              <p className="text-xs text-slate-400">Private account isolation saved to Microsoft Access Database.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Mandatory Sign In / Sign Up Form Card */}
        <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </button>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              {mode === 'login' ? 'Sign In to Access Portal' : 'Register New Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Enter your account credentials to access predictions and tools.'
                : 'Create an individual user account to record and store yield predictions.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Portal' : 'Create Account & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Want to test quickly?</span>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              ⚡ One-Click Demo Access
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
