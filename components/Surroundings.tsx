
import React from 'react';
import { GroundingChunk } from '../types';

interface SurroundingsProps {
  chunks: GroundingChunk[] | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const Surroundings: React.FC<SurroundingsProps> = ({ chunks, isLoading, error, onRefresh }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div>
            <h3 className="text-xl font-bold text-gray-800">Nearby Places</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Powered by Google Maps</p>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Refresh nearby places"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a2.25 2.25 0 0 0-2.25-2.25h-4.5a2.25 2.25 0 0 0-2.25 2.25v4.5A2.25 2.25 0 0 0 6.75 12h4.5a2.25 2.25 0 0 0 2.25-2.25Z" />
            </svg>
          )}
        </button>
      </div>

      {isLoading && (!chunks || chunks.length === 0) && !error && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Checking surroundings...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {chunks && chunks.length > 0 && (
        <ul className="space-y-2">
          {chunks.map((chunk, index) => (
            <li key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-6.05a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <a 
                href={chunk.maps.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm font-medium"
              >
                {chunk.maps.title}
              </a>
            </li>
          ))}
        </ul>
      )}
      {chunks && chunks.length === 0 && !isLoading && !error && (
          <p className="text-gray-500 text-center py-4">No specific places found nearby.</p>
      )}
    </div>
  );
};

export default Surroundings;
