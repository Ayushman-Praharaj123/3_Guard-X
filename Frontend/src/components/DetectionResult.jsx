import { useState, useRef, useEffect } from "react";
import { AlertTriangle, CheckCircle, Loader, Users, Clock, Cpu } from "lucide-react";

export default function DetectionResult({ result, image, loading }) {
  const imageRef = useRef(null);
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });

  // Handle image load to get display dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      setDisplayDimensions({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight
      });
    }
  };

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setDisplayDimensions({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">AI Model Processing</h3>
          <p className="text-slate-400">Neural network analyzing image...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <div className="text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Upload an image to start threat detection</p>
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="bg-red-900/20 rounded-xl p-8 border border-red-500/50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Detection Failed</h3>
          <p className="text-red-300">{result.error}</p>
        </div>
      </div>
    );
  }

  const threatCount = result.boxes?.length || 0;
  const isThreatDetected = threatCount > 0;

  return (
    <div className="space-y-6">
      {/* Detection Status */}
      <div className={`rounded-xl p-6 border ${
        isThreatDetected 
          ? 'bg-red-900/20 border-red-500/50' 
          : 'bg-emerald-900/20 border-emerald-500/50'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          {isThreatDetected ? (
            <AlertTriangle className="w-8 h-8 text-red-400" />
          ) : (
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          )}
          <div>
            <h3 className={`text-xl font-semibold ${
              isThreatDetected ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {isThreatDetected ? 'THREATS DETECTED' : 'AREA SECURE'}
            </h3>
            <p className="text-slate-400">
              {isThreatDetected 
                ? `${threatCount} human target${threatCount > 1 ? 's' : ''} identified`
                : 'No human activity detected in surveillance zone'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Image with Bounding Boxes - FIXED */}
      {image && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            AI Analysis Result
          </h4>
          <div className="relative inline-block w-full">
            <img 
              ref={imageRef}
              src={image} 
              alt="Detection scan" 
              className="max-w-full h-auto rounded-lg border-2 border-slate-600" 
              onLoad={handleImageLoad}
            />
            {/* Quick CSS Fix - Use percentage positioning */}
            {result.boxes?.map((box, i) => {
              const originalWidth = result.imageSize?.width || 1;
              const originalHeight = result.imageSize?.height || 1;
              
              // Convert to percentages
              const leftPercent = (box[0] / originalWidth) * 100;
              const topPercent = (box[1] / originalHeight) * 100;
              const widthPercent = ((box[2] - box[0]) / originalWidth) * 100;
              const heightPercent = ((box[3] - box[1]) / originalHeight) * 100;
              
              return (
                <div
                  key={i}
                  className="absolute border-2 border-red-500 bg-red-500/20 animate-pulse"
                  style={{
                    left: `${Math.max(0, Math.min(95, leftPercent))}%`,
                    top: `${Math.max(0, Math.min(95, topPercent))}%`,
                    width: `${Math.max(2, Math.min(50, widthPercent))}%`,
                    height: `${Math.max(2, Math.min(50, heightPercent))}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                    TARGET {i + 1}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Detection Stats */}
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <div className="text-xs text-slate-400 space-y-1">
              <div>Model: YOLO/CNN Neural Network</div>
              <div>Confidence Threshold: 50%</div>
              <div>Targets Detected: {threatCount}</div>
              {result.imageSize && (
                <div>
                  Original: {result.imageSize.width}x{result.imageSize.height} | 
                  Display: {Math.round(displayDimensions.width)}x{Math.round(displayDimensions.height)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
