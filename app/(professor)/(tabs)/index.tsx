import { ScrollView, Text, View } from 'react-native'
import { BookOpen } from 'lucide-react-native'
import { Card, EmptyState } from '@/components/ui'

export default function ProfessorHome() {
  return (
    <ScrollView className="flex-1 bg-canvas">
      <View className="p-6">
        <Text className="text-3xl font-sans-semibold text-fg-primary mb-2">
          My Courses
        </Text>
        <Text className="text-base font-sans text-fg-muted mb-6">
          Sections you teach
        </Text>

        <Card variant="elevated">
          <View className="p-4">
            <Text className="text-sm font-sans text-fg-muted mb-1">Signed in as</Text>
            <Text className="text-base font-sans-semibold text-fg-primary">Professor</Text>
          </View>
        </Card>

        <View className="mt-12">
          <EmptyState
            icon={BookOpen}
            title="Course management ships in Phase 5"
            description="Announcements, modules, items, and roadmap coverage land in the next phase."
          />
        </View>
      </View>
    </ScrollView>
  )
}
