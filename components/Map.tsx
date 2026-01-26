
import React, { useState, useRef, WheelEvent, MouseEvent, TouchEvent, useEffect } from 'react';
import { Location, PetStatus, IconType } from '../types';
import PetMarker from './PetMarker';

interface MapProps {
  location: Location;
  safeZoneCenter: Location;
  safeZoneRadius: number;
  status: PetStatus;
  petName: string;
  iconType: IconType;
  isLiveTracking: boolean;
  isEditingGeofence: boolean;
  onGeofenceChange: (newZone: { center: Location, radius: number }) => void;
  isBeeping?: boolean;
  isFlashing?: boolean;
  hideControls?: boolean;
}

type MapLayer = 'default' | 'satellite' | 'street';
type EditMode = 'none' | 'drawing' | 'moving' | 'resizing';

const Map: React.FC<MapProps> = ({ 
  location, 
  safeZoneCenter, 
  safeZoneRadius, 
  status, 
  petName, 
  iconType,
  isLiveTracking, 
  isEditingGeofence, 
  onGeofenceChange,
  isBeeping,
  isFlashing,
  hideControls = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('none');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pinchRef = useRef({ dist: 0, angle: 0, rotation: 0 });
  const layerSelectorRef = useRef<HTMLDivElement>(null);

  const [mapLayer, setMapLayer] = useState<MapLayer>('default');
  const [isLayerSelectorOpen, setIsLayerSelectorOpen] = useState(false);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const ZOOM_SENSITIVITY = 1.005;

  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

  const handleRecenter = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
        if (layerSelectorRef.current && !layerSelectorRef.current.contains(event.target as Node)) {
            setIsLayerSelectorOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [layerSelectorRef]);

  useEffect(() => {
    if (isLiveTracking) handleRecenter();
  }, [location, isLiveTracking]);

  const handleZoom = (delta: number, centerX: number, centerY: number) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    setZoom(prevZoom => {
      const newZoom = clamp(prevZoom * (ZOOM_SENSITIVITY ** -delta), MIN_ZOOM, MAX_ZOOM);
      const zoomFactor = newZoom / prevZoom;
      const newOffsetX = (rect.width / 2) - ((rect.width / 2) - offset.x) * zoomFactor;
      const newOffsetY = (rect.height / 2) - ((rect.height / 2) - offset.y) * zoomFactor;
      setOffset({ x: newOffsetX, y: newOffsetY });
      return newZoom;
    });
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (isLiveTracking || hideControls) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    handleZoom(e.deltaY, centerX, centerY);
  };

  const getMapCoords = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as TouchEvent<HTMLDivElement>).touches[0].clientX : (e as MouseEvent<HTMLDivElement>).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent<HTMLDivElement>).touches[0].clientY : (e as MouseEvent<HTMLDivElement>).clientY;
    return {
      x: (clientX - rect.left) / rect.width * 100,
      y: (clientY - rect.top) / rect.height * 100
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isLiveTracking || hideControls) return;
    if (isEditingGeofence) {
        const { x, y } = getMapCoords(e);
        const distToCenter = Math.sqrt((x - safeZoneCenter.x)**2 + (y - safeZoneCenter.y)**2);
        const handleRadius = 2.0 / zoom; 
        
        if (Math.abs(distToCenter - safeZoneRadius) < handleRadius) {
            setEditMode('resizing');
        } else if (distToCenter < handleRadius) {
            setEditMode('moving');
            dragStartRef.current = { x: x - safeZoneCenter.x, y: y - safeZoneCenter.y };
        } else {
            setEditMode('drawing');
            onGeofenceChange({ center: { x, y }, radius: 0 });
        }
        return;
    }
    
    if (e.shiftKey) {
        setIsRotating(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2, centerY = rect.height / 2;
        const startAngle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX);
        pinchRef.current = { dist: 0, angle: startAngle, rotation };
    } else {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isLiveTracking || hideControls) return;
    if (isEditingGeofence) {
        if (editMode === 'none') return;
        const { x, y } = getMapCoords(e);
        if (editMode === 'drawing' || editMode === 'resizing') {
            const newRadius = Math.sqrt((x - safeZoneCenter.x)**2 + (y - safeZoneCenter.y)**2);
            onGeofenceChange({ center: safeZoneCenter, radius: newRadius });
        } else if (editMode === 'moving') {
            const newCenter = { x: x - dragStartRef.current.x, y: y - dragStartRef.current.y };
            onGeofenceChange({ center: newCenter, radius: safeZoneRadius });
        }
        return;
    }

    if (isRotating) {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2, centerY = rect.height / 2;
        const currentAngle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX);
        const angleDelta = currentAngle - pinchRef.current.angle;
        setRotation(pinchRef.current.rotation + angleDelta * 180 / Math.PI);
    } else if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x, dy = e.clientY - dragStartRef.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUpOrLeave = () => {
    setEditMode('none');
    setIsDragging(false);
    setIsRotating(false);
  };
  
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => { 
    if(isLiveTracking || hideControls) return;
    if (e.touches.length === 1 && !isEditingGeofence) { 
        setIsDragging(true);
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) { 
        e.preventDefault();
        setIsDragging(false);
        const t1 = e.touches[0], t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const angle = Math.atan2(t1.clientY - t2.clientY, t1.clientX - t2.clientX);
        pinchRef.current = { dist, angle, rotation };
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => { 
    if(isLiveTracking || hideControls) return;
    if (e.touches.length === 1 && isDragging) { 
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0], t2 = e.touches[1];
        
        // Zooming
        const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const delta = (pinchRef.current.dist - newDist) * 1.5; // Sensitivity multiplier
        handleZoom(delta, (t1.clientX + t2.clientX) / 2, (t1.clientY + t2.clientY) / 2);
        
        // Rotating
        const newAngle = Math.atan2(t1.clientY - t2.clientY, t1.clientX - t2.clientX);
        const angleDelta = newAngle - pinchRef.current.angle;
        setRotation(pinchRef.current.rotation + angleDelta * 180 / Math.PI);

        // Update refs for next move event
        pinchRef.current.dist = newDist;
        pinchRef.current.angle = newAngle;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsRotating(false);
    // Reset rotation baseline after gesture ends
    pinchRef.current.rotation = rotation;
  };

  const getLayerConfigs = () => {
    switch(mapLayer) {
        case 'satellite': return { 
            bg: 'bg-slate-900', 
            pattern: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            patternSize: '40px 40px',
            safeZone: 'bg-white/10 border-white/40 border-4 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
        };
        case 'street': return { 
            bg: 'bg-slate-50', 
            pattern: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
            patternSize: '80px 80px',
            safeZone: 'bg-blue-500/10 border-blue-500/60 border-2'
        };
        default: return { 
            bg: 'bg-emerald-50', 
            pattern: 'radial-gradient(circle at 2px 2px, rgba(16,185,129,0.1) 1px, transparent 0)',
            patternSize: '30px 30px',
            safeZone: 'bg-green-600/10 border-green-600/60 border-2'
        };
    }
  };

  const layer = getLayerConfigs();
  const layerOptions = [
    { id: 'default', name: 'Meadow', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg> },
    { id: 'satellite', name: 'Satellite', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 3" /></svg> },
    { id: 'street', name: 'Urban', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  ];

  const selectedIcon = layerOptions.find(o => o.id === mapLayer)?.icon;

  return (
    <div 
        ref={mapRef} 
        className={`w-full h-full relative overflow-hidden select-none touch-none ${layer.bg}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
    >
      {/* Background Layer */}
      <div 
        className="absolute inset-[-500%] w-[1100%] h-[1100%]" 
        style={{ 
            backgroundImage: layer.pattern,
            backgroundSize: layer.patternSize,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging || isRotating || isLiveTracking ? 'none' : 'transform 0.15s ease-out'
        }}
      />

      {/* Dynamic Content Container */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging || isRotating || isLiveTracking ? 'none' : 'transform 0.15s ease-out'
        }}
      >
        {/* Safe Zone */}
        <div 
            className={`absolute rounded-full transition-all duration-300 ${isEditingGeofence ? 'border-blue-500 bg-blue-500/20 border-4 border-dashed animate-pulse' : layer.safeZone}`}
            style={{ 
                left: `${safeZoneCenter.x}%`, 
                top: `${safeZoneCenter.y}%`, 
                width: `${safeZoneRadius * 2}%`, 
                height: `${safeZoneRadius * 2}%`, 
                transform: 'translate(-50%, -50%)'
            }}
        >
          {isEditingGeofence && !hideControls && (
              <>
                <div className="absolute top-1/2 left-1/2 w-10 h-10 -m-5 bg-white rounded-full border-4 border-blue-600 shadow-2xl pointer-events-auto cursor-move" />
                <div className="absolute top-1/2 right-0 w-10 h-10 -my-5 -mr-5 bg-white rounded-full border-4 border-blue-600 shadow-2xl pointer-events-auto cursor-ew-resize" />
              </>
          )}
        </div>

        {/* Pet Marker */}
        <PetMarker 
            location={location} 
            status={status} 
            name={petName} 
            iconType={iconType} 
            isBeeping={isBeeping}
            isFlashing={isFlashing}
        />
      </div>

      {/* MAP CONTROLS - OVERLAY (Hidden when a modal is open) */}
      {!hideControls && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 md:right-6 flex flex-col items-end space-y-4 z-[100] pointer-events-none">
          
          {/* Layer Selection */}
          <div className="flex flex-col items-end space-y-2 pointer-events-auto" ref={layerSelectorRef}>
            {isLayerSelectorOpen && (
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white p-2 flex flex-col space-y-2 mb-2 animate-subtle-pop">
                    {layerOptions.map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => { setMapLayer(opt.id as any); setIsLayerSelectorOpen(false); }}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${mapLayer === opt.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {opt.icon}
                          <span className="text-xs font-black uppercase tracking-widest">{opt.name}</span>
                        </button>
                    ))}
                </div>
            )}
            <button 
              onClick={() => setIsLayerSelectorOpen(!isLayerSelectorOpen)}
              className={`w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-2 border-white transition-all ${isLayerSelectorOpen ? 'ring-4 ring-blue-500 scale-95' : 'hover:scale-105'}`}
            >
              <div className="text-blue-600 mb-0.5">{selectedIcon}</div>
              <span className="text-[9px] font-black uppercase text-gray-400">Layers</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white flex flex-col p-1.5 space-y-1.5 pointer-events-auto">
              <button 
                onClick={() => handleZoom(-300, 0, 0)}
                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
                disabled={isLiveTracking}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>
              <div className="h-px bg-gray-100 mx-3"></div>
              <button 
                onClick={() => handleZoom(300, 0, 0)}
                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
                disabled={isLiveTracking}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
              </button>
              <div className="h-px bg-gray-100 mx-3"></div>
              <button 
                onClick={handleRecenter}
                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
              </button>
          </div>

          {/* Compass */}
          {rotation % 360 !== 0 && (
              <button 
                onClick={() => setRotation(0)}
                className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-blue-600 border-2 border-white pointer-events-auto animate-subtle-pop"
              >
                <svg className="w-8 h-8 transition-transform" style={{ transform: `rotate(${-rotation}deg)`}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 2l7 19-7-4-7 4 7-19z" /></svg>
              </button>
          )}
        </div>
      )}

      {/* Editing Feedback */}
      {isEditingGeofence && !hideControls && (
          <div className="absolute bottom-4 left-4 right-4 text-center z-[110] md:hidden">
              <p className="bg-blue-600/90 text-white py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl backdrop-blur-md">
                  Pinch or drag to modify safe zone
              </p>
          </div>
      )}
    </div>
  );
};

export default Map;
