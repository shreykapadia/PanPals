import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Shared "Reduce Motion" reader (A11Y-CHECKLIST). Every animated surface in
 * the app gates on this and renders its final state immediately when it
 * returns true — motion is decoration, never the only way something reads.
 *
 * CROSS-LANE REQUEST (Talbia): `features/empties/useReducedMotion.ts` is an
 * identical copy. It can import this one instead so there's a single hook;
 * that edit belongs to the empties lane, so it isn't made here.
 */
export function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
