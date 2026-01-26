
import { Pet, PetStatus, Location, HealthMetrics, ConnectionStatus } from '../types';

// --- Internal State (This would be your database) ---
let currentPetState: Pet = {
  id: '1',
  name: 'Benji',
  breed: 'Rat Terrier',
  imageUrl: 'https://picsum.photos/id/237/200/300',
  iconType: 'dog',
  location: { x: 52, y: 48 },
  status: PetStatus.SAFE,
  connectionStatus: ConnectionStatus.CONNECTED,
  signalStrength: 95,
  lastUpdate: new Date(),
  history: [],
  health: {
    activityLevel: 75,
    heartRate: 85,
    temperature: 38.5,
  },
  healthHistory: [],
};

// --- Simulation State ---
let velocity = { dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2 };
const MAX_SPEED = 2.5;

// --- Public API Functions ---

/**
 * Returns a copy of the initial pet data without starting the simulation.
 */
export const getInitialPetData = (): Pet => {
  return { ...currentPetState };
};

/**
 * Simulates fetching the latest pet data from a backend server.
 */
export const fetchPetData = (safeZone: { center: Location, radius: number }): Promise<Pet> => {
  return new Promise(resolve => {
    // Simulate network latency
    setTimeout(() => {
      // 1. Update Pet Location
      if (Math.random() < 0.1) {
        velocity.dx += (Math.random() - 0.5) * 1;
        velocity.dy += (Math.random() - 0.5) * 1;
        const speed = Math.sqrt(velocity.dx**2 + velocity.dy**2);
        if (speed > MAX_SPEED) {
            velocity.dx = (velocity.dx / speed) * MAX_SPEED;
            velocity.dy = (velocity.dy / speed) * MAX_SPEED;
        }
      }

      let newX = currentPetState.location.x + velocity.dx;
      let newY = currentPetState.location.y + velocity.dy;

      if (newX < 0 || newX > 100) { velocity.dx *= -1; newX = Math.max(0, Math.min(100, newX)); }
      if (newY < 0 || newY > 100) { velocity.dy *= -1; newY = Math.max(0, Math.min(100, newY)); }
      const newLocation: Location = { x: newX, y: newY };
      
      // 2. Determine Pet Status
      const distance = Math.sqrt(Math.pow(newX - safeZone.center.x, 2) + Math.pow(newY - safeZone.center.y, 2));
      const newStatus = distance > safeZone.radius ? PetStatus.WANDERING : PetStatus.SAFE;
      
      const newLocationHistory = [{ location: currentPetState.location, timestamp: new Date() }, ...currentPetState.history].slice(0, 20);

      // 3. Update Connection & Signal Simulation
      // Signal fluctuates between 20 and 100
      const newSignalStrength = Math.max(20, Math.min(100, currentPetState.signalStrength + (Math.random() - 0.5) * 15));
      
      // Randomly simulate a "reconnecting" state if signal is very low
      let newConnStatus = ConnectionStatus.CONNECTED;
      if (newSignalStrength < 30 && Math.random() < 0.3) {
        newConnStatus = ConnectionStatus.CONNECTING;
      }

      // 4. Update Health Metrics
      const newHealth: HealthMetrics = {
        activityLevel: Math.max(10, Math.min(95, currentPetState.health.activityLevel + (Math.random() - 0.5) * 8)),
        heartRate: Math.max(60, Math.min(140, currentPetState.health.heartRate + (Math.random() - 0.5) * 4)),
        temperature: parseFloat(Math.max(38.0, Math.min(39.5, currentPetState.health.temperature + (Math.random() - 0.5) * 0.2)).toFixed(1)),
      };
      const newHealthHistory = [{ metrics: currentPetState.health, timestamp: new Date() }, ...currentPetState.healthHistory].slice(0, 20);

      // 5. Update the internal state
      currentPetState = {
        ...currentPetState,
        location: newLocation,
        status: newStatus,
        connectionStatus: newConnStatus,
        signalStrength: newSignalStrength,
        lastUpdate: new Date(),
        history: newLocationHistory,
        health: newHealth,
        healthHistory: newHealthHistory,
      };

      resolve({ ...currentPetState });

    }, 200 + Math.random() * 150);
  });
};