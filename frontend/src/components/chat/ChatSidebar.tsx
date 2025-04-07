import React, { useState } from 'react';
import { FaSearch, FaEdit, FaEllipsisV } from 'react-icons/fa';
import Image from 'next/image';
import { format } from 'date-fns';
import useChatStore from '../../store/useChatStore';

interface ChatSidebarProps {
  onCreateChat: () => void;
}

export default function ChatSidebar({ onCreateChat }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { rooms, activeRoomId, setActiveRoom } = useChatStore();
  
  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Chats</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onCreateChat}
            className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none"
          >
            <FaEdit className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none">
            <FaEllipsisV className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 text-sm bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute w-4 h-4 text-gray-500 left-4 top-3" />
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
