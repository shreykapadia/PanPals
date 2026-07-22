import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/auth';

export default function Index() {
  const { session } = useAuthStore();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
