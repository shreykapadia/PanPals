import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { useLogUsage } from '../../lib/api';
import { Product } from '../../mocks/types';
import { AddToFocusRow } from './AddToFocusRow';
import { FocusCard } from './FocusCard';
import { StatusDonut } from './StatusDonut';
import { QuickActions } from './QuickActions';
import { RecentProgress } from './RecentProgress';
import { RingSlider } from './RingSlider';
import { StreakRow } from './StreakRow';
import { ReconsiderNudge } from './ReconsiderNudge';
import { homeStrings } from './strings';
import { useFocusPot } from './useFocusPot';
import { useHomeData } from './useHomeData';

export function HomeScreen() {
  const {
    focusProducts,
    isFocusFull,
    unpinnedProducts,
    hasAnyActiveProducts,
    statusCounts,
    streak,
    readyWishlistItem,
    isLoading,
    isError,
    refetch,
  } = useHomeData();
  const focusPot = useFocusPot();
  const logUsage = useLogUsage();
  const [activeSliderProduct, setActiveSliderProduct] = useState<Product | null>(null);
  const [sliderError, setSliderError] = useState<string | undefined>();

  function closeSlider() {
    setActiveSliderProduct(null);
    setSliderError(undefined);
    logUsage.reset();
  }

  function confirmSlider(percent: number) {
    if (!activeSliderProduct) return;
    setSliderError(undefined);
    logUsage.mutate(
      { productId: activeSliderProduct.id, percentAfter: percent },
      {
        onSuccess: closeSlider,
        onError: () => setSliderError(homeStrings.logUsageErrorMessage),
      },
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <LoadingState
          message={homeStrings.loadingMessage}
          accessibilityLabel={homeStrings.loadingAccessibilityLabel}
        />
      </SafeAreaView>
    );
  }

  if (isError || !statusCounts || !streak) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <ErrorState
          title={homeStrings.errorTitle}
          message={homeStrings.errorMessage}
          accessibilityLabel={homeStrings.errorAccessibilityLabel}
          onRetry={() => void refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="h-14 items-center justify-center border-b border-border-warm bg-surface">
        <Text className="text-2xl font-caslon-bold text-dark-neutral">{homeStrings.wordmark}</Text>
      </View>
      <ScrollView contentContainerClassName="flex-grow px-4 pb-8 pt-6">
        <Text className="mb-3 text-lg font-caslon-bold text-dark-neutral">
          {homeStrings.focusSectionTitle}
        </Text>
        {focusProducts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {focusProducts.map((product) => (
              <FocusCard
                key={product.id}
                product={product}
                onPressRing={setActiveSliderProduct}
                onUnpin={focusPot.unpin}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="mb-8 min-h-[160px]">
            <EmptyState
              title={homeStrings.focusEmptyTitle}
              message={homeStrings.focusEmptyMessage}
              accessibilityLabel={homeStrings.focusEmptyAccessibilityLabel}
              icon="home"
            />
          </View>
        )}

        <AddToFocusRow
          products={unpinnedProducts}
          isFull={isFocusFull}
          hasAnyProducts={hasAnyActiveProducts}
          onPin={focusPot.pin}
        />
        <StatusDonut statusCounts={statusCounts} />
        <QuickActions />
        <RecentProgress />
        <StreakRow currentStreak={streak.current_streak} lastLogDate={streak.last_log_date} />
        {readyWishlistItem ? <ReconsiderNudge item={readyWishlistItem} /> : null}
      </ScrollView>

      {activeSliderProduct ? (
        <RingSlider
          product={activeSliderProduct}
          onConfirm={confirmSlider}
          onCancel={closeSlider}
          isSaving={logUsage.isPending}
          errorMessage={sliderError}
        />
      ) : null}
    </SafeAreaView>
  );
}
