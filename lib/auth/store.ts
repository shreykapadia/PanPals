import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  session: { user: AuthUser } | null;
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

function toAuthSession(session: Session | null): { user: AuthUser } | null {
  if (!session?.user?.email) return null;
  return { user: { id: session.user.id, email: session.user.email } };
}

/**
 * Real Supabase auth. `session`/`user` are kept in sync by the
 * onAuthStateChange listener below, not set directly inside signUp/signIn —
 * that's the one place Supabase's own state changes flow from.
 */
export const useAuthStore = create<AuthState>(() => ({
  session: null,
  user: null,
  isLoading: true,
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // If the project has "Confirm email" enabled, signUp succeeds but
    // returns no session until the user clicks the confirmation link —
    // the caller needs to know this to show the right message instead of
    // silently failing forward to a screen that assumes a live session.
    return { needsEmailConfirmation: !data.session };
  },
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  deleteAccount: async () => {
    // Deletes the caller's own profile row, which cascades to every table
    // that references it (products, wishlist_items, empties,
    // analytics_events, and usage_logs via products) per the FKs in
    // supabase/migrations/*_core_schema.sql. This does not remove the
    // underlying auth.users row — that requires the service role and is
    // out of a client app's reach by design. Real full-account deletion
    // (including the login credential itself) needs a server-side
    // Edge Function or admin RPC — a supabase/* change, out of this
    // phase's lib/*-only scope. Flagged as a known follow-up.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').delete().eq('id', user.id);
      if (error) throw error;
    }
    await supabase.auth.signOut();
  },
}));

supabase.auth.onAuthStateChange((_event, session) => {
  const authSession = toAuthSession(session);
  useAuthStore.setState({
    session: authSession,
    user: authSession?.user ?? null,
    isLoading: false,
  });
});
