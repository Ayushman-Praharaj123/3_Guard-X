/**
 * Guard-X Camera Client Page
 * 
 * This page runs on remote laptops (team member devices).
 * 
 * Workflow:
 * 1. User logs in with credentials
 * 2. Socket.IO connects with JWT token
 * 3. Camera remains IDLE until admin deploys
 * 4. On deploy command, start webcam capture
 * 5. Encode frames to JPEG and stream via Socket.IO
 * 6. Stop streaming on admin stop command
 * 
 * Frame Processing:
 * - Capture from webcam at 8-10 FPS
 * - Resize to 640x480 for performance
 * - Encode to JPEG with quality 60
 * - Convert to base64 and emit via Socket.IO
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { connectSocket, disconnectSocket, emitEvent, onEvent, offEvent, isConnected } from '../utils/socket';
import { Camera, Video, VideoOff, Wifi, WifiOff, Clock, Activity } from 'lucide-react';
import VideoTile from '../components/VideoTile';

export default function CameraClient() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [currentDetection, setCurrentDetection] = useState(null);
  const [stats, setStats] = useState({
    framesSent: 0,
    fps: 0,
    status: 'IDLE'
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const totalFramesSentRef = useRef(0);
  const lastFpsUpdate = useRef(Date.now());
  const socketRef = useRef(null);
  const captureAndSendFrameRef = useRef(null);

  // Use a ref to store connection status to avoid stale closure in setInterval
  const isConnectedRef = useRef(false);

  // Capture frame and send to server
  const captureAndSendFrame = () => {
    // Use refs instead of state to avoid stale closures
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const socket = socketRef.current;
    const connected = isConnectedRef.current;

    if (!video || !canvas || !socket || !connected) {
      return;
    }

    // Ensure video is actually playing and has dimensions
    if (video.paused || video.ended || video.videoWidth === 0) {
      return;
    }

    try {
      // Set canvas size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to JPEG base64 (Ultra-low quality 0.3 for 50-60 FPS throughput)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.3);
      const base64data = dataUrl.split(',')[1];

      // Emit frame to server
      socket.emit('camera_frame', {
        frame: base64data
      });
      
      // Update stats
      frameCountRef.current++;
      
      // Update stats state less frequently to avoid over-rendering
      const now = Date.now();
      if (now - lastFpsUpdate.current >= 1000) {
        const fps = frameCountRef.current;
        totalFramesSentRef.current += fps;
        
        setStats(prev => ({ 
          ...prev, 
          fps,
          framesSent: totalFramesSentRef.current,
          status: 'STREAMING'
        }));
        
        console.log(`📊 Streaming: ${fps} FPS, Total: ${totalFramesSentRef.current}`);
        frameCountRef.current = 0;
        lastFpsUpdate.current = now;
      }
    } catch (err) {
      console.error('❌ Error in captureAndSendFrame:', err);
    }
  };

  // Keep the ref updated with the latest version of the function
  useEffect(() => {
    captureAndSendFrameRef.current = captureAndSendFrame;
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!token) return;

    console.log('🔐 Initializing camera client socket connection...');
    const socketInstance = connectSocket(token);
    setSocket(socketInstance);
    socketRef.current = socketInstance;

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Camera client connected to Socket.IO. SID:', socketInstance.id);
      setConnected(true);
      isConnectedRef.current = true;
      setStats(prev => ({ ...prev, status: 'CONNECTED' }));
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Camera client disconnected:', reason);
      setConnected(false);
      isConnectedRef.current = false;
      setDeployed(false);
      setStats(prev => ({ ...prev, status: 'DISCONNECTED' }));
      stopStreaming();
    });

    // Deploy events
    socketInstance.on('deploy:assigned', (data) => {
      console.log('🚀 Deploy command received:', data);
      setDeployed(true);
      setStats(prev => ({ ...prev, status: 'DEPLOYED' }));
      startStreaming();
    });

    socketInstance.on('deploy:stop', (data) => {
      console.log('🛑 Stop command received:', data);
      setDeployed(false);
      setStats(prev => ({ ...prev, status: 'STOPPED' }));
      stopStreaming();
    });

    socketInstance.on('detection:result', (data) => {
      // console.log('🤖 Detection result received');
      setCurrentDetection(data);
    });

    return () => {
      console.log('🧹 Cleaning up camera client...');
      stopStreaming();
      disconnectSocket();
    };
  }, [token]);

  // Start webcam streaming
  const startStreaming = async () => {
    try {
      console.log('📹 Starting webcam...');

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 20, max: 30 }
        },
        audio: false
      });

      console.log('✅ Webcam stream obtained');
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready to play
        videoRef.current.onloadedmetadata = async () => {
          try {
            console.log('📹 Video metadata loaded, starting playback...');
            await videoRef.current.play();
            console.log('▶️ Video element playing');
            setStreaming(true);
            setStats(prev => ({ ...prev, status: 'STREAMING' }));
          } catch (playError) {
            console.error('❌ Video play error:', playError);
          }
        };
      }

      // Start frame capture loop (50 FPS - 20ms interval for extreme smoothness)
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (captureAndSendFrameRef.current) {
          captureAndSendFrameRef.current();
        }
      }, 20);
      
      console.log('✅ Frame capture interval set');
    } catch (error) {
      console.error('❌ Failed to start webcam:', error);
      alert(`Failed to access webcam: ${error.message}. Please grant camera permissions.`);
      setStats(prev => ({ ...prev, status: 'ERROR' }));
    }
  };

  // Stop webcam streaming
  const stopStreaming = () => {
    console.log('🛑 Stopping webcam...');

    // Stop interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStreaming(false);
    setCurrentDetection(null);
    setStats(prev => ({ ...prev, status: deployed ? 'DEPLOYED' : 'IDLE' }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Please Login</h1>
          <p className="text-slate-400">Camera client requires authentication</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              📹
            </div>
            <div>
              <h1 className="text-xl font-bold">Guard-X Camera Client</h1>
              <p className="text-sm text-slate-400">Operator: {user.full_name}</p>
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

      {/* Status Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">Status</span>
            </div>
            <div className={`text-lg font-bold ${
              stats.status === 'STREAMING' ? 'text-emerald-400' :
              stats.status === 'DEPLOYED' ? 'text-yellow-400' :
              stats.status === 'CONNECTED' ? 'text-blue-400' :
              'text-slate-400'
            }`}>
              {stats.status}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Video className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Frames Sent</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">{stats.framesSent}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400">FPS</span>
            </div>
            <div className="text-lg font-bold text-yellow-400">{stats.fps}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400">Camera ID</span>
            </div>
            <div className="text-lg font-bold text-purple-400">{user.username}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Status Message */}
          <div className={`rounded-lg p-6 mb-6 border ${
            deployed ? 'bg-emerald-500/10 border-emerald-500' :
            connected ? 'bg-blue-500/10 border-blue-500' :
            'bg-slate-800 border-slate-700'
          }`}>
            <div className="flex items-center gap-4">
              {deployed ? (
                <>
                  <Video className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400">Camera Deployed</h2>
                    <p className="text-slate-300">Streaming video to command center...</p>
                  </div>
                </>
              ) : connected ? (
                <>
                  <Camera className="w-8 h-8 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-blue-400">Ready for Deployment</h2>
                    <p className="text-slate-300">Waiting for admin authorization...</p>
                  </div>
                </>
              ) : (
                <>
                  <VideoOff className="w-8 h-8 text-slate-400" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-400">Disconnected</h2>
                    <p className="text-slate-300">Connecting to server...</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Camera Preview</h3>

            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              {streaming && currentDetection ? (
                <div className="w-full h-full">
                  <VideoTile detection={currentDetection} minimal={true} />
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-contain ${streaming ? 'block' : 'hidden'}`}
                  />
                  
                  {!streaming && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Camera inactive</p>
                        <p className="text-slate-500 text-sm">
                          {deployed ? 'Starting camera...' : 'Waiting for deployment'}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Instructions</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>• Ensure your webcam is connected and permissions are granted</p>
              <p>• Camera will remain idle until admin issues deploy command</p>
              <p>• Video frames are streamed at 8-10 FPS for optimal performance</p>
              <p>• All processing happens on the admin node, not your device</p>
              <p>• You can close this page to disconnect the camera</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

