import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { RepurchaseVerdict } from '../../mocks/types';
import { ArchiveEntry } from './useEmptiesArchive';
import { EmptyCard } from './EmptyCard';
import { emptiesStrings } from './strings';
import { useArchiveFilters } from './useArchiveFilters';

interface EmptiesArchiveProps {
  entries: ArchiveEntry[];
}

export function EmptiesArchive({ entries }: EmptiesArchiveProps) {
  const {
    categoryFilter,
    categoryOptions,
    clearFilters,
    filteredEntries,
    isFiltered,
    setCategoryFilter,
    setVerdictFilter,
    verdictFilter,
  } = useArchiveFilters(entries);

  return (
    <View accessibilityLabel={emptiesStrings.archiveAccessibilityLabel}>
      <Text className="mb-4 text-lg font-caslon-bold text-dark-neutral">
        {emptiesStrings.archiveTitle}
      </Text>
      <View className="mb-5 gap-4">
        <View>
          <Text className="mb-2 text-xs font-satoshi-bold uppercase tracking-wider text-muted-text">
            {emptiesStrings.archiveFilterVerdictLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip
              label={emptiesStrings.archiveFilterAll}
              selected={verdictFilter === 'all'}
              onPress={() => setVerdictFilter('all')}
              accessibilityLabel={emptiesStrings.archiveFilterAccessibilityLabel(
                emptiesStrings.archiveFilterVerdictLabel,
                emptiesStrings.archiveFilterAll,
              )}
            />
            {(Object.keys(emptiesStrings.repurchaseVerdicts) as RepurchaseVerdict[]).map(
              (verdict) => (
                <Chip
                  key={verdict}
                  label={emptiesStrings.repurchaseVerdicts[verdict]}
                  selected={verdictFilter === verdict}
                  onPress={() => setVerdictFilter(verdict)}
                  accessibilityLabel={emptiesStrings.archiveFilterAccessibilityLabel(
                    emptiesStrings.archiveFilterVerdictLabel,
                    emptiesStrings.repurchaseVerdicts[verdict],
                  )}
                />
              ),
            )}
          </View>
        </View>
        {categoryOptions.length > 1 ? (
          <View>
            <Text className="mb-2 text-xs font-satoshi-bold uppercase tracking-wider text-muted-text">
              {emptiesStrings.archiveFilterCategoryLabel}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label={emptiesStrings.archiveFilterAll}
                selected={categoryFilter === 'all'}
                onPress={() => setCategoryFilter('all')}
                accessibilityLabel={emptiesStrings.archiveFilterAccessibilityLabel(
                  emptiesStrings.archiveFilterCategoryLabel,
                  emptiesStrings.archiveFilterAll,
                )}
              />
              {categoryOptions.map((category) => (
                <Chip
                  key={category}
                  label={emptiesStrings.archiveCategoryLabels[category]}
                  selected={categoryFilter === category}
                  onPress={() => setCategoryFilter(category)}
                  accessibilityLabel={emptiesStrings.archiveFilterAccessibilityLabel(
                    emptiesStrings.archiveFilterCategoryLabel,
                    emptiesStrings.archiveCategoryLabels[category],
                  )}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
      {filteredEntries.length > 0 ? (
        filteredEntries.map(({ empty, product }) => (
          <EmptyCard key={empty.id} empty={empty} product={product} />
        ))
      ) : (
        <View className="items-center rounded-3xl bg-card-surface px-6 py-8">
          <Text className="text-center text-lg font-caslon-bold text-dark-neutral">
            {emptiesStrings.archiveNoMatchesTitle}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 font-satoshi text-muted-text">
            {emptiesStrings.archiveNoMatchesMessage}
          </Text>
          {isFiltered ? (
            <View className="mt-5 w-full">
              <Button
                label={emptiesStrings.archiveClearFilters}
                onPress={clearFilters}
                variant="secondary"
                accessibilityLabel={emptiesStrings.archiveClearFiltersAccessibilityLabel}
              />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
