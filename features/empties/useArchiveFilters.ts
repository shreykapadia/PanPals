import { useMemo, useState } from 'react';
import { Category, RepurchaseVerdict } from '../../mocks/types';
import { ArchiveEntry } from './useEmptiesArchive';

export type ArchiveVerdictFilter = 'all' | RepurchaseVerdict;
export type ArchiveCategoryFilter = 'all' | Category;

export function useArchiveFilters(entries: ArchiveEntry[]) {
  const [verdictFilter, setVerdictFilter] = useState<ArchiveVerdictFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<ArchiveCategoryFilter>('all');

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          entries.flatMap((entry) => (entry.product?.category ? [entry.product.category] : [])),
        ),
      ).sort(),
    [entries],
  );

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        ({ empty, product }) =>
          (verdictFilter === 'all' || empty.repurchase === verdictFilter) &&
          (categoryFilter === 'all' || product?.category === categoryFilter),
      ),
    [categoryFilter, entries, verdictFilter],
  );

  const clearFilters = () => {
    setVerdictFilter('all');
    setCategoryFilter('all');
  };

  return {
    categoryFilter,
    categoryOptions,
    clearFilters,
    filteredEntries,
    isFiltered: verdictFilter !== 'all' || categoryFilter !== 'all',
    setCategoryFilter,
    setVerdictFilter,
    verdictFilter,
  };
}
