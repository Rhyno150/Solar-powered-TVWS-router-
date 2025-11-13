import type { SosPayload, GbvReportPayload } from '../types';

const SOS_QUEUE_KEY = 'gbv_sos_queue';
const REPORT_QUEUE_KEY = 'gbv_report_queue';

// --- Local Storage Queue Management ---

const getQueue = <T>(queueName: string): T[] => {
  try {
    const queueJson = localStorage.getItem(queueName);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error(`Error reading queue "${queueName}" from localStorage`, error);
    return [];
  }
};

const saveToQueue = <T>(queueName: string, item: T): void => {
  const queue = getQueue<T>(queueName);
  queue.push(item);
  localStorage.setItem(queueName, JSON.stringify(queue));
};

const clearQueue = (queueName: string): void => {
  localStorage.removeItem(queueName);
};

// --- Mock API Endpoints ---
// In a real application, these would be fetch() calls to your backend.

const mockApiCall = (endpoint: string, payload: any): Promise<{ success: true }> => {
  console.log(`[API Call] Sending to ${endpoint}:`, payload);
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
};


// --- Public Service Functions ---

/**
 * Triggers an SOS alert. If offline, queues it for later.
 */
export const triggerSos = async (payload: SosPayload): Promise<void> => {
  if (navigator.onLine) {
    try {
      await mockApiCall('/api/gbv/sos', payload);
      console.log('SOS alert sent successfully online.');
    } catch (error) {
      console.error('Failed to send SOS online, queueing...', error);
      saveToQueue(SOS_QUEUE_KEY, payload);
    }
  } else {
    console.log('Offline. Queueing SOS alert.');
    saveToQueue(SOS_QUEUE_KEY, payload);
  }
};

/**
 * Submits a GBV report. If offline, queues it for later.
 */
export const submitGbvReport = async (payload: GbvReportPayload): Promise<void> => {
   if (navigator.onLine) {
    try {
      await mockApiCall('/api/gbv/report', payload);
      console.log('GBV report sent successfully online.');
    } catch (error) {
      console.error('Failed to send report online, queueing...', error);
      saveToQueue(REPORT_QUEUE_KEY, payload);
    }
  } else {
    console.log('Offline. Queueing GBV report.');
    saveToQueue(REPORT_QUEUE_KEY, payload);
  }
};


/**
 * Syncs queued offline data with the server.
 */
export const syncOfflineData = async (): Promise<void> => {
  console.log('Attempting to sync offline data...');
  
  // Sync SOS Alerts
  const sosQueue = getQueue<SosPayload>(SOS_QUEUE_KEY);
  if (sosQueue.length > 0) {
    console.log(`Syncing ${sosQueue.length} SOS alerts...`);
    const promises = sosQueue.map(payload => mockApiCall('/api/gbv/sos', payload));
    try {
      await Promise.all(promises);
      console.log('SOS queue synced successfully.');
      clearQueue(SOS_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to sync SOS queue.', error);
    }
  }

  // Sync GBV Reports
  const reportQueue = getQueue<GbvReportPayload>(REPORT_QUEUE_KEY);
  if (reportQueue.length > 0) {
    console.log(`Syncing ${reportQueue.length} GBV reports...`);
    const promises = reportQueue.map(payload => mockApiCall('/api/gbv/report', payload));
    try {
      await Promise.all(promises);
      console.log('Report queue synced successfully.');
      clearQueue(REPORT_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to sync report queue.', error);
    }
  }
};
