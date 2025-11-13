export type View = 'dashboard' | 'spectrum' | 'logging' | 'diagnostics' | 'analytics' | 'map';

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
}