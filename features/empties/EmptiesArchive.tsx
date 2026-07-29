import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Chip } from '../../components/ui/Chip';
import { ArchiveEntry } from './useEmptiesArchive';
import { EmptyCard } from './EmptyCard';
import { emptiesStrings } from './strings';

interface EmptiesArchiveProps {
  entries: ArchiveEntry[];
}

type FilterOptionId = 'all' | 'holy_grails' | 'skincare' | 'makeup' | 'hair' | 'body';

interface FilterOption {
  id: FilterOptionId;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: emptiesStrings.filterAll },
  { id: 'holy_grails', label: emptiesStrings.filterHolyGrails },
  { id: 'skincare', label: emptiesStrings.filterSkincare },
  { id: 'makeup', label: emptiesStrings.filterMakeup },
  { id: 'hair', label: emptiesStrings.filterHair },
  { id: 'body', label: emptiesStrings.filterBody },
];

export function EmptiesArchive({ entries }: EmptiesArchiveProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOptionId>('all');

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'all') return entries;

    if (activeFilter === 'holy_grails') {
      return entries.filter(({ empty }) => empty.repurchase === 'yes');
    }

    return entries.filter(({ product }) => {
      if (!product?.category) return false;
      const cat = product.category.toLowerCase();
      if (activeFilter === 'skincare') return cat.includes('skin');
      if (activeFilter === 'makeup')
        return (
          cat.includes('face') ||
          cat.includes('lip') ||
          cat.includes('eye') ||
          cat.includes('makeup')
        );
      if (activeFilter === 'hair') return cat.includes('hair');
      if (activeFilter === 'body') return cat.includes('body');
      return cat === activeFilter;
    });
  }, [entries, activeFilter]);

  return (
    <View accessibilityLabel={emptiesStrings.archiveAccessibilityLabel}>
      <Text className="mb-4 text-lg font-caslon-bold text-dark-neutral">
        {emptiesStrings.archiveTitle}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerStyle={{ gap: 8 }}
      >
        {FILTER_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={activeFilter === option.id}
            onPress={() => setActiveFilter(option.id)}
            accessibilityLabel={`Filter by ${option.label}`}
          />
        ))}
      </ScrollView>
      {filteredEntries.length > 0 ? (
        filteredEntries.map(({ empty, product }) => (
          <EmptyCard key={empty.id} empty={empty} product={product} />
        ))
      ) : (
        <View className="py-8 items-center justify-center rounded-3xl bg-card-surface p-6 shadow-sm border border-border-warm">
          <Text className="text-base font-caslon-bold text-dark-neutral text-center mb-1">
            {emptiesStrings.noFilterMatchesTitle}
          </Text>
          <Text className="text-sm font-satoshi text-muted-text text-center">
            {emptiesStrings.noFilterMatchesMessage}
          </Text>
        </View>
      )}
    </View>
  );
}
