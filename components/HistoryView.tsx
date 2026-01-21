
import React from 'react';
import { LocationHistoryItem } from '../types';

interface HistoryViewProps {
  history: LocationHistoryItem[];
  onClose: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Location History</h2>
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
          {history.length > 0 ? (
            <ul className="space-y-3">
              {history.map((item, index) => (
                <li key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full h-10 w-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-800 font-semibold">
                      Location Logged
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-gray-500 font-medium">No location history recorded yet.</p>
              <p className="text-sm text-gray-400 mt-2">History will appear here as your pet moves.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
