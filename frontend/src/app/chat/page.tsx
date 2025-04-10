'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatConversation from '../../components/chat/ChatConversation';
import NewChatDialog from '../../components/chat/NewChatDialog';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
// Import the socket manager and services
import { socketManager } from '../../lib/socket';
import { fetchContacts } from '../../lib/services/contactService';
import { fetchRooms, createRoom, fetchMessages, markMessagesAsRead } from '../../lib/services/chatService';

export default function ChatPage() {
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuthStore();
  const { addRoom, addMessage, activeRoomId, setActiveRoom, addContact, updateContact } = useChatStore();
  // We're now using the socket manager directly instead of the hook
  
  // Check if user is authenticated and initialize data
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setIsLoading(true);
      
      // Initialize socket connection
      socketManager.initialize(user.id);
      
      // Load contacts and chat rooms
      const initializeChat = async () => {
        try {
          // Load real contacts from Supabase
          const userContacts = await fetchContacts();
          userContacts.forEach(contact => {
            addContact(contact);
          });
          console.log('Loaded contacts:', userContacts.length);
          
          // Load rooms/conversations
          const userRooms = await fetchRooms();
          userRooms.forEach(room => {
            addRoom(room);
          });
          console.log('Loaded rooms:', userRooms.length);
          
          // Preload messages for all rooms
          await Promise.all(userRooms.map(async (room) => {
            const roomMessages = await fetchMessages(room.id);
            roomMessages.forEach(message => {
              addMessage(message);
            });
          }));
          
        } catch (error) {
          console.error('Failed to initialize chat data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      initializeChat();
      
      // Clean up socket connection when component unmounts
      return () => {
        socketManager.disconnect();
      };
    }
  }, [user, router, addContact, addRoom, addMessage]);
  
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
  
  // Set up socket event listeners
  useEffect(() => {
    // Handle new messages
    const messageUnsubscribe = socketManager.onMessage((message) => {
      addMessage(message);
      
      // Mark as read if we're in the active room
      if (activeRoomId === message.roomId) {
        markMessagesAsRead(message.roomId);
      }
    });
    
    // Handle room updates (new messages, typing indicators, etc.)
    const roomUpdateUnsubscribe = socketManager.onRoomUpdate((room) => {
      addRoom(room);
    });
    
    // Handle online status changes
    const onlineStatusUnsubscribe = socketManager.onOnlineStatus(({ userId, isOnline }) => {
      updateContact(userId, { isOnline });
    });
    
    return () => {
      // Clean up event listeners
      messageUnsubscribe();
      roomUpdateUnsubscribe();
      onlineStatusUnsubscribe();
    };
  }, [addMessage, addRoom, updateContact, activeRoomId]);
  
  const handleCreateChat = async (participants: string[], name: string, type: 'private' | 'group') => {
    if (!user) return;
    
    try {
      // Create a real room through our chat service
      const newRoom = await createRoom(participants, name, type);
      
      if (newRoom) {
        addRoom(newRoom);
        
        // Set this as the active room
        setActiveRoom(newRoom.id);
        
        // Join the socket.io room
        socketManager.joinRoom(newRoom.id);
        
        // In mobile view, switch to conversation view
        if (isMobileView) {
          setShowSidebar(false);
        }
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
