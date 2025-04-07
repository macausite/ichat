import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (participants: string[], name: string, type: 'private' | 'group') => void;
}

export default function NewChatDialog({ isOpen, onClose, onCreateChat }: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const { contacts } = useChatStore();
  const { user } = useAuthStore();
  
  if (!isOpen) return null;
  
  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleCreateChat = () => {
    if (selectedUsers.length === 0) return;
    
    // Determine if it's a private or group chat
    const isGroup = selectedUsers.length > 1;
    const chatType = isGroup ? 'group' : 'private';
    
    // For private chats, use the contact's name
    // For group chats, use the provided group name or a default
    let chatName = '';
    
    if (isGroup) {
      chatName = groupName.trim() || `Group (${selectedUsers.length + 1})`;
    } else {
      const contact = contacts.find(c => c.id === selectedUsers[0]);
      chatName = contact?.fullName || contact?.email || 'Chat';
    }
    
    onCreateChat(selectedUsers, chatName, chatType);
    
    // Reset state
    setSelectedUsers([]);
    setGroupName('');
    setSearchQuery('');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        {selectedUsers.length > 1 && (
          <div className="mb-4">
            <label htmlFor="groupName" className="block mb-1 text-sm font-medium text-gray-700">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute w-5 h-5 text-gray-400 left-3 top-2.5" />
          </div>
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUsers.map(userId => {
              const contact = contacts.find(c => c.id === userId);
              return (
                <div 
                  key={userId}
                  className="flex items-center px-3 py-1 text-sm bg-indigo-100 rounded-full"
                >
                  <span className="mr-1">{contact?.fullName || contact?.email || 'User'}</span>
                  <button
                    onClick={() => handleSelectUser(userId)}
                    className="text-indigo-500 hover:text-indigo-700 focus:outline-none"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-md">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No contacts found
            </div>
          ) : (
            filteredContacts.map(contact => {
              // Don't show current user
              if (contact.id === user?.id) return null;
              
              const isSelected = selectedUsers.includes(contact.id);
              
              return (
                <div
                  key={contact.id}
                  onClick={() => handleSelectUser(contact.id)}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 mr-3 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                    {(contact.fullName || contact.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">
                      {contact.fullName || 'Unnamed User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {contact.email || 'No email'}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 ml-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      isSelected 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          
          <button
            onClick={handleCreateChat}
            disabled={selectedUsers.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              selectedUsers.length === 0 
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
