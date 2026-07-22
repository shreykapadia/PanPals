import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '../../mocks/types';
import { queryKeys } from '../queryKeys';
import { supabase } from '../supabase';

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard.all,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard');
      if (error) throw error;
      return data as unknown as DashboardData;
    },
  });
}
