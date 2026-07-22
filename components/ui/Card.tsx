import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <View
      style={styles.shadow}
      className={`bg-card-surface rounded-xl border border-border-warm p-4 ${className}`}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: colors['dark-neutral'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
});
