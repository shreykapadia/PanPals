import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Camera, Plus, Search } from 'lucide-react-native';
import { colors } from '../../theme/tokens';
import { homeStrings } from './strings';

function QuickActionPill({
  icon,
  label,
  accessibilityLabel,
}: {
  icon: React.ReactNode;
  label: string;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={() => {}}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="mr-3 min-h-[44px] flex-row items-center gap-2 rounded-full border border-border-warm bg-card-surface px-4 py-2"
    >
      {icon}
      <Text className="text-xs font-satoshi-bold text-dark-neutral">{label}</Text>
    </Pressable>
  );
}

export function QuickActions() {
  return (
    <View className="mb-8 flex-row">
      <QuickActionPill
        icon={<Camera size={16} color={colors['inactive-gray']} strokeWidth={2} />}
        label={homeStrings.quickActionScan}
        accessibilityLabel={homeStrings.quickActionScanAccessibilityLabel}
      />
      <QuickActionPill
        icon={<Search size={16} color={colors['inactive-gray']} strokeWidth={2} />}
        label={homeStrings.quickActionSearch}
        accessibilityLabel={homeStrings.quickActionSearchAccessibilityLabel}
      />
      <QuickActionPill
        icon={<Plus size={16} color={colors['inactive-gray']} strokeWidth={2} />}
        label={homeStrings.quickActionLogItem}
        accessibilityLabel={homeStrings.quickActionLogItemAccessibilityLabel}
      />
    </View>
  );
}
