import { ScrollView, Text, View } from 'react-native'
import { Inbox, BookOpen, Users, Plus, Check } from 'lucide-react-native'
import { RoleThemeProvider } from '@/providers/role-theme-provider'
import type { Role } from '@/types/app.types'
import {
  Button,
  Card,
  Chip,
  ListRow,
  EmptyState,
  SkeletonCard,
  SkeletonListRow,
  ErrorView,
} from '@/components/ui'

/**
 * /dev/preview — Phase 2 visual smoke test.
 *
 * Renders all 7 primitives wrapped in three RoleThemeProvider variants stacked
 * vertically. Visually proves Phase 2 SC2 (role swap works) + SC3 (all 7 render).
 *
 * Reach via:
 *   - Dev build: scholera://dev/preview
 *   - Expo Go: tap the URL in the terminal output
 *
 * This screen is intentionally not gated by auth — Phase 2 is pre-auth.
 * Phase 3 may move it under a dev-only group, but for Phase 2 verification it
 * stays reachable from the unauthenticated root stack.
 */

const ROLES: Role[] = ['admin', 'professor', 'student']

function PrimitivesShowcase() {
  return (
    <View className="gap-4">
      {/* Buttons: all 4 variants + isPending + disabled */}
      <View className="gap-2">
        <Button variant="primary" onPress={() => {}}>Primary</Button>
        <Button variant="secondary" onPress={() => {}}>Secondary</Button>
        <Button variant="ghost" onPress={() => {}}>Ghost</Button>
        <Button variant="destructive" onPress={() => {}}>Destructive</Button>
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="primary" isPending>Pending</Button>
        <Button variant="primary" leftIcon={Plus} onPress={() => {}}>With icon</Button>
      </View>

      {/* Card: default + elevated */}
      <Card>
        <Text className="text-base font-sans-semibold text-fg-primary">Default card</Text>
        <Text className="text-xs font-sans text-fg-muted mt-1">
          Surface bg + subtle border
        </Text>
      </Card>
      <Card variant="elevated">
        <Text className="text-base font-sans-semibold text-fg-primary">Elevated card</Text>
        <Text className="text-xs font-sans text-fg-muted mt-1">Shadow, no border</Text>
      </Card>

      {/* Chips: all variants */}
      <View className="flex-row flex-wrap gap-2">
        <Chip label="Neutral" />
        <Chip label="Accent" variant="accent" />
        <Chip label="Topic" variant="topic" />
        <Chip label="Not started" variant="status" status="not-started" />
        <Chip label="In progress" variant="status" status="in-progress" />
        <Chip label="Complete" variant="status" status="complete" icon={Check} />
        <Chip label="Selected" selected />
      </View>

      {/* ListRow: stacked group */}
      <Card padding="sm">
        <ListRow
          title="With icon"
          subtitle="Subtitle line"
          leftIcon={BookOpen}
          onPress={() => {}}
        />
        <ListRow
          title="With trailing chip"
          subtitle="Multiple slots"
          leftIcon={Users}
          trailing={<Chip label="3" variant="neutral" />}
          onPress={() => {}}
        />
        <ListRow title="Destructive" leftIcon={Inbox} destructive onPress={() => {}} />
      </Card>

      {/* EmptyState — bounded height so it sits inside the column */}
      <View style={{ height: 240 }}>
        <EmptyState
          icon={Inbox}
          title="No items yet"
          description="When you add an item, it will appear here."
          action={{ label: 'Add item', onPress: () => {} }}
        />
      </View>

      {/* Skeleton presets */}
      <SkeletonCard />
      <Card padding="sm">
        <SkeletonListRow />
        <SkeletonListRow />
      </Card>

      {/* ErrorView — bounded height */}
      <View style={{ height: 240 }}>
        <ErrorView
          onRetry={() => {}}
          technical="ENOTFOUND api.example.com"
        />
      </View>
    </View>
  )
}

export default function PreviewScreen() {
  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="px-4 py-6">
        <Text className="text-3xl font-sans-semibold text-fg-primary">Phase 2 Preview</Text>
        <Text className="text-base font-sans text-fg-muted mt-1">
          All 7 primitives × 3 role themes
        </Text>
      </View>

      {ROLES.map((role) => (
        <View key={role} className="px-4 pb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-xl font-sans-semibold text-fg-primary capitalize">
              {role}
            </Text>
            <Chip label={role} variant="accent" />
          </View>
          <RoleThemeProvider role={role}>
            <PrimitivesShowcase />
          </RoleThemeProvider>
        </View>
      ))}
    </ScrollView>
  )
}
