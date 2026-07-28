import React, { useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Icon } from '../../../components/ui/Icon';
import { colors } from '../../../theme/tokens';
import { Product } from '../../../mocks/types';
import { inventoryStrings } from '../strings';

const STEP = 5;

interface UsageLogSheetProps {
  item: Product | null;
  onClose: () => void;
  onSave: (args: { percentAfter: number; note?: string }) => Promise<unknown>;
  isSaving: boolean;
}

/**
 * F2 usage update (PRD §F2): honor-system 5% steps, each log its own row.
 * No slider library is in the stack (D8 forbids adding one for this alone),
 * so the 5% step is a +/- stepper with a filled bar — same granularity,
 * fully accessible via button taps.
 */
export const UsageLogSheet: React.FC<UsageLogSheetProps> = ({
  item,
  onClose,
  onSave,
  isSaving,
}) => {
  const s = inventoryStrings.usageSheet;
  const [percent, setPercent] = useState(item?.percent_remaining ?? 100);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();

  // Re-seed local state whenever a new item opens the sheet.
  React.useEffect(() => {
    if (item) {
      setPercent(item.percent_remaining);
      setNote('');
      setError(undefined);
    }
  }, [item]);

  if (!item) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {
    setError(undefined);
    try {
      await onSave({ percentAfter: percent, note: note.trim() || undefined });
      handleClose();
    } catch {
      setError(s.errorSave);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/30">
        <SafeAreaView edges={['bottom']} className="bg-surface rounded-t-3xl">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-warm">
            <Text className="text-lg font-bold font-caslon text-dark-neutral">{s.title}</Text>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={inventoryStrings.detailSheet.close}
              hitSlop={8}
              className="min-w-[44px] min-h-[44px] items-center justify-center"
            >
              <Icon name="close" size={22} color={colors['inactive-gray']} />
            </Pressable>
          </View>

          <View className="p-4">
            <Text className="text-sm font-satoshi text-muted-text mb-4">
              {s.subtitle(`${item.brand} ${item.name}`)}
            </Text>

            <View className="flex-row items-center justify-center gap-6 mb-2">
              <Pressable
                onPress={() => setPercent((p) => Math.max(0, p - STEP))}
                accessibilityRole="button"
                accessibilityLabel="Decrease by 5 percent"
                className="w-11 h-11 rounded-full border border-border-warm items-center justify-center"
              >
                <Text className="text-lg font-satoshi-medium text-dark-neutral">–</Text>
              </Pressable>

              <Text
                className="text-2xl font-bold font-caslon text-dark-neutral min-w-[72px] text-center"
                accessibilityLabel={`${percent} percent remaining`}
              >
                {percent}%
              </Text>

              <Pressable
                onPress={() => setPercent((p) => Math.min(100, p + STEP))}
                accessibilityRole="button"
                accessibilityLabel="Increase by 5 percent"
                className="w-11 h-11 rounded-full border border-border-warm items-center justify-center"
              >
                <Text className="text-lg font-satoshi-medium text-dark-neutral">+</Text>
              </Pressable>
            </View>

            <View
              className="h-3 rounded-full bg-border-warm overflow-hidden mb-6"
              accessibilityRole="progressbar"
              accessibilityLabel={`${percent} percent remaining`}
            >
              <View
                className="h-3 rounded-full bg-primary-container"
                style={{ width: `${percent}%` }}
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

            {error && (
              <Text accessibilityRole="alert" className="text-xs text-error font-satoshi mb-2 px-2">
                {error}
              </Text>
            )}

            <Button
              label={isSaving ? s.saving : s.save}
              onPress={handleSave}
              loading={isSaving}
              accessibilityLabel={s.save}
              className="mt-2 mb-4"
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
