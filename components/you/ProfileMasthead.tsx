import React from 'react';
import { Image, Text, useWindowDimensions, View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../theme/tokens';

interface ProfileMastheadProps {
  username: string;
  avatarUrl: string | null;
  /** Uppercase micro-copy above the name. */
  eyebrow: string;
  /** Pre-formatted "Panning since March 2026". Omitted when the date is unknown. */
  memberSince?: string;
  /** One honest label for the whole band; the parts stay silent. */
  accessibilityLabel: string;
  /** Status-bar inset — the band bleeds under it and pads for itself. */
  topInset: number;
}

/** Band depth below the status bar: name block plus ~44pt of fade into the page. */
const BAND_HEIGHT = 172;
const AVATAR_SIZE = 64;

/**
 * The You tab's masthead — a warm tonal band carrying the avatar, name, and how
 * long she's been panning.
 *
 * It replaces the centered avatar-in-a-white-card that used to open this screen.
 * That card spent ~110pt to say one word and carried the same visual weight as
 * every other card below it, so the page had no focal point. A band that bleeds
 * to the top edge gives the tab one, and reads as the cover of her own project-pan
 * notebook rather than an iOS settings screen.
 *
 * Two gradients, both in `react-native-svg` (already a dependency — no
 * `expo-linear-gradient`), and no image asset: the photographic wall belongs to
 * onboarding (`StashWall`), and reusing it here would spend 99 KB to repeat a
 * joke the user has already heard.
 *
 * 1. A vertical tonal fade, `surface-container-high` → `surface`, so the band has
 *    no seam against the page and nothing below it needs to align to an edge.
 * 2. A rose bloom behind the avatar, which is what keeps the band from reading as
 *    grey. It stops at 0.3 opacity for contrast, not taste: the meta line sits at
 *    6.4:1 against the bloomed tone using `on-surface-variant`, where the muted
 *    `#666666` it would otherwise use lands at 4.0:1 — under the floor for 14px.
 *    Deepening the bloom pushes the name and eyebrow down with it.
 *
 * Deliberately light: this is the one tab that bleeds under the status bar with a
 * pale surface, so the app's default dark status-bar glyphs stay legible and the
 * screen needs no `setStatusBarStyle` juggling the way `welcome` does.
 */
export const ProfileMasthead: React.FC<ProfileMastheadProps> = ({
  username,
  avatarUrl,
  eyebrow,
  memberSince,
  accessibilityLabel,
  topInset,
}) => {
  const { width } = useWindowDimensions();
  const height = topInset + BAND_HEIGHT;
  const initial = username.trim().charAt(0).toUpperCase();

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={{ height }}
      className="w-full overflow-hidden"
    >
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="you-band" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors['surface-container-high']} />
              <Stop offset="0.58" stopColor={colors['surface-container-low']} />
              <Stop offset="1" stopColor={colors.surface} />
            </LinearGradient>
            <RadialGradient id="you-bloom" cx="0.2" cy="0.46" r="0.6">
              <Stop offset="0" stopColor={colors['primary-container']} stopOpacity={0.3} />
              <Stop offset="1" stopColor={colors['primary-container']} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={width} height={height} fill="url(#you-band)" />
          <Rect x={0} y={0} width={width} height={height} fill="url(#you-bloom)" />
        </Svg>
      </View>

      <View
        className="flex-1 flex-row items-center px-6"
        style={{ paddingTop: topInset }}
        importantForAccessibility="no-hide-descendants"
      >
        <View style={styles.avatarLift} className="rounded-full border-2 border-card-surface">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }}
              accessible={false}
            />
          ) : (
            <View
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              className="items-center justify-center rounded-full bg-primary-container"
            >
              <Text className="text-2xl font-caslon-bold text-on-primary-container">{initial}</Text>
            </View>
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-xs uppercase tracking-wider font-satoshi-medium text-on-primary-container">
            {eyebrow}
          </Text>
          <Text className="mt-1 text-2xl font-caslon-bold text-dark-neutral" numberOfLines={2}>
            {username}
          </Text>
          {memberSince ? (
            <Text className="mt-1 text-sm font-satoshi text-on-surface-variant">{memberSince}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Soft and diffused, never a hard black shadow (DESIGN-TOKENS §4). Lifts the
  // disc off the band so the white ring around it reads as a ring.
  avatarLift: {
    shadowColor: colors['dark-neutral'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
});
