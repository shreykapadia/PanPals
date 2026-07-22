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
      updates: Partial<Pick<Profile, 'username' | 'selected_goals' | 'age_range' | 'location'>>,
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');

      // upsert, not update: goal-capture is the FIRST write for a new
      // account — there's no profiles row yet at that point (no
      // auto-create-on-signup trigger). Later calls (You tab's edit
      // goals) hit the same row and behave like a normal partial update.
      // Cast: supabase-js's upsert typing wants the full Insert shape
      // (e.g. selected_goals present) since it could be creating a new
      // row. In practice a partial update only ever runs against an
      // already-existing row (You tab's edit goals), so this is safe.
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates } as ProfileInsert, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
