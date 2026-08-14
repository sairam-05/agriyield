import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, X, Leaf, AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const data = await loginUser({
          email: formData.email,
          password: formData.password
        });
        onAuthSuccess(data.user);
      } else {
        if (!formData.full_name.trim()) {
          throw new Error('Please enter your full name');
        }
        const data = await registerUser({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password
        });
        onAuthSuccess(data.user);
      }
      onClose();
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message || "";

      if (status === 404 || detail.includes("Account not found") || detail.includes("not found")) {
        setError(`No account found for "${formData.email}". Redirecting to Create Account...`);
        setTimeout(() => {
          setIsLogin(false);
        }, 1200);
      } else {
        setError(detail || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 mb-3">
            <Leaf className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin ? 'Sign in to sync yield predictions and farm reports' : 'Join AgriYield AI to track and optimize your farm performance'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-xl mb-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLogin 
                ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !isLogin 
                ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none z-10 text-emerald-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  required={!isLogin}
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={{ paddingLeft: '2.75rem', paddingRight: '1rem' }}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-xl py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none z-10 text-emerald-600">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{ paddingLeft: '2.75rem', paddingRight: '1rem' }}
                className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-xl py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none z-10 text-emerald-600">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-xl py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-700 z-10 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
