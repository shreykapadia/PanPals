import React from 'react';
import { Text, View } from 'react-native';
import { ArchiveEntry } from './useEmptiesArchive';
import { EmptyCard } from './EmptyCard';
import { emptiesStrings } from './strings';

interface EmptiesArchiveProps {
  entries: ArchiveEntry[];
}

export function EmptiesArchive({ entries }: EmptiesArchiveProps) {
  return (
    <View accessibilityLabel={emptiesStrings.archiveAccessibilityLabel}>
      <Text className="mb-4 text-lg font-caslon-bold text-dark-neutral">
        {emptiesStrings.archiveTitle}
      </Text>
      {entries.map(({ empty, product }) => (
        <EmptyCard key={empty.id} empty={empty} product={product} />
      ))}
    </View>
  );
}
