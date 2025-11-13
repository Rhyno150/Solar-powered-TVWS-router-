import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SpectrumMonitor from './components/SpectrumMonitor';
import InstallationLogger from './components/InstallationLogger';
import Diagnostics from './components/Diagnostics';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MapView from './components/MapView';
import Login from './components/Login';
import type { View } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
      case 'map':
        return <MapView goBack={() => setView('dashboard')} />;
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
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;