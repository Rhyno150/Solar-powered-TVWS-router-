import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SpectrumMonitor from './components/SpectrumMonitor';
import InstallationLogger from './components/InstallationLogger';
import Diagnostics from './components/Diagnostics';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Login from './components/Login';
import AccessManagement from './components/AccessManagement';
import GBVSafetyModule from './components/GBVSafetyModule';
import { syncOfflineData } from './services/safetyService';
import type { View } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSafetyModuleVisible, setIsSafetyModuleVisible] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Effect for handling offline data synchronization
  useEffect(() => {
    const handleOnline = () => {
      console.log('Device is back online. Syncing offline data...');
      syncOfflineData();
    };

    window.addEventListener('online', handleOnline);

    // Initial check in case the app loads while online
    if (navigator.onLine) {
      syncOfflineData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);


  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleQuickExit = () => {
    setIsSafetyModuleVisible(false);
    setView('dashboard');
  };

  const renderView = () => {
    switch (view) {
      case 'spectrum':
        return <SpectrumMonitor goBack={() => setView('dashboard')} />;
      case 'logging':
        return <InstallationLogger goBack={() => setView('dashboard')} />;
      case 'diagnostics':
        return <Diagnostics goBack={() => setView('dashboard')} />;
      case 'analytics':
        return <AnalyticsDashboard goBack={() => setView('dashboard')} />;
      case 'access':
        return <AccessManagement goBack={() => setView('dashboard')} />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-theme-white dark:bg-theme-dark font-sans transition-colors duration-300">
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onLogout={handleLogout}
        onToggleSafetyModule={() => setIsSafetyModuleVisible(!isSafetyModuleVisible)}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {renderView()}
      </main>
      {isSafetyModuleVisible && (
        <GBVSafetyModule
          onClose={() => setIsSafetyModuleVisible(false)}
          onQuickExit={handleQuickExit}
        />
      )}
    </div>
  );
};

export default App;