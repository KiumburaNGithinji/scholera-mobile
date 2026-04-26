import '../global.css'  // NativeWind v4 requires this import at the entry point

import { useEffect } from 'react'
import { AppState, type AppStateStatus, Platform } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter'
import { focusManager } from '@tanstack/react-query'
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider, useAuth } from '@/providers/auth-provider'

// Hold the splash screen visible until fonts have loaded.
// Per UI-SPEC: load only 2 Inter weights (400 + 600) — type contract uses exactly these.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in dev fast-refresh; safe to ignore.
})

/**
 * RN equivalent of TanStack Query's web-only refetchOnWindowFocus.
 * When the app returns from background ('active'), focus is set to true and
 * stale queries refetch. This is the "user reopens the app" UX from STACK.md.
 */
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

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

  // Subscribe to AppState changes for TanStack Query focus management.
  useEffect(() => {
    const sub = AppState.addEventListener('change', onAppStateChange)
    return () => sub.remove()
  }, [])

  // Don't mount the app tree until fonts are ready — prevents flash of system font.
  if (!fontsLoaded && !fontsError) {
    return null
  }

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <ProtectedRouter />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  )
}

/**
 * Reads auth state and redirects between (auth) and role groups.
 * Held until AuthProvider reports `ready` (session + role both resolved)
 * so we never flash the wrong role's screen.
 */
function ProtectedRouter() {
  const { session, role, ready } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return

    const seg0 = segments[0]
    const inAuthGroup = seg0 === '(auth)'
    const inRoleGroup =
      seg0 === '(admin)' || seg0 === '(professor)' || seg0 === '(student)'

    if (!session || !role) {
      if (!inAuthGroup) router.replace('/(auth)/sign-in')
      return
    }

    const expected = `(${role})`
    if (inAuthGroup) {
      router.replace(`/${expected}/(tabs)` as never)
    } else if (inRoleGroup && seg0 !== expected) {
      // Wrong role group (e.g. admin landed in /(student) — replace with correct)
      router.replace(`/${expected}/(tabs)` as never)
    }
  }, [session, role, ready, segments, router])

  if (!ready) return null

  return <Stack screenOptions={{ headerShown: false }} />
}
