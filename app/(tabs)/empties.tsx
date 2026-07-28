import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { EmptiesArchive } from '../../features/empties/EmptiesArchive';
import { EmptiesEmptyState } from '../../features/empties/EmptiesEmptyState';
import { EmptiesErrorState } from '../../features/empties/EmptiesErrorState';
import { EmptiesLoadingState } from '../../features/empties/EmptiesLoadingState';
import { FinishFlow } from '../../features/empties/FinishFlow';
import { EmptiesSummary } from '../../features/empties/EmptiesSummary';
import { emptiesStrings } from '../../features/empties/strings';
import { useEmptiesArchive } from '../../features/empties/useEmptiesArchive';
import { useProducts } from '../../lib/api';
import { mockProducts } from '../../mocks/fixtures';

const samplePreviewProduct = mockProducts[0];

export default function EmptiesTab() {
  const router = useRouter();
  const { finishProductId: finishProductIdParam } = useLocalSearchParams<{
    finishProductId?: string | string[];
  }>();
  const { entries, dashboard, isLoading, isError, refetch } = useEmptiesArchive();
  const productsQuery = useProducts();
  const [previewProductId, setPreviewProductId] = useState<string | null>(null);
  const [isSamplePreview, setIsSamplePreview] = useState(false);
  const previewProducts = useMemo(
    () => (productsQuery.data ?? []).filter((product) => product.status !== 'finished'),
    [productsQuery.data],
  );
  const finishProductId = Array.isArray(finishProductIdParam)
    ? finishProductIdParam[0]
    : finishProductIdParam;
  const closeFinishFlow = () => router.setParams({ finishProductId: undefined });

  if (isLoading) return <EmptiesLoadingState />;
  if (isError || !dashboard) return <EmptiesErrorState onRetry={() => void refetch()} />;
  if (finishProductId) {
    return (
      <FinishFlow
        productId={finishProductId}
        onComplete={closeFinishFlow}
        onCancel={closeFinishFlow}
      />
    );
  }
  if (__DEV__ && isSamplePreview) {
    return (
      <FinishFlow
        productId={samplePreviewProduct.id}
        productOverride={samplePreviewProduct}
        previewOnly
        onComplete={() => setIsSamplePreview(false)}
        onCancel={() => setIsSamplePreview(false)}
      />
    );
  }
  if (__DEV__ && previewProductId) {
    return (
      <FinishFlow
        productId={previewProductId}
        onComplete={() => setPreviewProductId(null)}
        onCancel={() => setPreviewProductId(null)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        accessibilityLabel={emptiesStrings.emptiesAccessibilityLabel}
        contentContainerClassName="flex-grow px-4 pb-8 pt-6"
      >
        <EmptiesSummary dashboard={dashboard} entries={entries} />
        {__DEV__ ? (
          <View className="mb-8 rounded-3xl bg-warning-peach p-4">
            <Text className="text-base font-satoshi-bold text-dark-neutral">
              {emptiesStrings.developerPreviewTitle}
            </Text>
            <Text className="mt-2 text-sm leading-5 font-satoshi text-muted-text">
              {previewProducts.length > 0
                ? emptiesStrings.developerPreviewMessage
                : emptiesStrings.developerSamplePreviewMessage}
            </Text>
            <View className="mt-4 gap-3">
              {previewProducts.length > 0 ? (
                previewProducts.map((product) => (
                  <Button
                    key={product.id}
                    label={emptiesStrings.developerPreviewAction(product.brand, product.name)}
                    onPress={() => setPreviewProductId(product.id)}
                    variant="secondary"
                    accessibilityLabel={emptiesStrings.developerPreviewAccessibilityLabel(
                      product.brand,
                      product.name,
                    )}
                  />
                ))
              ) : (
                <Button
                  label={emptiesStrings.developerSamplePreviewAction}
                  onPress={() => setIsSamplePreview(true)}
                  variant="secondary"
                  accessibilityLabel={emptiesStrings.developerSamplePreviewAccessibilityLabel}
                />
              )}
            </View>
          </View>
        ) : null}
        {entries.length > 0 ? (
          <EmptiesArchive entries={entries} />
        ) : (
          <View className="min-h-[320px]">
            <EmptiesEmptyState />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
