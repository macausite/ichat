import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Import Room, Message, and User from the central types file
import { Room as RoomType, Message as MessageType, User as UserType } from '../types';

// Extend the types for local use
interface Message extends MessageType {}

interface Room extends RoomType {
  // Ensure required properties for store operations
  unreadCount: number;
}

interface User extends UserType {}

interface ChatState {
  activeRoomId: string | null;
  rooms: Room[];
  messages: Record<string, Message[]>;
  contacts: User[];
  isLoading: boolean;
  error: string | null;
  
  setActiveRoom: (roomId: string | null) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, data: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;
  addMessage: (message: Message) => void;
  markMessagesAsRead: (roomId: string) => void;
  addContact: (contact: User) => void;
  updateContact: (userId: string, data: Partial<User>) => void;
  removeContact: (userId: string) => void;
}

const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeRoomId: null,
      rooms: [],
      messages: {},
      contacts: [],
      isLoading: false,
      error: null,
      
      setActiveRoom: (roomId) => {
        set({ activeRoomId: roomId });
        if (roomId) {
          // Mark messages as read when opening a room
          get().markMessagesAsRead(roomId);
        }
      },
      
      addRoom: (room) => {
        set((state) => ({
          rooms: [...state.rooms.filter(r => r.id !== room.id), room],
          messages: {
            ...state.messages,
            [room.id]: state.messages[room.id] || []
          }
        }));
      },
      
      updateRoom: (roomId, data) => {
        set((state) => ({
          rooms: state.rooms.map(room => 
            room.id === roomId ? { ...room, ...data } : room
          )
        }));
      },
      
      removeRoom: (roomId) => {
        set((state) => {
          const { [roomId]: _, ...remainingMessages } = state.messages;
          return {
            rooms: state.rooms.filter(room => room.id !== roomId),
            messages: remainingMessages,
            activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId
          };
        });
      },
      
      addMessage: (message) => {
        set((state) => {
          // Update messages for the specific room
          const roomMessages = [...(state.messages[message.roomId] || [])];
          
          // Avoid duplicate messages
          if (!roomMessages.some(m => m.id === message.id)) {
            roomMessages.push(message);
            roomMessages.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          }
          
          // Update unread count if this is not the active room
          const isActiveRoom = state.activeRoomId === message.roomId;
          const updatedRooms = state.rooms.map(room => {
            if (room.id === message.roomId) {
              return {
                ...room,
                last_message: message,
                unreadCount: isActiveRoom ? 0 : (room.unreadCount || 0) + 1
              };
            }
            return room;
          });
          
          return {
            messages: {
              ...state.messages,
              [message.roomId]: roomMessages
            },
            rooms: updatedRooms
          };
        });
      },
      
      markMessagesAsRead: (roomId) => {
        set((state) => {
          // Mark all messages in the room as read
          const roomMessages = state.messages[roomId] || [];
          const updatedMessages = roomMessages.map(msg => ({
            ...msg,
            read: true
          }));
          
          // Reset unread count for the room
          const updatedRooms = state.rooms.map(room => 
            room.id === roomId ? { ...room, unreadCount: 0 } : room
          );
          
          return {
            messages: {
              ...state.messages,
              [roomId]: updatedMessages
            },
            rooms: updatedRooms
          };
        });
      },
      
      addContact: (contact) => {
        set((state) => ({
          contacts: [...state.contacts.filter(c => c.id !== contact.id), contact]
        }));
      },
      
      updateContact: (userId, data) => {
        set((state) => ({
          contacts: state.contacts.map(contact => 
            contact.id === userId ? { ...contact, ...data } : contact
          )
        }));
      },
      
      removeContact: (userId) => {
        set((state) => ({
          contacts: state.contacts.filter(contact => contact.id !== userId)
        }));
      }
    }),
    {
      name: 'ichat-store'
    }
  )
);

export default useChatStore;
