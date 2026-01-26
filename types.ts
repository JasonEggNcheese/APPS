
export interface Location {
  x: number;
  y: number;
}

export enum PetStatus {
  SAFE = 'In Safe Zone',
  WANDERING = 'Wandering',
  DANGER = 'Danger Zone',
}

export enum ConnectionStatus {
  CONNECTED = 'Connected',
  CONNECTING = 'Connecting',
  DISCONNECTED = 'Disconnected',
  BLUETOOTH = 'Bluetooth',
}

export type IconType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'paw';

export interface LocationHistoryItem {
  location: Location;
  timestamp: Date;
}

export interface HealthMetrics {
  activityLevel: number; // as a percentage
  heartRate: number; // beats per minute
  temperature: number; // in Celsius
}

export interface HealthHistoryItem {
  metrics: HealthMetrics;
  timestamp: Date;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  iconType: IconType;
  location: Location;
  status: PetStatus;
  connectionStatus: ConnectionStatus;
  signalStrength: number; // 0 to 100
  lastUpdate: Date;
  history: LocationHistoryItem[];
  health: HealthMetrics;
  healthHistory: HealthHistoryItem[];
  // Training Mode states
  isBeeping?: boolean;
  isFlashing?: boolean;
}

export interface GroundingChunk {
  maps: {
    uri: string;
    title: string;
  };
}