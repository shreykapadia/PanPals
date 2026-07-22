import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth/useAuth';

export default function Index() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}
