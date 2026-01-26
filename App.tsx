
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Pet, PetStatus, Location, GroundingChunk, IconType, ConnectionStatus } from './types';
import Header from './components/Header';
import Map from './components/Map';
import PetProfile from './components/PetProfile';
import PetStatusPill from './components/PetStatusPill';
import Surroundings from './components/Surroundings';
import HistoryView from './components/HistoryView';
import HealthView from './components/HealthView';
import Notification from './components/Notification';
import TrainingControls from './components/TrainingControls';
import { fetchPetData, getInitialPetData } from './services/petApi';

const App: React.FC = () => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [surroundings, setSurroundings] = useState<GroundingChunk[] | null>(null);
  const [isFetchingSurroundings, setIsFetchingSurroundings] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isHealthViewVisible, setIsHealthViewVisible] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  
  // Bluetooth State
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isConnectingBluetooth, setIsConnectingBluetooth] = useState(false);

  // Geofence State
  const [safeZoneCenter, setSafeZoneCenter] = useState<Location>({ x: 50, y: 50 });
  const [safeZoneRadius, setSafeZoneRadius] = useState<number>(35);
  const [isEditingGeofence, setIsEditingGeofence] = useState(false);
  const [tempSafeZone, setTempSafeZone] = useState<{ center: Location, radius: number } | null>(null);

  const prevStatusRef = useRef<PetStatus | null>(null);

  useEffect(() => {
    setPet(getInitialPetData());

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
            },
            (error) => {
                console.error("Error getting user location:", error);
                setFetchError("Could not get your location. Nearby places feature will be unavailable.");
            }
        );
    }
  }, []);

  const handleBluetoothDisconnect = (silent = false) => {
    setIsBluetoothConnected(false);
    if (!silent) {
      setNotification({ message: 'Switched to GPS tracking.', type: 'success' });
    }
  };

  useEffect(() => {
    const updatePetData = async () => {
      const newPetData = await fetchPetData({ center: safeZoneCenter, radius: safeZoneRadius });

      if (isBluetoothConnected) {
        if (newPetData.status === PetStatus.WANDERING) {
          handleBluetoothDisconnect(true);
          setNotification({ message: 'Pet out of range, switching to GPS.', type: 'warning' });
        } else {
          newPetData.connectionStatus = ConnectionStatus.BLUETOOTH;
          newPetData.signalStrength = 100;
        }
      }
      
      setPet(prev => {
        if (!prev) return newPetData;
        return {
          ...newPetData,
          imageUrl: prev.imageUrl,
          iconType: prev.iconType,
          isBeeping: prev.isBeeping,
          isFlashing: prev.isFlashing
        };
      });
    };
    
    const updateInterval = isBluetoothConnected ? 250 : (isLiveTracking ? 500 : 2000);
    const intervalId = setInterval(updatePetData, updateInterval);
    return () => clearInterval(intervalId);
  }, [isLiveTracking, isBluetoothConnected, safeZoneCenter, safeZoneRadius]);

  const fetchSurroundings = useCallback(async (petLocation: Location) => {
      if (!userLocation) {
          setFetchError("Your location is not available, cannot fetch surroundings.");
          return;
      }
      
      setIsFetchingSurroundings(true);
      setFetchError(null);
      
      if (!surroundings) {
        setSurroundings(null);
      }

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const petLat = userLocation.latitude + (petLocation.y - 50) * 0.0005;
          const petLon = userLocation.longitude + (petLocation.x - 50) * 0.0005;
          
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: `My pet is at latitude ${petLat}, longitude ${petLon}. What are the most relevant points of interest nearby? Identify parks, cafes, water sources, and potential hazards like busy streets or construction sites.`,
              config: { tools: [{googleMaps: {}}], toolConfig: { retrievalConfig: { latLng: { latitude: petLat, longitude: petLon } } } },
          });

          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks) {
            const mapChunks = chunks.filter((c: any) => c.maps).map((c: any) => c as GroundingChunk);
            setSurroundings(mapChunks);
          } else {
               setSurroundings([]);
               setFetchError("Could not retrieve surroundings information from the map data.");
          }
      } catch (error) {
          console.error("Error fetching surroundings:", error);
          setFetchError("Failed to fetch surroundings. Please check your API key and network connection.");
      } finally {
          setIsFetchingSurroundings(false);
      }
  }, [userLocation, surroundings]);

  useEffect(() => {
    if (!pet) return;
    const prevStatus = prevStatusRef.current;
    if (prevStatus && prevStatus !== pet.status) {
      if (pet.status === PetStatus.WANDERING) {
        setNotification({ message: `${pet.name} has left the safe zone!`, type: 'warning' });
        fetchSurroundings(pet.location);
      } else if (pet.status === PetStatus.SAFE) {
        setNotification({ message: `${pet.name} is back in the safe zone.`, type: 'success' });
        setSurroundings(null);
        setFetchError(null);
      }
    }
    prevStatusRef.current = pet.status;
  }, [pet, fetchSurroundings]);

  const handlePetImageUpload = (newImageUrl: string) => {
    setPet(prevPet => prevPet ? ({ ...prevPet, imageUrl: newImageUrl }) : null);
  };

  const handlePetIconChange = (newIconType: IconType) => {
    setPet(prevPet => prevPet ? ({ ...prevPet, iconType: newIconType }) : null);
  };

  const handleTriggerSound = () => {
    if (!pet) return;
    setPet(prev => prev ? { ...prev, isBeeping: true } : null);
    setNotification({ message: "Collar tone sent", type: 'success' });
    setTimeout(() => {
      setPet(prev => prev ? { ...prev, isBeeping: false } : null);
    }, 3000);
  };

  const handleTriggerLight = () => {
    if (!pet) return;
    setPet(prev => prev ? { ...prev, isFlashing: true } : null);
    setNotification({ message: "Collar light active", type: 'success' });
    setTimeout(() => {
      setPet(prev => prev ? { ...prev, isFlashing: false } : null);
    }, 5000);
  };

  const handleStartEditGeofence = () => {
    setTempSafeZone({ center: safeZoneCenter, radius: safeZoneRadius });
    setIsEditingGeofence(true);
  };

  const handleSaveGeofence = () => {
    if (tempSafeZone) {
      setSafeZoneCenter(tempSafeZone.center);
      setSafeZoneRadius(tempSafeZone.radius);
    }
    setIsEditingGeofence(false);
    setTempSafeZone(null);
  };

  const handleCancelGeofence = () => {
    setIsEditingGeofence(false);
    setTempSafeZone(null);
  };

  const handleGeofenceChange = (newZone: { center: Location, radius: number }) => {
    setTempSafeZone(newZone);
  };

  const handleBluetoothConnect = () => {
    setIsConnectingBluetooth(true);
    setTimeout(() => {
      setIsConnectingBluetooth(false);
      setIsBluetoothConnected(true);
      setNotification({ message: 'Connected via Bluetooth.', type: 'success' });
    }, 2000); // Simulate connection delay
  };

  const renderBluetoothButton = () => {
    if (isEditingGeofence || pet?.status !== PetStatus.SAFE) return null;

    if (isBluetoothConnected) {
      return (
        <button onClick={() => handleBluetoothDisconnect(false)} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m7 4 9 9-9 9" /><path strokeLinecap="round" strokeLinejoin="round" d="m15.293 4.293-2.586 2.586a1 1 0 0 0 0 1.414l2.586 2.586m-5.172 5.172-2.586 2.586a1 1 0 0 0 0 1.414l2.586 2.586" /></svg>
          Disconnect Bluetooth
        </button>
      );
    }

    if (isConnectingBluetooth) {
      return (
        <button disabled className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-lg cursor-wait">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Connecting...
        </button>
      );
    }

    return (
       <button onClick={handleBluetoothConnect} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m7 4 9 9-9 9" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 4v16" /></svg>
        Connect via Bluetooth
      </button>
    );
  };

  if (!pet) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-xl text-gray-700">Connecting to GPS collar...</p>
      </div>
    );
  }

  const currentSafeZone = isEditingGeofence && tempSafeZone ? tempSafeZone : { center: safeZoneCenter, radius: safeZoneRadius };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-50 text-gray-800">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <Header 
        petName={pet.name} 
        connectionStatus={pet.connectionStatus} 
        signalStrength={pet.signalStrength} 
      />
      <main className="flex-grow flex flex-col md:flex-row relative overflow-hidden">
        <div className="w-full md:flex-1 h-1/2 md:h-full relative bg-green-100">
           <Map 
              location={pet.location} 
              safeZoneCenter={currentSafeZone.center} 
              safeZoneRadius={currentSafeZone.radius}
              status={pet.status} 
              petName={pet.name} 
              iconType={pet.iconType}
              isLiveTracking={isLiveTracking || isBluetoothConnected}
              isEditingGeofence={isEditingGeofence}
              onGeofenceChange={handleGeofenceChange}
              isBeeping={pet.isBeeping}
              isFlashing={pet.isFlashing}
              hideControls={isHistoryVisible || isHealthViewVisible}
            />
        </div>
        <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 p-4 sm:p-6 flex flex-col justify-between shadow-lg overflow-y-auto">
            <div>
              <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">Pet Details</h2>
                  <PetStatusPill status={pet.status} />
              </div>
              <PetProfile 
                pet={pet} 
                onImageUpload={handlePetImageUpload} 
                onIconChange={handlePetIconChange}
              />
              <TrainingControls 
                onTriggerSound={handleTriggerSound} 
                onTriggerLight={handleTriggerLight} 
                isBeeping={!!pet.isBeeping} 
                isFlashing={!!pet.isFlashing}
              />
              { (pet.status === PetStatus.WANDERING || isFetchingSurroundings || surroundings) &&
                <Surroundings 
                  chunks={surroundings} 
                  isLoading={isFetchingSurroundings} 
                  error={fetchError} 
                  onRefresh={() => pet && fetchSurroundings(pet.location)}
                />
              }
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {isEditingGeofence ? (
                <>
                  <button onClick={handleSaveGeofence} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Save Zone
                  </button>
                   <button onClick={handleCancelGeofence} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {renderBluetoothButton()}
                  <button onClick={handleStartEditGeofence} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                    Edit Safe Zone
                  </button>
                  <button onClick={() => setIsLiveTracking(!isLiveTracking)} className={`w-full font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center text-lg ${ isLiveTracking ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }`} >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.045A9 9 0 0 1 7.5 15a9 9 0 0 1-1.42-5.002N7.333 4.511 8.333 3.5a2.121 2.121 0 0 1 3 0l1 1a2.121 2.121 0 0 1 0 3l-1.928 1.928a2.121 2.121 0 0 1-3 0l-1.42-1.42" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.712 8.955a9 9 0 0 1 1.42 5.002 9 9 0 0 1-9 9 9 9 0 0 1-5.002-1.42m5.002-1.42 1.42-1.42a2.121 2.121 0 0 1 3 0l1.928 1.928a2.121 2.121 0 0 1 0 3l-1 1a2.121 2.121 0 0 1-3 0" /></svg>
                    {isLiveTracking ? 'Live Tracking: ON' : 'Live Tracking: OFF'}
                  </button>
                  <button onClick={() => setIsHistoryVisible(true)} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                    View History
                  </button>
                  <button onClick={() => setIsHealthViewVisible(true)} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                    Health Stats
                  </button>
                </>
              )}
            </div>
        </div>
      </main>
      {isHistoryVisible && <HistoryView history={pet.history} safeZoneCenter={safeZoneCenter} onClose={() => setIsHistoryVisible(false)} />}
      {isHealthViewVisible && <HealthView healthHistory={pet.healthHistory} onClose={() => setIsHealthViewVisible(false)} />}
    </div>
  );
};

export default App;
