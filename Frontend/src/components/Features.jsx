import { Shield, Eye, Zap, Target, Sun, Wifi } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Shield,
      title: "Covert Operations",
      description: "Unobtrusive design for high-risk zone surveillance without detection"
    },
    {
      icon: Eye,
      title: "Thermal Detection",
      description: "Advanced thermal imaging to detect human heat signatures"
    },
    {
      icon: Sun,
      title: "Solar Powered",
      description: "Self-sustaining solar panel integration for continuous operation"
    },
    {
      icon: Zap,
      title: "Real-time AI",
      description: "CNN & YOLO models for instant threat detection and alerts"
    },
    {
      icon: Target,
      title: "Multi-Terrain",
      description: "Air and land surveillance across diverse geographical terrain"
    },
    {
      icon: Wifi,
      title: "Wireless Communication",
      description: "Real-time data transmission and remote monitoring capabilities"
    }
  ];

  return (
    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700">
      <h3 className="text-3xl font-bold text-white mb-8 text-center">
        Key Features & Capabilities
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="flex items-start gap-4 p-6 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-all duration-300">
              <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-400/30 flex-shrink-0">
                <IconComponent className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2 text-lg">{feature.title}</h4>
                <p className="text-base text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-6 bg-emerald-900/20 rounded-lg border border-emerald-400/30">
        <h4 className="text-emerald-400 font-bold mb-4 text-xl">Use Case Scenarios:</h4>
        <ul className="text-base text-slate-300 space-y-3 leading-relaxed">
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Border Security (India-Pakistan, India-China borders)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Counter-Terrorism operations in J&K</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Naxal-affected areas monitoring (Chhattisgarh, Jharkhand, Odisha)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Disaster response & rescue operations</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

