import { renderHook, act } from '@testing-library/react-native';
import { useWishlistActions } from '../hooks/useWishlistActions';

const mockUpdateMutateAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../lib/api', () => ({
  useWishlist: () => ({
    data: [],
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
  }),
  useAddWishlistItem: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useUpdateWishlistItem: () => ({ mutateAsync: mockUpdateMutateAsync, isPending: false }),
  useRemoveWishlistItem: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

describe('useWishlistActions.editItem', () => {
  beforeEach(() => {
    mockUpdateMutateAsync.mockClear();
  });

  it('maps an explicit clear (null) to an empty string so the update actually persists', async () => {
    const { result } = renderHook(() => useWishlistActions());

    await act(async () => {
      await result.current.editItem('wish-1', { reflectionResponse: null });
    });

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'wish-1', reflectionResponse: '' }),
    );
  });

  it('leaves reflectionResponse untouched when not provided', async () => {
    const { result } = renderHook(() => useWishlistActions());

    await act(async () => {
      await result.current.editItem('wish-1', { priority: 'high' });
    });

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'wish-1', reflectionResponse: undefined, priority: 'high' }),
    );
  });

  it('passes a real reflection string through unchanged', async () => {
    const { result } = renderHook(() => useWishlistActions());

    await act(async () => {
      await result.current.editItem('wish-1', { reflectionResponse: 'Still want it' });
    });

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'wish-1', reflectionResponse: 'Still want it' }),
    );
  });
});
