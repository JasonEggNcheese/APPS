
import React from 'react';
import { Location, PetStatus, IconType } from '../types';

interface PetMarkerProps {
    location: Location;
    status: PetStatus;
    name: string;
    iconType: IconType;
    isBeeping?: boolean;
    isFlashing?: boolean;
}

const PetMarker: React.FC<PetMarkerProps> = ({ 
    location, 
    status, 
    name, 
    iconType, 
    isBeeping = false, 
    isFlashing = false 
}) => {
    const isSafe = status === PetStatus.SAFE;
    const markerColor = isSafe ? 'bg-blue-600' : 'bg-yellow-500';
    const ringColor = isSafe ? 'ring-blue-300' : 'ring-yellow-300';
    const pingColor = isSafe ? 'bg-blue-400' : 'bg-yellow-400';

    const renderIcon = () => {
        const iconClass = "w-5 h-5 text-white z-10 relative";
        switch (iconType) {
            case 'dog':
                return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.341A8.001 8.001 0 0012 4.5a8.001 8.001 0 00-7.428 10.841m14.856 0A7.5 7.5 0 0112 21.5a7.5 7.5 0 01-7.428-6.159m14.856 0a8.001 8.001 0 00-14.856 0"/></svg>;
            case 'cat':
                return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3 3V9m8.31 4a10.03 10.03 0 01-18.62 0 10.03 10.03 0 0118.62 0z"/></svg>;
            case 'bird':
                return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>;
            case 'rabbit':
                return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
            case 'paw':
                return <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
            default:
                return null;
        }
    };

    return (
        <div 
            className="absolute transition-all duration-1000 ease-linear group z-30"
            style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div 
                className="absolute bottom-full mb-3 w-max px-3 py-1.5 text-sm font-bold text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
                {name}
                <div className="absolute top-full left-1/2 w-0 h-0 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
            </div>

            <div className="relative flex justify-center items-center">
                {/* Sound Waves */}
                {isBeeping && (
                    <>
                        <div className="absolute w-12 h-12 border-4 border-blue-400/50 rounded-full animate-sound-wave"></div>
                        <div className="absolute w-12 h-12 border-4 border-blue-400/30 rounded-full animate-sound-wave" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute w-12 h-12 border-4 border-blue-400/10 rounded-full animate-sound-wave" style={{ animationDelay: '1s' }}></div>
                    </>
                )}

                {/* Flashing Light Effect */}
                {isFlashing && (
                    <div className="absolute w-16 h-16 bg-amber-400/40 rounded-full blur-xl animate-light-flash"></div>
                )}

                <div className={`absolute w-12 h-12 ${pingColor} rounded-full animate-ping opacity-40`}></div>
                
                <div className={`relative w-10 h-10 ${markerColor} rounded-full border-2 border-white shadow-xl ring-4 ${ringColor} flex items-center justify-center transition-all duration-300 ${isFlashing ? 'bg-amber-400 ring-amber-200' : ''}`}>
                    {renderIcon()}
                    {isFlashing && (
                         <div className="absolute inset-0 bg-amber-200/50 rounded-full animate-pulse"></div>
                    )}
                </div>

                <div className={`absolute top-[90%] w-0 h-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-white z-[-1]`}></div>
                <div className={`absolute top-[85%] w-0 h-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-${isSafe ? 'blue-600' : 'yellow-500'} z-[-1]`}></div>
            </div>
        </div>
    );
};

export default PetMarker;
