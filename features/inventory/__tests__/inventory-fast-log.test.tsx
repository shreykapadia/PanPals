import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InventoryItemCard } from '../components/InventoryItemCard';
import { FastLogSheet } from '../components/FastLogSheet';
import { ItemDetailSheet } from '../components/ItemDetailSheet';
import { UsageLogSheet } from '../components/UsageLogSheet';
import { Product } from '../../../mocks/types';

// FastLogSheet renders ProductSearch, which pulls in lib/api -> lib/supabase
// — mock it so the client's env-var check doesn't throw in tests.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

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

describe('FastLogSheet', () => {
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

describe('ItemDetailSheet', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it('navigates to the finish seam without rendering any finish/celebration UI itself', () => {
    const onClose = jest.fn();
    const { getByLabelText, queryByText } = render(
      <ItemDetailSheet
        item={baseItem}
        onClose={onClose}
        onOpenUsageLog={() => {}}
        onTogglePriority={() => Promise.resolve()}
        isTogglingPriority={false}
      />,
    );

    fireEvent.press(getByLabelText('Mark as Finished'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(tabs)/progress',
      params: { finishProductId: 'prod-1' },
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    // This lane never implements finishing — it only navigates to Talbia's screen.
    expect(queryByText('Repurchase')).toBeNull();
    expect(queryByText('Congratulations')).toBeNull();
  });

  it('hides "Mark as Finished" once the item is already finished', () => {
    const { queryByLabelText } = render(
      <ItemDetailSheet
        item={{ ...baseItem, status: 'finished' }}
        onClose={() => {}}
        onOpenUsageLog={() => {}}
        onTogglePriority={() => Promise.resolve()}
        isTogglingPriority={false}
      />,
    );

    expect(queryByLabelText('Mark as Finished')).toBeNull();
  });

  it('shows the Focus Pot error inline when the toggle rejects (e.g. the 6th pin)', async () => {
    const { getByLabelText, findByText } = render(
      <ItemDetailSheet
        item={baseItem}
        onClose={() => {}}
        onOpenUsageLog={() => {}}
        onTogglePriority={() => Promise.reject(new Error('focus pot full'))}
        isTogglingPriority={false}
      />,
    );

    fireEvent.press(getByLabelText('Remove from Focus Pot'));

    expect(await findByText('Your Focus Pot is full — remove a pinned item first.')).toBeTruthy();
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
