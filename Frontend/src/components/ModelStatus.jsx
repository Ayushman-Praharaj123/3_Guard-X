import { useState, useEffect } from "react";
import { Cpu, Wifi, AlertCircle, CheckCircle } from "lucide-react";
import { checkModelHealth } from "../apis/detectionApi";

export default function ModelStatus() {
  const [status, setStatus] = useState({ status: 'checking' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkModelHealth();
        setStatus(health);
      } catch (err) {
        setStatus({ status: 'offline', error: err.message });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg border backdrop-blur-sm ${
        status.status === 'operational' 
          ? 'bg-emerald-900/80 border-emerald-500/50' 
          : 'bg-red-900/80 border-red-500/50'
      }`}>
        <div className="flex items-center gap-2 text-sm">
          {status.status === 'operational' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span className={status.status === 'operational' ? 'text-emerald-400' : 'text-red-400'}>
            AI Model: {status.status === 'operational' ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}