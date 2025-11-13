import React, { useState, useRef } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { runOCRVault } from '../services/geminiService';
import { BackIcon, CameraIcon, SolarIcon } from '../icons';

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
          // reader.result contains the data URL (e.g., "data:image/jpeg;base64,...")
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
    setStatusMessage(`Installation logged successfully for Unit ${unitId} at ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}.`);
    // Here you would typically send data to a server
    console.log({ unitId, notes, location, photoName: photo?.name, isSolar });
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
                accept="image/*"
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
        
        {statusMessage && <p className="text-center text-sm font-semibold">{statusMessage}</p>}

        <button type="submit" disabled={!unitId || !location} className="w-full py-3 px-4 bg-accent-orange-dark text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange disabled:bg-gray-400 transition-colors duration-300">
            Log Installation
        </button>
      </form>
    </div>
  );
};

export default InstallationLogger;