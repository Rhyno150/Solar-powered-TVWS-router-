import React, { useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import type { InstallationLog } from '../types';
import { SolarIcon } from '../icons';

// IMPORTANT: Replace this with your actual Google Maps Platform API key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

interface GoogleMapProps {
  logs: InstallationLog[];
}

const GoogleMap: React.FC<GoogleMapProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<InstallationLog | null>(null);

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
        <div className="text-center p-4">
          <h3 className="font-bold text-lg">Google Maps API Key Missing</h3>
          <p className="text-sm">Please add your API key in <code>components/GoogleMap.tsx</code> to enable the map view.</p>
        </div>
      </div>
    );
  }

  const centerPosition = { lat: 40.3, lng: -82.9 }; // Approx center of Ohio

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={centerPosition}
        defaultZoom={7}
        mapId="tvws-connect-map"
        className="w-full h-full"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {logs.map((log) => (
          <Marker
            key={log.unitId}
            position={{
              lat: log.location.latitude,
              lng: log.location.longitude
            }}
            onClick={() => setSelectedLog(log)}
          />
        ))}

        {selectedLog && (
          <InfoWindow
            position={{
              lat: selectedLog.location.latitude,
              lng: selectedLog.location.longitude
            }}
            onCloseClick={() => setSelectedLog(null)}
          >
            <div className="p-1 space-y-1 text-text-light-primary">
               <div className="flex justify-between items-center font-bold">
                <p>{selectedLog.unitId}</p>
                {selectedLog.isSolarPowered && <SolarIcon className="w-4 h-4 text-accent-orange" title="Solar-Powered" />}
              </div>
              <p className="text-xs text-text-light-secondary">
                {selectedLog.location.latitude.toFixed(4)}, {selectedLog.location.longitude.toFixed(4)}
              </p>
              <p className="italic text-xs mt-1">"{selectedLog.notes}"</p>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
};

export default GoogleMap;