import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Input } from './Input';
import { Card } from './Card';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { useCatalogSearch } from '../../lib/api';
import { CatalogProduct, Category } from '../../mocks/types';

const DEBOUNCE_MS = 250;

interface ProductSearchProps {
  onSelect: (product: CatalogProduct) => void;
  onManualEntry?: () => void;
  category?: Category;
  placeholder?: string;
  allowManual?: boolean;
}

/**
 * Reusable catalog type-ahead (F1/F5 pre-fill). Imported by Joon (wishlist
 * add) and Matt (log modal) — keep this prop API stable (AI-CONTEXT §3).
 */
export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSelect,
  onManualEntry,
  category,
  placeholder = 'Search by brand or product name',
  allowManual = true,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const { data: results, isLoading, isError, refetch } = useCatalogSearch(debouncedQuery, category);

  const hasQuery = debouncedQuery.trim().length > 0;
  const hasResults = (results?.length ?? 0) > 0;

  return (
    <View className="w-full">
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        autoCapitalize="none"
        accessibilityLabel="Search the product catalog"
        accessibilityHint="Type a brand or product name to search"
      />

      {hasQuery && isLoading && <LoadingState message="Searching the catalog..." />}

      {hasQuery && !isLoading && isError && (
        <ErrorState message="We couldn't search the catalog right now." onRetry={() => refetch()} />
      )}

      {hasQuery && !isLoading && !isError && !hasResults && (
        <EmptyState
          title="No matches yet"
          message="Keep typing, or enter this product manually below."
          icon="info"
          accessibilityLabel="No catalog matches found"
        />
      )}

      {hasQuery && !isLoading && !isError && hasResults && (
        <View className="mt-2">
          {results!.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.brand} ${item.name}${
                item.shade_or_variant ? `, ${item.shade_or_variant}` : ''
              }`}
            >
              <Card className="mb-2 flex-row items-center">
                <View className="w-10 h-10 rounded-lg bg-surface-container items-center justify-center mr-3 overflow-hidden">
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} className="w-10 h-10" />
                  ) : (
                    <Text className="text-xs font-satoshi text-muted-text">
                      {item.brand.charAt(0)}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold font-satoshi text-dark-neutral"
                    numberOfLines={1}
                  >
                    {item.brand} · {item.name}
                  </Text>
                  {item.shade_or_variant && (
                    <Text className="text-xs font-satoshi text-muted-text" numberOfLines={1}>
                      {item.shade_or_variant}
                    </Text>
                  )}
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      {allowManual && (
        <Pressable
          onPress={onManualEntry}
          accessibilityRole="button"
          accessibilityLabel="Enter this product manually"
          className="mt-2 items-center py-3"
        >
          <Text className="text-sm font-semibold font-satoshi text-primary">Enter manually</Text>
        </Pressable>
      )}
    </View>
  );
};
