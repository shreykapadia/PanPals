import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppFonts } from '../theme/fonts';
import { useAuth } from '../lib/auth/useAuth';
import '../global.css';

try {
  SplashScreen.preventAutoHideAsync().catch(() => {});
} catch {
  // Native splash screen already hidden or not registered
}

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const { session, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Hide splash screen once fonts are loaded (or errored) and the
  // persisted session flag has resolved.
  useEffect(() => {
    if ((fontsLoaded || fontError) && !authLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, authLoading]);

  // Handle auth routing redirects
  useEffect(() => {
    if (!fontsLoaded || authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onGoalCapture = (segments as string[])[1] === 'goal-capture';
    const signedIn = !!session;

    if (!signedIn && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (signedIn && inAuthGroup && !onGoalCapture) {
      router.replace('/(tabs)');
    }
  }, [session, segments, fontsLoaded, authLoading, router]);

  if ((!fontsLoaded && !fontError) || authLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Slot />
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
