import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useProducts,
  useSimilarOwned,
  useWishlist,
  useDashboard,
  useEmpties,
  useFinishProduct,
  useCatalogSearch,
} from '../index';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('API Hooks (Mock-First Data Layer)', () => {
  it('useProducts returns mock products list', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('useSimilarOwned counts active products in category', async () => {
    const { result } = renderHook(() => useSimilarOwned('lip'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.count).toBeGreaterThan(0);
  });

  it('useWishlist returns items and handles cooling off date check', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const items = result.current.data || [];
    expect(items.some((w) => w.status === 'ready')).toBe(true);
  });

  it('useDashboard aggregates dashboard payload in one structure', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.focus_products.length).toBeLessThanOrEqual(5);
    expect(result.current.data?.profile.username).toBe('maya_panpals');
  });

  it('useCatalogSearch filters products by query prefix', async () => {
    const { result } = renderHook(() => useCatalogSearch('rare'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].brand).toBe('Rare Beauty');
  });

  it('useFinishProduct finishes product and creates private empty record', async () => {
    const { result: finishHook } = renderHook(() => useFinishProduct(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await finishHook.current.mutateAsync({
        productId: 'prod-1',
        repurchase: 'yes',
        reviewText: 'Loved it!',
      });
    });

    const { result: emptiesHook } = renderHook(() => useEmpties(), { wrapper: createWrapper() });
    await waitFor(() => expect(emptiesHook.current.isSuccess).toBe(true));
    expect(emptiesHook.current.data?.some((e) => e.product_id === 'prod-1')).toBe(true);
  });
});
