import React, { useState, useEffect } from 'react';
import { BackIcon } from '../icons';
import type { InstallationLog } from '../types';
import GoogleMap from './GoogleMap';

const MapView: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [installationLogs, setInstallationLogs] = useState<InstallationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/data/installation_logs.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: InstallationLog[]) => {
        setInstallationLogs(data);
      })
      .catch(error => {
        console.error("Failed to load installation logs:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="flex items-center self-start px-4 py-2 bg-theme-light-gray dark:bg-theme-dark-secondary text-accent-orange font-semibold rounded-lg shadow hover:bg-gray-200 dark:hover:bg-theme-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-orange">
        <BackIcon className="w-5 h-5 mr-2" />
        <span>Back to Dashboard</span>
      </button>

      <div className="p-4 sm:p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Network Installation Map</h2>
        <p className="text-center text-text-light-secondary dark:text-text-dark-secondary mb-4">
          {isLoading ? 'Loading installations...' : `Showing ${installationLogs.length} installations on the map. Click a marker for details.`}
        </p>
        <div className="w-full h-[60vh] bg-theme-white dark:bg-theme-dark rounded-md overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p>Loading Map...</p>
            </div>
          ) : (
            <GoogleMap logs={installationLogs} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;