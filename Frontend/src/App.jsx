import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header.jsx";
import UploadForm from "./components/UploadForm.jsx";
import DetectionResult from "./components/DetectionResult.jsx";
import HeroSection from "./components/HeroSection.jsx";
import ModelShowcase from "./components/ModelShowcase.jsx";
import Features from "./components/Features.jsx";
import Analytics from "./components/Analytics.jsx";
import About from "./components/About.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./components/Login.jsx";
import CameraDetection from "./components/CameraDetection.jsx";
import DroneFleet from "./components/DroneFleet.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CameraClient from "./pages/CameraClient.jsx";

function AppContent() {
  const [result, setResult] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [detectionHistory, setDetectionHistory] = useState([]);

  const { user, loading: authLoading, logout } = useAuth();

  const handleNewDetection = (newResult) => {
    setResult(newResult);
    if (newResult && !newResult.error) {
      setDetectionHistory(prev => [...prev, newResult]);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">🎖️ INITIALIZING MILITARY SYSTEMS...</p>
          <p className="text-emerald-400 text-sm">Verifying clearance levels...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  // Main military app for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 relative overflow-hidden">
      {/* Military Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        
        {/* Military Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-emerald-400/20"></div>
            ))}
          </div>
        </div>
        
        {/* Scanning Effects */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-teal-400/40 to-transparent animate-pulse delay-500"></div>
        
        {/* Moving Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={logout}
        />
        
        {/* Hero Section only on home page */}
        {currentPage === 'home' && <HeroSection setCurrentPage={setCurrentPage} />}
        
        <main className="max-w-7xl mx-auto py-12 px-4 space-y-12">
          {/* Model Showcase only on home and detection pages */}
          {(currentPage === 'home' || currentPage === 'detection') && <ModelShowcase />}
          
          {/* Home page content */}
          {currentPage === 'home' && (
            <div className="text-center">
              <Features />
            </div>
          )}
          
          {/* Detection page content */}
          {currentPage === 'detection' && (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <UploadForm 
                  setResult={handleNewDetection} 
                  setLoading={setLoading} 
                  setImage={setImage} 
                />
              </div>
              <DetectionResult result={result} image={image} loading={loading} />
            </div>
          )}

          {/* Real-time Camera page */}
          {currentPage === 'camera' && (
            <CameraDetection />
          )}

          {/* Drone Fleet Management page */}
          {currentPage === 'drones' && (
            <DroneFleet />
          )}

          {/* Admin Dashboard - Multi-Camera Command Center */}
          {currentPage === 'admin' && (
            <AdminDashboard />
          )}

          {/* Camera Client - Remote Laptop Streaming */}
          {currentPage === 'client' && (
            <CameraClient />
          )}

          {currentPage === 'analytics' && (
            <Analytics detectionHistory={detectionHistory} />
          )}

          {currentPage === 'about' && (
            <About />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;


