import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import supabase from '../lib/supabase';

import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string | undefined;
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,

      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Convert Supabase user to our User type
          const user: User = {
            id: data.user?.id || '',
            email: data.user?.email,
            full_name: data.user?.user_metadata?.full_name,
            avatar_url: data.user?.user_metadata?.avatar_url
          };

          set({
            user,
            session: data.session,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      signUp: async (email, password, fullName) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

          if (error) throw error;

          // Convert Supabase user to our User type
          const user: User = {
            id: data.user?.id || '',
            email: data.user?.email,
            full_name: data.user?.user_metadata?.full_name,
            avatar_url: data.user?.user_metadata?.avatar_url
          };

          set({
            user,
            session: data.session,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.signOut();
          
          if (error) throw error;
          
          set({
            user: null,
            session: null,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.updateUser({
            data
          });
          
          if (error) throw error;
          
          // Update local user data
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
    }),
    {
      name: 'ichat-auth-storage',
    }
  )
);

export default useAuthStore;
