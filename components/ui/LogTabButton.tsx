import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, Platform } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../../theme/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

/**
 * Centre ⊕ Log action (D23, DESIGN-TOKENS §5).
 *
 * Two things keep this from looking pasted onto the bar:
 *
 * 1. The layout column is an exact copy of a destination tab's column — a 24pt
 *    icon slot at `marginTop: 8` plus an 11pt label with `paddingBottom: 8`,
 *    mirroring `tabBarIconStyle`/`tabBarLabelStyle` in app/(tabs)/_layout.tsx.
 *    "Log" therefore lands on the same baseline as the other four labels
 *    whatever height the bar resolves to. The disc is absolutely positioned over
 *    that column, so its overhang can never drag the label off-baseline.
 * 2. 4pt of the 64pt footprint is a card-coloured ring, so the bar's 1px top
 *    border stops at the ring instead of running behind the disc.
 *
 * The fill is flat rose — no gradient, no sheen — per the soft-minimalism rule
 * that hierarchy comes from tonal layering, not gloss.
 */
const RING = 4;
const DISC = 56;
const OUTER = DISC + RING * 2;
const ICON_SLOT = 24;
const ICON_MARGIN_TOP = 8;
const LABEL_PADDING_BOTTOM = 8;

/**
 * The disc's bottom edge sits where a destination tab's icon ends and it grows
 * upward from there, overhanging the bar by ~17pt. Android clips children
 * outside the bar more aggressively, so it keeps a shallower overhang.
 */
const ANDROID_INSET = Platform.OS === 'android' ? 8 : 0;
const DISC_TOP = ICON_MARGIN_TOP + ICON_SLOT - OUTER + ANDROID_INSET;

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
      // The disc overhangs the Pressable's own box, and touches outside a
      // parent's bounds are dropped without slop to cover them.
      hitSlop={{ top: -DISC_TOP + 4, bottom: 8, left: 12, right: 12 }}
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
      }}
    >
      {/* Stands in for a destination tab's icon so the column measures the same
          and "Log" aligns with the other labels. */}
      <View style={{ width: OUTER, height: ICON_SLOT, marginTop: ICON_MARGIN_TOP }} />
      <Animated.View
        style={{
          position: 'absolute',
          top: DISC_TOP,
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
            // Soft diffused lift in the bar's own shadow language — warm
            // charcoal at low opacity, never a coloured glow (DESIGN-TOKENS §4).
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
          paddingBottom: LABEL_PADDING_BOTTOM,
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
