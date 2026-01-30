import React, { useEffect, useState, useRef } from 'react';
import { MapPin, AlertTriangle, Navigation } from 'lucide-react';

export default function DroneMap({ drones, selectedDrone }) {
  const mapRef = useRef(null);
  const [mapCenter] = useState({ lat: 28.7041, lng: 77.1025 });
  const [zoom, setZoom] = useState(13);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat, lng, mapBounds, containerSize) => {
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * containerSize.width;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * containerSize.height;
    return { x, y };
  };

  // Map bounds for Delhi NCR area
  const mapBounds = {
    north: 28.8041,
    south: 28.6041,
    east: 77.2025,
    west: 77.0025
  };

  const containerSize = { width: 800, height: 500 };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'maintenance': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="h-full w-full relative bg-slate-800 rounded-2xl overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Area Labels */}
        <div className="absolute top-8 left-8 text-slate-400 text-sm">
          <div className="font-semibold">Delhi NCR Sector</div>
          <div className="text-xs">28.70°N, 77.10°E</div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            className="bg-slate-900/80 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            +
          </button>
          <button 
            onClick={() => setZoom(Math.max(zoom - 1, 8))}
            className="bg-slate-900/80 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            -
          </button>
        </div>

        {/* Drones */}
        {Object.values(drones).map((drone) => {
          const position = latLngToPixel(drone.lat, drone.lon, mapBounds, containerSize);
          const isSelected = selectedDrone === drone.drone_id;
          
          return (
            <div key={drone.drone_id}>
              {/* Drone Marker */}
              <div
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isSelected ? 'scale-125 z-30' : 'z-20'
                }`}
                style={{
                  left: `${(position.x / containerSize.width) * 100}%`,
                  top: `${(position.y / containerSize.height) * 100}%`
                }}
              >
                {/* Coverage Circle */}
                <div 
                  className="absolute rounded-full border-2 border-dashed opacity-30"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderColor: getStatusColor(drone.status),
                    left: '-40px',
                    top: '-40px'
                  }}
                />

                {/* Detection Alert */}
                {drone.detection === 'Human' && (
                  <div className="absolute rounded-full bg-red-500/20 border-2 border-red-500 animate-pulse"
                       style={{ width: '60px', height: '60px', left: '-30px', top: '-30px' }}
                  />
                )}

                {/* Drone Icon */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    drone.detection === 'Human' ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'
                  } shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                >
                  <Navigation className="w-4 h-4 text-white" />
                </div>

                {/* Drone Info Popup */}
                {isSelected && (
                  <div className="absolute left-10 top-0 bg-slate-900/95 backdrop-blur-sm rounded-lg p-3 text-white text-xs min-w-48 border border-slate-700">
                    <div className="font-bold text-emerald-400 mb-1">{drone.drone_id}</div>
                    <div className="space-y-1">
                      <div>Status: <span className="font-semibold">{drone.status}</span></div>
                      <div>Battery: <span className="text-yellow-400">{drone.battery}%</span></div>
                      <div>Altitude: {drone.alt}m</div>
                      <div>Detection: 
                        <span className={drone.detection === 'Human' ? 'text-red-400 font-bold' : 'text-green-400'}>
                          {drone.detection}
                        </span>
                      </div>
                      {drone.confidence > 0 && (
                        <div>Confidence: {(drone.confidence * 100).toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Drone ID Label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 font-mono">
                  {drone.drone_id}
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
          <div className="font-semibold mb-2">Legend</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Threat</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
              <span>Inactive</span>
            </div>
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
          <div className="font-semibold mb-1">Live Stats</div>
          <div>Active Drones: {Object.values(drones).filter(d => d.status === 'active').length}</div>
          <div>Threats: {Object.values(drones).filter(d => d.detection === 'Human').length}</div>
          <div>Coverage: 2.5 km²</div>
        </div>
      </div>
    </div>
  );
}