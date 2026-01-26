
import React from 'react';
import { HealthHistoryItem } from '../types';

interface HealthViewProps {
  healthHistory: HealthHistoryItem[];
  onClose: () => void;
}

const HealthView: React.FC<HealthViewProps> = ({ healthHistory, onClose }) => {
  const history = [...healthHistory].reverse();

  const renderSparkline = (data: number[], color: string, label: string, unit: string) => {
    if (data.length < 2) return null;
    const width = 300;
    const height = 60;
    const padding = 10;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((val - min) / range) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-3">
            <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label} Trend</h4>
                <div className="flex items-baseline">
                    <span className="text-xl font-black text-gray-900">{data[data.length-1].toFixed(1)}</span>
                    <span className="ml-1 text-[10px] font-bold text-gray-500 uppercase">{unit}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[8px] font-black text-green-500 uppercase">Avg: {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)}</p>
            </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-sm"
          />
          <circle 
            cx={(data.length - 1) / (data.length - 1) * (width - 2 * padding) + padding} 
            cy={height - ((data[data.length-1] - min) / range) * (height - 2 * padding) - padding} 
            r="4" 
            fill={color} 
            stroke="white" 
            strokeWidth="2"
          />
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-subtle-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Health Dashboard</h2>
            <p className="text-sm font-bold text-blue-500 uppercase tracking-wider">Vitals & Activity Telemetry</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-gray-200 rounded-2xl text-gray-500 hover:text-gray-900 transition-all hover:rotate-90"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="overflow-y-auto p-8 bg-gray-50/30 scrollbar-hide">
          {history.length > 0 ? (
            <div className="space-y-8">
              {/* Top Row - Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {renderSparkline(history.map(h => h.metrics.heartRate), '#EF4444', 'Heart Rate', 'bpm')}
                 {renderSparkline(history.map(h => h.metrics.activityLevel), '#6366F1', 'Activity', '%')}
                 {renderSparkline(history.map(h => h.metrics.temperature), '#F97316', 'Temperature', '°C')}
              </div>

              {/* Data Table */}
              <div className="mt-10">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Historical Readings</h3>
                <div className="space-y-3">
                  {healthHistory.slice(0, 10).map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-800">Reading Synchronized</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{item.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                         <div className="text-right">
                             <p className="text-[10px] font-black text-red-500 uppercase">BPM</p>
                             <p className="text-sm font-black text-gray-900">{item.metrics.heartRate.toFixed(0)}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] font-black text-indigo-500 uppercase">ACT</p>
                             <p className="text-sm font-black text-gray-900">{item.metrics.activityLevel.toFixed(0)}</p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] font-black text-orange-500 uppercase">TEMP</p>
                             <p className="text-sm font-black text-gray-900">{item.metrics.temperature}°C</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 px-4 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-900 font-black uppercase text-sm tracking-widest">Biometric Data Stream Active</p>
              <p className="text-xs text-gray-400 mt-2 font-bold uppercase">Collecting vitals... charts will render shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthView;
