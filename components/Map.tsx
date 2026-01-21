
import React, { useState, useRef, WheelEvent, MouseEvent, TouchEvent } from 'react';
import { Location, PetStatus } from '../types';
import PetMarker from './PetMarker';

interface MapProps {
  location: Location;
  safeZoneCenter: Location;
  safeZoneRadius: number;
  status: PetStatus;
}

type MapLayer = 'default' | 'satellite' | 'street';

const Map: React.FC<MapProps> = ({ location, safeZoneCenter, safeZoneRadius, status }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pinchDistRef = useRef(0);

  const [mapLayer, setMapLayer] = useState<MapLayer>('default');
  const [isLayerSelectorOpen, setIsLayerSelectorOpen] = useState(false);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const ZOOM_SENSITIVITY = 1.005;

  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

  const handleZoom = (delta: number, centerX: number, centerY: number) => {
    setZoom(prevZoom => {
      const newZoom = clamp(prevZoom * (ZOOM_SENSITIVITY ** -delta), MIN_ZOOM, MAX_ZOOM);
      const zoomFactor = newZoom / prevZoom;

      setOffset(prevOffset => ({
        x: centerX - (centerX - prevOffset.x) * zoomFactor,
        y: centerY - (centerY - prevOffset.y) * zoomFactor
      }));

      return newZoom;
    });
  };

  // --- Mouse Event Handlers ---
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    setOffset({ x, y });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    handleZoom(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
  };
  
  // --- Touch Event Handlers ---
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) { // Panning
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.touches[0].clientX - offset.x,
            y: e.touches[0].clientY - offset.y,
        };
    } else if (e.touches.length === 2) { // Pinching
        e.preventDefault();
        setIsDragging(false);
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) { // Panning
        e.preventDefault();
        const x = e.touches[0].clientX - dragStartRef.current.x;
        const y = e.touches[0].clientY - dragStartRef.current.y;
        setOffset({ x, y });
    } else if (e.touches.length === 2) { // Pinching
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const delta = pinchDistRef.current - newDist;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
        const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;

        handleZoom(delta * 0.5, centerX, centerY);
        pinchDistRef.current = newDist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchDistRef.current = 0;
  };


  const handleRecenter = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const getMapLayerStyles = () => {
    switch (mapLayer) {
      case 'satellite':
        return {
          mapContainer: 'bg-gray-800',
          mapLayer: 'bg-repeat',
          style: { backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-matter.png')` },
          safeZone: 'bg-white bg-opacity-20 border-white'
        };
      case 'street':
        return {
          mapContainer: 'bg-gray-300',
          mapLayer: 'bg-repeat',
          style: { backgroundImage: `url('https://www.transparenttextures.com/patterns/subtle-grid.png')`},
          safeZone: 'bg-blue-500 bg-opacity-20 border-blue-400'
        };
      default:
        return {
          mapContainer: 'bg-green-50',
          mapLayer: '',
          style: {},
          safeZone: 'bg-green-500 bg-opacity-20 border-green-600'
        };
    }
  };

  const layerStyles = getMapLayerStyles();
  const cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-grab';

  return (
    <div 
        className={`w-full h-full overflow-hidden relative border-2 border-gray-300 select-none touch-none ${cursorClass} ${layerStyles.mapContainer}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      <div 
        className={`w-full h-full ${layerStyles.mapLayer}`}
        style={{ 
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          ...layerStyles.style
        }}
      >
        {/* Safe Zone */}
        <div
          className={`absolute border-2 border-dashed rounded-full ${layerStyles.safeZone}`}
          style={{
            left: `${safeZoneCenter.x}%`,
            top: `${safeZoneCenter.y}%`,
            width: `${safeZoneRadius * 2}%`,
            height: `${safeZoneRadius * 2}%`,
            transform: 'translate(-50%, -50%)',
          }}
        ></div>

        {/* Pet Marker */}
        <PetMarker location={location} status={status} />
      </div>

      {/* Map Layer Controls */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsLayerSelectorOpen(!isLayerSelectorOpen)}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle map layers"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-10.498 4.277 4.277a.75.75 0 0 1 0 1.06l-4.277 4.277M3 11.25a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25v1.5a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-1.5Zm9-3.75a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25v1.5a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-1.5Z" />
          </svg>
        </button>
        {isLayerSelectorOpen && (
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl w-32 animate-fadeIn">
            <button onClick={() => { setMapLayer('default'); setIsLayerSelectorOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${mapLayer === 'default' ? 'font-bold text-blue-600' : 'text-gray-700'} hover:bg-gray-100 rounded-t-lg`}>Default</button>
            <button onClick={() => { setMapLayer('satellite'); setIsLayerSelectorOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${mapLayer === 'satellite' ? 'font-bold text-blue-600' : 'text-gray-700'} hover:bg-gray-100`}>Satellite</button>
            <button onClick={() => { setMapLayer('street'); setIsLayerSelectorOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${mapLayer === 'street' ? 'font-bold text-blue-600' : 'text-gray-700'} hover:bg-gray-100 rounded-b-lg`}>Street</button>
          </div>
        )}
      </div>

      {/* Zoom and Recenter Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2">
        <div className="bg-white rounded-lg shadow-lg flex flex-col">
            <button 
              onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.closest('.relative')?.getBoundingClientRect(); handleZoom(-150, rect ? rect.width/2 : 0, rect ? rect.height/2 : 0); }}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <div className="w-full h-px bg-gray-200"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.closest('.relative')?.getBoundingClientRect(); handleZoom(150, rect ? rect.width/2 : 0, rect ? rect.height/2 : 0); }}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Zoom out"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
        </div>
        <button 
          onClick={handleRecenter}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Recenter map on pet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Map;
