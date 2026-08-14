import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LoadingScreen from './components/LoadingScreen';
import AuthScreen from './components/AuthScreen';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import Recommendation from './pages/Recommendation';
import Optimization from './pages/Optimization';
import RiskField from './pages/RiskField';
import Analysis from './pages/Analysis';
import History from './pages/History';
import Reports from './pages/Reports';
import { fetchHealth, fetchCurrentUser, setAuthToken } from './api';
import { ShieldCheck, Database, TrendingUp, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthStatus, setHealthStatus] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  
  // Loading & Auth state
  const [isLoading, setIsLoading] = useState(true);
  const [isPostAuthLoading, setIsPostAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    async function initApp() {
      // Check health
      const status = await fetchHealth();
      setHealthStatus(status);

      // Check current user session
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }

    initApp();

    const interval = setInterval(async () => {
      const status = await fetchHealth();
      setHealthStatus(status);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setAuthModalOpen(false);
    setIsPostAuthLoading(true);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setIsPostAuthLoading(false);
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
  };

  const handleSelectCropForPrediction = (cropName, envData) => {
    setSelectedPreset({
      crop: cropName,
      soil: envData.soil_type,
      ph: envData.soil_ph,
      N: envData.nitrogen,
      P: envData.phosphorus,
      K: envData.potassium,
      temp: envData.temperature,
      rain: envData.rainfall,
      hum: envData.humidity,
      sun: envData.sunshine_hours
    });
  };

  const handleSelectHistoryItem = (historyItem) => {
    setSelectedPrediction(historyItem);
  };

  // 1. Initial Site Load Splash Screen
  if (isLoading) {
    return <LoadingScreen onFinished={() => setIsLoading(false)} />;
  }

  // 2. Mandatory Authentication Gate (If unauthenticated, require Sign In / Sign Up)
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // 3. Post-Authentication Loading Screen (Shown after user enters login/signup details)
  if (isPostAuthLoading) {
    return (
      <LoadingScreen 
        title={`Welcome, ${user.full_name || 'User'}!`}
        subtitle="Verifying Account Credentials & Preparing Your Personal Workspace..."
        customSteps={[
          { label: "Verifying Authentication Security Tokens...", icon: ShieldCheck },
          { label: "Connecting to Agriyield Access Database...", icon: Database },
          { label: "Loading Personal Prediction History & Market Rates...", icon: TrendingUp },
          { label: "Workspace Unlocked!", icon: UserCheck }
        ]}
        onFinished={() => setIsPostAuthLoading(false)} 
      />
    );
  }

  // 4. Main Application Workspace (Unlocked after Auth & Post-Auth Loading)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        healthStatus={healthStatus}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-8 pb-10">
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            onSelectPreset={handleSelectPreset}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'prediction' && (
          <Prediction 
            initialPreset={selectedPreset} 
            setActiveTab={setActiveTab} 
            setSelectedPrediction={setSelectedPrediction} 
          />
        )}

        {activeTab === 'recommendation' && (
          <Recommendation 
            setActiveTab={setActiveTab} 
            onSelectCropForPrediction={handleSelectCropForPrediction} 
          />
        )}

        {activeTab === 'optimization' && (
          <Optimization />
        )}

        {activeTab === 'risk' && (
          <RiskField 
            predictionResult={selectedPrediction} 
            setActiveTab={setActiveTab} 
            onSelectCropForPrediction={handleSelectCropForPrediction} 
          />
        )}

        {activeTab === 'analysis' && (
          <Analysis />
        )}

        {activeTab === 'history' && (
          <History 
            onSelectHistoryItem={handleSelectHistoryItem} 
            setActiveTab={setActiveTab}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'reports' && (
          <Reports 
            selectedPrediction={selectedPrediction}
            setActiveTab={setActiveTab}
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 AgriYield AI. All rights reserved.</p>
          <p>Trained ML Models: Random Forest, Gradient Boosting, Decision Tree, Linear Regression</p>
        </div>
      </footer>

      {/* Login & Register Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </div>
  );
}
