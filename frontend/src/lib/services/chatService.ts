import supabase from '../supabase';
import { Room, Message, User } from '../../types';

/**
 * Fetch rooms (conversations) for the current user
 * @returns Promise resolving to array of Room objects
 */
export const fetchRooms = async (): Promise<Room[]> => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch rooms where the user is a participant
    const { data: roomParticipants, error: roomsError } = await supabase
      .from('room_participants')
      .select(`
        room_id,
        rooms(id, name, type, created_at, updated_at)
      `)
      .eq('user_id', user.id);

    if (roomsError) {
      throw roomsError;
    }

    // For each room, get the participants and last message
    const rooms = await Promise.all((roomParticipants || []).map(async ({ room_id, rooms: roomData }) => {
      // Extract room data safely using type assertion
      // First cast to unknown, then to the desired type
      const room = roomData ? (roomData as unknown as {
        id: string;
        name: string;
        type: 'private' | 'group';
        created_at: string;
        updated_at: string;
      }) : {
        // Default values if roomData is missing
        id: room_id,
        name: 'Chat',
        type: 'private' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select(`
          user_profiles(id, email, full_name, avatar_url, last_seen)
        `)
        .eq('room_id', room_id);

      if (participantsError) {
        console.error('Error fetching room participants:', participantsError);
        return null;
      }

      // Get last message
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', room_id)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (messagesError) {
        console.error('Error fetching last message:', messagesError);
      }

      // Get unread count
      const { data: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('room_id', room_id)
        .eq('read', false)
        .neq('sender_id', user.id);

      if (unreadError) {
        console.error('Error fetching unread count:', unreadError);
      }

      const lastMessage = messages && messages.length > 0 
        ? formatMessage(messages[0]) 
        : undefined;

      // Properly type and extract user_profiles
      const formattedParticipants = participants
        ? participants.map(p => {
            // Type the nested user_profiles object safely
            const profile = p.user_profiles ? (p.user_profiles as unknown as {
              id: string;
              email: string;
              full_name: string;
              avatar_url?: string;
              last_seen?: string;
            }) : null;
            
            if (!profile) return null;
            
            if (profile.id === user.id) return null; // Exclude current user
            
            return {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              avatarUrl: profile.avatar_url,
              lastSeen: profile.last_seen,
              isOnline: isUserOnline(profile.last_seen)
            };
          }).filter(Boolean) // Remove null entries
        : [];

      return {
        id: room_id,
        name: room.type === 'private' && formattedParticipants.length === 1
          ? formattedParticipants[0]?.fullName || formattedParticipants[0]?.email || 'Chat'
          : room.name,
        type: room.type,
        last_message: lastMessage, // Use the correct field name to match the Room type
        unreadCount: unreadCount?.length || 0,
        participants: formattedParticipants as User[],  // Cast to correct type
        createdAt: room.created_at,
        updatedAt: room.updated_at
      };
    }));

    return rooms.filter(room => room !== null) as Room[];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Fallback to mock rooms for testing
    return getFallbackRooms();
  }
};

/**
 * Fetch messages for a specific room
 * @param roomId ID of the room to fetch messages for
 * @returns Promise resolving to array of Message objects
 */
export const fetchMessages = async (roomId: string): Promise<Message[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get messages for the room
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(message => formatMessage(message));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Create a new room (conversation)
 * @param participants Array of user IDs to include in the room
 * @param name Name of the room (for group chats)
 * @param type Type of room ('private' or 'group')
 * @returns Promise resolving to the created Room object
 */
export const createRoom = async (
  participants: string[],
  name: string,
  type: 'private' | 'group'
): Promise<Room | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First check if a private room already exists between these users
    if (type === 'private' && participants.length === 1) {
      const existingRoom = await findExistingPrivateRoom(user.id, participants[0]);
      if (existingRoom) {
        console.log('Existing private room found:', existingRoom);
        return existingRoom;
      }
    }

    // Create new room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name: type === 'group' ? name : null,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (roomError || !room) {
      throw roomError || new Error('Failed to create room');
    }

    // Add all participants including the current user
    const allParticipants = [...participants, user.id];
    
    // Create room participants records
    const participantRecords = allParticipants.map(userId => ({
      room_id: room.id,
      user_id: userId,
      joined_at: new Date().toISOString()
    }));

    const { error: participantsError } = await supabase
      .from('room_participants')
      .insert(participantRecords);

    if (participantsError) {
      // Try to rollback room creation
      await supabase.from('rooms').delete().eq('id', room.id);
      throw participantsError;
    }

    // Fetch participant profiles
    const { data: participantData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', participants);

    if (profilesError) {
      console.error('Error fetching participant profiles:', profilesError);
    }

    const formattedParticipants: User[] = (participantData || []).map(p => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      avatarUrl: p.avatar_url,
      lastSeen: p.last_seen,
      isOnline: isUserOnline(p.last_seen)
    }));

    return {
      id: room.id,
      name: type === 'private' && formattedParticipants.length === 1
        ? formattedParticipants[0]?.fullName || formattedParticipants[0]?.email || 'Chat'
        : name,
      type,
      unreadCount: 0,
      participants: formattedParticipants,
      createdAt: room.created_at,
      updatedAt: room.updated_at
    };
  } catch (error) {
    console.error('Error creating room:', error);
    return null;
  }
};

/**
 * Send a message to a room
 * @param roomId ID of the room to send the message to
 * @param content Content of the message
 * @returns Promise resolving to the sent Message object
 */
export const sendMessage = async (roomId: string, content: string): Promise<Message | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const message = {
      room_id: roomId,
      sender_id: user.id,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update room's updated_at timestamp
    await supabase
      .from('rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId);

    return formatMessage(data);
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

/**
 * Mark messages in a room as read
 * @param roomId ID of the room to mark messages as read
 * @returns Promise resolving to a boolean indicating success
 */
export const markMessagesAsRead = async (roomId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('room_id', roomId)
      .neq('sender_id', user.id)
      .eq('read', false);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

/**
 * Find an existing private room between two users
 * @param userId1 ID of the first user
 * @param userId2 ID of the second user
 * @returns Promise resolving to the Room object if found, null otherwise
 */
const findExistingPrivateRoom = async (userId1: string, userId2: string): Promise<Room | null> => {
  // Find rooms where user 1 is a participant
  const { data: user1Rooms, error: user1Error } = await supabase
    .from('room_participants')
    .select('room_id')
    .eq('user_id', userId1);

  if (user1Error || !user1Rooms.length) {
    return null;
  }

  // Find rooms where user 2 is a participant
  const { data: user2Rooms, error: user2Error } = await supabase
    .from('room_participants')
    .select('room_id')
    .eq('user_id', userId2)
    .in('room_id', user1Rooms.map(r => r.room_id));

  if (user2Error || !user2Rooms.length) {
    return null;
  }

  // Find private rooms among the common rooms
  const commonRoomIds = user2Rooms.map(r => r.room_id);
  
  const { data: privateRooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*')
    .eq('type', 'private')
    .in('id', commonRoomIds);

  if (roomsError || !privateRooms.length) {
    return null;
  }

  // For each potential private room, check if it has exactly 2 participants
  for (const room of privateRooms) {
    const { data: participants, error: participantsError } = await supabase
      .from('room_participants')
      .select('user_id')
      .eq('room_id', room.id);

    if (participantsError || !participants) continue;

    if (participants.length === 2) {
      // Found a private room with exactly these two users
      return await fetchRoomById(room.id);
    }
  }

  return null;
};

/**
 * Fetch a specific room by ID
 * @param roomId ID of the room to fetch
 * @returns Promise resolving to the Room object
 */
export const fetchRoomById = async (roomId: string): Promise<Room | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get room data
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      throw roomError || new Error('Room not found');
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('room_participants')
      .select(`
        user_profiles(id, email, full_name, avatar_url, last_seen)
      `)
      .eq('room_id', roomId);

    if (participantsError) {
      throw participantsError;
    }

    // Get last message
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (messagesError) {
      console.error('Error fetching last message:', messagesError);
    }

    // Get unread count
    const { data: unreadCount, error: unreadError } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('room_id', roomId)
      .eq('read', false)
      .neq('sender_id', user.id);

    if (unreadError) {
      console.error('Error fetching unread count:', unreadError);
    }

    const lastMessage = messages && messages.length > 0 
      ? formatMessage(messages[0]) 
      : undefined;

    // Properly type and extract user_profiles
    const formattedParticipants = participants
      ? participants.map(p => {
          // Type the nested user_profiles object safely
          const profile = p.user_profiles ? (p.user_profiles as unknown as {
            id: string;
            email: string;
            full_name: string;
            avatar_url?: string;
            last_seen?: string;
          }) : null;
          
          if (!profile) return null;
          
          if (profile.id === user.id) return null; // Exclude current user
          
          return {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            lastSeen: profile.last_seen,
            isOnline: isUserOnline(profile.last_seen)
          };
        }).filter(Boolean) // Remove null entries
      : [];

    const roomName = room.type === 'private' && formattedParticipants.length === 1
      ? formattedParticipants[0]?.fullName || formattedParticipants[0]?.email || 'Chat'
      : room.name;

    return {
      id: room.id,
      name: roomName,
      type: room.type,
      last_message: lastMessage, // Use the correct field name to match the Room type
      unreadCount: unreadCount?.length || 0,
      participants: formattedParticipants as User[],  // Cast to correct type
      createdAt: room.created_at,
      updatedAt: room.updated_at
    };
  } catch (error) {
    console.error('Error fetching room by id:', error);
    return null;
  }
};

/**
 * Format a database message object to the Message interface
 * @param dbMessage Database message record
 * @returns Formatted Message object
 */
const formatMessage = (dbMessage: any): Message => {
  return {
    id: dbMessage.id,
    roomId: dbMessage.room_id,
    senderId: dbMessage.sender_id,
    content: dbMessage.content,
    timestamp: dbMessage.timestamp,
    read: dbMessage.read
  };
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
 * Fallback method to get mock rooms for testing
 * @returns Array of mock Room objects
 */
const getFallbackRooms = (): Room[] => {
  const mockUsers = [
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
    }
  ];
  
  return [
    {
      id: 'room1',
      name: 'Sarah Johnson',
      type: 'private',
      unreadCount: 2,
      participants: [mockUsers[0]],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      last_message: {
        id: 'msg1',
        roomId: 'room1',
        senderId: 'user1',
        content: 'Hi there! How are you doing today?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      }
    },
    {
      id: 'room2',
      name: 'Michael Chen',
      type: 'private',
      unreadCount: 0,
      participants: [mockUsers[1]],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      last_message: {
        id: 'msg2',
        roomId: 'room2',
        senderId: 'self',
        content: 'Let me know when you have time to meet.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      }
    }
  ];
};
