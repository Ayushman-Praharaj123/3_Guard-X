import { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, AlertTriangle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
      {/* Military Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Military Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-emerald-400/20"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          {/* Military Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-400/30 relative">
                <Shield className="w-8 h-8 text-emerald-400" />
                <Star className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">🎖️ GUARD-X MILITARY</h1>
            <p className="text-emerald-400 font-semibold">CLASSIFIED SYSTEM ACCESS</p>
            <p className="text-slate-400 text-sm mt-2">AUTHORIZED PERSONNEL ONLY</p>
          </div>

          {/* Classification Banner */}
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
            <p className="text-red-300 font-bold text-sm">🔒 RESTRICTED ACCESS</p>
            <p className="text-red-400 text-xs">Military Credentials Required</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-semibold">ACCESS DENIED</p>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🎖️ Military ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  placeholder="Enter military username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔐 Security Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  placeholder="Enter security code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  AUTHORIZE ACCESS
                </>
              )}
            </button>
          </form>

          {/* Military Footer */}
          <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
            <p className="text-emerald-400 font-semibold">GUARD-X SURVEILLANCE SYSTEM v2.0</p>
            <p>🎖️ MILITARY GRADE SECURITY</p>
            <p>Powered by NEXTECH AI DIVISION</p>
            <div className="mt-4 p-2 bg-slate-700/30 rounded border border-slate-600/50">
              <p className="text-yellow-400 text-xs">⚠️ UNAUTHORIZED ACCESS IS PROHIBITED</p>
              <p className="text-slate-400 text-xs">All activities are monitored and logged</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}