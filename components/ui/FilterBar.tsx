import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Icon } from './Icon';
import { Chip } from './Chip';
import { colors } from '../../theme/tokens';

export interface FilterBarProps<T extends string = string> {
  activeCount?: number;
  onOpenFilterSheet: () => void;
  quickOptions?: readonly T[];
  selectedQuickOption?: T;
  quickOptionLabel?: (option: T) => string;
  onSelectQuickOption?: (option: T | undefined) => void;
  allLabel?: string;
  accessibilityLabel?: string;
}

export function FilterBar<T extends string = string>({
  activeCount = 0,
  onOpenFilterSheet,
  quickOptions = [],
  selectedQuickOption,
  quickOptionLabel = (opt) => opt,
  onSelectQuickOption,
  allLabel = 'All',
  accessibilityLabel = 'Open filter options',
}: FilterBarProps<T>) {
  return (
    <View className="mb-3">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['__filter_btn__', '__all__', ...quickOptions] as const}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => {
          if (item === '__filter_btn__') {
            return (
              <Pressable
                onPress={onOpenFilterSheet}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                className={`rounded-full px-3.5 py-2 min-h-[44px] border flex-row items-center gap-1.5 ${
                  activeCount > 0
                    ? 'bg-primary-container border-primary-container'
                    : 'bg-card-surface border-border-warm'
                }`}
              >
                <Icon name="sliders" size={16} color={colors['dark-neutral']} />
                <Text className="text-sm font-satoshi-semibold text-dark-neutral">Filters</Text>
                {activeCount > 0 && (
                  <View className="bg-card-surface px-2 py-0.5 rounded-full min-w-[20px] items-center justify-center">
                    <Text className="text-xs font-satoshi-bold text-dark-neutral">
                      {activeCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }

          if (!onSelectQuickOption) return null;

          if (item === '__all__') {
            return (
              <Chip
                label={allLabel}
                selected={!selectedQuickOption}
                onPress={() => onSelectQuickOption(undefined)}
              />
            );
          }

          const opt = item as T;
          return (
            <Chip
              label={quickOptionLabel(opt)}
              selected={selectedQuickOption === opt}
              onPress={() => onSelectQuickOption(selectedQuickOption === opt ? undefined : opt)}
            />
          );
        }}
      />
    </View>
  );
}
