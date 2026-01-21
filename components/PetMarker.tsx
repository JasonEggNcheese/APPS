
import React from 'react';
import { Location, PetStatus } from '../types';

interface PetMarkerProps {
    location: Location;
    status: PetStatus;
}

const PetMarker: React.FC<PetMarkerProps> = ({ location, status }) => {
    const markerColor = status === PetStatus.SAFE ? 'bg-blue-500' : 'bg-yellow-500';
    const ringColor = status === PetStatus.SAFE ? 'ring-blue-300' : 'ring-yellow-300';

    return (
        <div 
            className="absolute transition-all duration-1000 ease-linear"
            style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div className="relative flex justify-center items-center">
                <div className={`absolute w-8 h-8 ${markerColor} rounded-full animate-ping opacity-75`}></div>
                <div className={`relative w-6 h-6 ${markerColor} rounded-full border-2 border-white shadow-lg ring-2 ${ringColor}`}></div>
            </div>
        </div>
    );
};

export default PetMarker;
