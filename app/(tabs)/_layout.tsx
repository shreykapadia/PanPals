import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { LogTabButton } from '../../components/ui/LogTabButton';
import { colors, spacing } from '../../theme/tokens';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors['primary-container'], // brand rose
        tabBarInactiveTintColor: colors['inactive-gray'],
        tabBarStyle: {
          height: spacing['footer-height'],
          overflow: 'visible',
          borderTopWidth: 1,
          borderTopColor: colors['border-warm'],
          backgroundColor: colors['card-surface'],
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: colors['dark-neutral'],
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Satoshi-Medium',
          fontSize: 11,
          paddingBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home Dashboard Tab',
          tabBarIcon: ({ color }) => <Icon name="home" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarLabel: 'Inventory',
          tabBarAccessibilityLabel: 'Inventory Tab',
          tabBarIcon: ({ color }) => <Icon name="inventory" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarButton: () => (
            <LogTabButton
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/inventory',
                  params: { action: 'log' },
                })
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarLabel: 'Wishlist',
          tabBarAccessibilityLabel: 'Wishlist Tab',
          tabBarIcon: ({ color }) => <Icon name="wishlist" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="empties"
        options={{
          title: 'Empties',
          tabBarLabel: 'Empties',
          tabBarAccessibilityLabel: 'Empties Archive Tab',
          tabBarIcon: ({ color }) => <Icon name="empties" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
