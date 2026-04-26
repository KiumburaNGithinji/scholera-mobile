import { useAuth } from '@/providers/auth-provider'
import type { Role } from '@/types/app.types'

/**
 * Reads the active user's role from AuthContext (Phase 3).
 *
 * Falls back to 'student' when no session is loaded so token-driven Tailwind
 * classes on pre-auth screens (sign-in, splash) still resolve to a default.
 */
export function useRole(): Role {
  const { role } = useAuth()
  return role ?? 'student'
}
