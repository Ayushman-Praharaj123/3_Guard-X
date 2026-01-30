import { Users } from "lucide-react";

export default function Footer() {
  const teamMembers = [
    "Ayush Kumar",
    "Ashish Kumar", 
    "Ayoan Singh",
    "Aryan Kumar",
    "Ayushman Praharaj"
  ];

  return (
    <footer className="relative bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/20 mt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 right-1/4 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Team Members Section */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" />
            Team Guard-X
          </h3>
          
          <div className="text-center mb-6">
            <p className="text-emerald-400 font-semibold text-lg">NIST University</p>
            <p className="text-slate-400 text-sm">NEXTECH 1.0</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:bg-slate-700/50">
                <h4 className="font-semibold text-white text-center">{member}</h4>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-emerald-400 font-bold text-lg animate-pulse">JAI HIND</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

