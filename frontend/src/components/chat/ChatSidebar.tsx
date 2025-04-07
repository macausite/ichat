import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaEllipsisV, FaUserCircle, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import { format } from 'date-fns';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';

interface ChatSidebarProps {
  onCreateChat: () => void;
}

export default function ChatSidebar({ onCreateChat }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const { activeRoomId, rooms, setActiveRoom } = useChatStore();
  const { user, signOut } = useAuthStore();
  
  // Count total unread messages
  const totalUnreadCount = rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
  
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);
  
  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white shadow-md">
      {/* User Profile Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
        <div className="relative flex-shrink-0 mr-3">
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name || 'User'}
              width={48}
              height={48}
              className="rounded-full border-2 border-white"
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full">
              <span className="text-lg font-semibold">
                {user?.full_name?.substring(0, 1) || 'U'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <h2 className="text-lg font-semibold truncate">{user?.full_name || 'User'}</h2>
          <p className="text-xs text-indigo-100">Online</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-white rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none transition-all"
          >
            <FaEllipsisV className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 animate-fade-in">
              <div className="py-1">
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaUserCircle className="mr-2" />
                  Profile
                </button>
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaUsers className="mr-2" />
                  New Group
                </button>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between p-4 border-b border-gray-200">
        <button 
          onClick={onCreateChat} 
          className="flex items-center justify-center w-full py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          <FaEdit className="mr-2" />
          New Conversation
        </button>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative focus-within-ring rounded-md overflow-hidden">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none transition-all"
          />
        </div>
      </div>
      
      {/* Conversation List */}
      <div className="flex-grow overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isActive = room.id === activeRoomId;
            const lastMessageTime = room.lastMessage?.timestamp 
              ? format(new Date(room.lastMessage.timestamp), 'h:mm a')
              : '';
            
            return (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`flex items-center p-4 cursor-pointer border-l-4 ${
                  isActive 
                    ? 'bg-indigo-50 border-indigo-500' 
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0 mr-3">
                  {room.type === 'group' ? (
                    <div className="flex items-center justify-center w-12 h-12 text-white bg-indigo-500 rounded-full">
                      {room.name.substring(0, 2).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                      {room.participants[0]?.avatarUrl ? (
                        <Image
                          src={room.participants[0].avatarUrl}
                          alt={room.name}
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-white bg-indigo-500">
                          {room.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {room.participants.some(p => p.isOnline) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium truncate">{room.name}</h3>
                    <span className="text-xs text-gray-500">{lastMessageTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">
                      {room.lastMessage?.content || 'No messages yet'}
                    </p>
                    
                    {room.unreadCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 ml-2 text-xs text-white bg-indigo-500 rounded-full">
                        {room.unreadCount > 9 ? '9+' : room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
