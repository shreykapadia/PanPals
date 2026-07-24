import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native';
import { Icon } from '../../components/ui/Icon';
import { Product } from '../../mocks/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressRing } from './components/ProgressRing';
import { emptiesStrings } from './strings';
import { useReducedMotion } from './useReducedMotion';

interface CelebrationStateProps {
  product: Product;
  monthsInUse: number | null;
  onContinue: () => void;
  onCancel?: () => void;
  previewOnly?: boolean;
}

const particleCount = 150;
const backgroundParticleCount = 18;
const ringLoadDuration = 360;
const checkPopDuration = 260;
const burstDelay = 80;
const mainCelebrationDuration = 6000;
const backgroundTwinkleDuration = 4000;

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10_000;
  return value - Math.floor(value);
}

const burstOffsets = Array.from({ length: particleCount }, (_, index) => {
  const seed = index + 1;
  const angle = seededRandom(seed * 19.19) * Math.PI * 2;
  const radius = 55 + seededRandom(seed * 71.71) * 75;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
});
const backgroundOffsets = burstOffsets.slice(0, backgroundParticleCount);

export function CelebrationState({
  product,
  monthsInUse,
  onContinue,
  onCancel,
  previewOnly = false,
}: CelebrationStateProps) {
  const reduceMotion = useReducedMotion();
  const checkAnimation = useRef(new Animated.Value(0)).current;
  const burstAnimation = useRef(new Animated.Value(0)).current;
  const backgroundAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      checkAnimation.stopAnimation();
      burstAnimation.stopAnimation();
      backgroundAnimation.stopAnimation();
      checkAnimation.setValue(1);
      burstAnimation.setValue(0);
      backgroundAnimation.setValue(0);
      return;
    }

    checkAnimation.setValue(0);
    burstAnimation.setValue(0);
    backgroundAnimation.setValue(0);
    const check = Animated.timing(checkAnimation, {
      toValue: 1,
      duration: checkPopDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const burst = Animated.timing(burstAnimation, {
      toValue: 1,
      duration: mainCelebrationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const background = Animated.timing(backgroundAnimation, {
      toValue: 1,
      duration: backgroundTwinkleDuration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const checkTimer = setTimeout(() => check.start(), ringLoadDuration);
    const burstTimer = setTimeout(() => burst.start(), ringLoadDuration + burstDelay);
    const backgroundTimer = setTimeout(
      () => background.start(),
      ringLoadDuration + burstDelay + mainCelebrationDuration,
    );

    return () => {
      clearTimeout(checkTimer);
      clearTimeout(burstTimer);
      clearTimeout(backgroundTimer);
      check.stop();
      burst.stop();
      background.stop();
    };
  }, [backgroundAnimation, burstAnimation, checkAnimation, reduceMotion]);

  const sparkleStyle = {
    opacity: burstAnimation.interpolate({
      inputRange: [0, 0.1, 0.5, 1],
      outputRange: [0, 0.65, 0.35, 0],
    }),
    transform: [
      {
        scale: burstAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
      },
    ],
  };

  const completionBadgePopStyle = {
    opacity: checkAnimation.interpolate({
      inputRange: [0, 0.18, 0.45, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [
      {
        scale: checkAnimation.interpolate({
          inputRange: [0, 0.3, 0.58, 1],
          outputRange: [0.55, 1.22, 0.94, 1],
        }),
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-surface px-6 pb-8 pt-24">
      <View
        accessibilityLabel={emptiesStrings.celebrationProductAccessibilityLabel(
          product.brand,
          product.name,
        )}
        className="mb-5 w-full flex-row items-center rounded-3xl bg-card-surface p-3 shadow-sm"
      >
        {product.photo_url ? (
          <Image
            source={{ uri: product.photo_url }}
            accessibilityLabel={`${product.brand} ${product.name}`}
            className="mr-3 h-14 w-14 rounded-2xl bg-surface-container"
          />
        ) : (
          <View className="mr-3 h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
            <Text className="text-base font-satoshi-bold text-dark-neutral">
              {product.brand.slice(0, 1)}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-xs font-satoshi text-muted-text">
            {emptiesStrings.celebrationProductLabel}
          </Text>
          <Text className="mt-1 text-base font-satoshi-bold text-dark-neutral" numberOfLines={1}>
            {product.brand} {product.name}
          </Text>
          {product.shade ? (
            <Text className="mt-1 text-xs font-satoshi text-muted-text" numberOfLines={1}>
              {emptiesStrings.celebrationProductShade(product.shade)}
            </Text>
          ) : null}
        </View>
      </View>
      <View className="flex-1 items-center justify-start pt-6">
        <Animated.Text
          accessibilityElementsHidden
          style={sparkleStyle}
          className="mb-4 text-xl text-primary-container"
        >
          {emptiesStrings.celebrationSparkles}
        </Animated.Text>
        <View className="relative h-40 w-40 items-center justify-center">
          {burstOffsets.map((offset, index) => {
            const burstStyle = {
              opacity: burstAnimation.interpolate({
                inputRange: [0, 0.08, 0.35, 0.75, 1],
                outputRange: [0, 0.9, 0.72, 0.2, 0],
              }),
              transform: [
                {
                  translateX: burstAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [offset.x * 0.7, offset.x * 1.45],
                  }),
                },
                {
                  translateY: burstAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [offset.y * 0.7, offset.y * 1.45],
                  }),
                },
                {
                  scale: burstAnimation.interpolate({
                    inputRange: [0, 0.08, 0.35, 1],
                    outputRange: [0.5, 1.1, 0.82, 0.7],
                  }),
                },
              ],
            };

            return (
              <Animated.View
                key={`${index}-${offset.x}-${offset.y}`}
                pointerEvents="none"
                accessibilityElementsHidden
                style={burstStyle}
                className="absolute inset-0 items-center justify-center"
              >
                <Text className="text-2xl text-primary-container">
                  {
                    emptiesStrings.celebrationBurstSparkles[
                      index % emptiesStrings.celebrationBurstSparkles.length
                    ]
                  }
                </Text>
              </Animated.View>
            );
          })}
          {backgroundOffsets.map((offset, index) => {
            const twinkleMidpoint = 0.3 + (index % 4) * 0.1;
            const backgroundStyle = {
              opacity: backgroundAnimation.interpolate({
                inputRange: [0, 0.08, twinkleMidpoint, 0.82, 1],
                outputRange: [0, 0.16, 0.08, 0.12, 0],
              }),
              transform: [
                {
                  translateX: backgroundAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [offset.x * 1.2, offset.x * 1.35],
                  }),
                },
                {
                  translateY: backgroundAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [offset.y * 1.2, offset.y * 1.35],
                  }),
                },
                {
                  scale: backgroundAnimation.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0.65, 0.95, 0.78, 0.65],
                  }),
                },
              ],
            };

            return (
              <Animated.View
                key={`background-${index}-${offset.x}-${offset.y}`}
                pointerEvents="none"
                accessibilityElementsHidden
                style={backgroundStyle}
                className="absolute inset-0 items-center justify-center"
              >
                <Text className="text-xl text-primary-container">
                  {
                    emptiesStrings.celebrationBurstSparkles[
                      index % emptiesStrings.celebrationBurstSparkles.length
                    ]
                  }
                </Text>
              </Animated.View>
            );
          })}
          <ProgressRing percent={100} size={160} />
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            className="absolute inset-0 items-center justify-center"
          >
            <Animated.View
              style={completionBadgePopStyle}
              className="h-12 w-12 items-center justify-center rounded-full bg-primary-container shadow-sm"
            >
              <Text className="text-2xl font-satoshi-bold text-card-surface">
                {emptiesStrings.celebrationCompletionMark}
              </Text>
            </Animated.View>
          </View>
        </View>
        <Text className="mt-8 text-center text-3xl font-caslon-bold text-dark-neutral">
          {emptiesStrings.celebrationTitle}
        </Text>
        <Text className="mt-3 text-center text-sm leading-5 font-satoshi text-muted-text">
          {emptiesStrings.celebrationMessage}
        </Text>
        {previewOnly ? (
          <Text className="mt-3 text-center text-xs leading-4 font-satoshi text-muted-text">
            {emptiesStrings.previewOnlyMessage}
          </Text>
        ) : null}
        {monthsInUse !== null ? (
          <View className="mt-5 rounded-full bg-eco-sage px-4 py-2">
            <Text className="text-sm font-satoshi-medium text-dark-neutral">
              {emptiesStrings.monthsInUse(monthsInUse)}
            </Text>
          </View>
        ) : null}
      </View>
      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel={emptiesStrings.celebrationContinueAccessibilityLabel}
        className="h-14 w-full items-center justify-center rounded-full bg-primary-container px-6 active:bg-primary"
      >
        <Text className="text-base font-satoshi font-semibold tracking-wide text-dark-neutral">
          {emptiesStrings.celebrationContinue}
        </Text>
      </Pressable>
      {onCancel ? (
        <Pressable
          onPress={onCancel}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={emptiesStrings.finishCancelAccessibilityLabel}
          className="absolute left-6 top-12 z-50 h-12 w-12 items-center justify-center rounded-full bg-card-surface shadow-sm"
        >
          <Icon name="close" size={20} />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
