import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Single global QueryClient for the entire app.
 *
 * Defaults are chosen to match Phase 2 success criterion 4:
 *   - staleTime: 2 min — tab switch within window shows cached data instantly (no spinner)
 *   - gcTime: 5 min — cache survives 5 min after last consumer unmounts
 *   - retry: 2 + exponential backoff — recovers from transient network blips
 *   - retryDelay: capped at 8s — no multi-minute hangs
 *   - refetchOnWindowFocus: false — RN: window focus is meaningless; AppState handles this
 *     in app/_layout.tsx via focusManager
 *   - refetchOnReconnect: true — when network comes back, refetch (mobile-critical)
 *   - refetchOnMount: true — refetch on remount when data is stale
 *   - mutations.retry: 0 — user-initiated; never auto-retry (prevents double-creates)
 *
 * Mounted at root layout, OUTSIDE RoleThemeProvider — one client per app, regardless
 * of role. Provider order: SafeAreaProvider > QueryProvider > [AuthProvider Phase 3] >
 * [RoleThemeProvider in role group layouts].
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,         // 2 min — REQUIRED by Phase 2 SC4
      gcTime: 1000 * 60 * 5,            // 5 min — REQUIRED by Phase 2 SC4
      retry: 2,                          // 2 retries on transient failure
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,      // RN: see app/_layout.tsx AppState integration
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,                          // user-initiated; do NOT auto-retry
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
