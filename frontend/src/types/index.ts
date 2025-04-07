import { User as SupabaseAuthUser } from '@supabase/supabase-js';

export interface SupabaseUser extends SupabaseAuthUser {
  user_metadata: {
    full_name?: string;
  };
}

export interface Message {
  id: string;
  roomId: string; // Changed from room_id to match implementation
  senderId: string; // Changed from sender_id to match implementation
  content: string;
  timestamp: string;
  read: boolean;
  sender_name?: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Participant {
  id: string;
  fullName: string;
  isOnline: boolean;
  email?: string; // Added to match User interface requirements
}

export interface Room {
  id: string;
  name: string;
  type: 'private' | 'group';
  createdAt?: string; // Changed from created_at to match implementation
  updatedAt?: string; // Changed from updated_at to match implementation
  created_at?: string; // Keep for backward compatibility
  updated_at?: string; // Keep for backward compatibility
  last_message?: Message;
  unread_count?: number;
  unreadCount?: number; // Add camelCase version
  participants?: User[] | Participant[]; // Support both User and Participant arrays
}

export interface RoomUser {
  room_id: string;
  user_id: string;
  joined_at: string;
  is_admin?: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  session: any; // Can be typed more specifically if needed
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ChatState {
  activeRoomId: string | null;
  rooms: Room[];
  messages: Record<string, Message[]>;
  setActiveRoom: (roomId: string | null) => void;
  addRoom: (room: Room) => void;
  addMessage: (message: Message) => void;
  markMessagesAsRead: (roomId: string) => void;
}

export interface TypingState {
  [roomId: string]: {
    [userId: string]: {
      username: string;
      timestamp: number;
    };
  };
}
