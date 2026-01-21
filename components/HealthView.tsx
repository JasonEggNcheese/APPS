
import React from 'react';
import { HealthHistoryItem } from '../types';

interface HealthViewProps {
  healthHistory: HealthHistoryItem[];
  onClose: () => void;
}

const HealthView: React.FC<HealthViewProps> = ({ healthHistory, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Health Metrics History</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="overflow-y-auto p-4">
          {healthHistory.length > 0 ? (
            <ul className="space-y-3">
              {healthHistory.map((item, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-800 font-semibold">
                      Health Reading
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-indigo-100 p-2 rounded">
                      <div className="text-sm text-indigo-800 font-medium">Activity</div>
                      <div className="text-lg font-bold text-indigo-900">{item.metrics.activityLevel.toFixed(0)}%</div>
                    </div>
                     <div className="bg-red-100 p-2 rounded">
                      <div className="text-sm text-red-800 font-medium">Heart Rate</div>
                      <div className="text-lg font-bold text-red-900">{item.metrics.heartRate.toFixed(0)} bpm</div>
                    </div>
                     <div className="bg-orange-100 p-2 rounded">
                      <div className="text-sm text-orange-800 font-medium">Temp</div>
                      <div className="text-lg font-bold text-orange-900">{item.metrics.temperature}°C</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-gray-500 font-medium">No health history recorded yet.</p>
              <p className="text-sm text-gray-400 mt-2">Data will appear here as the collar sends updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthView;
