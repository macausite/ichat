import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../lib/config';
import useAuthStore from '../store/useAuthStore';

export default function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user, session } = useAuthStore();

  useEffect(() => {
    // Only connect if user is authenticated
    if (user && session) {
      // Initialize socket connection
      socketRef.current = io(API_URL, {
        auth: {
          token: session.access_token
        }
      });

      // Event listeners
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, session]);

  return socketRef;
}
