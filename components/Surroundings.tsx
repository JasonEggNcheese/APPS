
import React from 'react';
import { GroundingChunk } from '../types';

interface SurroundingsProps {
  chunks: GroundingChunk[] | null;
  isLoading: boolean;
  error: string | null;
}

const Surroundings: React.FC<SurroundingsProps> = ({ chunks, isLoading, error }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-3">Nearby Places</h3>
      {isLoading && (
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
            <li key={index} className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <a 
                href={chunk.maps.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {chunk.maps.title}
              </a>
            </li>
          ))}
        </ul>
      )}
      {chunks && chunks.length === 0 && !isLoading && !error && (
          <p className="text-gray-500">No specific places found nearby.</p>
      )}
    </div>
  );
};

export default Surroundings;
