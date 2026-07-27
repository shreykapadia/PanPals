import React, { useRef, useState } from 'react';
import { Modal, PanResponder, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/tokens';
import { Product } from '../../mocks/types';
import { homeStrings } from './strings';

interface RingSliderProps {
  product: Product;
  onConfirm: (percent: number) => void;
  onCancel: () => void;
  isSaving?: boolean;
  errorMessage?: string;
}

export const SLIDER_STEP = 5;
const THUMB_SIZE = 28;

export function snapToStep(percent: number): number {
  return Math.min(100, Math.max(0, Math.round(percent / SLIDER_STEP) * SLIDER_STEP));
}

export function RingSlider({
  product,
  onConfirm,
  onCancel,
  isSaving,
  errorMessage,
}: RingSliderProps) {
  const initialPercent = snapToStep(product.percent_remaining);
  const percentRef = useRef(initialPercent);
  const dragStartPercentRef = useRef(initialPercent);
  const trackWidthRef = useRef(0);
  const [percent, setPercentState] = useState(initialPercent);

  function setPercent(next: number) {
    percentRef.current = next;
    setPercentState(next);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartPercentRef.current = percentRef.current;
      },
      onPanResponderMove: (_event, gestureState) => {
        if (trackWidthRef.current === 0) return;
        const deltaPercent = (gestureState.dx / trackWidthRef.current) * 100;
        setPercent(snapToStep(dragStartPercentRef.current + deltaPercent));
      },
    }),
  ).current;

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-end bg-on-surface/40">
        <View className="w-full rounded-t-3xl bg-card-surface p-6">
          <Text
            numberOfLines={1}
            className="text-center text-base font-satoshi-bold text-dark-neutral"
          >
            {product.brand} {product.name}
          </Text>
          <Text
            accessibilityLabel={homeStrings.sliderPercentAccessibilityLabel(percent)}
            className="mt-2 text-center text-4xl font-caslon-bold text-dark-neutral"
          >
            {percent}%
          </Text>

          <View
            className="mt-8 h-2 justify-center rounded-full bg-border-warm"
            onLayout={(event) => {
              trackWidthRef.current = event.nativeEvent.layout.width;
            }}
          >
            <View
              style={{ width: `${percent}%` }}
              className="absolute left-0 h-2 rounded-full bg-primary-container"
            />
            <View
              {...panResponder.panHandlers}
              accessibilityRole="adjustable"
              accessibilityLabel={homeStrings.sliderAccessibilityLabel(product.brand, product.name)}
              accessibilityValue={{ min: 0, max: 100, now: percent }}
              style={{
                position: 'absolute',
                left: `${percent}%`,
                marginLeft: -THUMB_SIZE / 2,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: colors['primary-container'],
              }}
            />
          </View>

          {errorMessage ? (
            <Text
              accessibilityLabel={homeStrings.logUsageErrorAccessibilityLabel}
              className="mt-4 text-center text-xs font-satoshi text-error"
            >
              {errorMessage}
            </Text>
          ) : null}

          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Button
                label={homeStrings.sliderCancel}
                variant="secondary"
                onPress={onCancel}
                accessibilityLabel={homeStrings.sliderCancelAccessibilityLabel}
              />
            </View>
            <View className="flex-1">
              <Button
                label={homeStrings.sliderConfirm}
                onPress={() => onConfirm(percent)}
                loading={isSaving}
                accessibilityLabel={homeStrings.sliderConfirmAccessibilityLabel(percent)}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
