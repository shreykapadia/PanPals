import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { Chip } from '../../components/ui/Chip';
import {
  CATEGORIES,
  Category,
  WishlistItem,
  WishlistPriority,
  WishlistStatus,
} from '../../mocks/types';
import { useWishlistActions } from '../../features/wishlist/hooks/useWishlistActions';
import { AddWishlistItemSheet } from '../../features/wishlist/components/AddWishlistItemSheet';
import { EditWishlistItemSheet } from '../../features/wishlist/components/EditWishlistItemSheet';
import { WishlistItemCard } from '../../features/wishlist/components/WishlistItemCard';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  wishlistStrings,
} from '../../features/wishlist/strings';

const STATUS_FILTERS: WishlistStatus[] = ['cooling', 'ready', 'purchased', 'removed'];
const PRIORITY_FILTERS: WishlistPriority[] = ['high', 'medium', 'low'];
const UNDO_WINDOW_MS = 5000;

export default function WishlistTab() {
  const s = wishlistStrings.screen;

  const [statusFilter, setStatusFilter] = useState<WishlistStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<Category | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<WishlistPriority | undefined>(undefined);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [lastRemoved, setLastRemoved] = useState<WishlistItem | null>(null);

  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    items,
    isLoading,
    isError,
    isRefetching,
    refetch,
    addItem,
    isAdding,
    editItem,
    isEditing,
    removeItem,
    restoreItem,
  } = useWishlistActions(statusFilter ? { status: statusFilter } : undefined);

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (!categoryFilter || item.category === categoryFilter) &&
          (!priorityFilter || item.priority === priorityFilter),
      ),
    [items, categoryFilter, priorityFilter],
  );

  const handleRemove = async (item: WishlistItem) => {
    await removeItem(item.id);
    setLastRemoved(item);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setLastRemoved(null), UNDO_WINDOW_MS);
  };

  const handleUndo = async () => {
    if (!lastRemoved) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    const item = lastRemoved;
    setLastRemoved(null);
    await restoreItem(item);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState message="Loading your wishlist…" />;
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
          onAction={() => setIsAddOpen(true)}
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
          <WishlistItemCard
            item={item}
            onPress={() => setEditingItem(item)}
            onRemove={() => handleRemove(item)}
          />
        )}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-bold font-caslon text-dark-neutral">{s.title}</Text>
        <Pressable
          onPress={() => setIsAddOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={s.addButtonLabel}
          className="w-11 h-11 rounded-full bg-primary-container items-center justify-center"
        >
          <Text className="text-lg font-bold text-dark-neutral">+</Text>
        </Pressable>
      </View>

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
          <FilterRow
            label={s.filterPriorityLabel}
            allLabel={s.filterAllLabel}
            selected={priorityFilter}
            options={PRIORITY_FILTERS}
            optionLabel={(v) => PRIORITY_LABELS[v]}
            onSelect={setPriorityFilter}
          />
        </View>
      )}

      {renderContent()}

      {lastRemoved && (
        <View className="absolute bottom-4 left-4 right-4 bg-inverse-surface rounded-full px-5 py-3 flex-row items-center justify-between">
          <Text className="text-sm font-satoshi text-inverse-on-surface flex-1" numberOfLines={1}>
            {wishlistStrings.undo.message}
          </Text>
          <Pressable
            onPress={handleUndo}
            accessibilityRole="button"
            accessibilityLabel={wishlistStrings.undo.action}
          >
            <Text className="text-sm font-semibold font-satoshi text-inverse-primary ml-3">
              {wishlistStrings.undo.action}
            </Text>
          </Pressable>
        </View>
      )}

      <AddWishlistItemSheet
        visible={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={(item) => addItem(item)}
        isSaving={isAdding}
      />

      <EditWishlistItemSheet
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(id, patch) => editItem(id, patch)}
        isSaving={isEditing}
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
