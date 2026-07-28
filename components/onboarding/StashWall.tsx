import React from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../theme/tokens';

/**
 * Pexels 7256149 (DS Stories) — Pexels License: free commercial use, no
 * attribution required. Pre-cropped and downscaled to a 1179×561 band so the
 * bundle carries ~99 KB instead of the 1.4 MB original.
 */
const STASH_WALL_ART = require('../../assets/images/stash-wall.jpg');

interface StashWallProps {
  /** Band height in points, status-bar inset included — the caller pads for it. */
  height: number;
  /** Masthead content drawn over the wall. Keep it white; see the tint note. */
  children?: React.ReactNode;
}

/**
 * The onboarding masthead: a wall of unused lipsticks — the stash the headline
 * asks Maya to shop — dissolving into the cream surface so the focus tiles below
 * read as three products stepping out of it.
 *
 * Three stacked gradients do the art direction, all drawn in `react-native-svg`
 * (already a dependency) rather than pulling in `expo-linear-gradient`:
 *
 * 1. A pale-rose lift that raises the photo's near-black tubes off the floor.
 *    Washing them straight with rose reads grey-brown; lifting first lands them
 *    as rose-mauve, which is the palette's register.
 * 2. A rose wash that pulls the whole band into the token set — there is no black
 *    in it. Deep at the masthead, then thinning so the pattern keeps its own pink
 *    further down. The masthead stops are set by contrast, not taste: sampled off
 *    the render, the wordmark sits at 4.2:1 typical and 3.6:1 against the
 *    lightest pixel behind it — clear of the 3:1 floor for large text (24px bold
 *    serif) either way. Lightening the first stop eats that margin fast.
 * 3. A cream fade that reaches full `surface` at the bottom edge, so the band has
 *    no seam against the page and no hard line to align anything to.
 */
export const StashWall: React.FC<StashWallProps> = ({ height, children }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={{ height }} className="w-full overflow-hidden">
      <Image
        source={STASH_WALL_ART}
        resizeMode="cover"
        style={{ position: 'absolute', top: 0, left: 0, width, height }}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      />

      <View
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="stash-lift" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors['inverse-primary']} stopOpacity={0.08} />
              <Stop offset="0.5" stopColor={colors['inverse-primary']} stopOpacity={0.24} />
              <Stop offset="1" stopColor={colors['inverse-primary']} stopOpacity={0.2} />
            </LinearGradient>
            <LinearGradient id="stash-wash" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.94} />
              <Stop offset="0.42" stopColor={colors.primary} stopOpacity={0.68} />
              <Stop offset="0.72" stopColor={colors.primary} stopOpacity={0.4} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0.22} />
            </LinearGradient>
            <LinearGradient id="stash-dissolve" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.55" stopColor={colors.surface} stopOpacity={0} />
              <Stop offset="0.85" stopColor={colors.surface} stopOpacity={0.6} />
              <Stop offset="1" stopColor={colors.surface} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={width} height={height} fill="url(#stash-lift)" />
          <Rect x={0} y={0} width={width} height={height} fill="url(#stash-wash)" />
          <Rect x={0} y={0} width={width} height={height} fill="url(#stash-dissolve)" />
        </Svg>
      </View>

      {children}
    </View>
  );
};
