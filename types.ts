
export interface Location {
  x: number;
  y: number;
}

export enum PetStatus {
  SAFE = 'In Safe Zone',
  WANDERING = 'Wandering',
  DANGER = 'Danger Zone',
}

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
  location: Location;
  status: PetStatus;
  lastUpdate: Date;
  history: LocationHistoryItem[];
  health: HealthMetrics;
  healthHistory: HealthHistoryItem[];
}

export interface GroundingChunk {
  maps: {
    uri: string;
    title: string;
  };
}
