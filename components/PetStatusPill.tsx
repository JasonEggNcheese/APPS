
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
          shadow: 'shadow-green-900/10',
          animation: '',
        };
      case PetStatus.WANDERING:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500 animate-pulse',
          shadow: 'shadow-yellow-900/20',
          animation: 'animate-breathe-yellow',
        };
      case PetStatus.DANGER:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          dot: 'bg-red-500 animate-ping',
          shadow: 'shadow-red-900/30',
          animation: 'animate-breathe-red',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          dot: 'bg-gray-500',
          shadow: 'shadow-gray-900/10',
          animation: '',
        };
    }
  };

  const { bg, text, dot, shadow, animation } = getStatusStyles();

  return (
    <div 
      className={`
        flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
        shadow-sm transition-all duration-500 ease-in-out border border-white/50
        animate-subtle-pop
        ${bg} ${text} ${shadow} ${animation}
      `}
    >
      <span className={`relative flex h-2.5 w-2.5`}>
        {/* For more urgent statuses, we add an outer glowing ring */}
        {(status === PetStatus.WANDERING || status === PetStatus.DANGER) && (
           <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dot}`}></span>
      </span>
      <span>{status}</span>
    </div>
  );
};

export default PetStatusPill;