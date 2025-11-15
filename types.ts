export type View = 'dashboard' | 'spectrum' | 'logging' | 'diagnostics' | 'analytics' | 'access';

export interface GpsData {
  latitude: number;
  longitude: number;
}

export interface ChannelInfo {
  name: string;
  frequency: string;
  power: string;
}

export interface SignalData {
  rssi: number;
  snr: number;
}

export interface InstallationLog {
  unitId: string;
  location: GpsData;
  timestamp: string;
  notes: string;
  isSolarPowered?: boolean;
}

export interface RegisteredUser {
  id: string;
  name: string;
  contact: string; // e.g., email or phone
  unitId: string;
  registeredAt: string;
}

// GBV Safety Module Types
export interface SosPayload {
  userId: string;
  timestamp: string;
  location: GpsData | null;
}

export interface GbvReportPayload {
  reportId: string;
  report: string;
  timestamp: string;
}