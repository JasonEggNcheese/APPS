
import React, { useRef } from 'react';
import { Pet } from '../types';

interface PetProfileProps {
  pet: Pet;
  onImageUpload: (imageUrl: string) => void;
}

const PetProfile: React.FC<PetProfileProps> = ({ pet, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };
  
  const [lastSeen, setLastSeen] = React.useState(timeAgo(pet.lastUpdate));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastSeen(timeAgo(pet.lastUpdate));
    }, 1000);
    return () => clearInterval(interval);
  }, [pet.lastUpdate]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="relative group cursor-pointer" onClick={handleImageClick}>
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 group-hover:border-blue-400 transition-colors"
          />
          <div
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-opacity"
            aria-label="Change pet photo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
            </svg>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
          />
        </div>
        <div>
          <h3 className="text-3xl font-extrabold text-gray-800">{pet.name}</h3>
          <p className="text-md text-gray-500">{pet.breed}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
          <span className="font-semibold text-gray-600">Last Seen:</span>
          <span className="font-bold text-gray-800">{lastSeen}</span>
        </div>
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
          <span className="font-semibold text-gray-600">Collar Battery:</span>
          <div className="flex items-center">
            <span className="font-bold text-green-600 mr-2">92%</span>
            <div className="w-5 h-5 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5ZM3.75 18h15A2.25 2.25 0 0 0 21 15.75v-6.5A2.25 2.25 0 0 0 18.75 7H3.75A2.25 2.25 0 0 0 1.5 9.25v6.5A2.25 2.25 0 0 0 3.75 18Z" />
                </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Health Metrics</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
              <span className="font-semibold text-gray-600">Activity Level:</span>
            </div>
            <span className="font-bold text-gray-800">{pet.health.activityLevel.toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              <span className="font-semibold text-gray-600">Heart Rate:</span>
            </div>
            <span className="font-bold text-gray-800">{pet.health.heartRate.toFixed(0)} bpm</span>
          </div>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
              <span className="font-semibold text-gray-600">Temperature:</span>
            </div>
            <span className="font-bold text-gray-800">{pet.health.temperature}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
