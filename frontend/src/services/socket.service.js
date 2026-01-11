import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (!this.socket || !this.socket.connected) {
      console.log('🔌 Connecting to Socket.IO:', SOCKET_URL);
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔴 Socket connection error:', error);
      });
    }
    return this.socket;
  }

  joinSession(sessionId) {
    if (this.socket && this.socket.connected) {
      console.log('📥 Joining session:', sessionId);
      this.socket.emit('join-session', sessionId);
    } else {
      console.warn('⚠️ Socket not connected, attempting to connect...');
      this.connect();
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('join-session', sessionId);
        }
      }, 1000);
    }
  }

  leaveSession(sessionId) {
    if (this.socket && this.socket.connected) {
      console.log('📤 Leaving session:', sessionId);
      this.socket.emit('leave-session', sessionId);
    }
  }

  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      console.log('👂 Listening for event:', event);
      this.socket.on(event, callback);
      
      // Track listeners for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from tracked listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      
      // Remove all tracked listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
      
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
