import { Shield, Target, Zap, ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Add setCurrentPage prop
  const { setCurrentPage } = arguments[0] || {};

  const stats = [
    { value: "80%", label: "Detection Accuracy" },
    { value: "24/7", label: "Surveillance" },
    { value: "∞", label: "Solar Powered" }
  ];

  const animatedTexts = [
    "SMART SENTINEL",
    "AI GUARDIAN", 
    "DRONE"
  ];

  useEffect(() => {
    setIsVisible(true);
    const statInterval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % animatedTexts.length);
    }, 4000);
    
    return () => {
      clearInterval(statInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-slate-900/50 to-teal-900/30"></div>
        
        {/* Moving Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-400/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-teal-400/30 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-emerald-300/40 rounded-full animate-bounce delay-1000"></div>
        
        {/* Moving Lines */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-teal-400/50 to-transparent animate-pulse delay-500"></div>
      </div>

      <div className={`relative max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Status Badge with Animation */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-emerald-500/30 animate-pulse">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            <span className="text-emerald-400 font-semibold text-sm tracking-wider">CHAKRAVYUH 1.0 • OPERATIONAL</span>
          </div>
          
          {/* Animated Title */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent animate-pulse">
              {animatedTexts[textIndex]}
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent animate-bounce">
              SURVEILLANCE
            </span>
          </h1>
        </div>

        {/* Typewriter Subtitle */}
        <div className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          <span className="inline-block animate-pulse">A </span>
          <span className="text-emerald-400 font-semibold animate-pulse delay-100"> compact, intelligent, and covert </span>
          <span className="inline-block animate-pulse delay-200">  AI-powered surveillance solution that </span>
          <span className="text-teal-400 font-semibold animate-pulse delay-300"> proactively detects unusual human activities </span>
          <span className="inline-block animate-pulse delay-400">  in high-risk zones</span>
        </div>

        {/* Enhanced Animated Stats */}
        <div className="flex justify-center items-center gap-12 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`transition-all duration-500 ${
                currentStat === index 
                  ? 'scale-110 opacity-100 animate-pulse' 
                  : 'scale-90 opacity-60'
              }`}
            >
              <div className="text-center p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300">
                <div className="text-3xl font-bold text-emerald-400 mb-2 animate-bounce">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            onClick={() => setCurrentPage && setCurrentPage('detection')}
            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 animate-pulse"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <Target className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Start Detection</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
          
          <button 
            onClick={() => setShowVideoModal(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
            <span>Watch Demo</span>
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-emerald-400 transition-colors text-2xl font-bold"
            >
              ✕
            </button>
            
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                <h3 className="text-xl font-bold text-white">Guard-X Demo Video</h3>
              </div>
              
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  muted
                  playsInline
                  poster="/demo-thumbnail.jpg"
                  onError={(e) => console.log('Video error:', e)}
                  onLoadStart={() => console.log('Video loading started')}
                >
                  <source src="/demo.mp4" type="video/mp4" />
                  <source src="/guard-x-demo.mp4" type="video/mp4" />
                  
                  {/* Fallback for no video */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-slate-400 mb-2">Demo Video</h4>
                      <p className="text-slate-500">Guard-X AI Surveillance System</p>
                      <p className="text-slate-600 text-sm mt-2">Real-time human detection & threat analysis</p>
                      <p className="text-red-400 text-xs mt-2">Video file not found in /public folder</p>
                    </div>
                  </div>
                </video>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-slate-400 text-sm">
                  Advanced AI Detection • Drone Fleet Management • Real-time Surveillance
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}









