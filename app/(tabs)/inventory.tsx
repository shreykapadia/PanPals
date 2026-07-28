import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Chip } from '../../components/ui/Chip';
import { Input } from '../../components/ui/Input';
import { CATEGORIES, Category, Product, ProductStatus } from '../../mocks/types';
import { useInventoryActions } from '../../features/inventory/hooks/useInventoryActions';
import { FastLogSheet } from '../../features/inventory/components/FastLogSheet';
import { ItemDetailSheet } from '../../features/inventory/components/ItemDetailSheet';
import { UsageLogSheet } from '../../features/inventory/components/UsageLogSheet';
import { InventoryItemCard } from '../../features/inventory/components/InventoryItemCard';
import { CATEGORY_LABELS, STATUS_LABELS, inventoryStrings } from '../../features/inventory/strings';

const STATUS_FILTERS: ProductStatus[] = ['unopened', 'in_rotation', 'finished'];

export default function InventoryTab() {
  const s = inventoryStrings.screen;

  const [statusFilter, setStatusFilter] = useState<ProductStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<Category | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  const [usageLogItem, setUsageLogItem] = useState<Product | null>(null);

  const {
    items,
    isLoading,
    isError,
    isRefetching,
    refetch,
    logItem,
    isLogging,
    logUsage,
    isLoggingUsage,
    togglePriority,
    isTogglingPriority,
  } = useInventoryActions({ status: statusFilter, category: categoryFilter });

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.brand.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.shade ?? '').toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  const handleTogglePriority = (item: Product) =>
    togglePriority({ productId: item.id, isPriority: !item.is_priority }).then((updated) => {
      // Keep the open detail sheet in sync with the item it's currently showing.
      setDetailItem(updated as Product);
    });

  const handleLogUsageSave = (args: { percentAfter: number; note?: string }) => {
    if (!usageLogItem) return Promise.reject(new Error('No item selected'));
    return logUsage({ productId: usageLogItem.id, ...args });
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState message="Loading your inventory…" />;
    }
    if (isError) {
      return <ErrorState message={s.errorMessage} onRetry={() => refetch()} />;
    }
    if (items.length === 0) {
      return (
        <EmptyState
          title={s.emptyTitle}
          message={s.emptyMessage}
          actionLabel={s.addButtonLabel}
          onAction={() => setIsLogOpen(true)}
        />
      );
    }
    if (filteredItems.length === 0) {
      return <EmptyState title={s.noMatchesTitle} message={s.noMatchesMessage} icon="info" />;
    }
    return (
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        renderItem={({ item }) => (
          <InventoryItemCard item={item} onPress={() => setDetailItem(item)} />
        )}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-bold font-caslon text-dark-neutral">{s.title}</Text>
        <Pressable
          onPress={() => setIsLogOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={s.addButtonLabel}
          className="w-11 h-11 rounded-full bg-primary-container items-center justify-center"
        >
          <Text className="text-lg font-bold text-dark-neutral">+</Text>
        </Pressable>
      </View>

      {!isLoading && !isError && items.length > 0 && (
        <View className="px-4 mb-2">
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={s.searchPlaceholder}
            accessibilityLabel={s.searchPlaceholder}
            showLabel={false}
          />
        </View>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <View className="mb-2">
          <FilterRow
            label={s.filterStatusLabel}
            allLabel={s.filterAllLabel}
            selected={statusFilter}
            options={STATUS_FILTERS}
            optionLabel={(v) => STATUS_LABELS[v]}
            onSelect={setStatusFilter}
          />
          <FilterRow
            label={s.filterCategoryLabel}
            allLabel={s.filterAllLabel}
            selected={categoryFilter}
            options={CATEGORIES}
            optionLabel={(v) => CATEGORY_LABELS[v]}
            onSelect={setCategoryFilter}
          />
        </View>
      )}

      {renderContent()}

      <FastLogSheet
        visible={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        onSave={(item) => logItem(item)}
        isSaving={isLogging}
      />

      <ItemDetailSheet
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onOpenUsageLog={(item) => setUsageLogItem(item)}
        onTogglePriority={handleTogglePriority}
        isTogglingPriority={isTogglingPriority}
      />

      <UsageLogSheet
        item={usageLogItem}
        onClose={() => setUsageLogItem(null)}
        onSave={handleLogUsageSave}
        isSaving={isLoggingUsage}
      />
    </SafeAreaView>
  );
}

function FilterRow<T extends string>({
  label,
  allLabel,
  selected,
  options,
  optionLabel,
  onSelect,
}: {
  label: string;
  allLabel: string;
  selected: T | undefined;
  options: readonly T[];
  optionLabel: (value: T) => string;
  onSelect: (value: T | undefined) => void;
}) {
  return (
    <View className="mb-2">
      <Text className="text-[11px] font-semibold text-muted-text font-satoshi px-4 mb-1 uppercase tracking-wider">
        {label}
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['__all__', ...options] as const}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) =>
          item === '__all__' ? (
            <Chip label={allLabel} selected={!selected} onPress={() => onSelect(undefined)} />
          ) : (
            <Chip
              label={optionLabel(item as T)}
              selected={selected === item}
              onPress={() => onSelect(item as T)}
            />
          )
        }
      />
    </View>
  );
}
