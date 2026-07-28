import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, Platform } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../../theme/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

/**
 * Centre ⊕ Log action (D23, DESIGN-TOKENS §5).
 *
 * The disc keeps the 64pt footprint the 88pt footer was sized for, but 4pt of it
 * is a card-coloured ring: the bar's 1px top border stops at the ring instead of
 * running behind the disc, so the button reads as part of the bar rather than
 * pasted on top of it. Flat rose fill — no gradient or sheen — per the soft
 * minimalism rule that hierarchy comes from tonal layering, not gloss.
 */
const RING = 4;
const DISC = 56;
const OUTER = DISC + RING * 2;

/** Android clips less of the overhang, so it needs a smaller lift. */
const OVERHANG = Platform.OS === 'android' ? -10 : -18;

export interface LogTabButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export const LogTabButton: React.FC<LogTabButtonProps> = ({
  onPress,
  accessibilityLabel = 'Quick log a product',
}) => {
  const reduceMotion = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    if (reduceMotion) return;
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const handlePressIn = () => animateTo(0.96);
  const handlePressOut = () => animateTo(1);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{
        color: colors['on-primary-container'],
        borderless: true,
        radius: DISC / 2,
      }}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: OVERHANG,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          width: OUTER,
          height: OUTER,
          borderRadius: OUTER / 2,
          backgroundColor: colors['card-surface'],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: DISC,
            height: DISC,
            borderRadius: DISC / 2,
            backgroundColor: colors['primary-container'],
            alignItems: 'center',
            justifyContent: 'center',
            // Soft diffused lift in the bar's own shadow language — warm charcoal
            // at low opacity, never a coloured glow (DESIGN-TOKENS §4).
            shadowColor: colors['dark-neutral'],
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Icon name="log" size={24} color={colors['dark-neutral']} strokeWidth={2} />
        </View>
      </Animated.View>
      <Text
        style={{
          marginTop: 4,
          fontSize: 11,
          color: colors['inactive-gray'],
        }}
        className="font-satoshi-medium"
      >
        Log
      </Text>
    </Pressable>
  );
};
