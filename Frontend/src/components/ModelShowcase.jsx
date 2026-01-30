import { useState, useEffect } from "react";
import { Cpu, Camera, Radar, Sun, Wifi, Battery } from "lucide-react";
import beetle1 from "../assets/beetle1_nobg.png";
import beetle2 from "../assets/beetle2_nobg.png";

export default function ModelShowcase() {
  const [rotation, setRotation] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);

  const beetleImages = [beetle1, beetle2];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.3);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % beetleImages.length);
    }, 3000);
    return () => clearInterval(imageInterval);
  }, []);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Guard-X Beetle Drone - 3D Holographic Display
        </h2>
        <p className="text-emerald-400 text-center mb-12">
          Bio-inspired micro-scale design with 3D visualization
        </p>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 3D Beetle Model Display */}
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 overflow-hidden relative">
              
              {/* 3D Grid Background */}
              <div className="absolute inset-0 opacity-30">
                <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                  {Array.from({length: 144}).map((_, i) => (
                    <div key={i} className="border border-emerald-400/10"></div>
                  ))}
                </div>
              </div>

              {/* 3D Axis Lines */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/40"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-400/40"></div>
                <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border border-emerald-400/20 rounded-full"></div>
              </div>

              <div className="relative h-96 flex items-center justify-center perspective-1000">
                
                {/* 3D Beetle Model Container */}
                <div className="relative w-80 h-80 flex items-center justify-center transform-gpu">
                  
                  {/* Main Beetle PNG with 3D Transform */}
                  <img 
                    src={beetleImages[currentImage]} 
                    alt={`3D Beetle Model ${currentImage + 1}`}
                    className="w-72 h-72 object-contain transition-all duration-1000"
                    style={{ 
                      transform: `
                        rotateX(${Math.sin(rotation * 0.02) * 20}deg) 
                        rotateY(${rotation * 0.6}deg) 
                        rotateZ(${Math.sin(rotation * 0.03) * 8}deg)
                        scale(${1 + Math.sin(rotation * 0.04) * 0.15})
                        translateZ(${Math.sin(rotation * 0.02) * 30}px)
                      `,
                      filter: `
                        brightness(1.4) 
                        contrast(1.5) 
                        saturate(1.6) 
                        drop-shadow(0 0 40px rgba(16, 185, 129, 0.8))
                        drop-shadow(0 0 80px rgba(16, 185, 129, 0.4))
                        hue-rotate(${Math.sin(rotation * 0.01) * 15}deg)
                      `,
                      background: 'transparent'
                    }}
                  />
                  
                  {/* 3D Holographic Ghost Images */}
                  <img 
                    src={beetleImages[currentImage]} 
                    alt="Ghost Layer 1"
                    className="absolute w-72 h-72 object-contain opacity-30"
                    style={{ 
                      transform: `
                        rotateY(${rotation * 0.4}deg) 
                        translateZ(15px)
                        scale(1.05)
                      `,
                      filter: 'brightness(0.8) saturate(2) hue-rotate(30deg)',
                      mixBlendMode: 'screen'
                    }}
                  />
                  
                  <img 
                    src={beetleImages[currentImage]} 
                    alt="Ghost Layer 2"
                    className="absolute w-72 h-72 object-contain opacity-20"
                    style={{ 
                      transform: `
                        rotateY(${rotation * -0.3}deg) 
                        translateZ(-15px)
                        scale(0.95)
                      `,
                      filter: 'brightness(0.6) saturate(3) hue-rotate(-30deg)',
                      mixBlendMode: 'screen'
                    }}
                  />

                  {/* 3D Scanning Rings */}
                  <div 
                    className="absolute inset-0 border-2 border-emerald-400/50 rounded-full"
                    style={{ 
                      transform: `rotateX(90deg) scale(${1 + Math.sin(rotation * 0.05) * 0.3})`,
                      opacity: Math.sin(rotation * 0.05) * 0.6 + 0.4
                    }}
                  ></div>
                  
                  <div 
                    className="absolute inset-0 border border-cyan-400/40 rounded-full"
                    style={{ 
                      transform: `rotateZ(45deg) scale(${1 + Math.sin(rotation * 0.03) * 0.2})`,
                      opacity: Math.sin(rotation * 0.03) * 0.4 + 0.3
                    }}
                  ></div>

                  {/* Enhanced 3D Particle Effects */}
                  {Array.from({length: 12}).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-emerald-400/70 rounded-full"
                      style={{
                        transform: `
                          rotateY(${rotation * 1.2 + i * 30}deg) 
                          translateX(140px) 
                          translateZ(${Math.sin(rotation * 0.1 + i) * 40}px)
                          scale(${0.5 + Math.sin(rotation * 0.08 + i) * 0.5})
                        `,
                        opacity: Math.sin(rotation * 0.1 + i) * 0.7 + 0.3,
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
                      }}
                    ></div>
                  ))}

                  {/* Orbital Rings */}
                  {Array.from({length: 3}).map((_, i) => (
                    <div
                      key={`ring-${i}`}
                      className="absolute border border-emerald-400/30 rounded-full"
                      style={{
                        width: `${200 + i * 40}px`,
                        height: `${200 + i * 40}px`,
                        transform: `
                          rotateX(${60 + i * 30}deg) 
                          rotateY(${rotation * (0.2 + i * 0.1)}deg)
                        `,
                        opacity: 0.3 - i * 0.1
                      }}
                    ></div>
                  ))}
                </div>

                {/* Enhanced Status Displays */}
                <div className="absolute top-4 left-4 bg-slate-900/95 rounded-lg px-4 py-3 border border-emerald-400/60 backdrop-blur-sm">
                  <div className="text-emerald-400 text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span>3D MODEL</span>
                    </div>
                    <div>STATUS: ACTIVE</div>
                  </div>
                </div>

                {/* Rotation & Scale Indicator */}
                <div className="absolute top-4 right-4 bg-slate-900/95 rounded-lg px-4 py-3 border border-emerald-400/60 backdrop-blur-sm">
                  <div className="text-emerald-400 text-xs font-mono">
                    <div>ROT: {Math.round(rotation % 360)}°</div>
                    <div>SCALE: {(1 + Math.sin(rotation * 0.04) * 0.15).toFixed(2)}x</div>
                    <div>UNIT: {currentImage + 1}/{beetleImages.length}</div>
                  </div>
                </div>

                {/* 3D Navigation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  {beetleImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        currentImage === index 
                          ? 'bg-emerald-400 border-emerald-400 scale-125 shadow-lg shadow-emerald-400/50' 
                          : 'bg-transparent border-emerald-400/60 hover:border-emerald-400 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>

                {/* 3D Projection Status */}
                <div className="absolute bottom-4 right-4 bg-slate-900/95 rounded-lg px-4 py-3 border border-emerald-400/60 backdrop-blur-sm">
                  <div className="text-emerald-400 text-xs font-mono">
                    <div>3D PROJ</div>
                    <div>ENABLED</div>
                    <div>PNG MODE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">3D Model Specifications</h3>
              </div>
              <ul className="space-y-2 text-slate-300">
                
                <li>• Multi-axis rotation system</li>
                <li>• Holographic projection layers</li>
                <li>• Dynamic particle effects</li>
                
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">3D Rendering Engine</h3>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li>• CSS 3D transforms</li>
                <li>• Hardware acceleration</li>
                <li>• Perspective projection</li>
                <li>• Smooth interpolation</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Sun className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Visual Effects</h3>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li>• Dynamic color shifting</li>
                <li>• Holographic overlays</li>
                <li>• Particle system animation</li>
                <li>• 3D scanning rings</li>
                
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}







