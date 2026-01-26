
import React, { useRef } from 'react';
import { Pet, IconType } from '../types';

interface PetProfileProps {
  pet: Pet;
  onImageUpload: (imageUrl: string) => void;
  onIconChange: (iconType: IconType) => void;
}

const PetProfile: React.FC<PetProfileProps> = ({ pet, onImageUpload, onIconChange }) => {
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

  const icons: { type: IconType; svg: React.ReactNode }[] = [
    { type: 'dog', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg> }, // Placeholder circles replaced by Heroicon paths in actual PetMarker, using simpler SVGs for the picker
    { type: 'cat', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1 10h3l-4-4-4 4h3v4h2v-4z"/></svg> },
    { type: 'bird', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> },
    { type: 'rabbit', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg> },
    { type: 'paw', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29L5.7 12.71 4.29 14.12 9.29 19.12 19.71 8.71 18.29 7.29 9.29 16.29Z"/></svg> },
  ];

  // Helper to get descriptive labels
  const getIconLabel = (type: IconType) => type.charAt(0).toUpperCase() + type.slice(1);

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
        
        {/* New Icon Picker Section */}
        <div className="mt-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Marker Style</h4>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {icons.map((icon) => (
              <button
                key={icon.type}
                onClick={() => onIconChange(icon.type)}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  pet.iconType === icon.type 
                    ? 'bg-blue-600 text-white shadow-md scale-110' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={getIconLabel(icon.type)}
              >
                {/* Simplified icons for the selection list */}
                <div className="scale-75">
                  {icon.type === 'dog' && <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.341A8.001 8.001 0 0012 4.5a8.001 8.001 0 00-7.428 10.841m14.856 0A7.5 7.5 0 0112 21.5a7.5 7.5 0 01-7.428-6.159m14.856 0a8.001 8.001 0 00-14.856 0"/></svg>}
                  {icon.type === 'cat' && <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3 3V9m8.31 4a10.03 10.03 0 01-18.62 0 10.03 10.03 0 0118.62 0z"/></svg>}
                  {icon.type === 'bird' && <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>}
                  {icon.type === 'rabbit' && <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                  {icon.type === 'paw' && <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>}
                </div>
              </button>
            ))}
          </div>
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
