/**
 * Guard-X Socket.IO Client Utilities
 * 
 * This module provides Socket.IO connection management with JWT authentication.
 * 
 * Data flow:
 * - Connect with JWT token from localStorage
 * - Authenticate on server
 * - Join appropriate room (admin_room or camera_room)
 * - Handle real-time events
 * 
 * Usage:
 *   import { connectSocket, disconnectSocket } from './utils/socket';
 *   const socket = connectSocket(token);
 */

import { io } from 'socket.io-client';

// Use dynamic URL based on window location for multi-laptop deployment
// If accessing from another laptop (e.g., http://192.168.1.100:5173),
// it will use http://192.168.1.100:8000
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:8000`;

let socket = null;

/**
 * Connect to Socket.IO server with JWT authentication
 * 
 * @param {string} token - JWT authentication token
 * @returns {Socket} Socket.IO client instance
 */
export function connectSocket(token) {
  if (socket && socket.connected) {
    console.log('🔌 Socket already connected');
    return socket;
  }

  console.log('🔌 Connecting to Socket.IO server...');
  console.log('   URL:', SOCKET_URL);
  console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN!');

  if (!token) {
    console.error('❌ Cannot connect: No token provided!');
    return null;
  }

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: {
      token: token
    },
    query: {
      token: token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error.message);
    console.error('   Details:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error);
  });

  return socket;
}

/**
 * Disconnect from Socket.IO server
 */
export function disconnectSocket() {
  if (socket) {
    console.log('🔌 Disconnecting Socket.IO...');
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get current socket instance
 * 
 * @returns {Socket|null} Current socket instance or null
 */
export function getSocket() {
  return socket;
}

/**
 * Emit event to server
 * 
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export function emitEvent(event, data) {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.error('❌ Socket not connected, cannot emit event:', event);
  }
}

/**
 * Listen to event from server
 * 
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export function onEvent(event, callback) {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.error('❌ Socket not initialized, cannot listen to event:', event);
  }
}

/**
 * Remove event listener
 * 
 * @param {string} event - Event name
 * @param {Function} callback - Callback function (optional)
 */
export function offEvent(event, callback) {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
}

/**
 * Check if socket is connected
 * 
 * @returns {boolean} True if connected, false otherwise
 */
export function isConnected() {
  return socket && socket.connected;
}

