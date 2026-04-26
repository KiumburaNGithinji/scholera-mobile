import type { Role } from '@/types/app.types'

/**
 * Stub for Phase 2 — returns a default role.
 *
 * Phase 3 (Auth + Role Router) replaces this implementation with one that reads
 * from AuthContext (the real session-derived role from the profiles table).
 *
 * The hook's signature does NOT change between Phase 2 and Phase 3 — consumers
 * stay the same. Only the body becomes context-driven.
 */
export function useRole(): Role {
  // Phase 2 default — overridden in Phase 3 by AuthContext.
  return 'student'
}
