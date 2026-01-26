
import React from 'react';
import { LocationHistoryItem, Location } from '../types';

interface HistoryViewProps {
  history: LocationHistoryItem[];
  safeZoneCenter: Location;
  onClose: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, safeZoneCenter, onClose }) => {
  const calculateDistance = (loc: Location) => {
    return Math.sqrt(Math.pow(loc.x - safeZoneCenter.x, 2) + Math.pow(loc.y - safeZoneCenter.y, 2));
  };

  const distances = [...history].reverse().map(item => calculateDistance(item.location));
  const maxDistance = Math.max(...distances, 50); // Min scale of 50 for visibility

  const renderDistanceChart = () => {
    if (distances.length < 2) return null;

    const width = 400;
    const height = 100;
    const padding = 10;
    
    const points = distances.map((d, i) => {
      const x = (i / (distances.length - 1)) * (width - 2 * padding) + padding;
      const y = height - (d / maxDistance) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
        <div className="flex justify-between items-end mb-2">
            <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest">Distance Trend (m)</h4>
            <span className="text-[10px] font-bold text-blue-400">Relative to center</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />
          
          {/* Path */}
          <polyline
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-sm"
          />
          
          {/* Area under path */}
          <path
            d={`M ${padding} ${height - padding} L ${points} L ${width - padding} ${height - padding} Z`}
            fill="url(#blueGradient)"
            className="opacity-20"
          />

          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          
          {/* Labels */}
          <text x={padding} y={height} fontSize="8" fill="#9CA3AF" fontWeight="bold">T-Start</text>
          <text x={width - padding} y={height} fontSize="8" fill="#9CA3AF" fontWeight="bold" textAnchor="end">Now</text>
        </svg>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center p-4 transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-subtle-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Activity Log</h2>
            <p className="text-xs font-bold text-gray-400 uppercase">Recent Location History</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="overflow-y-auto p-6 scrollbar-hide">
          {history.length > 0 ? (
            <>
              {renderDistanceChart()}
              <ul className="space-y-4">
                {history.map((item, index) => (
                  <li key={index} className="flex items-center group">
                    <div className="relative flex flex-col items-center mr-4">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'} z-10`} />
                        {index !== history.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-200 absolute top-3" />
                        )}
                    </div>
                    <div className="flex-grow p-3 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-800 font-bold text-sm">
                          {index === 0 ? 'Current Location' : `Ping #${history.length - index}`}
                        </p>
                        <p className="text-[10px] font-black text-gray-400 uppercase">
                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                         X: {item.location.x.toFixed(1)}, Y: {item.location.y.toFixed(1)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-900 font-black uppercase text-sm tracking-widest">Awaiting Data</p>
              <p className="text-xs text-gray-400 mt-2 font-bold uppercase">GPS history will populate as Benji explores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
