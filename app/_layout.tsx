import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts as useArchivo,
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  useFonts as useJetBrains,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import {
  useFonts as useSerif,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [archivoLoaded, archivoError] = useArchivo({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
  });
  const [jbLoaded, jbError] = useJetBrains({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  const [serifLoaded, serifError] = useSerif({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });

  // Dacă fonturile eșuează, continuăm oricum — RN va folosi fontul sistemului
  const loaded = (archivoLoaded && jbLoaded && serifLoaded) || !!(archivoError || jbError || serifError);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="car/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="car/[id]" />
        <Stack.Screen name="fuel" options={{ presentation: 'modal' }} />
        <Stack.Screen name="fines" />
        <Stack.Screen name="fine/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="document/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="expense/new" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
