import { useState } from "react";
import { Shield, Target, Zap, Menu, Camera, LogOut, User } from "lucide-react";

export default function Header({ currentPage, setCurrentPage, user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="relative z-20 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Guard-X</h1>
              <p className="text-xs text-emerald-400">CHAKRAVYUH 1.0</p>
            </div>
          </div>
          
          {/* Compact Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 backdrop-blur-sm rounded-full p-1 border border-slate-700/50">
            {[
              { id: 'home', label: 'Home', icon: Shield },
              { id: 'detection', label: 'Detection', icon: Target },
              { id: 'camera', label: 'Live Camera', icon: Camera },
              { id: 'drones', label: 'Drone Fleet', icon: Zap },
              ...(user?.role === 'ADMIN' ? [{ id: 'admin', label: 'Command Center', icon: Shield }] : []),
              { id: 'client', label: 'Camera Client', icon: Camera },
              { id: 'analytics', label: 'Analytics', icon: Zap },
              { id: 'about', label: 'About', icon: Menu }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  {currentPage === item.id && (
                    <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-full p-2 pr-4 border border-slate-700/50 hover:border-emerald-400/30 transition-all"
            >
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-400/30">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-white text-sm font-medium">{user?.username}</p>
                <p className="text-slate-400 text-xs">Operator</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-xl">
                <div className="p-3 border-b border-slate-700/50">
                  <p className="text-white font-medium">{user?.full_name || user?.username}</p>
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

