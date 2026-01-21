
import React from 'react';
import { Location, PetStatus } from '../types';

interface PetMarkerProps {
    location: Location;
    status: PetStatus;
    name: string;
}

const PetMarker: React.FC<PetMarkerProps> = ({ location, status, name }) => {
    const markerColor = status === PetStatus.SAFE ? 'bg-blue-500' : 'bg-yellow-500';
    const ringColor = status === PetStatus.SAFE ? 'ring-blue-300' : 'ring-yellow-300';

    return (
        <div 
            className="absolute transition-all duration-1000 ease-linear group"
            style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div 
                className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-bold text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
                {name}
                <div className="absolute top-full left-1/2 w-0 h-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
            </div>

            <div className="relative flex justify-center items-center">
                <div className={`absolute w-8 h-8 ${markerColor} rounded-full animate-ping opacity-75`}></div>
                <div className={`relative w-6 h-6 ${markerColor} rounded-full border-2 border-white shadow-lg ring-2 ${ringColor}`}></div>
            </div>
        </div>
    );
};

export default PetMarker;
