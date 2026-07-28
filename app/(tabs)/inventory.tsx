import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Chip } from '../../components/ui/Chip';
import { Input } from '../../components/ui/Input';
import { CATEGORIES, Product, ProductStatus } from '../../mocks/types';
import { ProductPatch } from '../../lib/api';
import { useInventoryActions } from '../../features/inventory/hooks/useInventoryActions';
import {
  filterInventory,
  recentlyUsedProductIds,
  useInventoryFilters,
} from '../../features/inventory/hooks/useInventoryFilters';
import { FastLogSheet } from '../../features/inventory/components/FastLogSheet';
import { ItemDetailSheet } from '../../features/inventory/components/ItemDetailSheet';
import { UsageLogSheet } from '../../features/inventory/components/UsageLogSheet';
import { InventoryItemCard } from '../../features/inventory/components/InventoryItemCard';
import { CATEGORY_LABELS, STATUS_LABELS, inventoryStrings } from '../../features/inventory/strings';

const STATUS_FILTERS: ProductStatus[] = ['unopened', 'in_rotation', 'finished'];

export default function InventoryTab() {
  const s = inventoryStrings.screen;

  const filters = useInventoryFilters();
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  const [usageLogItem, setUsageLogItem] = useState<Product | null>(null);

  const {
    items,
    isLoading,
    isError,
    isRefetching,
    refetch,
    allUsageLogs,
    logItem,
    isLogging,
    logUsage,
    isLoggingUsage,
    togglePriority,
    isTogglingPriority,
    updateItem,
    isUpdating,
    deleteItem,
    isDeleting,
  } = useInventoryActions({ status: filters.status, category: filters.category });

  const recentIds = useMemo(() => recentlyUsedProductIds(allUsageLogs), [allUsageLogs]);

  const filteredItems = useMemo(() => {
    // Status/category are already applied server-side by useInventoryActions
    // above; filterInventory just re-checks them (harmless — items already
    // conform) plus the two client-side-only criteria: search and "recently used".
    const state = {
      status: filters.status,
      category: filters.category,
      search: filters.search,
      recentlyUsedOnly: filters.recentlyUsedOnly,
    };
    return filterInventory(items, state, recentIds);
  }, [
    items,
    filters.status,
    filters.category,
    filters.search,
    filters.recentlyUsedOnly,
    recentIds,
  ]);

  const handleTogglePriority = (item: Product) =>
    togglePriority({ productId: item.id, isPriority: !item.is_priority }).then((updated) => {
      // Keep the open detail sheet in sync with the item it's currently showing.
      setDetailItem(updated as Product);
    });

  const handleLogUsageSave = (args: { percentAfter: number; note?: string }) => {
    if (!usageLogItem) return Promise.reject(new Error('No item selected'));
    return logUsage({ productId: usageLogItem.id, ...args });
  };

  const handleSaveEdit = (patch: ProductPatch) => {
    if (!editingItem) return Promise.reject(new Error('No item selected'));
    return updateItem({ productId: editingItem.id, patch }).then((updated) => {
      // Keep the detail sheet underneath in sync with the freshly saved item.
      setDetailItem(updated as Product);
      return updated;
    });
  };

  const handleDelete = (item: Product) => deleteItem(item.id);

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
            value={filters.search}
            onChangeText={filters.setSearch}
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
            selected={filters.status}
            options={STATUS_FILTERS}
            optionLabel={(v) => STATUS_LABELS[v]}
            onSelect={filters.setStatus}
          />
          <FilterRow
            label={s.filterCategoryLabel}
            allLabel={s.filterAllLabel}
            selected={filters.category}
            options={CATEGORIES}
            optionLabel={(v) => CATEGORY_LABELS[v]}
            onSelect={filters.setCategory}
          />
          <View className="px-4">
            <Chip
              label={s.recentlyUsedLabel}
              selected={filters.recentlyUsedOnly}
              onPress={() => filters.setRecentlyUsedOnly((prev) => !prev)}
            />
          </View>
        </View>
      )}

      {renderContent()}

      <FastLogSheet
        visible={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        onSave={(item) => logItem(item)}
        isSaving={isLogging}
      />

      <FastLogSheet
        visible={editingItem != null}
        editingItem={editingItem}
        onClose={() => setEditingItem(null)}
        onSaveEdit={handleSaveEdit}
        isSaving={isUpdating}
      />

      <ItemDetailSheet
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onOpenUsageLog={(item) => setUsageLogItem(item)}
        onOpenEdit={(item) => setEditingItem(item)}
        onTogglePriority={handleTogglePriority}
        isTogglingPriority={isTogglingPriority}
        onDelete={handleDelete}
        isDeleting={isDeleting}
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
