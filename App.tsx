
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Pet, PetStatus, Location, GroundingChunk, HealthMetrics } from './types';
import Header from './components/Header';
import Map from './components/Map';
import PetProfile from './components/PetProfile';
import PetStatusPill from './components/PetStatusPill';
import Surroundings from './components/Surroundings';
import HistoryView from './components/HistoryView';
import HealthView from './components/HealthView';

const SAFE_ZONE_CENTER: Location = { x: 50, y: 50 };
const SAFE_ZONE_RADIUS = 35; // in percentage of map dimensions

const App: React.FC = () => {
  const [pet, setPet] = useState<Pet>({
    id: '1',
    name: 'Buddy',
    breed: 'Golden Retriever',
    imageUrl: 'https://picsum.photos/seed/buddy/200/200',
    location: { x: 50, y: 50 },
    status: PetStatus.SAFE,
    lastUpdate: new Date(),
    history: [],
    health: {
      activityLevel: 75,
      heartRate: 85,
      temperature: 38.5,
    },
    healthHistory: [],
  });

  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [surroundings, setSurroundings] = useState<GroundingChunk[] | null>(null);
  const [isFetchingSurroundings, setIsFetchingSurroundings] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isHealthViewVisible, setIsHealthViewVisible] = useState(false);

  const prevStatusRef = useRef<PetStatus | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting user location:", error);
                setFetchError("Could not get your location. Nearby places feature will be unavailable.");
            }
        );
    }
  }, []);

  const fetchSurroundings = async (petLocation: Location) => {
      if (!userLocation) {
          setFetchError("Your location is not available, cannot fetch surroundings.");
          return;
      }
      
      setIsFetchingSurroundings(true);
      setFetchError(null);
      setSurroundings(null);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

          const petLat = userLocation.latitude + (petLocation.y - 50) * 0.0005;
          const petLon = userLocation.longitude + (petLocation.x - 50) * 0.0005;
          
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: `My pet is wandering near latitude ${petLat}, longitude ${petLon}. What are some notable places nearby, like parks, cafes, or busy roads?`,
              config: {
                  tools: [{googleMaps: {}}],
                  toolConfig: {
                      retrievalConfig: {
                          latLng: {
                              latitude: petLat,
                              longitude: petLon
                          }
                      }
                  }
              },
          });

          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks) {
            const mapChunks = chunks.filter((c: any) => c.maps).map((c: any) => c as GroundingChunk);
            setSurroundings(mapChunks);
          } else {
               setFetchError("Could not retrieve surroundings information from the map data.");
          }
      } catch (error) {
          console.error("Error fetching surroundings:", error);
          setFetchError("Failed to fetch surroundings. Please check your API key and network connection.");
      } finally {
          setIsFetchingSurroundings(false);
      }
  };

  useEffect(() => {
    const updatePetData = () => {
      setPet(prevPet => {
        // Simulate Location
        const moveX = (Math.random() - 0.5) * 4;
        const moveY = (Math.random() - 0.5) * 4;
        let newX = Math.max(0, Math.min(100, prevPet.location.x + moveX));
        let newY = Math.max(0, Math.min(100, prevPet.location.y + moveY));
        const newLocation: Location = { x: newX, y: newY };

        const distance = Math.sqrt(Math.pow(newX - SAFE_ZONE_CENTER.x, 2) + Math.pow(newY - SAFE_ZONE_CENTER.y, 2));
        const newStatus = distance > SAFE_ZONE_RADIUS ? PetStatus.WANDERING : PetStatus.SAFE;
        
        const newLocationHistory = [{ location: prevPet.location, timestamp: new Date() }, ...prevPet.history].slice(0, 20);

        // Simulate Health Metrics
        const newHealth: HealthMetrics = {
          activityLevel: Math.max(10, Math.min(95, prevPet.health.activityLevel + (Math.random() - 0.5) * 10)),
          heartRate: Math.max(60, Math.min(140, prevPet.health.heartRate + (Math.random() - 0.5) * 5)),
          temperature: parseFloat(Math.max(38.0, Math.min(39.5, prevPet.health.temperature + (Math.random() - 0.5) * 0.2)).toFixed(1)),
        };

        const newHealthHistory = [{ metrics: prevPet.health, timestamp: new Date() }, ...prevPet.healthHistory].slice(0, 20);

        return {
          ...prevPet,
          location: newLocation,
          status: newStatus,
          lastUpdate: new Date(),
          history: newLocationHistory,
          health: newHealth,
          healthHistory: newHealthHistory,
        };
      });
    };

    const intervalId = setInterval(updatePetData, 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    if (pet.status === PetStatus.WANDERING && prevStatus !== PetStatus.WANDERING) {
        fetchSurroundings(pet.location);
    }
    if (pet.status === PetStatus.SAFE && prevStatus === PetStatus.WANDERING) {
        setSurroundings(null);
        setFetchError(null);
    }
    prevStatusRef.current = pet.status;
  }, [pet.status, pet.location, userLocation]);

  const handlePetImageUpload = (newImageUrl: string) => {
    setPet(prevPet => ({
      ...prevPet,
      imageUrl: newImageUrl,
    }));
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-50 text-gray-800">
      <Header petName={pet.name} />
      <main className="flex-grow flex flex-col md:flex-row relative overflow-hidden">
        <div className="w-full md:flex-1 h-1/2 md:h-full relative bg-green-100">
           <Map location={pet.location} safeZoneCenter={SAFE_ZONE_CENTER} safeZoneRadius={SAFE_ZONE_RADIUS} status={pet.status} />
        </div>
        <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 p-4 sm:p-6 flex flex-col justify-between shadow-lg overflow-y-auto">
            <div>
              <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Pet Details</h2>
                  <PetStatusPill status={pet.status} />
              </div>
              <PetProfile pet={pet} onImageUpload={handlePetImageUpload} />
              { (pet.status === PetStatus.WANDERING || isFetchingSurroundings || surroundings) &&
                <Surroundings chunks={surroundings} isLoading={isFetchingSurroundings} error={fetchError} />
              }
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Locate Pet
              </button>
               <button onClick={() => setIsHistoryVisible(true)} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                View History
              </button>
               <button onClick={() => setIsHealthViewVisible(true)} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                Health Stats
              </button>
            </div>
        </div>
      </main>
      {isHistoryVisible && <HistoryView history={pet.history} onClose={() => setIsHistoryVisible(false)} />}
      {isHealthViewVisible && <HealthView healthHistory={pet.healthHistory} onClose={() => setIsHealthViewVisible(false)} />}
    </div>
  );
};

export default App;
