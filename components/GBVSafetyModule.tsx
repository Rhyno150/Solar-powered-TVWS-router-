import React, { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { triggerSos, submitGbvReport } from '../services/safetyService';
import type { SosPayload, GbvReportPayload } from '../types';

interface GBVSafetyModuleProps {
  onClose: () => void;
  onQuickExit: () => void;
}

type SafetyModuleView = 'main' | 'report' | 'help';

const GBVSafetyModule: React.FC<GBVSafetyModuleProps> = ({ onClose, onQuickExit }) => {
  const { location } = useGeolocation();
  const [currentView, setCurrentView] = useState<SafetyModuleView>('main');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');
  
  const handlePanicClick = async () => {
    setStatusMessage('Sending silent alert...');
    const payload: SosPayload = {
      userId: 'user-001', // This should be replaced with a real, logged-in user ID
      timestamp: new Date().toISOString(),
      location: location,
    };
    await triggerSos(payload);
    setStatusMessage('Alert Sent. Help is on the way.');
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportText.trim() === '') return;
    
    setStatusMessage('Submitting report securely...');
    const payload: GbvReportPayload = {
      reportId: `report-${Date.now()}`,
      report: reportText, // In a real app, this should be encrypted on the client
      timestamp: new Date().toISOString(),
    };
    await submitGbvReport(payload);
    setReportText('');
    setStatusMessage('Your anonymous report has been submitted.');
    setTimeout(() => {
        setStatusMessage(null);
        setCurrentView('main');
    }, 4000);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'report':
        return (
          <>
            <h3 className="text-xl font-bold text-center mb-2">Anonymous Reporting</h3>
            <p className="text-sm text-center text-text-light-secondary dark:text-text-dark-secondary mb-4">
              Your report is confidential. Please describe the incident. Do not include personal information.
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={6}
                className="w-full p-2 bg-theme-white dark:bg-theme-dark border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange"
                placeholder="Describe the incident here..."
              />
              <button type="submit" className="w-full py-3 bg-accent-orange text-white font-semibold rounded-lg">
                Submit Report
              </button>
              <button type="button" onClick={() => setCurrentView('main')} className="w-full py-2 text-sm text-accent-orange">
                Cancel
              </button>
            </form>
          </>
        );
      case 'help':
        return (
          <>
            <h3 className="text-xl font-bold text-center mb-4">Help & Resources</h3>
            <div className="space-y-4 text-sm text-left">
              <p className="font-bold">If you are in immediate danger, call your local emergency number.</p>
              <div>
                <h4 className="font-semibold text-accent-orange">National GBV Hotlines:</h4>
                <ul className="list-disc list-inside">
                  <li>National Domestic Violence Hotline: 1-800-799-7233</li>
                  <li>RAINN (Rape, Abuse & Incest National Network): 1-800-656-HOPE</li>
                  <li>Childhelp National Child Abuse Hotline: 1-800-422-4453</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-accent-orange">Safety Tips:</h4>
                <ul className="list-disc list-inside">
                    <li>Trust your instincts.</li>
                    <li>Have a safety plan.</li>
                    <li>Tell someone you trust what is happening.</li>
                    <li>Know a safe place to go.</li>
                </ul>
              </div>
            </div>
            <button onClick={() => setCurrentView('main')} className="w-full mt-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Back to Safety Menu</button>
          </>
        );
      case 'main':
      default:
        return (
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-2xl font-bold">Safety & Help</h3>
            <p className="text-sm text-center text-text-light-secondary dark:text-text-dark-secondary">
              If you are in danger, press the panic button for immediate, silent assistance.
            </p>
            <button
              onClick={handlePanicClick}
              className="w-48 h-48 bg-red-600 text-white rounded-full flex flex-col items-center justify-center shadow-lg transform active:scale-95 transition-transform"
            >
              <span className="text-4xl font-bold">SOS</span>
              <span className="text-sm">Panic Button</span>
            </button>
            <div className="w-full grid grid-cols-2 gap-4 pt-4">
                <button onClick={() => setCurrentView('report')} className="w-full py-3 bg-accent-orange-light text-white font-semibold rounded-lg">
                    Anonymous Report
                </button>
                <button onClick={() => setCurrentView('help')} className="w-full py-3 bg-accent-orange-light text-white font-semibold rounded-lg">
                    Help & Resources
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-theme-light-gray dark:bg-theme-dark-secondary rounded-2xl p-6 relative">
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
            <button onClick={onQuickExit} className="py-1 px-3 bg-gray-500 text-white text-xs font-bold rounded-full hover:bg-gray-600">
                QUICK EXIT
            </button>
            <button onClick={onClose} className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full text-lg font-bold">
                &times;
            </button>
        </div>
        <div className="mt-8">
            {statusMessage ? (
                <div className="text-center p-4">
                    <p className="text-lg font-semibold text-accent-orange">{statusMessage}</p>
                </div>
            ) : renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GBVSafetyModule;
