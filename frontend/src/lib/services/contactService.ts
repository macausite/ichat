import supabase from '../supabase';
import { User } from '../../types';

/**
 * Fetch all contacts for the current user
 * @returns Promise resolving to array of User objects
 */
export const fetchContacts = async (): Promise<User[]> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch contacts from Supabase
    // This assumes a "contacts" table with a user_id column to identify the owner
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        contact_id,
        user_profiles(id, email, full_name, avatar_url, last_seen)
      `)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Transform the data into the User interface format
    return (data || []).map(contact => {
      // Safe type assertion with unknown intermediate cast
      const profile = contact.user_profiles ? (contact.user_profiles as unknown as {
        id: string;
        email: string;
        full_name: string;
        avatar_url?: string;
        last_seen?: string;
      }) : {
        id: '',
        email: '',
        full_name: '',
        avatar_url: undefined,
        last_seen: undefined
      };
      
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        lastSeen: profile.last_seen,
        isOnline: isUserOnline(profile.last_seen)
      };
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    // If there's an error (like during development without proper DB setup),
    // fall back to mock contacts for testing
    return getFallbackContacts();
  }
};

/**
 * Add a new contact for the current user
 * @param contactEmail Email of the contact to add
 * @returns Promise resolving to the added User object
 */
export const addContact = async (contactEmail: string): Promise<User | null> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Find the user by email
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', contactEmail)
      .single();
    
    if (userError || !userProfiles) {
      throw new Error('User not found');
    }
    
    // Check if contact already exists
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .eq('contact_id', userProfiles.id)
      .single();
      
    if (existingContact) {
      throw new Error('Contact already exists');
    }
    
    // Create new contact
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        contact_id: userProfiles.id
      });
      
    if (insertError) {
      throw insertError;
    }
    
    // Return the added contact as a User object
    return {
      id: userProfiles.id,
      email: userProfiles.email,
      fullName: userProfiles.full_name,
      avatarUrl: userProfiles.avatar_url,
      lastSeen: userProfiles.last_seen,
      isOnline: isUserOnline(userProfiles.last_seen)
    };
  } catch (error) {
    console.error('Error adding contact:', error);
    return null;
  }
};

/**
 * Check if user is online based on last_seen timestamp
 * @param lastSeen Last seen timestamp
 * @returns Boolean indicating if user is considered online
 */
const isUserOnline = (lastSeen?: string): boolean => {
  if (!lastSeen) return false;
  
  // Consider user online if they were active in the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(lastSeen) > fiveMinutesAgo;
};

/**
 * Fallback method to get mock contacts for testing
 * @returns Array of mock User objects
 */
const getFallbackContacts = (): User[] => {
  return [
    {
      id: 'user1',
      email: 'sarah.johnson@example.com',
      fullName: 'Sarah Johnson',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 'user2',
      email: 'michael.chen@example.com',
      fullName: 'Michael Chen',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      avatarUrl: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: 'user3',
      email: 'emma.rodriguez@example.com',
      fullName: 'Emma Rodriguez',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      avatarUrl: 'https://i.pravatar.cc/150?img=3'
    },
    {
      id: 'user4',
      email: 'james.wilson@example.com',
      fullName: 'James Wilson',
      isOnline: false,
      lastSeen: new Date(Date.now() - 86400000).toISOString(),
      avatarUrl: 'https://i.pravatar.cc/150?img=4'
    },
    {
      id: 'user5',
      email: 'olivia.park@example.com',
      fullName: 'Olivia Park',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      avatarUrl: 'https://i.pravatar.cc/150?img=5'
    }
  ];
};
