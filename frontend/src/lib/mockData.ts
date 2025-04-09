// Mock data for testing the iChat application
import { User } from '../types';

/**
 * Generates a list of mock contacts to populate the chat interface
 * @returns Array of User objects
 */
export const generateMockContacts = (): User[] => {
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
      lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
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
      lastSeen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
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

/**
 * Simulates loading contacts from an API with a delay
 * @returns Promise that resolves to an array of User objects
 */
export const fetchMockContacts = async (): Promise<User[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockContacts());
    }, 500);
  });
};
