import React from 'react';
import { Modal, ModalProps } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

export interface ModalScreenProps extends ModalProps {
  children: React.ReactNode;
  containerClassName?: string;
}

const DEFAULT_METRICS = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/**
 * Standard platform wrapper for full-screen Modal dialogs.
 * React Native Modals mount inside a separate native WindowController on iOS/Android.
 * Nesting <SafeAreaProvider> inside <Modal> ensures <SafeAreaView> measures the top
 * status bar / notch / dynamic island insets correctly so modal header content is not cut off.
 */
export const ModalScreen: React.FC<ModalScreenProps> = ({
  children,
  containerClassName = 'flex-1 bg-surface',
  ...modalProps
}) => {
  return (
    <Modal {...modalProps}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? DEFAULT_METRICS}>
        <SafeAreaView className={containerClassName}>{children}</SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};
