import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Use dynamic URL based on window location for multi-laptop deployment
// If accessing from another laptop (e.g., http://192.168.1.100:5173),
// it will use http://192.168.1.100:8000/api
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

// Debug: Log the API URL being used
console.log('🔧 Guard-X API Configuration:');
console.log('   Hostname:', window.location.hostname);
console.log('   API URL:', API_URL);
console.log('   Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('guardx_military_token'));

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Military auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login to:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      const { access_token, user_info, clearance_level, unit } = response.data;
      
      const userData = {
        ...user_info,
        clearance_level,
        unit
      };
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('guardx_military_token', access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Military login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'UNAUTHORIZED ACCESS' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('guardx_military_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};