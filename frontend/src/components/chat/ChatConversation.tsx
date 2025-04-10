"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import useChatStore from '../../store/useChatStore';
import { Message } from '../../types';
import useAuthStore from '../../store/useAuthStore';
import { socketManager } from '../../lib/socket';
import { FaArrowLeft, FaEllipsisV, FaPhone, FaVideo, FaInfoCircle, FaUserPlus, FaSearch } from 'react-icons/fa';

interface ChatConversationProps {
  onBackClick?: () => void;
  isMobile?: boolean;
}

export default function ChatConversation({ onBackClick, isMobile = false }: ChatConversationProps) {
  const { activeRoomId, rooms, messages, addMessage, markMessagesAsRead } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeRoom = rooms.find(room => room.id === activeRoomId);
  const activeMessages = useMemo(() => {
    return activeRoomId ? messages[activeRoomId] || [] : [];
  }, [messages, activeRoomId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages]);
  
  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (activeRoomId) {
      markMessagesAsRead(activeRoomId);
    }
  }, [activeRoomId, markMessagesAsRead]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  
  // Listen for typing events
  useEffect(() => {
    if (!activeRoomId || !user) return;
    
    const unsubscribe = socketManager.onTyping((data) => {
      if (data.roomId === activeRoomId && data.userId !== user.id) {
        setIsTyping(data.isTyping);
        setTypingUser(data.username);
      }
    });
    
    // Join the room for real-time updates
    socketManager.joinRoom(activeRoomId);
    
    return () => {
      unsubscribe();
      // Don't leave the room on cleanup as we might just be temporarily hiding the component
    };
  }, [activeRoomId, user]);
  
  if (!activeRoom || !activeRoomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="p-8 text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-100">
            <FaSearch className="w-12 h-12 text-indigo-400" />
          </div>
          <h3 className="mb-3 text-xl font-medium text-gray-700">Select a conversation</h3>
          <p className="text-gray-500 max-w-sm">Choose a chat from the sidebar or start a new conversation to begin messaging</p>
        </div>
      </div>
    );
  }
  
  const handleMessageSent = (message: Message) => {
    addMessage(message);
  };
  
  const formatTimeForHeader = () => {
    const onlineUsers = activeRoom.participants.filter(p => p.isOnline);
    if (onlineUsers.length > 0) {
      return onlineUsers.length === 1 ? 'Online' : `${onlineUsers.length} online`;
    } else {
      return 'Offline';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-white shadow-sm">
        {isMobile && (
          <button 
            onClick={onBackClick}
            className="p-2 mr-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
            aria-label="Back to conversations"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex-shrink-0 mr-3">
          {activeRoom.type === 'group' ? (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
              {activeRoom.name.substring(0, 2).toUpperCase()}
            </div>
          ) : (
            <div className="relative">
              {activeRoom.participants[0]?.avatarUrl ? (
                <Image
                  src={activeRoom.participants[0].avatarUrl}
                  alt={activeRoom.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {activeRoom.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              {activeRoom.participants.some(p => p.isOnline) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <h2 className="text-lg font-medium truncate">{activeRoom.name}</h2>
          <p className="text-xs text-gray-500 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${activeRoom.participants.some(p => p.isOnline) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {formatTimeForHeader()}
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors" aria-label="Voice call">
            <FaPhone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors" aria-label="Video call">
            <FaVideo className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors" aria-label="Conversation info">
            <FaInfoCircle className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none transition-colors" aria-label="More options">
            <FaEllipsisV className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50 custom-scrollbar">
        {activeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fade-in">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-indigo-100">
              <FaUserPlus className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-4 py-1 text-xs bg-gray-200 rounded-full text-gray-600">
                {format(new Date(activeMessages[0]?.timestamp || new Date()), 'MMMM d, yyyy')}
              </span>
            </div>
            
            {activeMessages.map((message: Message, index: number) => {
              // Check if we need to show a date separator
              const showDateSeparator = index > 0 && (
                new Date(message.timestamp).toDateString() !== 
                new Date(activeMessages[index - 1].timestamp).toDateString()
              );
              
              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && (
                    <div className="text-center my-4">
                      <span className="inline-block px-4 py-1 text-xs bg-gray-200 rounded-full text-gray-600">
                        {format(new Date(message.timestamp), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <ChatMessage
                    content={message.content}
                    timestamp={message.timestamp}
                    isOwn={message.senderId === user?.id}
                    senderName={
                      message.senderId !== user?.id
                        ? activeRoom?.participants?.find(p => p.id === message.senderId)?.fullName || 'User'
                        : undefined
                    }
                    isRead={message.read}
                  />
                </React.Fragment>
              );
            })}
            
            {isTyping && (
              <div className="text-gray-500 text-sm ml-2 mb-2">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="ml-2">{typingUser} is typing...</span>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <MessageInput 
        roomId={activeRoomId}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
