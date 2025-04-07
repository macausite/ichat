'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatConversation from '../../components/chat/ChatConversation';
import NewChatDialog from '../../components/chat/NewChatDialog';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import useSocket from '../../hooks/useSocket';

export default function ChatPage() {
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();
  const { addRoom, addMessage, activeRoomId } = useChatStore();
  const socketRef = useSocket();
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768 || !activeRoomId);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeRoomId]);
  
  // Handle incoming messages from socket
  useEffect(() => {
    if (socketRef.current) {
      const socket = socketRef.current; // Capture the value of socketRef.current
      
      socket.on('receive_message', (message) => {
        addMessage(message);
      });
      
      return () => {
        socket.off('receive_message'); // Use the captured reference in cleanup
      };
    }
  }, [socketRef, addMessage]);
  
  const handleCreateChat = async (participants: string[], name: string, type: 'private' | 'group') => {
    if (!user) return;
    
    try {
      // In a real app, this would be a server API call
      // For now, we'll just create a mock room
      const newRoom = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        unreadCount: 0,
        participants: participants.map(id => ({
          id,
          fullName: 'User ' + id.substring(0, 4),
          isOnline: Math.random() > 0.5,
          email: `user_${id.substring(0, 4)}@example.com`, // Add email field to satisfy User interface
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      addRoom(newRoom);
      
      // In mobile view, switch to conversation view
      if (isMobileView) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };
  
  // If user is not authenticated, don't render anything
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {(showSidebar || !isMobileView) && (
        <div className={`${isMobileView ? 'w-full' : 'w-80'} h-full bg-white`}>
          <ChatSidebar onCreateChat={() => setIsNewChatDialogOpen(true)} />
        </div>
      )}
      
      {/* Conversation */}
      {(!showSidebar || !isMobileView) && (
        <div className={`${isMobileView ? 'w-full' : 'flex-grow'} h-full`}>
          <ChatConversation 
            socket={socketRef} 
            onBackClick={() => setShowSidebar(true)}
            isMobile={isMobileView}
          />
        </div>
      )}
      
      {/* New Chat Dialog */}
      <NewChatDialog 
        isOpen={isNewChatDialogOpen}
        onClose={() => setIsNewChatDialogOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
}
