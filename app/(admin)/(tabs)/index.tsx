import { ScrollView, Text, View } from 'react-native'
import { LayoutDashboard } from 'lucide-react-native'
import { Card, EmptyState } from '@/components/ui'

export default function AdminHome() {
  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="p-6">
        <Text className="text-3xl font-sans-semibold text-fg-primary mb-2">
          Admin Dashboard
        </Text>
        <Text className="text-base font-sans text-fg-muted mb-6">
          Institution overview
        </Text>

        <Card variant="elevated">
          <View className="p-4">
            <Text className="text-sm font-sans text-fg-muted mb-1">Signed in as</Text>
            <Text className="text-base font-sans-semibold text-fg-primary">Admin</Text>
          </View>
        </Card>

        <View className="mt-12">
          <EmptyState
            icon={LayoutDashboard}
            title="Dashboard ships in Phase 4"
            description="Stats grid, departments list, and professor drill-down land in the next phase."
          />
        </View>
      </View>
    </ScrollView>
  )
}
