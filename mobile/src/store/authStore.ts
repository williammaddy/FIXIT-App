import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { authApi } from '../services/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  login: (token: string, user: User) => Promise<void>;
  register: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  login: async (token: string, user: User) => {
    await SecureStore.setItemAsync('token', token);
    set({ token, user });
  },

  register: async (token: string, user: User) => {
    await SecureStore.setItemAsync('token', token);
    set({ token, user });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('token');
    } catch (e) {}
    set({ token: null, user: null });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          set({ token, user: res.data, isHydrated: true });
          return;
        }
      }
    } catch (e) {
      try {
        await SecureStore.deleteItemAsync('token');
      } catch (err) {}
    }
    set({ token: null, user: null, isHydrated: true });
  },

  updateUser: (user: User) => {
    set({ user });
  },
}));
