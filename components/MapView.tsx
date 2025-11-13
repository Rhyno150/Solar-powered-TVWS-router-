import React, { useState, useMemo, useEffect } from 'react';
import { BackIcon, SolarIcon } from '../icons';
import type { InstallationLog } from '../types';

const MapView: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [hoveredLog, setHoveredLog] = useState<InstallationLog | null>(null);
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

  const bounds = useMemo(() => {
    if (installationLogs.length === 0) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }
    const latitudes = installationLogs.map(log => log.location.latitude);
    const longitudes = installationLogs.map(log => log.location.longitude);
    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLng: Math.min(...longitudes),
      maxLng: Math.max(...longitudes),
    };
  }, [installationLogs]);

  const project = (lat: number, lng: number) => {
    const width = 800;
    const height = 600;
    const padding = 40;
    
    // Avoid division by zero if there's only one point
    const lngRange = (bounds.maxLng - bounds.minLng) || 1;
    const latRange = (bounds.maxLat - bounds.minLat) || 1;

    const x = ((lng - bounds.minLng) / lngRange) * (width - 2 * padding) + padding;
    const y = ((bounds.maxLat - lat) / latRange) * (height - 2 * padding) + padding;
    
    return { x, y };
  };

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="flex items-center self-start px-4 py-2 bg-theme-light-gray dark:bg-theme-dark-secondary text-accent-orange font-semibold rounded-lg shadow hover:bg-gray-200 dark:hover:bg-theme-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-orange">
        <BackIcon className="w-5 h-5 mr-2" />
        <span>Back to Dashboard</span>
      </button>

      <div className="p-4 sm:p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Network Installation Map</h2>
        <p className="text-center text-text-light-secondary dark:text-text-dark-secondary mb-4">
          {isLoading ? 'Loading installations...' : `Showing ${installationLogs.length} installations across Ohio. Hover for details.`}
        </p>
        <div className="w-full bg-theme-white dark:bg-theme-dark rounded-md overflow-hidden">
          {isLoading ? (
            <div className="h-[450px] flex items-center justify-center">
              <p>Loading Map...</p>
            </div>
          ) : (
            <svg viewBox="0 0 800 600" className="w-full h-auto">
              <rect width="800" height="600" className="fill-current text-orange-50 dark:text-theme-dark" />
              {installationLogs.map(log => {
                const { x, y } = project(log.location.latitude, log.location.longitude);
                return (
                  <circle
                    key={log.unitId}
                    cx={x}
                    cy={y}
                    r="6"
                    className="fill-current text-accent-orange opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredLog(log)}
                    onMouseLeave={() => setHoveredLog(null)}
                  />
                );
              })}
            </svg>
          )}
        </div>
        {hoveredLog && (() => {
          const { x, y } = project(hoveredLog.location.latitude, hoveredLog.location.longitude);
          return (
            <div
              className="absolute bg-theme-dark-secondary text-white text-sm rounded-lg p-2 shadow-xl z-10 pointer-events-none transition-all"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -120%)',
                minWidth: '200px'
              }}
            >
              <div className="flex justify-between items-center font-bold">
                <p>{hoveredLog.unitId}</p>
                {hoveredLog.isSolarPowered && <SolarIcon className="w-4 h-4 text-yellow-300" title="Solar-Powered" />}
              </div>
              <p className="text-xs text-gray-300">
                {hoveredLog.location.latitude.toFixed(4)}, {hoveredLog.location.longitude.toFixed(4)}
              </p>
              <p className="italic text-xs mt-1">"{hoveredLog.notes}"</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default MapView;