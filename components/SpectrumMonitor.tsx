import React, { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getAvailableFrequencies } from '../services/geminiService';
import type { ChannelInfo, SignalData } from '../types';
import { BackIcon } from '../icons';
import Gauge from './Gauge';

const SpectrumMonitor: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const { location, error: geoError } = useGeolocation();
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelInfo | null>(null);
  const [signal, setSignal] = useState<SignalData>({ rssi: -120, snr: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchFrequencies = useCallback(async () => {
    if (location) {
      setLoading(true);
      setError(null);
      try {
        const fetchedChannels = await getAvailableFrequencies(location);
        setChannels(fetchedChannels);
        if (fetchedChannels.length > 0) {
          setSelectedChannel(fetchedChannels[0]);
        }
      } catch (err) {
        setError('Failed to fetch channel data.');
      } finally {
        setLoading(false);
      }
    }
  }, [location]);

  useEffect(() => {
    fetchFrequencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChannel) {
        // Simulate fluctuating signal data
        const snr = Math.floor(Math.random() * 35) + 5; // 5 to 40
        const rssi = -1 * (Math.floor(Math.random() * 50) + 40); // -40 to -90
        setSignal({ snr, rssi });
      } else {
        setSignal({ rssi: -120, snr: 0 });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedChannel]);

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="flex items-center self-start px-4 py-2 bg-theme-light-gray dark:bg-theme-dark-secondary text-accent-orange font-semibold rounded-lg shadow hover:bg-gray-200 dark:hover:bg-theme-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-orange">
        <BackIcon className="w-5 h-5 mr-2" />
        <span>Back</span>
      </button>

      <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Real-time Signal Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center justify-center">
                <Gauge value={signal.snr} maxValue={40} />
                <p className="mt-2 text-lg font-semibold">SNR: <span className="text-text-light-primary dark:text-text-dark-primary">{signal.snr} dB</span></p>
                <p className="text-md text-text-light-secondary dark:text-text-dark-secondary">RSSI: {signal.rssi} dBm</p>
            </div>
            <div className="text-center md:text-left">
                <h3 className="font-bold text-lg">Current Channel</h3>
                {selectedChannel ? (
                    <>
                        <p className="text-3xl font-bold text-accent-orange">{selectedChannel.name}</p>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary">{selectedChannel.frequency}</p>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary">{selectedChannel.power}</p>
                    </>
                ) : (
                    <p className="text-gray-500">No channel selected</p>
                )}
            </div>
        </div>
      </div>
      
      <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Available Channels</h2>
        {loading && <p>Searching for channels based on your location...</p>}
        {geoError && <p className="text-accent-orange-dark">{geoError}</p>}
        {error && <p className="text-accent-orange-dark">{error}</p>}
        {!loading && channels.length === 0 && <p>No available channels found.</p>}
        <div className="space-y-3">
          {channels.map((channel, index) => (
            <button
              key={channel.name}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full text-left p-4 rounded-md transition-colors duration-200 ${selectedChannel?.name === channel.name ? 'bg-accent-orange text-white shadow-md' : 'bg-gray-200 dark:bg-theme-dark hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{channel.name}</p>
                  <p className="text-sm">{channel.frequency}</p>
                </div>
                {index === 0 && <span className="text-xs font-semibold bg-accent-orange-dark text-white py-1 px-3 rounded-full">Recommended</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpectrumMonitor;