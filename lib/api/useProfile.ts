/**
 * MOCK-FIRST: returns fixtures until types/database.ts lands (AI-CONTEXT §2).
 * Swap internals only; keep this signature stable so feature screens never change.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile } from '../../mocks/types';
import { mockProfile } from '../../mocks/fixtures';
import { queryKeys } from '../queryKeys';

export function useProfile() {
  return useQuery<Profile>({
    queryKey: queryKeys.profile.all,
    queryFn: async () => ({ ...mockProfile }),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<Pick<Profile, 'username' | 'selected_goals' | 'age_range' | 'location'>>,
    ) => {
      Object.assign(mockProfile, updates);
      return { ...mockProfile };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
