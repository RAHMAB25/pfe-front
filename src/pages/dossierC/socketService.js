// socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token, userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connecté');
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO déconnecté');
    });

    this.socket.on('receiveNotification', (notification) => {
      console.log('📨 Nouvelle notification reçue:', notification);
      // Déclencher les callbacks enregistrés
      this.listeners.forEach(callback => callback(notification));
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback) {
    const id = Date.now().toString();
    this.listeners.set(id, callback);
    return id;
  }

  offNotification(id) {
    this.listeners.delete(id);
  }
}

export default new SocketService();