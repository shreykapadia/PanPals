import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile } from '../../mocks/types';
import { Database } from '../../types/database';
import { queryKeys } from '../queryKeys';
import { supabase } from '../supabase';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export function useProfile() {
  return useQuery<Profile>({
    queryKey: queryKeys.profile.all,
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<
        Pick<
          Profile,
          'username' | 'selected_goals' | 'age_range' | 'location' | 'reminders_enabled'
        >
      >,
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');

      // Try updating existing profile row first (avoids Postgres NOT NULL check on untouched columns during upsert)
      const { data: existingData, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      if (existingData) return existingData as Profile;

      // Profile row does not exist yet (e.g. initial onboarding).
      // Fallback username ensures creating a row never violates NOT NULL constraint.
      const fallbackUsername = updates.username || user.email?.split('@')[0] || 'panpal';
      const insertPayload: ProfileInsert = {
        id: user.id,
        username: fallbackUsername,
        selected_goals: updates.selected_goals ?? [],
        ...updates,
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('profiles')
        .upsert(insertPayload, { onConflict: 'id' })
        .select()
        .single();

      if (insertError) throw insertError;
      return insertedData as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
