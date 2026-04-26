import type { ReactNode } from 'react'
import { View } from 'react-native'
import { roleThemes } from '@/theme/role-theme'
import type { Role } from '@/types/app.types'

interface RoleThemeProviderProps {
  role: Role
  children: ReactNode
}

/**
 * Injects the role-specific accent CSS variable into the subtree.
 *
 * Children that use Tailwind classes like `bg-accent`, `text-accent`, or
 * `border-accent` will render in the role's color (steel/clay/sage).
 *
 * Mounted in role group layouts (app/(admin)/_layout.tsx etc) — Phase 3 work.
 * NOT mounted at root because the sign-in screen has no role yet.
 */
export function RoleThemeProvider({ role, children }: RoleThemeProviderProps) {
  return (
    <View style={roleThemes[role]} className="flex-1">
      {children}
    </View>
  )
}
