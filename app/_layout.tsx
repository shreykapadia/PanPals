import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useAppFonts } from '../theme/fonts';
import { useAuthStore } from '../lib/auth';
import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const { session } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Hide splash screen once fonts are loaded or have errored
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Handle auth routing redirects
  useEffect(() => {
    if (!fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const signedIn = !!session;

    if (!signedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (signedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments, fontsLoaded, router]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
