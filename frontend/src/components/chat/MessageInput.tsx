"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa';
import useAuthStore from '../../store/useAuthStore';
import { Message } from '../../types';

interface MessageInputProps {
  roomId: string;
  socket: React.MutableRefObject<Socket | null>;
  onMessageSent: (message: Message) => void;
}

export default function MessageInput({ roomId, socket, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();
  
  // Auto-resize textarea as user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && socket.current && user) {
      setIsTyping(true);
      socket.current.emit('typing', {
        roomId,
        userId: user.id,
        username: user.full_name || 'User',
        isTyping: true
      });
    }
    
    // Reset the timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a new timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (socket.current && user) {
        setIsTyping(false);
        socket.current.emit('typing', {
          roomId,
          userId: user.id,
          username: user.full_name || 'User',
          isTyping: false
        });
      }
    }, 2000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !socket.current || !user) return;
    
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID until server assigns one
      roomId,
      senderId: user.id,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Emit message to server
    socket.current.emit('send_message', newMessage);
    
    // Update local state
    onMessageSent(newMessage);
    
    // Clear input
    setMessage('');
    
    // Reset typing indicator
    if (isTyping && socket.current) {
      setIsTyping(false);
      socket.current.emit('typing', {
        roomId,
        userId: user.id,
        username: user.full_name || 'User',
        isTyping: false
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-end p-4 border-t border-gray-200">
      <button 
        type="button" 
        className="flex-shrink-0 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <FaPaperclip className="w-5 h-5" />
      </button>
      
      <div className="relative flex-grow">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
            handleTyping();
          }}
          placeholder="Type a message..."
          className="w-full p-3 pr-12 text-sm bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32"
          rows={1}
        />
        
        <button 
          type="button" 
          className="absolute right-12 bottom-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FaSmile className="w-5 h-5" />
        </button>
      </div>
      
      <button 
        type="submit" 
        disabled={!message.trim()}
        className={`flex-shrink-0 ml-2 p-2 rounded-full focus:outline-none ${
          message.trim() 
            ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <FaPaperPlane className="w-5 h-5" />
      </button>
    </form>
  );
}
