import React, { useRef, useState } from 'react';
import { Modal, PanResponder, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { Product } from '../../../mocks/types';
import { colors } from '../../../theme/tokens';
import { homeStrings } from '../../home/strings';
import { inventoryStrings } from '../strings';

const STEP = 5;
const THUMB_SIZE = 24;

export function snapToStep(percent: number): number {
  return Math.min(100, Math.max(0, Math.round(percent / STEP) * STEP));
}

interface UsageLogSheetProps {
  item: Product | null;
  onClose: () => void;
  onSave: (args: { percentAfter: number; note?: string }) => Promise<unknown>;
  isSaving: boolean;
  errorMessage?: string;
}

/**
 * Standardized Usage Logging Sheet (PRD §F2, DESIGN-TOKENS v2.0.0):
 * Shared usage logging interface across Inventory and Home Focus Pot.
 * Features 5% stepper buttons (– / +), interactive drag slider track,
 * optional note entry field, and primary "Save update" pill CTA.
 */
export const UsageLogSheet: React.FC<UsageLogSheetProps> = ({
  item,
  onClose,
  onSave,
  isSaving,
  errorMessage,
}) => {
  const s = inventoryStrings.usageSheet;
  const initialPercent = snapToStep(item?.percent_remaining ?? 100);
  const [percent, setPercentState] = useState(initialPercent);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>(errorMessage);

  const percentRef = useRef(initialPercent);
  const dragStartPercentRef = useRef(initialPercent);
  const trackWidthRef = useRef(0);

  function updatePercent(next: number) {
    const clamped = snapToStep(next);
    percentRef.current = clamped;
    setPercentState(clamped);
  }

  React.useEffect(() => {
    if (item) {
      const p = snapToStep(item.percent_remaining);
      percentRef.current = p;
      setPercentState(p);
      setNote('');
      setError(errorMessage);
    }
  }, [item, errorMessage]);

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
        updatePercent(dragStartPercentRef.current + deltaPercent);
      },
    }),
  ).current;

  if (!item) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    setError(undefined);
    try {
      await onSave({ percentAfter: percent, note: note.trim() || undefined });
    } catch {
      setError(errorMessage ?? s.errorSave);
    }
  };

  const currentErrorMessage = errorMessage ?? error;
  const errorAccessibilityLabel =
    currentErrorMessage === homeStrings.logUsageErrorMessage
      ? homeStrings.logUsageErrorAccessibilityLabel
      : (currentErrorMessage ?? s.errorSave);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/30">
        <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-surface">
          <View className="flex-row items-center justify-between border-b border-border-warm px-4 py-3">
            <Text className="font-caslon text-lg font-bold text-dark-neutral">{s.title}</Text>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel without saving this update"
              hitSlop={8}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <Icon name="close" size={22} color={colors['inactive-gray']} />
            </Pressable>
          </View>

          <View className="p-4">
            <Text className="mb-4 font-satoshi text-sm text-muted-text">
              {s.subtitle(`${item.brand} ${item.name}`)}
            </Text>

            <View className="mb-4 flex-row items-center justify-center gap-6">
              <Pressable
                onPress={() => updatePercent(percent - STEP)}
                accessibilityRole="button"
                accessibilityLabel="Decrease by 5 percent"
                className="h-11 w-11 items-center justify-center rounded-full border border-border-warm"
              >
                <Text className="font-satoshi-medium text-lg text-dark-neutral">–</Text>
              </Pressable>

              <Text
                className="min-w-[72px] text-center font-caslon text-3xl font-bold text-dark-neutral"
                accessibilityLabel={`${percent}% remaining`}
              >
                {percent}%
              </Text>

              <Pressable
                onPress={() => updatePercent(percent + STEP)}
                accessibilityRole="button"
                accessibilityLabel="Increase by 5 percent"
                className="h-11 w-11 items-center justify-center rounded-full border border-border-warm"
              >
                <Text className="font-satoshi-medium text-lg text-dark-neutral">+</Text>
              </Pressable>
            </View>

            <View
              className="relative mb-6 h-3 justify-center rounded-full bg-border-warm"
              onLayout={(event) => {
                trackWidthRef.current = event.nativeEvent.layout.width;
              }}
              accessibilityRole="adjustable"
              accessibilityLabel={homeStrings.sliderAccessibilityLabel(item.brand, item.name)}
              accessibilityValue={{ min: 0, max: 100, now: percent }}
            >
              <View
                style={{ width: `${percent}%` }}
                className="absolute left-0 h-3 rounded-full bg-primary-container"
              />
              <View
                {...panResponder.panHandlers}
                style={{
                  position: 'absolute',
                  left: `${percent}%`,
                  marginLeft: -THUMB_SIZE / 2,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: THUMB_SIZE / 2,
                  backgroundColor: colors['primary-container'],
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              />
            </View>

            <Input
              label={s.noteLabel}
              value={note}
              onChangeText={setNote}
              placeholder={s.notePlaceholder}
              multiline
              accessibilityLabel={s.noteLabel}
            />

            {currentErrorMessage && (
              <Text
                accessibilityRole="alert"
                accessibilityLabel={errorAccessibilityLabel}
                className="mb-2 px-2 font-satoshi text-xs text-error"
              >
                {currentErrorMessage}
              </Text>
            )}

            <Button
              label={isSaving ? s.saving : s.save}
              onPress={handleSave}
              loading={isSaving}
              accessibilityLabel={`Save ${percent}% remaining`}
              className="mb-4 mt-2"
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
