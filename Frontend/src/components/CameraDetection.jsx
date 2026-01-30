import { useState, useEffect, useRef } from 'react';
import { Camera, Square, Play, Pause, AlertTriangle, Users, Wifi, WifiOff, MapPin, Navigation, Crosshair } from 'lucide-react';
import VideoTile from './VideoTile';

export default function CameraDetection() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [detectionData, setDetectionData] = useState(null);
  const [frameData, setFrameData] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [stats, setStats] = useState({
    totalDetections: 0,
    currentThreats: 0,
    fps: 0,
    lastUpdate: null,
    sessionStartTime: null,
    totalFrames: 0
  });

  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdate = useRef(Date.now());
  const mapRef = useRef(null);

  // Get GPS location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setGpsLocation(location);
          setLocationError(null);
          console.log('📍 GPS Location:', location);
        },
        (error) => {
          setLocationError(error.message);
          console.error('❌ GPS Error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  };

  // Watch GPS location
  useEffect(() => {
    getLocation();
    
    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        setGpsLocation(location);
      },
      (error) => setLocationError(error.message),
      { enableHighAccuracy: true, maximumAge: 30000 }
    );

    return () => {
      if (watchId) navigator.geolocation?.clearWatch(watchId);
    };
  }, []);

  // Update statistics with live camera data
  const updateStats = (detections) => {
    setStats(prev => ({
      ...prev,
      currentThreats: detections.count,
      totalDetections: prev.totalDetections + detections.count,
      totalFrames: prev.totalFrames + 1,
      lastUpdate: new Date().toLocaleTimeString(),
      sessionStartTime: prev.sessionStartTime || new Date().toISOString()
    }));

    // Save to localStorage for analytics
    const liveDetection = {
      type: 'live_camera',
      timestamp: new Date().toISOString(),
      location: gpsLocation,
      detections: detections,
      sessionId: `live_${Date.now()}`
    };
    
    const existingData = JSON.parse(localStorage.getItem('liveDetectionHistory') || '[]');
    existingData.push(liveDetection);
    
    // Keep only last 1000 entries
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    localStorage.setItem('liveDetectionHistory', JSON.stringify(existingData));
  };

  // Calculate FPS
  const updateFPS = () => {
    frameCountRef.current++;
    const now = Date.now();
    
    if (now - lastFpsUpdate.current >= 1000) {
      const fps = frameCountRef.current;
      setStats(prev => ({ ...prev, fps }));
      frameCountRef.current = 0;
      lastFpsUpdate.current = now;
    }
  };

  // Start camera
  const startCamera = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_camera',
        camera_id: 0,
        gps_location: gpsLocation
      }));
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_camera'
      }));
    }
  };

  // Connect WebSocket
  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8000/camera/ws/camera`;
    console.log('🔌 Connecting to:', wsUrl);
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connected');
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('📨 Received:', message);
      
      switch (message.type) {
        case 'camera_started':
          console.log('📹 Camera started');
          setIsStreaming(true);
          setStats(prev => ({ ...prev, sessionStartTime: new Date().toISOString() }));
          break;
          
        case 'camera_stopped':
          console.log('🛑 Camera stopped');
          setIsStreaming(false);
          setFrameData(null);
          break;
          
        case 'detection_frame':
          setFrameData(message.frame);
          setDetectionData(message.detections);
          updateStats(message.detections);
          updateFPS();
          break;
          
        case 'camera_error':
          console.error('❌ Camera error:', message.message);
          setConnectionStatus('error');
          break;
      }
    };

    wsRef.current.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setConnectionStatus('disconnected');
      setIsStreaming(false);
      
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          console.log('🔄 Attempting to reconnect...');
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  // Connect on component mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Render frame on canvas
  useEffect(() => {
    if (frameData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      
      img.src = `data:image/jpeg;base64,${frameData}`;
    }
  }, [frameData]);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getConnectionIcon = () => {
    return connectionStatus === 'connected' ? Wifi : WifiOff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-emerald-500/20 rounded-full border border-emerald-400/30">
            <Camera className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Real-time Surveillance</h1>
        <p className="text-slate-400">Live camera feed with AI threat detection & GPS tracking</p>
      </div>

      {/* GPS & Controls */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* GPS Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              <span className={`font-medium ${getConnectionStatusColor()}`}>
                {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* GPS Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              {gpsLocation ? (
                <span className="text-blue-400 text-sm font-mono">
                  {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                </span>
              ) : (
                <span className="text-slate-400 text-sm">
                  {locationError || 'Getting GPS...'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={getLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Update GPS
            </button>
            
            {!isStreaming ? (
              <button
                onClick={startCamera}
                disabled={connectionStatus !== 'connected'}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-bold text-lg">{stats.currentThreats}</div>
            <div className="text-slate-400 text-sm">Current Threats</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{stats.totalDetections}</div>
            <div className="text-slate-400 text-sm">Total Detected</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-yellow-400 font-bold text-lg">{stats.fps}</div>
            <div className="text-slate-400 text-sm">FPS</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-purple-400 font-bold text-lg">{stats.totalFrames}</div>
            <div className="text-slate-400 text-sm">Frames</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-orange-400 font-bold text-xs">{stats.lastUpdate || '--:--:--'}</div>
            <div className="text-slate-400 text-sm">Last Update</div>
          </div>
        </div>
      </div>

      {/* Video Feed & Map */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            Live Camera Feed
          </h3>
          
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
            {frameData ? (
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[500px] object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {isStreaming ? (
                    <>
                      <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-400">Initializing camera feed...</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Camera feed inactive</p>
                      <p className="text-slate-500 text-sm">Click "Start Camera" to begin surveillance</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Map */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Live Location
          </h3>
          
          {gpsLocation ? (
            <div className="space-y-4">
              {/* Simple Map Placeholder */}
              <div className="bg-slate-700 rounded-lg p-4 h-64 flex items-center justify-center">
                <div className="text-center">
                  <Crosshair className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Live Position</p>
                  <p className="text-blue-400 text-sm font-mono">
                    {gpsLocation.latitude.toFixed(6)}
                  </p>
                  <p className="text-blue-400 text-sm font-mono">
                    {gpsLocation.longitude.toFixed(6)}
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Accuracy: ±{Math.round(gpsLocation.accuracy)}m
                  </p>
                </div>
              </div>
              
              {/* Location Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Latitude:</span>
                  <span className="text-white font-mono">{gpsLocation.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Longitude:</span>
                  <span className="text-white font-mono">{gpsLocation.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accuracy:</span>
                  <span className="text-white">±{Math.round(gpsLocation.accuracy)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Updated:</span>
                  <span className="text-white">{new Date(gpsLocation.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Getting GPS location...</p>
                {locationError && (
                  <p className="text-red-400 text-sm mt-2">{locationError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detection Info */}
      {detectionData && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Live Detection Analysis
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Targets:</span>
              <span className="text-white ml-2 font-medium">{detectionData.count}</span>
            </div>
            <div>
              <span className="text-slate-400">Avg Confidence:</span>
              <span className="text-white ml-2 font-medium">
                {detectionData.confidences?.length > 0 
                  ? `${(detectionData.confidences.reduce((a, b) => a + b, 0) / detectionData.confidences.length * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </span>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>
              <span className={`ml-2 font-medium ${detectionData.count > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {detectionData.count > 0 ? 'ALERT' : 'SECURE'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Location:</span>
              <span className="text-blue-400 ml-2 font-medium">
                {gpsLocation ? 'GPS Active' : 'No GPS'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Instructions</h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p>• Ensure your camera and GPS permissions are granted</p>
          <p>• Red bounding boxes indicate detected human targets</p>
          <p>• GPS location is tracked and saved with each detection</p>
          <p>• Real-time statistics are updated continuously during streaming</p>
          <p>• All live detection data is saved for analytics review</p>
        </div>
      </div>
    </div>
  );
}


