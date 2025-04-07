import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import { FaArrowLeft, FaEllipsisV, FaPhone, FaVideo } from 'react-icons/fa';

interface ChatConversationProps {
  socket: React.MutableRefObject<Socket | null>;
  onBackClick?: () => void;
  isMobile?: boolean;
}

export default function ChatConversation({ socket, onBackClick, isMobile = false }: ChatConversationProps) {
  const { activeRoomId, rooms, messages, addMessage, markMessagesAsRead } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeRoom = rooms.find(room => room.id === activeRoomId);
  const activeMessages = activeRoomId ? messages[activeRoomId] || [] : [];
  
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
  
  if (!activeRoom || !activeRoomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="p-8 text-center">
          <h3 className="mb-2 text-xl font-medium text-gray-700">Select a conversation</h3>
          <p className="text-gray-500">Choose a chat from the sidebar or start a new conversation</p>
        </div>
      </div>
    );
  }
  
  const handleMessageSent = (message: any) => {
    addMessage(message);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        {isMobile && (
          <button 
            onClick={onBackClick}
            className="p-2 mr-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex-shrink-0 w-10 h-10 mr-3 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
          {activeRoom.name.substring(0, 2).toUpperCase()}
        </div>
        
        <div className="flex-grow">
          <h2 className="text-lg font-medium">{activeRoom.name}</h2>
          <p className="text-xs text-gray-500">
            {activeRoom.participants.some(p => p.isOnline) 
              ? 'Online' 
              : 'Offline'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none">
            <FaPhone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none">
            <FaVideo className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none">
            <FaEllipsisV className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto bg-white">
        {activeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          activeMessages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              isOwn={message.senderId === user?.id}
              senderName={
                message.senderId !== user?.id
                  ? activeRoom.participants.find(p => p.id === message.senderId)?.fullName || 'User'
                  : undefined
              }
              isRead={message.read}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <MessageInput 
        roomId={activeRoomId}
        socket={socket}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
