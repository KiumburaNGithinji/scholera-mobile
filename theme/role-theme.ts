import { vars } from 'nativewind'
import type { Role } from '@/types/app.types'

/**
 * Per-role CSS variable overrides.
 *
 * The single token that swaps per role is --color-accent. Every other token
 * (canvas, surface, fg-primary, border-subtle, semantic) stays role-independent
 * and is defined in global.css :root.
 *
 * RGB triplets (space-separated, no commas) match global.css format so Tailwind's
 * rgb(var(--color-accent) / <alpha-value>) pattern works with alpha modifiers.
 *
 * Hex equivalents (for cross-reference with theme/tokens.ts):
 *   admin     #64748B (steel)
 *   professor #CC785C (clay)
 *   student   #86A17C (sage) — same as global.css default
 */
export const roleThemes: Record<Role, ReturnType<typeof vars>> = {
  admin:     vars({ '--color-accent': '100 116 139' }),
  professor: vars({ '--color-accent': '204 120 92' }),
  student:   vars({ '--color-accent': '134 161 124' }),
}
