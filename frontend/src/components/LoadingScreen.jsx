import React, { useState, useEffect } from 'react';
import { Sprout, Cpu, Database, TrendingUp, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoadingScreen({ onFinished, title, subtitle, customSteps }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const defaultSteps = [
    { label: "Initializing Machine Learning Engines...", icon: Cpu },
    { label: "Connecting to Agriyield Database...", icon: Database },
    { label: "Fetching Mandi Market Prices & NPK Profiles...", icon: TrendingUp },
    { label: "System Ready!", icon: CheckCircle }
  ];

  const steps = customSteps || defaultSteps;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onFinished) onFinished();
            }, 400);
          }, 250);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 18) + 12;
        return next > 100 ? 100 : next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onFinished]);

  useEffect(() => {
    if (steps.length === 0) return;
    const stepRatio = 100 / steps.length;
    const idx = Math.min(steps.length - 1, Math.floor(progress / stepRatio));
    setCurrentStep(idx);
  }, [progress, steps.length]);

  const StepIcon = steps[currentStep]?.icon || CheckCircle;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Glowing Rings */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute w-64 h-64 rounded-full bg-teal-500/10 blur-2xl animate-ping"></div>

      <div className="relative z-10 max-w-md w-full px-6 text-center space-y-6">
        {/* Animated Brand Icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center transform hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
              <Sprout className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        {/* Brand Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-200 to-teal-400 bg-clip-text text-transparent">
            {title || "AgriYield AI"}
          </h1>
          <p className="text-xs text-emerald-300/80 font-medium tracking-wide mt-1">
            {subtitle || "Yield Prediction & Agronomic Market Intelligence"}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-3 pt-2">
          <div className="w-full bg-slate-800/80 border border-emerald-500/20 rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-200 ease-out shadow-lg shadow-emerald-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <StepIcon className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{steps[currentStep]?.label}</span>
            </div>
            <span className="text-white font-mono font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
