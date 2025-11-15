import React from 'react';
import type { View } from '../types';
import { SpectrumIcon, LogIcon, DiagnosticIcon, AnalyticsIcon, UsersIcon } from '../icons';

interface DashboardProps {
  setView: (view: View) => void;
}

const DashboardButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  focusRingColor: string;
}> = ({ onClick, icon, title, description, iconBgColor, focusRingColor }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus:ring-4 ${focusRingColor}`}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-full mr-5 text-white ${iconBgColor}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">{title}</h2>
        <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1">{description}</p>
      </div>
    </div>
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="space-y-6 animate-fade-in">
       <DashboardButton
        onClick={() => setView('spectrum')}
        icon={<SpectrumIcon className="w-8 h-8" />}
        title="Spectrum & Signal"
        description="Map channels and monitor real-time signal strength."
        iconBgColor="bg-accent-orange"
        focusRingColor="focus:ring-accent-orange/50"
      />
      <DashboardButton
        onClick={() => setView('logging')}
        icon={<LogIcon className="w-8 h-8" />}
        title="Installation Logging"
        description="Log new deployments with OCR-assisted unit ID."
        iconBgColor="bg-accent-orange-light"
        focusRingColor="focus:ring-accent-orange-light/50"
      />
       <DashboardButton
        onClick={() => setView('access')}
        icon={<UsersIcon className="w-8 h-8" />}
        title="Community Access"
        description="Manage registered users for secure hotspots."
        iconBgColor="bg-accent-orange"
        focusRingColor="focus:ring-accent-orange/50"
      />
      <DashboardButton
        onClick={() => setView('diagnostics')}
        icon={<DiagnosticIcon className="w-8 h-8" />}
        title="AI Diagnostics"
        description="Run checks and submit voice reports via Gemini."
        iconBgColor="bg-accent-orange-dark"
        focusRingColor="focus:ring-accent-orange-dark/50"
      />
      <DashboardButton
        onClick={() => setView('analytics')}
        icon={<AnalyticsIcon className="w-8 h-8" />}
        title="Network Analytics"
        description="View performance dashboards and generate reports."
        iconBgColor="bg-accent-orange-light"
        focusRingColor="focus:ring-accent-orange-light/50"
      />
    </div>
  );
};

export default Dashboard;