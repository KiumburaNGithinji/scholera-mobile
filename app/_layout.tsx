import '../global.css'  // NativeWind v4 requires this import at the entry point

import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter'

// Hold the splash screen visible until fonts have loaded.
// Per UI-SPEC: load only 2 Inter weights (400 + 600) — the type contract uses
// exactly these. Loading additional weights inflates cold-start by ~250KB.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in dev fast-refresh; safe to ignore.
})

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  })

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => {
        // Already hidden; noop.
      })
    }
  }, [fontsLoaded, fontsError])

  // Don't mount the app tree until fonts are ready — prevents flash of system font.
  // If font loading errors, mount anyway (fall back to system font rather than block).
  if (!fontsLoaded && !fontsError) {
    return null
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  )
}
