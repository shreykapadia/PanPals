import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Input } from '../../components/ui/Input';
import { RepurchaseVerdict } from '../../mocks/types';
import { emptiesStrings } from './strings';

interface RepurchaseReviewProps {
  verdict: RepurchaseVerdict;
  reviewText: string;
  isSaving: boolean;
  onVerdictChange: (verdict: RepurchaseVerdict) => void;
  onReviewTextChange: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onCancel?: () => void;
}

export function RepurchaseReview({
  verdict,
  reviewText,
  isSaving,
  onVerdictChange,
  onReviewTextChange,
  onSave,
  onSkip,
  onCancel,
}: RepurchaseReviewProps) {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerClassName="flex-grow px-6 pb-2 pt-6"
        >
          <Text className="text-2xl font-caslon-bold text-dark-neutral">
            {emptiesStrings.reviewTitle}
          </Text>
          <Text className="mt-3 text-sm leading-5 font-satoshi text-muted-text">
            {emptiesStrings.reviewMessage}
          </Text>
          <View className="mt-8">
            <Text className="mb-3 text-sm font-satoshi-bold text-dark-neutral">
              {emptiesStrings.reviewVerdictLabel}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {(Object.keys(emptiesStrings.repurchaseVerdicts) as RepurchaseVerdict[]).map(
                (option) => (
                  <Chip
                    key={option}
                    label={emptiesStrings.repurchaseVerdicts[option]}
                    selected={verdict === option}
                    onPress={() => onVerdictChange(option)}
                    accessibilityLabel={emptiesStrings.repurchaseVerdicts[option]}
                  />
                ),
              )}
            </View>
          </View>
          <View className="mt-8">
            <Input
              label={emptiesStrings.reviewInputLabel}
              placeholder={emptiesStrings.reviewInputPlaceholder}
              value={reviewText}
              onChangeText={onReviewTextChange}
              maxLength={160}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
              accessibilityLabel={emptiesStrings.reviewInputLabel}
            />
          </View>
          <Text className="text-xs font-satoshi text-muted-text">
            {emptiesStrings.reviewDefaultVerdictNote}
          </Text>
          <View className="mt-auto gap-3 pt-8">
            <Button
              label={emptiesStrings.reviewSave}
              onPress={onSave}
              loading={isSaving}
              accessibilityLabel={emptiesStrings.reviewSaveAccessibilityLabel}
            />
            <Button
              label={emptiesStrings.reviewSkip}
              onPress={onSkip}
              disabled={isSaving}
              variant="secondary"
              accessibilityLabel={emptiesStrings.reviewSkipAccessibilityLabel}
            />
            {onCancel ? (
              <Button
                label={emptiesStrings.finishCancelAction}
                onPress={onCancel}
                disabled={isSaving}
                variant="secondary"
                accessibilityLabel={emptiesStrings.reviewCancelAccessibilityLabel}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
