import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptiesArchive } from '../../features/empties/EmptiesArchive';
import { EmptiesEmptyState } from '../../features/empties/EmptiesEmptyState';
import { EmptiesErrorState } from '../../features/empties/EmptiesErrorState';
import { EmptiesLoadingState } from '../../features/empties/EmptiesLoadingState';
import { FinishFlow } from '../../features/empties/FinishFlow';
import { EmptiesSummary } from '../../features/empties/EmptiesSummary';
import { emptiesStrings } from '../../features/empties/strings';
import { useEmptiesArchive } from '../../features/empties/useEmptiesArchive';

export default function EmptiesTab() {
  const router = useRouter();
  const { finishProductId: finishProductIdParam } = useLocalSearchParams<{
    finishProductId?: string | string[];
  }>();
  const { entries, dashboard, isLoading, isError, refetch } = useEmptiesArchive();

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

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        accessibilityLabel={emptiesStrings.emptiesAccessibilityLabel}
        contentContainerClassName="flex-grow px-4 pb-8 pt-6"
      >
        <EmptiesSummary dashboard={dashboard} entries={entries} />
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
