
import React from 'react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
    petName: string;
    connectionStatus: ConnectionStatus;
    signalStrength: number;
}

const Header: React.FC<HeaderProps> = ({ petName, connectionStatus, signalStrength }) => {
  
  const getSignalBars = () => {
    const bars = Math.ceil(signalStrength / 25); // 0 to 4 bars
    return bars;
  };

  const signalBars = getSignalBars();
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED: return 'bg-green-500';
      case ConnectionStatus.BLUETOOTH: return 'bg-blue-500';
      case ConnectionStatus.CONNECTING: return 'bg-amber-500 animate-pulse';
      case ConnectionStatus.DISCONNECTED: return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSignalColor = () => {
    if (connectionStatus === ConnectionStatus.BLUETOOTH) return 'text-blue-500';
    if (signalBars >= 3) return 'text-green-500';
    if (signalBars === 2) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <header className="bg-white shadow-md p-3 md:p-4 flex justify-between items-center z-10 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-50 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
        <div>
            <h1 className="text-lg md:text-xl font-black text-gray-900 leading-tight">PetTracker</h1>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Collar GPS-01</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-8">
        <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}></span>
                <span className="text-xs font-bold text-gray-600 uppercase">{connectionStatus}</span>
            </div>
            <div className="text-[10px] text-gray-400 font-medium">Last ping: Just now</div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          {/* Signal Icon */}
          <div className={`flex items-end h-4 mb-0.5 ${getSignalColor()}`}>
            {connectionStatus === ConnectionStatus.BLUETOOTH ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m7 4 9 9-9 9" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 4v16" /></svg>
            ) : (
              <div className="flex items-end space-x-0.5 h-full">
                {[1, 2, 3, 4].map((bar) => (
                  <div 
                    key={bar} 
                    className={`w-1 rounded-sm transition-all duration-300 ${
                      bar <= signalBars ? 'bg-current' : 'bg-gray-200'
                    }`}
                    style={{ height: `${bar * 25}%` }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="text-right border-l border-gray-200 pl-3">
            <div className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Device</div>
            <div className="font-black text-sm text-blue-600 leading-none">{petName}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;