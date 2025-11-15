import React, { useState, useEffect, useRef } from 'react';
import { generateNetworkReport } from '../services/geminiService';
import { BackIcon, AnalyticsIcon, DownloadIcon, SolarIcon, UploadIcon } from '../icons';
import LineChart from './LineChart';
import type { InstallationLog } from '../types';

// Mock Data for components not dependent on the fetched logs
const MOCK_SNR_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  snr: Math.floor(Math.random() * 10) + 22 + Math.sin(i/4) * 3, // some fluctuation
}));

const INITIAL_STATS = {
  totalInstallations: 0,
  averageSnr: 28.5,
  alerts: 0,
};

const AnalyticsDashboard: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activityLog, setActivityLog] = useState<InstallationLog[]>([]);
  const [fullLogs, setFullLogs] = useState<InstallationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    fetch('/data/installation_logs.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: InstallationLog[]) => {
        setFullLogs(data);
        setActivityLog(data.slice(0, 5));
        setStats(prevStats => ({
          ...prevStats,
          totalInstallations: data.length,
        }));
      })
      .catch(error => {
        console.error("Failed to load installation logs:", error);
        setStatusMessage("Failed to load default installation logs.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport(null);
    try {
      const result = await generateNetworkReport(stats);
      setReport(result);
    } catch (error) {
      setReport('Failed to generate AI report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadData = () => {
    if (fullLogs.length === 0) return;

    const headers = ['unitId', 'latitude', 'longitude', 'timestamp', 'notes', 'isSolarPowered'];
    const csvRows = fullLogs.map(log => {
      // Escape commas in notes by wrapping the string in double quotes
      const notes = `"${log.notes.replace(/"/g, '""')}"`;
      return [
        log.unitId,
        log.location.latitude,
        log.location.longitude,
        log.timestamp,
        notes,
        log.isSolarPowered ? 'Yes' : 'No'
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'installation_logs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/json') {
      setStatusMessage('Error: Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File content is not readable');
        }
        const data: InstallationLog[] = JSON.parse(text);
        
        // Basic validation
        if (!Array.isArray(data) || (data.length > 0 && (!data[0].unitId || !data[0].location))) {
           throw new Error('Invalid data structure in JSON file.');
        }

        setFullLogs(data);
        setActivityLog(data.slice(0, 5));
        setStats(prevStats => ({
          ...prevStats,
          totalInstallations: data.length,
        }));
        setStatusMessage(`Successfully loaded ${data.length} records from ${file.name}.`);
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
        setStatusMessage('Error: Could not parse the uploaded file. Please ensure it is a valid JSON array of installation logs.');
      }
    };
    reader.onerror = () => {
        setStatusMessage('Error reading the file.');
    };
    reader.readAsText(file);
    
    // Reset file input value to allow re-uploading the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-theme-white dark:bg-theme-dark p-4 rounded-lg text-center shadow-inner">
        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">{title}</p>
        <p className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="flex items-center self-start px-4 py-2 bg-theme-light-gray dark:bg-theme-dark-secondary text-accent-orange font-semibold rounded-lg shadow hover:bg-gray-200 dark:hover:bg-theme-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-orange">
        <BackIcon className="w-5 h-5 mr-2" />
        <span>Back</span>
      </button>

      <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Network Analytics</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Installations" value={isLoading ? '...' : stats.totalInstallations} />
          <StatCard title="Average SNR" value={`${stats.averageSnr} dB`} />
          <StatCard title="24h Alerts" value={stats.alerts} />
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">24-Hour Signal Trend (Avg. SNR)</h3>
          <LineChart data={MOCK_SNR_HISTORY} />
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Data &amp; Reports</h3>
          
          {statusMessage && (
            <div className="mb-4 p-3 bg-accent-purple-light dark:bg-accent-purple-dark-bg text-accent-purple-text dark:text-accent-purple-dark-text rounded-lg text-center text-sm" role="alert">
                <p>{statusMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="application/json"
              className="hidden"
              aria-hidden="true"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center py-3 px-4 bg-accent-purple-text text-white font-semibold rounded-lg shadow-md hover:bg-accent-purple disabled:bg-gray-400 transition-colors duration-300"
            >
              <UploadIcon className="w-6 h-6 mr-2"/>
              Upload Dataset
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center py-3 px-4 bg-accent-orange text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange-dark disabled:bg-gray-400 transition-colors duration-300"
            >
              <AnalyticsIcon className="w-6 h-6 mr-2"/>
              {isGenerating ? 'Analyzing...' : 'Generate AI Report'}
            </button>
            <button
              onClick={handleDownloadData}
              className="w-full flex items-center justify-center py-3 px-4 bg-accent-orange-light text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange transition-colors duration-300"
            >
              <DownloadIcon className="w-6 h-6 mr-2"/>
              Download Dataset
            </button>
          </div>
          {report && (
            <div className="mt-4 p-4 bg-theme-white dark:bg-theme-dark rounded-md">
              <p className="font-mono text-sm whitespace-pre-wrap">{report}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Recent Activity Log</h3>
          {isLoading ? (
             <p className="text-center text-text-light-secondary dark:text-text-dark-secondary">Loading activity...</p>
          ) : activityLog.length > 0 ? (
            <div className="space-y-3">
              {activityLog.map(log => (
                <div key={log.unitId + log.timestamp} className="p-3 bg-theme-white dark:bg-theme-dark rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-text-light-primary dark:text-text-dark-primary">Unit ID: {log.unitId}</p>
                    {log.isSolarPowered && <SolarIcon className="w-5 h-5 text-accent-orange" title="Solar-Powered" />}
                  </div>
                  <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                    {new Date(log.timestamp).toLocaleString()} - {log.location.latitude.toFixed(2)}, {log.location.longitude.toFixed(2)}
                  </p>
                  <p className="text-sm italic text-text-light-primary dark:text-text-dark-primary">"{log.notes}"</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-light-secondary dark:text-text-dark-secondary">No activity to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;