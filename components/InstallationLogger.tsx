import React, { useState, useRef, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { runOCRVault } from '../services/geminiService';
import { BackIcon, CameraIcon, SolarIcon, EditIcon } from '../icons';
import type { InstallationLog } from '../types';

const EditInstallationModal: React.FC<{
  log: InstallationLog;
  onSave: (updatedLog: InstallationLog) => void;
  onClose: () => void;
}> = ({ log, onSave, onClose }) => {
  const [updatedUnitId, setUpdatedUnitId] = useState(log.unitId);
  const [updatedNotes, setUpdatedNotes] = useState(log.notes);
  const [updatedIsSolar, setUpdatedIsSolar] = useState(log.isSolarPowered ?? false);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setNewPhotoPreview(reader.result as string);
        setIsProcessing(true);
        setModalStatus('Analyzing new asset tag...');
        try {
          const base64String = (reader.result as string).split(',')[1];
          const extractedId = await runOCRVault(base64String, file.type);
          setUpdatedUnitId(extractedId);
          setModalStatus('Unit ID extracted successfully!');
        } catch (error) {
          setModalStatus('Error processing image. Please enter ID manually.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedLog: InstallationLog = {
      ...log,
      unitId: updatedUnitId,
      notes: updatedNotes,
      isSolarPowered: updatedIsSolar,
      timestamp: new Date().toISOString(), // Update timestamp on edit
    };
    onSave(updatedLog);
  };
  
  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-orange focus:border-accent-orange sm:text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Edit Installation: {log.unitId}</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full h-48 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center bg-theme-white dark:bg-theme-dark">
              {newPhotoPreview ? (
                  <img src={newPhotoPreview} alt="New asset tag preview" className="max-h-full max-w-full object-contain" />
              ) : (
                  <p className="text-gray-500 text-center">Upload new photo to re-scan ID</p>
              )}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" ref={modalFileInputRef} onChange={handleFileChange} className="hidden"/>
            <button type="button" onClick={() => modalFileInputRef.current?.click()} disabled={isProcessing} className="w-full flex items-center justify-center py-3 px-4 bg-accent-orange text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange-dark disabled:bg-gray-400 transition-colors duration-300">
                <CameraIcon className="w-6 h-6 mr-2" />
                {isProcessing ? 'Processing...' : 'Upload New Photo'}
            </button>
        </div>

          <div>
            <label htmlFor="edit-unitId" className="block text-sm font-medium">Unit ID</label>
            <input type="text" id="edit-unitId" value={updatedUnitId} onChange={(e) => setUpdatedUnitId(e.target.value)} disabled={isProcessing} className={inputStyle} />
          </div>
          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium">Technician Notes</label>
            <textarea id="edit-notes" rows={4} value={updatedNotes} onChange={(e) => setUpdatedNotes(e.target.value)} className={inputStyle} />
          </div>
          <div className="flex items-center justify-start p-3 rounded-lg bg-theme-white dark:bg-theme-dark">
              <input id="edit-isSolar" type="checkbox" checked={updatedIsSolar} onChange={(e) => setUpdatedIsSolar(e.target.checked)} className="h-5 w-5 text-accent-orange border-gray-300 rounded focus:ring-accent-orange"/>
              <label htmlFor="edit-isSolar" className="ml-3 flex items-center text-md font-medium cursor-pointer">
                  Solar-Powered Unit
                  <SolarIcon className={`w-6 h-6 ml-2 transition-colors ${updatedIsSolar ? 'text-accent-orange' : 'text-gray-300 dark:text-gray-600'}`} />
              </label>
          </div>
          {modalStatus && <p className="text-center text-sm font-semibold">{modalStatus}</p>}
          <div className="flex space-x-4">
            <button onClick={onClose} className="w-full py-3 px-4 bg-gray-300 dark:bg-gray-600 text-text-light-primary dark:text-text-dark-primary font-semibold rounded-lg shadow-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">Cancel</button>
            <button onClick={handleSave} className="w-full py-3 px-4 bg-accent-orange-dark text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange transition-colors">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};


const InstallationLogger: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const { location } = useGeolocation();
  const [unitId, setUnitId] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSolar, setIsSolar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<InstallationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [editingLog, setEditingLog] = useState<InstallationLog | null>(null);

  useEffect(() => {
    fetch('/data/installation_logs.json')
      .then(res => res.json())
      .then((data: InstallationLog[]) => {
        // Sort by date descending to show recent first
        data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(data);
      })
      .catch(console.error)
      .finally(() => setIsLoadingLogs(false));
  }, []);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPhotoPreview(reader.result as string);
        setIsProcessing(true);
        setStatusMessage('Analyzing asset tag...');
        try {
          const base64String = (reader.result as string).split(',')[1];
          const extractedId = await runOCRVault(base64String, file.type);
          setUnitId(extractedId);
          setStatusMessage('Unit ID extracted successfully!');
        } catch (error) {
          setStatusMessage('Error processing image. Please enter ID manually.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !location) {
        setStatusMessage('Unit ID and GPS location are required.');
        return;
    }
    const newLog: InstallationLog = {
      unitId,
      location,
      notes,
      isSolarPowered: isSolar,
      timestamp: new Date().toISOString()
    };
    // Add to the top of the list
    setLogs(prevLogs => [newLog, ...prevLogs]);
    setStatusMessage(`Installation logged successfully for Unit ${unitId}.`);
    // Clear form
    setUnitId('');
    setNotes('');
    setIsSolar(false);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleUpdateLog = (updatedLog: InstallationLog) => {
    setLogs(logs.map(log => log.unitId === editingLog?.unitId ? updatedLog : log));
    setEditingLog(null);
    setStatusMessage(`Log for Unit ${updatedLog.unitId} updated successfully.`);
  };

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="flex items-center self-start px-4 py-2 bg-theme-light-gray dark:bg-theme-dark-secondary text-accent-orange font-semibold rounded-lg shadow hover:bg-gray-200 dark:hover:bg-theme-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-orange">
        <BackIcon className="w-5 h-5 mr-2" />
        <span>Back</span>
      </button>

      <form onSubmit={handleSubmit} className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-bold mb-4">Log New Installation</h2>

        <div className="flex flex-col items-center space-y-4">
            <div className="w-full h-48 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center bg-theme-white dark:bg-theme-dark">
            {photoPreview ? (
                <img src={photoPreview} alt="Asset tag preview" className="max-h-full max-w-full object-contain" />
            ) : (
                <p className="text-gray-500">Asset Tag Photo Preview</p>
            )}
            </div>
            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full flex items-center justify-center py-3 px-4 bg-accent-orange text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange-dark disabled:bg-gray-400 transition-colors duration-300"
            >
                <CameraIcon className="w-6 h-6 mr-2" />
                {isProcessing ? 'Processing...' : 'Capture/Upload Asset Tag'}
            </button>
        </div>

        <div>
          <label htmlFor="unitId" className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Unit ID (autofilled by OCR)</label>
          <input
            type="text"
            id="unitId"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={isProcessing}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-orange focus:border-accent-orange sm:text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700"
            placeholder="Capture photo to fill"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary">Technician Notes</label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-orange focus:border-accent-orange sm:text-sm"
            placeholder="Antenna height, line-of-sight observations, etc."
          />
        </div>

        <div className="flex items-center justify-start p-3 rounded-lg bg-theme-white dark:bg-theme-dark transition-colors">
            <input
                id="isSolar"
                type="checkbox"
                checked={isSolar}
                onChange={(e) => setIsSolar(e.target.checked)}
                className="h-5 w-5 text-accent-orange border-gray-300 rounded focus:ring-accent-orange"
            />
            <label htmlFor="isSolar" className="ml-3 flex items-center text-md font-medium text-text-light-primary dark:text-text-dark-primary cursor-pointer">
                Solar-Powered Unit
                <SolarIcon className={`w-6 h-6 ml-2 transition-colors ${isSolar ? 'text-accent-orange' : 'text-gray-300 dark:text-gray-600'}`} />
            </label>
        </div>
        
        {statusMessage && <p className="text-center text-sm font-semibold text-accent-orange-dark">{statusMessage}</p>}

        <button type="submit" disabled={!unitId || !location} className="w-full py-3 px-4 bg-accent-orange-dark text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange disabled:bg-gray-400 transition-colors duration-300">
            Log Installation
        </button>
      </form>

      <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-bold mb-4">Recent Installations</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoadingLogs ? (
            <p>Loading recent logs...</p>
          ) : logs.length > 0 ? (
            logs.slice(0, 10).map(log => (
              <div key={log.unitId + log.timestamp} className="p-3 bg-theme-white dark:bg-theme-dark rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <p className="font-bold text-text-light-primary dark:text-text-dark-primary">Unit ID: {log.unitId}</p>
                    {log.isSolarPowered && <SolarIcon className="w-5 h-5 ml-2 text-accent-orange" title="Solar-Powered" />}
                  </div>
                  <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">{new Date(log.timestamp).toLocaleString()}</p>
                  <p className="text-sm italic text-text-light-primary dark:text-text-dark-primary truncate">"{log.notes}"</p>
                </div>
                <button onClick={() => setEditingLog(log)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={`Edit log for ${log.unitId}`}>
                  <EditIcon className="w-6 h-6 text-accent-orange" />
                </button>
              </div>
            ))
          ) : (
            <p>No installation logs found.</p>
          )}
        </div>
      </div>

      {editingLog && (
        <EditInstallationModal 
            log={editingLog} 
            onSave={handleUpdateLog} 
            onClose={() => setEditingLog(null)} 
        />
      )}
    </div>
  );
};

export default InstallationLogger;
