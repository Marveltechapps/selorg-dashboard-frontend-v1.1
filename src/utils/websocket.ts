import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

/**
 * WebSocket Client Service
 * Handles real-time communication with backend
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found, WebSocket connection skipped');
      return;
    }

    const wsUrl = process.env.VITE_WS_URL || API_CONFIG.baseURL.replace('http', 'ws');
    
    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Subscribe to default rooms
    if (this.socket.connected) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role) {
        this.subscribe(`role:${user.role}`);
      }
      if (user.id) {
        this.subscribe(`user:${user.id}`);
      }
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Subscribe to a room/channel
   */
  subscribe(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe', room);
      console.log(`Subscribed to room: ${room}`);
    }
  }

  /**
   * Unsubscribe from a room/channel
   */
  unsubscribe(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', room);
      console.log(`Unsubscribed from room: ${room}`);
    }
  }

  /**
   * Listen to an event
   */
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      this.listeners.get(event)?.clear();
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, event not sent:', event);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
