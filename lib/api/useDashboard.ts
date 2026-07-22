/**
 * MOCK-FIRST: returns fixtures until types/database.ts lands (AI-CONTEXT §2).
 * Swap internals only; keep this signature stable so feature screens never change.
 */

import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '../../mocks/types';
import { mockDashboardData, mockProfile } from '../../mocks/fixtures';
import { queryKeys } from '../queryKeys';

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard.all,
    queryFn: async () => {
      // Return fresh computed structure based on current state
      return {
        ...mockDashboardData,
        profile: mockProfile,
        streak: {
          current_streak: mockProfile.current_streak,
          longest_streak: mockProfile.longest_streak,
          last_log_date: mockProfile.last_log_date,
        },
      };
    },
  });
}
