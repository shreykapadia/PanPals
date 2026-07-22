import { create } from 'zustand';

interface AuthState {
  session: { user: { id: string; email: string } } | null;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: { user: { id: 'mock-user-123', email: 'maya@panpals.app' } }, // default to signed in for developer preview
  isLoading: false,
  signIn: () => set({ session: { user: { id: 'mock-user-123', email: 'maya@panpals.app' } } }),
  signOut: () => set({ session: null }),
}));
