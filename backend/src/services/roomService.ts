import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Room {
  id?: string;
  name: string;
  type: 'private' | 'group';
  createdAt: string;
  updatedAt: string;
}

export interface RoomUser {
  roomId: string;
  userId: string;
  joinedAt: string;
}

export const createRoom = async (room: Room, participants: string[]) => {
  try {
    // Start a transaction
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert([room])
      .select();
    
    if (roomError) {
      throw roomError;
    }
    
    const newRoom = roomData[0];
    
    // Add participants to the room
    const roomUsers = participants.map(userId => ({
      roomId: newRoom.id,
      userId,
      joinedAt: new Date().toISOString()
    }));
    
    const { error: participantError } = await supabase
      .from('room_users')
      .insert(roomUsers);
    
    if (participantError) {
      throw participantError;
    }
    
    return newRoom;
  } catch (error) {
    throw error;
  }
};

export const getRoomsByUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('room_users')
      .select(`
        roomId,
        rooms:roomId(*)
      `)
      .eq('userId', userId);
    
    if (error) {
      throw error;
    }
    
    return data.map(item => item.rooms);
  } catch (error) {
    throw error;
  }
};

export const getRoomParticipants = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from('room_users')
      .select(`
        userId,
        users:userId(id, email, full_name, avatar_url)
      `)
      .eq('roomId', roomId);
    
    if (error) {
      throw error;
    }
    
    return data.map(item => item.users);
  } catch (error) {
    throw error;
  }
};

export default {
  createRoom,
  getRoomsByUser,
  getRoomParticipants
};
