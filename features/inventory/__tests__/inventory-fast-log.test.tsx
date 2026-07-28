import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InventoryItemCard } from '../components/InventoryItemCard';
import { FastLogSheet } from '../components/FastLogSheet';
import { ItemDetailSheet } from '../components/ItemDetailSheet';
import { UsageLogSheet } from '../components/UsageLogSheet';
import { Product, UsageLog } from '../../../mocks/types';

// FastLogSheet renders ProductSearch, which calls useCatalogSearch; ItemDetailSheet
// calls useUsageLogs directly. Mocking lib/api (rather than lib/supabase) means
// neither hook's real query-builder chain ever runs in these tests.
const mockUseUsageLogs = jest.fn();
jest.mock('../../../lib/api', () => ({
  useCatalogSearch: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useUsageLogs: (...args: unknown[]) => mockUseUsageLogs(...args),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const baseItem: Product = {
  id: 'prod-1',
  user_id: 'user-1',
  catalog_product_id: null,
  brand: 'Rare Beauty',
  name: 'Soft Pinch Liquid Blush',
  shade: 'Happy',
  category: 'face',
  format: 'full',
  status: 'in_rotation',
  percent_remaining: 25,
  photo_url: null,
  pao_months: 12,
  opened_at: '2026-01-15',
  is_priority: true,
  source_wishlist_item_id: null,
  created_at: '2026-01-15T00:00:00.000Z',
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function renderDetailSheet(overrides: Partial<React.ComponentProps<typeof ItemDetailSheet>> = {}) {
  return render(
    <ItemDetailSheet
      item={baseItem}
      onClose={jest.fn()}
      onOpenUsageLog={() => {}}
      onOpenEdit={() => {}}
      onTogglePriority={() => Promise.resolve()}
      isTogglingPriority={false}
      onDelete={() => Promise.resolve()}
      isDeleting={false}
      {...overrides}
    />,
  );
}

describe('InventoryItemCard', () => {
  it('renders brand, name, shade, status, and focus pot state', () => {
    const { getByText, getByLabelText } = render(
      <InventoryItemCard item={baseItem} onPress={() => {}} />,
    );

    expect(getByText('Rare Beauty · Soft Pinch Liquid Blush')).toBeTruthy();
    expect(getByText('Face · Happy')).toBeTruthy();
    expect(getByText('IN ROTATION')).toBeTruthy();
    expect(getByText('IN FOCUS POT')).toBeTruthy();
    expect(
      getByLabelText(
        'Rare Beauty Soft Pinch Liquid Blush, Happy, In Rotation, 25% remaining, In Focus Pot',
      ),
    ).toBeTruthy();
  });
});

describe('FastLogSheet — create mode', () => {
  const fillManualEntry = (
    getByLabelText: (label: string) => any,
    getByText: (label: string) => any,
  ) => {
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Glossier');
    fireEvent.changeText(getByLabelText('Product Name'), 'Cloud Paint');
  };

  it('keeps the save button disabled until brand and name are filled', () => {
    const onSave = jest.fn();
    const { getByText, getByLabelText } = renderWithClient(
      <FastLogSheet visible onClose={() => {}} onSave={onSave} isSaving={false} />,
    );

    fireEvent.press(getByText('Manual'));
    fireEvent.press(getByLabelText('Log item'));

    expect(onSave).not.toHaveBeenCalled();
    expect(getByLabelText('Log item').props.accessibilityState?.disabled).toBe(true);
  });

  it('defaults to unopened/100%/no opened_at and saves manual entry fields', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = renderWithClient(
      <FastLogSheet visible onClose={() => {}} onSave={onSave} isSaving={false} />,
    );

    fillManualEntry(getByLabelText, getByText);
    fireEvent.press(getByText('Log item'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        brand: 'Glossier',
        name: 'Cloud Paint',
        status: 'unopened',
        percent_remaining: 100,
        opened_at: null,
        is_priority: false,
      }),
    );
  });

  it('sets opened_at when status is switched to In Rotation', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = renderWithClient(
      <FastLogSheet visible onClose={() => {}} onSave={onSave} isSaving={false} />,
    );

    fillManualEntry(getByLabelText, getByText);
    fireEvent.press(getByText('In Rotation'));
    fireEvent.press(getByText('Log item'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0];
    expect(saved.status).toBe('in_rotation');
    expect(typeof saved.opened_at).toBe('string');
  });

  it('renders nothing when not visible', () => {
    const { queryByText } = renderWithClient(
      <FastLogSheet visible={false} onClose={() => {}} onSave={jest.fn()} isSaving={false} />,
    );
    expect(queryByText('Log New Item')).toBeNull();
  });
});

describe('FastLogSheet — edit mode', () => {
  it('pre-fills fields from editingItem and shows the edit title/button', () => {
    const { getByText, getByLabelText, queryByText } = renderWithClient(
      <FastLogSheet
        visible
        editingItem={baseItem}
        onClose={() => {}}
        onSaveEdit={jest.fn()}
        isSaving={false}
      />,
    );

    expect(getByText('Edit item')).toBeTruthy();
    expect(getByLabelText('Brand').props.value).toBe('Rare Beauty');
    expect(getByLabelText('Product Name').props.value).toBe('Soft Pinch Liquid Blush');
    expect(getByLabelText('Shade (optional)').props.value).toBe('Happy');
    expect(getByText('Save changes')).toBeTruthy();
    // Create-only affordances are hidden — nothing to search/scan when editing.
    expect(queryByText('Search catalog')).toBeNull();
    expect(queryByText('Tap to add a photo')).toBeNull();
  });

  it('saves a patch (not a full NewProduct) via onSaveEdit, including a corrected percent', async () => {
    const onSaveEdit = jest.fn().mockResolvedValue(undefined);
    const { getByText, getByLabelText } = renderWithClient(
      <FastLogSheet
        visible
        editingItem={baseItem}
        onClose={() => {}}
        onSaveEdit={onSaveEdit}
        isSaving={false}
      />,
    );

    fireEvent.press(getByLabelText('Increase by 5 percent'));
    fireEvent.changeText(getByLabelText('Product Name'), 'Soft Pinch Blush (updated)');
    fireEvent.press(getByText('Save changes'));

    await waitFor(() => expect(onSaveEdit).toHaveBeenCalledTimes(1));
    expect(onSaveEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Soft Pinch Blush (updated)',
        percent_remaining: 30,
      }),
    );
    // 'finished' must never be reachable from this form — see ProductPatch's type.
    expect(onSaveEdit.mock.calls[0][0].status).not.toBe('finished');
  });

  it('offers "In Rotation" instead of "Finished" as an edit option, even for a finished item', () => {
    const { getByText, queryByText } = renderWithClient(
      <FastLogSheet
        visible
        editingItem={{ ...baseItem, status: 'finished' }}
        onClose={() => {}}
        onSaveEdit={jest.fn()}
        isSaving={false}
      />,
    );

    // Finishing stays Talbia's flow — the status chips never offer it.
    expect(queryByText('Finished')).toBeNull();
    expect(getByText('In Rotation')).toBeTruthy();
  });
});

describe('ItemDetailSheet', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseUsageLogs.mockReset().mockReturnValue({ data: [], isLoading: false, isError: false });
  });

  it('navigates to the finish seam without rendering any finish/celebration UI itself', () => {
    const onClose = jest.fn();
    const { getByLabelText, queryByText } = renderDetailSheet({ onClose });

    fireEvent.press(getByLabelText('Mark as Finished'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(tabs)/empties',
      params: { finishProductId: 'prod-1' },
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    // This lane never implements finishing — it only navigates to Talbia's screen.
    expect(queryByText('Repurchase')).toBeNull();
    expect(queryByText('Congratulations')).toBeNull();
  });

  it('hides "Mark as Finished" once the item is already finished', () => {
    const { queryByLabelText } = renderDetailSheet({ item: { ...baseItem, status: 'finished' } });

    expect(queryByLabelText('Mark as Finished')).toBeNull();
  });

  it('shows the Focus Pot error inline when the toggle rejects (e.g. the 6th pin)', async () => {
    const { getByLabelText, findByText } = renderDetailSheet({
      onTogglePriority: () => Promise.reject(new Error('focus pot full')),
    });

    fireEvent.press(getByLabelText('Remove from Focus Pot'));

    expect(await findByText('Your Focus Pot is full — remove a pinned item first.')).toBeTruthy();
  });

  it('calls onOpenEdit with the item when Edit is pressed', () => {
    const onOpenEdit = jest.fn();
    const { getByLabelText } = renderDetailSheet({ onOpenEdit });

    fireEvent.press(getByLabelText('Edit'));

    expect(onOpenEdit).toHaveBeenCalledWith(baseItem);
  });

  it('renders each usage log newest-first with its percent and note', () => {
    // percent_after deliberately differs from baseItem.percent_remaining (25%)
    // so this assertion can't accidentally match the ring's own label.
    const logs: UsageLog[] = [
      {
        id: 'log-1',
        product_id: 'prod-1',
        percent_after: 40,
        note: 'Reapplied after lunch',
        photo_url: null,
        logged_at: new Date().toISOString(),
      },
    ];
    mockUseUsageLogs.mockReturnValue({ data: logs, isLoading: false, isError: false });

    const { getByText } = renderDetailSheet();

    expect(mockUseUsageLogs).toHaveBeenCalledWith('prod-1');
    expect(getByText('40%')).toBeTruthy();
    expect(getByText('Reapplied after lunch')).toBeTruthy();
    expect(getByText('Logged today')).toBeTruthy();
  });

  it('shows the empty-history state when there are no usage logs', () => {
    const { getByText } = renderDetailSheet();

    expect(getByText('No uses logged yet')).toBeTruthy();
  });

  it('shows an inline error if usage history fails to load', () => {
    mockUseUsageLogs.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    const { getByText } = renderDetailSheet();

    expect(getByText("We couldn't load usage history right now.")).toBeTruthy();
  });

  it('confirms before deleting, and calls onDelete + onClose only if the user confirms', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const onDelete = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    const { getByLabelText } = renderDetailSheet({ onDelete, onClose });

    fireEvent.press(getByLabelText('Delete item'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Delete this item?',
      "This removes Rare Beauty Soft Pinch Liquid Blush and its full usage history. If you already finished it, that record is deleted too. This can't be undone.",
      expect.any(Array),
    );
    // Nothing happens until the destructive button is pressed.
    expect(onDelete).not.toHaveBeenCalled();

    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const confirmButton = buttons.find((b) => b.text === 'Delete')!;
    confirmButton.onPress?.();

    expect(onDelete).toHaveBeenCalledWith(baseItem);
    alertSpy.mockRestore();
  });
});

describe('UsageLogSheet', () => {
  it('steps percent by 5 and saves the note', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = render(
      <UsageLogSheet item={baseItem} onClose={() => {}} onSave={onSave} isSaving={false} />,
    );

    expect(getByText('25%')).toBeTruthy();
    fireEvent.press(getByLabelText('Increase by 5 percent'));
    expect(getByText('30%')).toBeTruthy();

    fireEvent.changeText(getByLabelText('Note (optional)'), 'Reapplied after lunch');
    fireEvent.press(getByText('Save update'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({ percentAfter: 30, note: 'Reapplied after lunch' });
  });

  it('clamps percent between 0 and 100', () => {
    const { getByLabelText, getByText } = render(
      <UsageLogSheet
        item={{ ...baseItem, percent_remaining: 100 }}
        onClose={() => {}}
        onSave={jest.fn()}
        isSaving={false}
      />,
    );

    fireEvent.press(getByLabelText('Increase by 5 percent'));
    expect(getByText('100%')).toBeTruthy();
  });

  it('renders nothing when no item is selected', () => {
    const { queryByText } = render(
      <UsageLogSheet item={null} onClose={() => {}} onSave={jest.fn()} isSaving={false} />,
    );
    expect(queryByText('Log usage')).toBeNull();
  });
});
