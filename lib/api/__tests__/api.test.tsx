import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useProducts,
  useSimilarOwned,
  useUsageLogs,
  useUpdateProduct,
  useDeleteProduct,
  useWishlist,
  useDashboard,
  useEmpties,
  useFinishProduct,
  useCatalogSearch,
  useProfile,
  useUpdateProfile,
  type ProductPatch,
} from '../index';
import type { Product, Profile } from '../../../mocks/types';
import {
  mockFrom,
  mockRpc,
  resetSupabaseMock,
  chainableResult,
} from '../../testUtils/supabaseMock';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../supabase', () => require('../../testUtils/supabaseMock'));

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

describe('API Hooks (real Supabase client, mocked)', () => {
  beforeEach(() => {
    resetSupabaseMock();
  });

  it('useProducts returns the products list', async () => {
    mockFrom.mockReturnValue(
      chainableResult({ data: [{ id: 'prod-1', name: 'Test Product' }], error: null }),
    );

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('useSimilarOwned counts active products in category', async () => {
    mockRpc.mockResolvedValue({
      data: { count: 3, products: [{ id: 'prod-2' }, { id: 'prod-3' }, { id: 'prod-4' }] },
      error: null,
    });

    const { result } = renderHook(() => useSimilarOwned('lip'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRpc).toHaveBeenCalledWith('find_similar_owned', {
      category: 'lip',
      exclude_product_id: undefined,
    });
    expect(result.current.data?.count).toBeGreaterThan(0);
  });

  it('useUsageLogs returns one product’s history newest-first', async () => {
    const builder = chainableResult({
      data: [
        { id: 'log-2', product_id: 'prod-1', percent_after: 60, logged_at: '2026-07-26T09:00:00Z' },
        { id: 'log-1', product_id: 'prod-1', percent_after: 80, logged_at: '2026-07-20T09:00:00Z' },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const { result } = renderHook(() => useUsageLogs('prod-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFrom).toHaveBeenCalledWith('usage_logs');
    expect(builder.order).toHaveBeenCalledWith('logged_at', { ascending: false });
    expect(builder.eq).toHaveBeenCalledWith('product_id', 'prod-1');
    expect(result.current.data?.[0].id).toBe('log-2');
  });

  it('useUsageLogs without a product id reads every log the user owns', async () => {
    const builder = chainableResult({
      data: [{ id: 'log-9', product_id: 'prod-7', percent_after: 45 }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const { result } = renderHook(() => useUsageLogs(undefined, { limit: 20 }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // No owner filter — usage_logs_select_own already scopes the read.
    expect(builder.eq).not.toHaveBeenCalled();
    expect(builder.limit).toHaveBeenCalledWith(20);
    expect(result.current.data?.length).toBe(1);
  });

  it('useUpdateProduct applies a partial patch, including a direct percent correction', async () => {
    const builder = chainableResult({
      data: { id: 'prod-1', name: 'Corrected Name', percent_remaining: 40 },
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() });
    // Assert on the mutation's return value, not the hook's rendered `data` —
    // the latter depends on a post-await re-render and flakes.
    let updated: Product | undefined;
    await act(async () => {
      updated = await result.current.mutateAsync({
        productId: 'prod-1',
        patch: { name: 'Corrected Name', percent_remaining: 40 },
      });
    });

    expect(builder.update).toHaveBeenCalledWith({ name: 'Corrected Name', percent_remaining: 40 });
    expect(builder.eq).toHaveBeenCalledWith('id', 'prod-1');
    expect(updated?.percent_remaining).toBe(40);
  });

  it('useUpdateProduct refuses to finish a product, so the empties archive is never skipped', async () => {
    mockFrom.mockReturnValue(chainableResult({ data: null, error: null }));

    // ProductPatch excludes 'finished' from `status`, so the real defense is a
    // tsc failure and a caller can only get here by casting past the type.
    // The cast is what's under test: the runtime backstop still holds.
    const finishingPatch = { status: 'finished' } as unknown as ProductPatch;

    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ productId: 'prod-1', patch: finishingPatch }),
      ).rejects.toThrow('useFinishProduct');
    });

    expect(mockFrom).not.toHaveBeenCalledWith('products');
  });

  it('useUpdateProduct rejects an out-of-range percent before hitting the database', async () => {
    mockFrom.mockReturnValue(chainableResult({ data: null, error: null }));

    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ productId: 'prod-1', patch: { percent_remaining: 140 } }),
      ).rejects.toThrow('0 to 100');
    });

    expect(mockFrom).not.toHaveBeenCalledWith('products');
  });

  it('useDeleteProduct deletes the row by id', async () => {
    const builder = chainableResult({ data: null, error: null });
    mockFrom.mockReturnValue(builder);

    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.mutateAsync({ productId: 'prod-1' });
    });

    expect(mockFrom).toHaveBeenCalledWith('products');
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', 'prod-1');
  });

  it('useWishlist returns items including one that is ready', async () => {
    mockFrom.mockReturnValue(
      chainableResult({
        data: [
          { id: 'wish-1', status: 'cooling' },
          { id: 'wish-2', status: 'ready' },
        ],
        error: null,
      }),
    );

    const { result } = renderHook(() => useWishlist(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const items = result.current.data || [];
    expect(items.some((w) => w.status === 'ready')).toBe(true);
  });

  it('useDashboard aggregates the dashboard payload in one call', async () => {
    mockRpc.mockResolvedValue({
      data: {
        profile: { username: 'maya_panpals' },
        focus_products: [{ id: 'prod-1' }],
        status_counts: { unopened: 1, in_rotation: 2, finished: 1 },
        streak: { current_streak: 5, longest_streak: 12, last_log_date: '2026-07-22' },
        category_counts: { lip: 1, face: 0, eye: 0, skincare: 0, fragrance: 0, hair: 0, other: 0 },
        ready_wishlist_items: [],
      },
      error: null,
    });

    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRpc).toHaveBeenCalledWith('get_dashboard');
    expect(result.current.data?.focus_products.length).toBeLessThanOrEqual(5);
    expect(result.current.data?.profile.username).toBe('maya_panpals');
  });

  it('useCatalogSearch calls search_catalog and returns matches', async () => {
    mockRpc.mockResolvedValue({
      data: [{ id: 'cat-1', brand: 'Rare Beauty', name: 'Soft Pinch Blush' }],
      error: null,
    });

    const { result } = renderHook(() => useCatalogSearch('rare'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRpc).toHaveBeenCalledWith('search_catalog', {
      q: 'rare',
      category: undefined,
      limit: 10,
    });
    expect(result.current.data?.[0].brand).toBe('Rare Beauty');
  });

  it('useFinishProduct calls finish_product and useEmpties reflects the new record', async () => {
    mockRpc.mockResolvedValue({
      data: { id: 'empty-1', product_id: 'prod-1', repurchase: 'yes' },
      error: null,
    });
    // finish_product's mutationFn also calls track(), which calls
    // supabase.from('analytics_events').insert(...) — dispatch by table
    // name so both that call and the later useEmpties query resolve.
    mockFrom.mockImplementation((table: string) => {
      if (table === 'empties') {
        return chainableResult({
          data: [{ id: 'empty-1', product_id: 'prod-1', repurchase: 'yes' }],
          error: null,
        });
      }
      return chainableResult({ data: null, error: null });
    });

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

    expect(mockRpc).toHaveBeenCalledWith('finish_product', {
      product_id: 'prod-1',
      review: 'Loved it!',
      repurchase: 'yes',
      photo_url: null,
    });

    const { result: emptiesHook } = renderHook(() => useEmpties(), { wrapper: createWrapper() });
    await waitFor(() => expect(emptiesHook.current.isSuccess).toBe(true));
    expect(emptiesHook.current.data?.some((e) => e.product_id === 'prod-1')).toBe(true);
  });

  it('useUpdateProfile updates existing profile row without requiring username', async () => {
    const builder = chainableResult({
      data: { id: 'user-1', username: 'maya', selected_goals: ['Reduce waste'] },
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });
    let updated: Profile | undefined;
    await act(async () => {
      updated = await result.current.mutateAsync({ selected_goals: ['Reduce waste'] });
    });

    expect(builder.update).toHaveBeenCalledWith({ selected_goals: ['Reduce waste'] });
    expect(updated?.selected_goals).toEqual(['Reduce waste']);
  });

  it('useProfile fetches the user profile', async () => {
    mockFrom.mockReturnValue(
      chainableResult({
        data: { id: 'user-1', username: 'maya', selected_goals: [] },
        error: null,
      }),
    );

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.username).toBe('maya');
  });
});
