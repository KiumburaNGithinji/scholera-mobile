import { ScrollView, Text, View } from 'react-native'
import { GraduationCap } from 'lucide-react-native'
import { Card, EmptyState } from '@/components/ui'

export default function StudentHome() {
  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="p-6">
        <Text className="text-3xl font-sans-semibold text-fg-primary mb-2">
          My Courses
        </Text>
        <Text className="text-base font-sans text-fg-muted mb-6">
          Courses you're enrolled in
        </Text>

        <Card variant="elevated">
          <View className="p-4">
            <Text className="text-sm font-sans text-fg-muted mb-1">Signed in as</Text>
            <Text className="text-base font-sans-semibold text-fg-primary">Student</Text>
          </View>
        </Card>

        <View className="mt-12">
          <EmptyState
            icon={GraduationCap}
            title="Course detail ships in Phase 6"
            description="Read-only announcements, modules, and your independent roadmap progress land in the next phase."
          />
        </View>
      </View>
    </ScrollView>
  )
}
