import React, { useState } from 'react';
import { performAnomalyCheck } from '../services/geminiService';
import type { SignalData } from '../types';
import { BackIcon, DiagnosticIcon, MicIcon } from '../icons';

const Diagnostics: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const [anomalyStatus, setAnomalyStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  
  const handleAnomalyCheck = async () => {
    setIsChecking(true);
    setAnomalyStatus('Generating signal history and analyzing...');
    
    // Simulate a recent history of signal data
    const mockHistory: SignalData[] = Array.from({ length: 10 }, () => ({
      snr: Math.floor(Math.random() * 20) + 15, // Mostly good signal
      rssi: -1 * (Math.floor(Math.random() * 30) + 50),
    }));
    // Introduce a potential anomaly
    mockHistory[7] = { snr: 5, rssi: -95 }; 
    
    const result = await performAnomalyCheck(mockHistory);
    setAnomalyStatus(result);
    setIsChecking(false);
  };

  const handleVoiceNote = () => {
    setIsRecording(true);
    setVoiceStatus('Recording... Speak your report now.');

    // Simulate recording and submission
    setTimeout(() => {
        setIsRecording(false);
        setVoiceStatus('Recording finished. Submitting for transcription...');
        setTimeout(() => {
            setVoiceStatus('Voice report submitted successfully.');
        }, 1500);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="flex items-center self-start px-4 py-2 bg-theme-light-gray dark:bg-theme-dark-secondary text-accent-orange font-semibold rounded-lg shadow hover:bg-gray-200 dark:hover:bg-theme-dark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-orange">
        <BackIcon className="w-5 h-5 mr-2" />
        <span>Back</span>
      </button>

      <div className="p-6 bg-theme-light-gray dark:bg-theme-dark-secondary rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-bold mb-4">Diagnostic Tools</h2>

        {/* Anomaly Check */}
        <div className="space-y-3">
          <button
            onClick={handleAnomalyCheck}
            disabled={isChecking}
            className="w-full flex items-center justify-center py-3 px-4 bg-accent-orange text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange-dark disabled:bg-gray-400 transition-colors duration-300"
          >
            <DiagnosticIcon className="w-6 h-6 mr-2"/>
            {isChecking ? 'Analyzing...' : 'Perform Signal Anomaly Check'}
          </button>
          {anomalyStatus && (
            <div className="p-4 bg-theme-white dark:bg-theme-dark rounded-md">
              <p className="font-mono text-sm whitespace-pre-wrap">{anomalyStatus}</p>
            </div>
          )}
        </div>

        {/* Voice Note */}
        <div className="space-y-3 pt-4 border-t border-gray-300 dark:border-gray-600">
          <button
            onClick={handleVoiceNote}
            disabled={isRecording}
            className="w-full flex items-center justify-center py-3 px-4 bg-accent-orange-light text-white font-semibold rounded-lg shadow-md hover:bg-accent-orange disabled:bg-gray-400 transition-colors duration-300"
          >
            <MicIcon className="w-6 h-6 mr-2"/>
            {isRecording ? 'Recording...' : 'Submit Voice Note Report'}
          </button>
           {voiceStatus && (
            <div className="p-4 bg-theme-white dark:bg-theme-dark rounded-md text-center">
              <p className="text-sm font-semibold">{voiceStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;