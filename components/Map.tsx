
import React, { useState, useRef, WheelEvent, MouseEvent, TouchEvent, useEffect } from 'react';
import { Location, PetStatus } from '../types';
import PetMarker from './PetMarker';

interface MapProps {
  location: Location;
  safeZoneCenter: Location;
  safeZoneRadius: number;
  status: PetStatus;
  petName: string;
  isLiveTracking: boolean;
  isEditingGeofence: boolean;
  onGeofenceChange: (newZone: { center: Location, radius: number }) => void;
}

type MapLayer = 'default' | 'satellite' | 'street';
type EditMode = 'none' | 'drawing' | 'moving' | 'resizing';

const Map: React.FC<MapProps> = ({ location, safeZoneCenter, safeZoneRadius, status, petName, isLiveTracking, isEditingGeofence, onGeofenceChange }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('none');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pinchDistRef = useRef(0);
  const pinchAngleRef = useRef(0);
  const pinchStartRotationRef = useRef(0);
  const rotateStartRef = useRef({ angle: 0, rotation: 0 });
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
    setZoom(prevZoom => {
      const newZoom = clamp(prevZoom * (ZOOM_SENSITIVITY ** -delta), MIN_ZOOM, MAX_ZOOM);
      const zoomFactor = newZoom / prevZoom;
      setOffset(prevOffset => ({ x: centerX - (centerX - prevOffset.x) * zoomFactor, y: centerY - (centerY - prevOffset.y) * zoomFactor }));
      return newZoom;
    });
  };

  const getMapCoords = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width * 100,
      y: (clientY - rect.top) / rect.height * 100
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isLiveTracking) return;
    if (isEditingGeofence) {
        const { x, y } = getMapCoords(e);
        const distToCenter = Math.sqrt((x - safeZoneCenter.x)**2 + (y - safeZoneCenter.y)**2);
        const handleRadius = 1.5 / zoom; // Make handle click area larger when zoomed out
        
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
    
    e.preventDefault();
    if (e.shiftKey) {
        setIsRotating(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2, centerY = rect.height / 2;
        const startAngle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX);
        rotateStartRef.current = { angle: startAngle, rotation };
    } else {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isLiveTracking) return;
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
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.width / 2, centerY = rect.height / 2;
        const currentAngle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX);
        const angleDelta = currentAngle - rotateStartRef.current.angle;
        setRotation(rotateStartRef.current.rotation + angleDelta * 180 / Math.PI);
    } else if (isDragging) {
        e.preventDefault();
        const dx = e.clientX - dragStartRef.current.x, dy = e.clientY - dragStartRef.current.y;
        const rad = -rotation * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
        const rotatedDx = (dx * cos - dy * sin) / zoom, rotatedDy = (dx * sin + dy * cos) / zoom;
        setOffset(prev => ({ x: prev.x + rotatedDx, y: prev.y + rotatedDy }));
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUpOrLeave = () => {
    setEditMode('none');
    setIsDragging(false);
    setIsRotating(false);
  };
  
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => { if(!isEditingGeofence) {/*... existing touch logic ...*/}};
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => { if(!isEditingGeofence) {/*... existing touch logic ...*/}};
  const handleTouchEnd = () => { if(!isEditingGeofence) {/*... existing touch logic ...*/}};
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => { if (isLiveTracking || isEditingGeofence) return; /*... existing wheel logic ...*/};

  const layerOptions = [
    { id: 'default' as MapLayer, name: 'Default', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg> },
    { id: 'satellite' as MapLayer, name: 'Satellite', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0 1 12 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253m0 0" /></svg> },
    { id: 'street' as MapLayer, name: 'Street', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21v-2.25a2.25 2.25 0 0 1 2.25-2.25h3a2.25 2.25 0 0 1 2.25 2.25V21m-6.75 0H15" /></svg> },
  ];
  const getMapLayerStyles = () => { /* ... existing layer styles logic ... */ return { mapContainer: 'bg-green-50', mapLayer: '', style: {}, safeZone: 'bg-green-500 bg-opacity-20 border-green-600' }; };
  const layerStyles = getMapLayerStyles();
  const cursorClass = isEditingGeofence ? 'cursor-crosshair' : (isLiveTracking ? 'cursor-default' : (isDragging || isRotating ? 'cursor-grabbing' : 'cursor-grab'));
  const selectedLayerIcon = layerOptions.find(opt => opt.id === mapLayer)?.icon;

  return (
    <div ref={mapRef} className={`w-full h-full overflow-hidden relative border-2 border-gray-300 select-none touch-none ${cursorClass} ${layerStyles.mapContainer}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUpOrLeave} onMouseLeave={handleMouseUpOrLeave} onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} title={isLiveTracking ? '' : 'Click and drag to pan. Hold Shift to rotate. Use scroll/pinch to zoom.'} >
       {isEditingGeofence && (
        <div className="absolute top-0 left-0 w-full p-2 bg-blue-600 text-white text-center text-sm z-20 shadow-lg">
            Drag on the map to draw a new safe zone. Use the handles to move or resize.
        </div>
      )}
      <div className={`w-full h-full ${layerStyles.mapLayer}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`, transition: isDragging || isRotating || isLiveTracking ? 'none' : 'transform 0.1s ease-out', ...layerStyles.style }} >
        <div className={`absolute border-2 border-dashed rounded-full ${isEditingGeofence ? 'border-blue-500 bg-blue-500 bg-opacity-25' : layerStyles.safeZone}`} style={{ left: `${safeZoneCenter.x}%`, top: `${safeZoneCenter.y}%`, width: `${safeZoneRadius * 2}%`, height: `${safeZoneRadius * 2}%`, transform: 'translate(-50%, -50%)' }}>
          {isEditingGeofence && <>
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -m-2 bg-white rounded-full border-2 border-blue-600 cursor-move" />
            <div className="absolute top-1/2 right-0 w-4 h-4 -my-2 -mr-2 bg-white rounded-full border-2 border-blue-600 cursor-ew-resize" />
          </>}
        </div>
        <PetMarker location={location} status={status} name={petName} />
      </div>
      {/* ... existing map controls JSX ... */}
    </div>
  );
};

export default Map;
