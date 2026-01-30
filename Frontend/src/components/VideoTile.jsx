/**
 * Guard-X Video Tile Component
 * 
 * Displays individual camera feed with AI detection overlays.
 * 
 * Responsibilities:
 * - Render video frame from base64 JPEG
 * - Draw bounding boxes over detections
 * - Display camera ID and status
 * - Show detection count and labels
 * 
 * Props:
 * - detection: {camera_id, camera_sid, frame, detections, timestamp}
 */

import { useEffect, useRef } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';

export default function VideoTile({ detection, minimal = false }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Render frame on canvas
  useEffect(() => {
    if (!detection || !detection.frame || !canvasRef.current) {
      console.log('⚠️ VideoTile: Missing frame or canvas ref');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();

    img.onload = () => {
      // Only resize if dimensions changed
      if (canvas.width !== img.width || canvas.height !== img.height) {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Draw image (contains boxes drawn by backend)
      ctx.drawImage(img, 0, 0);
      
      // REMOVED frontend drawBoundingBoxes to prevent UI freeze at high FPS
    };

    img.onerror = () => {
      console.error('❌ VideoTile: Failed to load image frame');
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, canvas.width || 300, canvas.height || 200);
      ctx.fillStyle = '#fff';
      ctx.fillText('Frame Load Error', 10, 20);
    };

    // Ensure we handle the base64 prefix correctly
    if (detection.frame.startsWith('data:image')) {
      img.src = detection.frame;
    } else {
      img.src = `data:image/jpeg;base64,${detection.frame}`;
    }
    
    imageRef.current = img;
  }, [detection]);

  // Draw bounding boxes and labels
  const drawBoundingBoxes = (ctx, detections) => {
    const { boxes, labels, confidences } = detections;

    if (!boxes || boxes.length === 0) return;

    // Color mapping for different threat types
    const colorMap = {
      'Human': '#FFFF00',    // Yellow
      'Weapon': '#FF0000',   // Red
      'Vehicle': '#0000FF',  // Blue
    };

    boxes.forEach((box, i) => {
      const [x1, y1, x2, y2] = box;
      const label = labels[i] || 'Unknown';
      const conf = confidences[i] || 0;

      // Get color for this label
      const color = colorMap[label] || '#00FF00';

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Draw label background
      const labelText = `${label} ${(conf * 100).toFixed(0)}%`;
      ctx.font = '14px Arial';
      const textMetrics = ctx.measureText(labelText);
      const textHeight = 20;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textHeight, textMetrics.width + 10, textHeight);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(labelText, x1 + 5, y1 - 5);
    });
  };

  if (!detection) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
          <Camera className="w-12 h-12 text-slate-600" />
        </div>
      </div>
    );
  }

  const detectionCount = detection.detections?.count || 0;
  const hasThreats = detectionCount > 0;

  return (
    <div className={`${minimal ? 'bg-transparent p-0 border-0' : 'bg-slate-800 p-4 border'} rounded-lg ${
      hasThreats && !minimal ? 'border-red-500' : 'border-slate-700'
    }`}>
      {/* Camera Header */}
      {!minimal && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className={`w-5 h-5 ${hasThreats ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="font-medium text-white">{detection.camera_id}</span>
          </div>
          
          {hasThreats && (
            <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">{detectionCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Video Frame */}
      <div className={`relative bg-black rounded-lg overflow-hidden ${minimal ? '' : 'mb-3'}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ maxHeight: minimal ? '100%' : '300px', objectFit: 'contain' }}
        />
      </div>

      {/* Detection Info */}
      {!minimal && detection.detections && detection.detections.labels && detection.detections.labels.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Detections:</div>
          <div className="flex flex-wrap gap-1">
            {detection.detections.labels.map((label, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded ${
                  label === 'Weapon' ? 'bg-red-500/20 text-red-400' :
                  label === 'Human' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}
              >
                {label} {(detection.detections.confidences[i] * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {!minimal && (
        <div className="mt-2 text-xs text-slate-500">
          Last update: {new Date(detection.timestamp * 1000).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

