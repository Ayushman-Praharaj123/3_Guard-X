/**
 * Guard-X Admin Dashboard
 * 
 * This is the command and control interface for the Admin Node.
 * 
 * Responsibilities:
 * - Display all connected cameras
 * - Deploy/stop cameras with authorization
 * - Show live video feeds in grid layout
 * - Overlay AI detections on video
 * - Display system status and statistics
 * 
 * Data flow:
 * Admin → Deploy Command → Camera Starts Streaming → AI Detection → Display Results
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { connectSocket, disconnectSocket, emitEvent, onEvent, offEvent } from '../utils/socket';
import { Camera, Play, Square, Users, Activity, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import VideoTile from '../components/VideoTile';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [detections, setDetections] = useState({});
  const [fullscreenFeed, setFullscreenFeed] = useState(null);
  const [stats, setStats] = useState({
    totalCameras: 0,
    deployedCameras: 0,
    totalDetections: 0,
    activeThreats: 0
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token) return;

    console.log('🔐 Initializing admin socket connection...');
    const socketInstance = connectSocket(token);
    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      console.log(`✅ Admin connected to Socket.IO. SID: ${socketInstance.id}, Role: ${user?.role}`);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Admin disconnected from Socket.IO');
      setConnected(false);
    });

    // Camera events
    socketInstance.on('camera:list', (data) => {
      console.log('📹 Camera list received:', data);
      setCameras(data.cameras || []);
      updateStats(data.cameras || []);
    });

    socketInstance.on('camera:connected', (data) => {
      console.log('📹 New camera connected:', data);
      setCameras(prev => {
        const newCameras = [...prev, {
          sid: data.sid,
          username: data.username,
          camera_id: data.camera_id,
          deployed: false
        }];
        updateStats(newCameras);
        return newCameras;
      });
    });

    socketInstance.on('camera:disconnect', (data) => {
      console.log('📹 Camera disconnected:', data);
      setCameras(prev => {
        const newCameras = prev.filter(cam => cam.sid !== data.sid);
        updateStats(newCameras);
        return newCameras;
      });
      setDetections(prev => {
        const updated = { ...prev };
        delete updated[data.sid];
        return updated;
      });
    });

    // Deploy events
    socketInstance.on('deploy:success', (data) => {
      console.log('🚀 Camera deployed:', data);
      setCameras(prev => {
        const newCameras = prev.map(cam =>
          cam.sid === data.camera_sid ? { ...cam, deployed: true } : cam
        );
        updateStats(newCameras);
        return newCameras;
      });
    });

    // Detection events
    socketInstance.on('detection:result', (data) => {
      console.log(' Detection result received:', {
        camera_sid: data.camera_sid,
        camera_id: data.camera_id,
        hasFrame: !!data.frame,
        frameSize: data.frame ? data.frame.length : 0,
        detectionCount: data.detections?.count || 0,
        timestamp: data.timestamp
      });

      // Batch state updates to prevent nested re-renders
      setDetections(prevDetections => {
        const updatedDetections = {
          ...prevDetections,
          [data.camera_sid]: data
        };
        return updatedDetections;
      });

      // Update stats separately to avoid nested state updates
      setStats(prevStats => {
        // Calculate active threats from current detections + new data
        const currentActiveThreats = Object.values({
          ...detections,
          [data.camera_sid]: data
        }).reduce((sum, det) => sum + (det.detections?.count || 0), 0);

        return {
          ...prevStats,
          totalDetections: prevStats.totalDetections + (data.detections?.count || 0),
          activeThreats: currentActiveThreats
        };
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [token]);

  // Update statistics
  const updateStats = (cameraList) => {
    const deployed = cameraList.filter(cam => cam.deployed).length;
    setStats(prev => ({
      ...prev,
      totalCameras: cameraList.length,
      deployedCameras: deployed
    }));
  };

  // Deploy camera
  const handleDeploy = (cameraSid) => {
    if (!socket || !connected) {
      alert('Not connected to server');
      return;
    }

    console.log('🚀 Deploying camera:', cameraSid);
    emitEvent('deploy_start', { camera_sid: cameraSid });
  };

  // Stop camera
  const handleStop = (cameraSid) => {
    if (!socket || !connected) {
      alert('Not connected to server');
      return;
    }

    console.log('🛑 Stopping camera:', cameraSid);
    emitEvent('deploy_stop', { camera_sid: cameraSid });
    
    // Update local state
    setCameras(prev => prev.map(cam =>
      cam.sid === cameraSid ? { ...cam, deployed: false } : cam
    ));
    
    // Remove detection data
    setDetections(prev => {
      const updated = { ...prev };
      delete updated[cameraSid];
      return updated;
    });
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">Admin clearance required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-700 rounded-lg flex items-center justify-center">
              
            </div>
            <div>
              <h1 className="text-xl font-bold">Guard-X Command Center</h1>
              <p className="text-sm text-slate-400">Admin: {user.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {connected ? (
                <>
                  <Wifi className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">Total Cameras</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.totalCameras}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Deployed</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{stats.deployedCameras}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400">FPS</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{stats.totalDetections}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-slate-400">Active Threats</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{stats.activeThreats}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* 6 Operator Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => {
            // Find if there's a camera connected for this slot
            const camera = cameras[index];
            const detection = camera ? detections[camera.sid] : null;
            const operatorNum = index + 1;

            return (
              <div
                key={index}
                className={`bg-slate-800/80 rounded-xl border ${
                  camera?.deployed ? 'border-emerald-500' : 'border-slate-700/50'
                } overflow-hidden transition-all duration-300 ${
                  detection ? 'cursor-pointer hover:border-emerald-400 hover:scale-[1.02]' : ''
                }`}
                onClick={detection ? () => setFullscreenFeed(detection) : undefined}
              >
                {/* Header */}
                <div className="bg-slate-900/50 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {camera ? camera.camera_id : `Operator ${operatorNum}`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {camera ? `User: ${camera.username}` : 'Model: best.pt'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    camera?.deployed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {camera?.deployed ? 'DEPLOYED' : 'WAITING'}
                  </span>
                </div>

                {/* Video Feed or Placeholder */}
                <div className="relative bg-slate-900/30 aspect-video flex items-center justify-center">
                  {detection ? (
                    <VideoTile detection={detection} minimal={true} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Camera className="w-20 h-20 text-slate-700 mb-3" />
                      <p className="text-slate-500 text-sm">
                        {camera ? 'Camera ready' : 'No operator connected'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer - Deploy/Stop Button */}
                <div className="px-4 py-3 bg-slate-900/30">
                  {camera ? (
                    camera.deployed ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStop(camera.sid);
                        }}
                        className="w-full bg-red-600/80 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium"
                      >
                        <Square className="w-4 h-4" />
                        Stop Streaming
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeploy(camera.sid);
                        }}
                        className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium"
                      >
                        <Play className="w-4 h-4" />
                        Deploy Camera
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full bg-slate-700/30 text-slate-500 py-2.5 px-4 rounded-lg font-medium cursor-not-allowed"
                    >
                      Waiting for Connection
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Feed Modal */}
      {fullscreenFeed && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreenFeed(null)}
        >
          <div className="relative w-full h-full max-w-7xl max-h-screen flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setFullscreenFeed(null)}
              className="absolute -top-2 right-0 text-white hover:text-red-400 transition-colors text-4xl font-bold z-10 bg-slate-800/80 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Fullscreen Video */}
            <div className="flex-1 flex items-center justify-center">
              <VideoTile
                detection={fullscreenFeed}
                minimal={false}
                fullscreen={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

