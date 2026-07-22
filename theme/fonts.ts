import { useFonts as useExpoFonts } from 'expo-font';
import {
  LibreCaslonText_400Regular,
  LibreCaslonText_700Bold,
} from '@expo-google-fonts/libre-caslon-text';

export function useAppFonts() {
  const [loaded, error] = useExpoFonts({
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
    'LibreCaslonText-Regular': LibreCaslonText_400Regular,
    'LibreCaslonText-Bold': LibreCaslonText_700Bold,
  });

  return [loaded, error] as const;
}
