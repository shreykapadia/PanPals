import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Icon } from './Icon';
import { Chip } from './Chip';
import { colors } from '../../theme/tokens';

export interface FilterGroup<T extends string = string> {
  id: string;
  label: string;
  allLabel?: string;
  selected: T | undefined;
  options: readonly T[];
  optionLabel: (value: T) => string;
  onSelect: (value: T | undefined) => void;
}

export interface FilterToggle {
  id: string;
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  groups?: FilterGroup<any>[];
  toggles?: FilterToggle[];
  onResetAll?: () => void;
  activeCount?: number;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  title = 'Filters',
  groups = [],
  toggles = [],
  onResetAll,
  activeCount = 0,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityLabel="Close modal background"
        />
        <View className="bg-surface rounded-t-3xl max-h-[85%] border-t border-border-warm px-4 pt-4 pb-8 shadow-xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-border-warm mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl font-bold font-caslon text-dark-neutral">{title}</Text>
              {activeCount > 0 && (
                <View className="bg-primary-container px-2.5 py-0.5 rounded-full">
                  <Text className="text-xs font-satoshi-bold text-dark-neutral">{activeCount}</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-3">
              {onResetAll && activeCount > 0 && (
                <Pressable
                  onPress={onResetAll}
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters"
                >
                  <Text className="text-sm font-satoshi-medium text-muted-text underline">
                    Reset all
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close filters modal"
                className="w-9 h-9 rounded-full bg-card-surface border border-border-warm items-center justify-center"
              >
                <Icon name="close" size={18} color={colors['dark-neutral']} />
              </Pressable>
            </View>
          </View>

          {/* Filter Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingVertical: 8 }}
          >
            {groups.map((group) => (
              <View key={group.id} className="gap-2">
                <Text className="text-xs font-semibold uppercase tracking-wider font-satoshi text-muted-text">
                  {group.label}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <Chip
                    label={group.allLabel || 'All'}
                    selected={!group.selected}
                    onPress={() => group.onSelect(undefined)}
                  />
                  {group.options.map((option) => (
                    <Chip
                      key={option}
                      label={group.optionLabel(option)}
                      selected={group.selected === option}
                      onPress={() => group.onSelect(group.selected === option ? undefined : option)}
                    />
                  ))}
                </View>
              </View>
            ))}

            {toggles.length > 0 && (
              <View className="gap-2 pt-2 border-t border-border-warm">
                <Text className="text-xs font-semibold uppercase tracking-wider font-satoshi text-muted-text">
                  Special
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {toggles.map((toggle) => (
                    <Chip
                      key={toggle.id}
                      label={toggle.label}
                      selected={toggle.selected}
                      onPress={toggle.onToggle}
                    />
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Apply Footer CTA */}
          <View className="pt-4 mt-2 border-t border-border-warm">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Apply filters"
              className="w-full h-12 rounded-full bg-primary-container items-center justify-center"
            >
              <Text className="text-base font-satoshi-bold text-dark-neutral">Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
