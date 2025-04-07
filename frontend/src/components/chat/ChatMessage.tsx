import React from 'react';
import { format } from 'date-fns';

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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
        isOwn 
          ? 'bg-indigo-500 text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}>
        {!isOwn && senderName && (
          <div className="text-xs font-medium mb-1">
            {senderName}
          </div>
        )}
        
        <div className="text-sm">
          {content}
        </div>
        
        <div className="flex items-center justify-end mt-1 text-xs">
          <span className={isOwn ? 'text-indigo-100' : 'text-gray-500'}>
            {formattedTime}
          </span>
          
          {isOwn && (
            <span className="ml-1">
              {isRead ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-400">
                  <path d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
