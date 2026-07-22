import { Category } from '../mocks/types';

export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    similar: (category: Category, excludeId?: string) =>
      [...queryKeys.products.all, 'similar', { category, excludeId }] as const,
  },
  wishlist: {
    all: ['wishlist'] as const,
    lists: () => [...queryKeys.wishlist.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.wishlist.lists(), { filters }] as const,
    details: () => [...queryKeys.wishlist.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.wishlist.details(), id] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
  },
  empties: {
    all: ['empties'] as const,
    lists: () => [...queryKeys.empties.all, 'list'] as const,
  },
  catalog: {
    all: ['catalog'] as const,
    search: (q: string, category?: Category) =>
      [...queryKeys.catalog.all, 'search', { q, category }] as const,
  },
};
