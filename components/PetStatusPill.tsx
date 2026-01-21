
import React from 'react';
import { PetStatus } from '../types';

interface PetStatusPillProps {
  status: PetStatus;
}

const PetStatusPill: React.FC<PetStatusPillProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case PetStatus.SAFE:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          dot: 'bg-green-500',
        };
      case PetStatus.WANDERING:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500 animate-pulse',
        };
      case PetStatus.DANGER:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          dot: 'bg-red-500 animate-ping',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          dot: 'bg-gray-500',
        };
    }
  };

  const { bg, text, dot } = getStatusStyles();

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${bg} ${text}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${dot}`}></span>
      <span>{status}</span>
    </div>
  );
};

export default PetStatusPill;
