// CRITICAL: react-native-url-polyfill/auto MUST be the FIRST import in this file.
// supabase-js depends on the standard URL API which RN lacks.
// If this import is missing or not first, sessions silently fail to rehydrate.
import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import type { Database } from '../types/database.types'

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,           // NOT expo-secure-store — exceeds 2048-byte limit
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,       // REQUIRED: must be false in RN (no URL bar)
    },
  }
)

// Pause/resume token refresh based on app foreground state
// Prevents unnecessary auth calls when app is backgrounded
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
