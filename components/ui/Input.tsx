import React, { useState } from 'react';
import { TextInput, View, Text, Pressable, TextInputProps } from 'react-native';
import { colors } from '../../theme/tokens';
import { Icon } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Helper copy under the field. Suppressed while an error is showing. */
  hint?: string;
  /**
   * Adds a show/hide affordance for password fields, and owns
   * `secureTextEntry` for as long as it's enabled.
   */
  secureToggle?: boolean;
  /** Keeps the label for assistive tech while hiding it visually. */
  showLabel?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  secureToggle = false,
  showLabel = true,
  className = '',
  ...props
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <View className="w-full mb-4">
      {label && showLabel && (
        <Text className="text-xs text-muted-text font-satoshi-medium mb-2 px-2 uppercase tracking-wider">
          {label}
        </Text>
      )}
      <View className="justify-center">
        <TextInput
          placeholderTextColor={colors['inactive-gray']}
          className={`h-12 w-full rounded-full border border-border-warm bg-card-surface px-6 text-base text-dark-neutral font-satoshi ${
            secureToggle ? 'pr-14' : ''
          } ${error ? 'border-error' : ''} ${className}`}
          {...props}
          secureTextEntry={secureToggle ? !revealed : props.secureTextEntry}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setRevealed((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
            className="absolute right-2 h-11 w-11 items-center justify-center"
          >
            <Icon
              name={revealed ? 'eye-off' : 'eye'}
              size={18}
              color={colors['muted-text']}
              strokeWidth={1.75}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="text-sm text-error font-satoshi mt-1 px-4">{error}</Text>
      ) : hint ? (
        <Text className="text-sm text-muted-text font-satoshi mt-1 px-4">{hint}</Text>
      ) : null}
    </View>
  );
};
