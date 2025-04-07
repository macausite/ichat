import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Message {
  id?: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export const saveMessage = async (message: Message) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0];
  } catch (error) {
    throw error;
  }
};

export const getMessagesByRoom = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('roomId', roomId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  saveMessage,
  getMessagesByRoom
};
