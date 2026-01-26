
import React from 'react';

interface TrainingControlsProps {
  onTriggerSound: () => void;
  onTriggerLight: () => void;
  isBeeping: boolean;
  isFlashing: boolean;
}

const TrainingControls: React.FC<TrainingControlsProps> = ({ 
  onTriggerSound, 
  onTriggerLight, 
  isBeeping, 
  isFlashing 
}) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Training Mode</h4>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onTriggerSound}
          disabled={isBeeping}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group ${
            isBeeping 
              ? 'bg-blue-50 border-blue-400 text-blue-600' 
              : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30'
          }`}
        >
          <div className={`p-2 rounded-full mb-2 ${isBeeping ? 'bg-blue-100' : 'bg-gray-50 group-hover:bg-blue-100/50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isBeeping ? 'animate-bounce' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          </div>
          <span className="text-xs font-black uppercase">{isBeeping ? 'Playing...' : 'Sound'}</span>
        </button>

        <button 
          onClick={onTriggerLight}
          disabled={isFlashing}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group ${
            isFlashing 
              ? 'bg-amber-50 border-amber-400 text-amber-600' 
              : 'bg-white border-gray-100 text-gray-600 hover:border-amber-200 hover:bg-amber-50/30'
          }`}
        >
          <div className={`p-2 rounded-full mb-2 ${isFlashing ? 'bg-amber-100' : 'bg-gray-50 group-hover:bg-amber-100/50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${isFlashing ? 'animate-pulse' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <span className="text-xs font-black uppercase">{isFlashing ? 'Flashing...' : 'Light'}</span>
        </button>
      </div>
      <p className="mt-3 text-[10px] text-gray-400 font-bold uppercase text-center tracking-tighter">
        Actions trigger local collar signals
      </p>
    </div>
  );
};

export default TrainingControls;
