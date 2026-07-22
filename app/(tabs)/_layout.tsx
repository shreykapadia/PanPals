import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { colors } from '../../theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors['primary-container'], // brand rose
        tabBarInactiveTintColor: colors['inactive-gray'],
        tabBarStyle: {
          height: 80,
          borderTopWidth: 1,
          borderTopColor: colors['border-warm'],
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#333333',
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
        name="progress"
        options={{
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarAccessibilityLabel: 'Progress Tab',
          tabBarIcon: ({ color }) => <Icon name="progress" color={color} size={24} />,
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
        name="you"
        options={{
          title: 'You',
          tabBarLabel: 'You',
          tabBarAccessibilityLabel: 'You Profile Tab',
          tabBarIcon: ({ color }) => <Icon name="you" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
