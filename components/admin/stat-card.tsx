import { Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Card } from '@/components/ui'
import { tokens } from '@/theme/tokens'

/**
 * Single stat tile in the admin dashboard 2x2 grid.
 *
 * Visual: elevated Card containing a small label ("Students"), a large count
 * in the role-accent color ("142"), and an optional left-side icon.
 *
 * Lives under components/admin/ (not components/ui/) because it's not part of
 * the Phase 2 7-primitive contract — it's an admin-specific composition of
 * the Card primitive + Text rendering.
 *
 * The accent color is injected by the surrounding RoleThemeProvider in
 * app/(admin)/_layout.tsx — for admin that's steel (#64748B). On other roles
 * the same component would render in clay or sage.
 */
export interface StatCardProps {
  label: string
  count: number
  icon?: LucideIcon
}

export function StatCard({ label, count, icon: Icon }: StatCardProps) {
  return (
    <Card variant="elevated" padding="lg">
      {Icon ? (
        <View className="mb-2">
          <Icon color={tokens.colors.fgMuted} size={20} />
        </View>
      ) : null}
      <Text className="text-xs font-sans text-fg-muted uppercase tracking-wide">
        {label}
      </Text>
      <Text className="text-3xl font-sans-semibold text-accent mt-1">
        {count}
      </Text>
    </Card>
  )
}
