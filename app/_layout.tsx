import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import { tokenCache } from "@/lib/auth";
import { registerBackgroundFetchAsync } from '@/store/taskStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModalPortal } from 'react-native-modals';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    registerBackgroundFetchAsync();
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <GestureHandlerRootView>
          <ClerkLoaded>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <ModalPortal />
          </ClerkLoaded>
        </GestureHandlerRootView>
      </ClerkProvider>
    </ThemeProvider>
  );
}
