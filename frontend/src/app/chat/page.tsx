'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatConversation from '../../components/chat/ChatConversation';
import NewChatDialog from '../../components/chat/NewChatDialog';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import useSocket from '../../hooks/useSocket';
import { fetchMockContacts } from '../../lib/mockData';

export default function ChatPage() {
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();
  const { addRoom, addMessage, activeRoomId, addContact } = useChatStore();
  const socketRef = useSocket();
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      // Load mock contacts
      const loadContacts = async () => {
        try {
          const mockContacts = await fetchMockContacts();
          // Add each contact to the store
          mockContacts.forEach(contact => {
            addContact(contact);
          });
          console.log('Loaded mock contacts:', mockContacts.length);
        } catch (error) {
          console.error('Failed to load contacts:', error);
        } finally {
          // When user data and contacts are available, we can safely show content
          setIsLoading(false);
        }
      };
      
      loadContacts();
    }
  }, [user, router, addContact]);
  
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
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-indigo-200"></div>
          <div className="h-4 w-24 bg-indigo-200 rounded mb-3"></div>
          <div className="h-2 w-16 bg-indigo-100 rounded"></div>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, don't render anything
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${showSidebar || !isMobileView ? 'translate-x-0' : '-translate-x-full'} 
          ${isMobileView ? 'absolute z-10 w-full' : 'relative w-80'} 
          h-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
      >
        <ChatSidebar onCreateChat={() => setIsNewChatDialogOpen(true)} />
      </div>
      
      {/* Conversation */}
      <div 
        className={`${!showSidebar || !isMobileView ? 'translate-x-0' : 'translate-x-full'} 
          ${isMobileView ? 'absolute z-10 w-full' : 'relative flex-grow'} 
          h-full bg-white transition-transform duration-300 ease-in-out`}
      >
        <ChatConversation 
          socket={socketRef} 
          onBackClick={() => setShowSidebar(true)}
          isMobile={isMobileView}
        />
      </div>
      
      {/* New Chat Dialog */}
      <NewChatDialog 
        isOpen={isNewChatDialogOpen}
        onClose={() => setIsNewChatDialogOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
}
