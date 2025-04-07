import React from 'react';
import { format } from 'date-fns';
import { FaCheckDouble, FaCheck } from 'react-icons/fa';

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName?: string;
  isRead?: boolean;
}

export default function ChatMessage({ content, timestamp, isOwn, senderName, isRead }: ChatMessageProps) {
  const formattedTime = format(new Date(timestamp), 'h:mm a');
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div 
        className={`message-bubble ${
          isOwn 
            ? 'own bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm' 
            : 'other bg-white border border-gray-200 text-gray-800 shadow-sm'
        }`}
      >
        {!isOwn && senderName && (
          <div className="text-xs font-medium text-indigo-600 mb-1">
            {senderName}
          </div>
        )}
        
        <div className="whitespace-pre-wrap break-words text-sm">
          {content}
        </div>
        
        <div className="flex items-center justify-end mt-1.5 space-x-1 text-xs">
          <span className={isOwn ? 'text-indigo-100' : 'text-gray-500'}>
            {formattedTime}
          </span>
          
          {isOwn && (
            <span className="flex items-center">
              {isRead ? (
                <FaCheckDouble className="w-3 h-3 ml-1 text-blue-300" />
              ) : (
                <FaCheck className="w-3 h-3 ml-1 text-indigo-100" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
