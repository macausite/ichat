import { io, Socket } from 'socket.io-client';
import { API_URL } from './config';
import { Message, Room } from '../types';

/**
 * SocketManager handles the WebSocket connections for real-time chat features
 */
class SocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private typingHandlers: ((data: { roomId: string, userId: string, username: string, isTyping: boolean }) => void)[] = [];
  private onlineStatusHandlers: ((data: { userId: string, isOnline: boolean }) => void)[] = [];
  private roomUpdateHandlers: ((room: Room) => void)[] = [];
  private connectionHandlers: ((isConnected: boolean) => void)[] = [];

  /**
   * Initialize socket connection
   * @param userId Current user's ID
   */
  initialize(userId: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.userId = userId;
    
    this.socket = io(API_URL, {
      autoConnect: true,
      withCredentials: true,
      auth: {
        userId
      }
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.notifyConnectionHandlers(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.notifyConnectionHandlers(false);
    });

    this.socket.on('new_message', (message: Message) => {
      console.log('New message received:', message);
      this.notifyMessageHandlers(message);
    });

    this.socket.on('typing', (data: { roomId: string, userId: string, username: string, isTyping: boolean }) => {
      console.log('Typing status:', data);
      this.notifyTypingHandlers(data);
    });

    this.socket.on('online_status', (data: { userId: string, isOnline: boolean }) => {
      console.log('Online status update:', data);
      this.notifyOnlineStatusHandlers(data);
    });

    this.socket.on('room_update', (room: Room) => {
      console.log('Room update:', room);
      this.notifyRoomUpdateHandlers(room);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      this.notifyConnectionHandlers(false);
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  /**
   * Send a message
   * @param message Message to send
   */
  sendMessage(message: Message): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected, cannot send message');
      return;
    }

    this.socket.emit('send_message', message);
  }

  /**
   * Send typing status
   * @param roomId Room ID
   * @param isTyping Whether user is typing
   */
  sendTypingStatus(roomId: string, isTyping: boolean): void {
    if (!this.socket || !this.socket.connected || !this.userId) {
      console.error('Socket not connected, cannot send typing status');
      return;
    }

    this.socket.emit('typing', {
      roomId,
      isTyping
    });
  }

  /**
   * Join a room
   * @param roomId Room ID to join
   */
  joinRoom(roomId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected, cannot join room');
      return;
    }

    this.socket.emit('join_room', { roomId });
  }

  /**
   * Leave a room
   * @param roomId Room ID to leave
   */
  leaveRoom(roomId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected, cannot leave room');
      return;
    }

    this.socket.emit('leave_room', { roomId });
  }

  /**
   * Update read status for messages
   * @param roomId Room ID
   */
  updateReadStatus(roomId: string): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected, cannot update read status');
      return;
    }

    this.socket.emit('mark_read', { roomId });
  }

  /**
   * Add handler for new messages
   * @param handler Function to handle new messages
   */
  onMessage(handler: (message: Message) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add handler for typing status updates
   * @param handler Function to handle typing status
   */
  onTyping(handler: (data: { roomId: string, userId: string, username: string, isTyping: boolean }) => void): () => void {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add handler for online status updates
   * @param handler Function to handle online status
   */
  onOnlineStatus(handler: (data: { userId: string, isOnline: boolean }) => void): () => void {
    this.onlineStatusHandlers.push(handler);
    return () => {
      this.onlineStatusHandlers = this.onlineStatusHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add handler for room updates
   * @param handler Function to handle room updates
   */
  onRoomUpdate(handler: (room: Room) => void): () => void {
    this.roomUpdateHandlers.push(handler);
    return () => {
      this.roomUpdateHandlers = this.roomUpdateHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add handler for connection status changes
   * @param handler Function to handle connection status
   */
  onConnectionChange(handler: (isConnected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Notify all message handlers
   * @param message Message to notify about
   */
  private notifyMessageHandlers(message: Message): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  /**
   * Notify all typing handlers
   * @param data Typing data to notify about
   */
  private notifyTypingHandlers(data: { roomId: string, userId: string, username: string, isTyping: boolean }): void {
    this.typingHandlers.forEach(handler => handler(data));
  }

  /**
   * Notify all online status handlers
   * @param data Online status data to notify about
   */
  private notifyOnlineStatusHandlers(data: { userId: string, isOnline: boolean }): void {
    this.onlineStatusHandlers.forEach(handler => handler(data));
  }

  /**
   * Notify all room update handlers
   * @param room Room to notify about
   */
  private notifyRoomUpdateHandlers(room: Room): void {
    this.roomUpdateHandlers.forEach(handler => handler(room));
  }

  /**
   * Notify all connection handlers
   * @param isConnected Whether socket is connected
   */
  private notifyConnectionHandlers(isConnected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(isConnected));
  }
}

export const socketManager = new SocketManager();
