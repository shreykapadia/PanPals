import { Product, UsageLog } from '../../../../mocks/types';
import { filterInventory, matchesSearch, recentlyUsedProductIds } from '../useInventoryFilters';

function makeProduct(overrides: Partial<Product>): Product {
  return {
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
    is_priority: false,
    source_wishlist_item_id: null,
    created_at: '2026-01-15T00:00:00.000Z',
    ...overrides,
  };
}

function makeLog(overrides: Partial<UsageLog>): UsageLog {
  return {
    id: 'log-1',
    product_id: 'prod-1',
    percent_after: 50,
    note: null,
    photo_url: null,
    logged_at: '2026-01-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('matchesSearch', () => {
  const item = makeProduct({ brand: 'Rare Beauty', name: 'Soft Pinch Blush', shade: 'Joy' });

  it('matches on brand, name, or shade, case-insensitively', () => {
    expect(matchesSearch(item, 'rare')).toBe(true);
    expect(matchesSearch(item, 'PINCH')).toBe(true);
    expect(matchesSearch(item, 'joy')).toBe(true);
  });

  it('returns true for an empty or whitespace-only query', () => {
    expect(matchesSearch(item, '')).toBe(true);
    expect(matchesSearch(item, '   ')).toBe(true);
  });

  it('does not match unrelated text', () => {
    expect(matchesSearch(item, 'fenty')).toBe(false);
  });

  it('does not blow up on a null shade', () => {
    const noShade = makeProduct({ shade: null });
    expect(matchesSearch(noShade, 'anything')).toBe(false);
    expect(matchesSearch(noShade, '')).toBe(true);
  });
});

describe('recentlyUsedProductIds', () => {
  const now = new Date('2026-07-28T12:00:00.000Z');

  it('includes a product logged within the window', () => {
    const logs = [makeLog({ product_id: 'prod-1', logged_at: '2026-07-24T12:00:00.000Z' })];
    expect(recentlyUsedProductIds(logs, 7, now).has('prod-1')).toBe(true);
  });

  it('excludes a product logged outside the window', () => {
    const logs = [makeLog({ product_id: 'prod-1', logged_at: '2026-07-01T12:00:00.000Z' })];
    expect(recentlyUsedProductIds(logs, 7, now).has('prod-1')).toBe(false);
  });

  it('treats the window boundary as inclusive', () => {
    const logs = [makeLog({ product_id: 'prod-1', logged_at: '2026-07-21T12:00:00.000Z' })];
    expect(recentlyUsedProductIds(logs, 7, now).has('prod-1')).toBe(true);
  });

  it('dedupes multiple logs for the same product', () => {
    const logs = [
      makeLog({ id: 'a', product_id: 'prod-1', logged_at: '2026-07-27T00:00:00.000Z' }),
      makeLog({ id: 'b', product_id: 'prod-1', logged_at: '2026-07-26T00:00:00.000Z' }),
    ];
    expect(recentlyUsedProductIds(logs, 7, now).size).toBe(1);
  });
});

describe('filterInventory', () => {
  const items = [
    makeProduct({ id: 'a', brand: 'Rare Beauty', category: 'face', status: 'in_rotation' }),
    makeProduct({ id: 'b', brand: 'Fenty Beauty', category: 'lip', status: 'unopened' }),
    makeProduct({ id: 'c', brand: 'Glossier', category: 'face', status: 'finished' }),
  ];
  const emptyState = {
    status: undefined,
    category: undefined,
    search: '',
    recentlyUsedOnly: false,
  };

  it('returns everything when no filter is active', () => {
    expect(filterInventory(items, emptyState, new Set())).toHaveLength(3);
  });

  it('filters by status', () => {
    const result = filterInventory(items, { ...emptyState, status: 'unopened' }, new Set());
    expect(result.map((i) => i.id)).toEqual(['b']);
  });

  it('filters by category', () => {
    const result = filterInventory(items, { ...emptyState, category: 'face' }, new Set());
    expect(result.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('filters by search text', () => {
    const result = filterInventory(items, { ...emptyState, search: 'fenty' }, new Set());
    expect(result.map((i) => i.id)).toEqual(['b']);
  });

  it('filters by "recently used", using the caller-supplied id set', () => {
    const result = filterInventory(
      items,
      { ...emptyState, recentlyUsedOnly: true },
      new Set(['a', 'c']),
    );
    expect(result.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('combines every active filter (AND, not OR)', () => {
    const result = filterInventory(
      items,
      { status: undefined, category: 'face', search: 'glossier', recentlyUsedOnly: false },
      new Set(),
    );
    expect(result.map((i) => i.id)).toEqual(['c']);
  });
});
