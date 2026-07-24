import React, { useEffect, useMemo, useState } from 'react';
import { ParamListBase } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from 'expo-router';
import { Text, View } from 'react-native';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { useProducts } from '../../lib/api';
import { Product, RepurchaseVerdict } from '../../mocks/types';
import { CelebrationState } from './CelebrationState';
import { RepurchaseReview } from './RepurchaseReview';
import { emptiesStrings } from './strings';
import { useFinishProduct } from './useFinishProduct';

type FinishStep = 'celebrate' | 'review' | 'saved';

interface FinishFlowProps {
  productId: string;
  onComplete?: () => void;
  onCancel?: () => void;
  productOverride?: Product;
  previewOnly?: boolean;
}

function monthsSinceOpened(product: Product): number | null {
  if (!product.opened_at) return null;

  const openedAt = new Date(product.opened_at);
  const months = Math.floor((Date.now() - openedAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  return Math.max(1, months);
}

export function FinishFlow({
  productId,
  onComplete,
  onCancel,
  productOverride,
  previewOnly = false,
}: FinishFlowProps) {
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const productsQuery = useProducts();
  const product = useMemo(
    () =>
      productOverride ?? (productsQuery.data ?? []).find((candidate) => candidate.id === productId),
    [productId, productOverride, productsQuery.data],
  );
  const { finish, error, isPending, reset } = useFinishProduct();
  const [step, setStep] = useState<FinishStep>('celebrate');
  const [reviewText, setReviewText] = useState('');
  const [verdict, setVerdict] = useState<RepurchaseVerdict>('maybe');

  const cancelFinish = () => {
    if (onCancel) {
      onCancel();
    } else {
      setStep('celebrate');
    }
  };

  useEffect(() => {
    if (!onCancel) return;

    return navigation.addListener('tabPress', onCancel);
  }, [navigation, onCancel]);

  const saveFinish = async (selectedVerdict: RepurchaseVerdict, note?: string) => {
    if (previewOnly) {
      if (onComplete) {
        onComplete();
      } else {
        setStep('saved');
      }
      return;
    }

    try {
      await finish({
        productId,
        repurchase: selectedVerdict,
        reviewText: note?.trim() || undefined,
        photoUrl: product?.photo_url ?? undefined,
      });
      if (onComplete) {
        onComplete();
      } else {
        setStep('saved');
      }
    } catch {
      // TanStack Query exposes the error state below and allows a calm retry.
    }
  };

  if (!productOverride && productsQuery.isPending) {
    return (
      <LoadingState
        message={emptiesStrings.loadingArchive}
        accessibilityLabel={emptiesStrings.loadingArchiveAccessibilityLabel}
      />
    );
  }

  if ((!productOverride && productsQuery.isError) || !product) {
    return (
      <ErrorState
        title={emptiesStrings.finishNotFoundTitle}
        message={emptiesStrings.finishNotFoundMessage}
        onRetry={() => void productsQuery.refetch()}
        accessibilityLabel={emptiesStrings.finishNotFoundTitle}
      />
    );
  }

  if (step === 'review') {
    if (error) {
      return (
        <ErrorState
          title={emptiesStrings.finishErrorTitle}
          message={emptiesStrings.finishErrorMessage}
          onRetry={reset}
          accessibilityLabel={emptiesStrings.finishErrorTitle}
        />
      );
    }

    return (
      <RepurchaseReview
        verdict={verdict}
        reviewText={reviewText}
        isSaving={isPending}
        onVerdictChange={setVerdict}
        onReviewTextChange={setReviewText}
        onSave={() => void saveFinish(verdict, reviewText)}
        onSkip={() => void saveFinish('maybe')}
        onCancel={cancelFinish}
      />
    );
  }

  if (step === 'saved') {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-center text-2xl font-caslon-bold text-dark-neutral">
          {emptiesStrings.finishSavedTitle}
        </Text>
        <Text className="mt-3 text-center text-sm leading-5 font-satoshi text-muted-text">
          {emptiesStrings.finishSavedMessage}
        </Text>
      </View>
    );
  }

  return (
    <CelebrationState
      product={product}
      monthsInUse={monthsSinceOpened(product)}
      onContinue={() => setStep('review')}
      onCancel={cancelFinish}
      previewOnly={previewOnly}
    />
  );
}
