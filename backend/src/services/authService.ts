import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export const verifyToken = async (token: string) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      throw new Error('Invalid or expired token');
    }
    
    return data.user;
  } catch (error) {
    throw error;
  }
};

export default {
  verifyToken
};
