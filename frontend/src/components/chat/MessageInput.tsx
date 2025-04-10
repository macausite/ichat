"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaPaperclip, FaMicrophone, FaImage, FaVideo } from 'react-icons/fa';
import useAuthStore from '../../store/useAuthStore';
import { Message } from '../../types';
import { socketManager } from '../../lib/socket';
import { sendMessage } from '../../lib/services/chatService';

interface MessageInputProps {
  roomId: string;
  onMessageSent: (message: Message) => void;
}

export default function MessageInput({ roomId, onMessageSent }: MessageInputProps) {
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
    if (!isTyping && user) {
      setIsTyping(true);
      socketManager.sendTypingStatus(roomId, true);
    }
    
    // Reset the timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a new timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (user) {
        setIsTyping(false);
        socketManager.sendTypingStatus(roomId, false);
      }
    }, 2000);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    const messageContent = message.trim();
    
    try {
      // Create a temporary message for optimistic UI update
      const tempMessage = {
        id: Math.random().toString(36).substr(2, 9), // Temporary ID until server assigns one
        roomId,
        senderId: user.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Update local state immediately for responsive UI
      onMessageSent(tempMessage);
      
      // Clear input
      setMessage('');
      
      // Send message through our service (which handles both API and socket)
      const sentMessage = await sendMessage(roomId, messageContent);
      
      // If the message was sent successfully, update it with the real ID
      if (sentMessage) {
        // The socket will automatically broadcast to all clients including this one
        // so we don't need to manually update the message again
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Could add error handling UI here (e.g., show error message)
    }
    
    // Reset typing indicator
    if (isTyping) {
      setIsTyping(false);
      socketManager.sendTypingStatus(roomId, false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  
  return (
    <div className="bg-white border-t border-gray-200">
      {/* Attachment Options */}
      {showAttachmentOptions && (
        <div className="flex justify-around p-2 border-b border-gray-200 animate-slide-in">
          <button 
            type="button" 
            className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
            aria-label="Send image"
          >
            <div className="p-2 bg-indigo-100 rounded-full mb-1">
              <FaImage className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-xs">Image</span>
          </button>
          <button 
            type="button" 
            className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
            aria-label="Send video"
          >
            <div className="p-2 bg-indigo-100 rounded-full mb-1">
              <FaVideo className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-xs">Video</span>
          </button>
          <button 
            type="button" 
            className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
            aria-label="Send voice message"
          >
            <div className="p-2 bg-indigo-100 rounded-full mb-1">
              <FaMicrophone className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-xs">Audio</span>
          </button>
        </div>
      )}
      
      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-center p-3">
        <button 
          type="button" 
          onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
          className="flex-shrink-0 p-2 mr-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
          aria-label="Add attachment"
        >
          <FaPaperclip className="w-5 h-5" />
        </button>
        
        <div className="relative flex-grow focus-within-ring rounded-full overflow-hidden">
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
            className="w-full py-3 px-4 pr-12 text-sm bg-gray-100 border-none focus:outline-none resize-none max-h-32"
            rows={1}
          />
          
          <button 
            type="button" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
            aria-label="Add emoji"
          >
            <FaSmile className="w-5 h-5" />
          </button>
        </div>
        
        <button 
          type="submit" 
          disabled={!message.trim()}
          className={`flex-shrink-0 ml-2 p-3 rounded-full focus:outline-none transition-colors ${
            message.trim() 
              ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <FaPaperPlane className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
