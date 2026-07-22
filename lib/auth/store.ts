import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const SIGNED_IN_KEY = 'panpals_signed_in';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  session: { user: AuthUser } | null;
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

/**
 * MOCK-FIRST: fabricates a session in-memory and persists only a signed-in
 * flag via expo-secure-store. Real Supabase auth wiring is Phase 2
 * (AI-CONTEXT §2) — keep this shape stable so screens never change.
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  signUp: async (email: string) => {
    const user: AuthUser = { id: 'mock-user-123', email };
    await SecureStore.setItemAsync(SIGNED_IN_KEY, 'true');
    set({ session: { user }, user, isLoading: false });
  },
  signIn: async (email: string) => {
    const user: AuthUser = { id: 'mock-user-123', email };
    await SecureStore.setItemAsync(SIGNED_IN_KEY, 'true');
    set({ session: { user }, user, isLoading: false });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync(SIGNED_IN_KEY);
    set({ session: null, user: null, isLoading: false });
  },
  deleteAccount: async () => {
    // MOCK-FIRST: real account + data deletion is Phase 2. For now this
    // behaves like sign-out so the UI flow (confirm -> deleted -> welcome)
    // is fully exercisable against the mock store.
    await SecureStore.deleteItemAsync(SIGNED_IN_KEY);
    set({ session: null, user: null, isLoading: false });
  },
}));

SecureStore.getItemAsync(SIGNED_IN_KEY)
  .then((flag) => {
    if (flag === 'true') {
      const user: AuthUser = { id: 'mock-user-123', email: 'maya@panpals.app' };
      useAuthStore.setState({ session: { user }, user, isLoading: false });
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  })
  .catch(() => {
    useAuthStore.setState({ isLoading: false });
  });
