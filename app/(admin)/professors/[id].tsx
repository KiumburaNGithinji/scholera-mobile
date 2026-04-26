import { Image, ScrollView, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { BookOpen, GraduationCap } from 'lucide-react-native'
import {
  Card,
  EmptyState,
  ErrorView,
  ListRow,
  SkeletonCard,
  SkeletonListRow,
} from '@/components/ui'
import { useAdminProfessorDetail } from '@/hooks/admin'

/**
 * Admin → Department → Professor detail.
 *
 * Route: /(admin)/professors/[id]
 *
 * Shows the professor's profile (display_name, bio, avatar) in a Card and
 * a "Courses" section listing all courses they teach.
 *
 * Stack header title is the professor's display_name (dynamic, set after
 * the query resolves). Back button returns to the department detail screen.
 *
 * 4-state contract:
 *   - Pending  -> SkeletonCard for the profile + 2 SkeletonListRows for courses
 *   - Error    -> ErrorView with onRetry
 *   - Empty    -> Profile renders normally; courses section shows EmptyState if courses[] is empty
 *   - Success  -> Profile Card + ListRow per course
 *
 * Note: this screen does NOT navigate further. ADMIN-03 stops here — admin
 * sees the courses, but tapping a course is not in scope for v1.
 */
export default function ProfessorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isPending, error, refetch } = useAdminProfessorDetail(id)

  const headerTitle = data?.professor.display_name ?? 'Professor'

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView className="flex-1 bg-canvas">
        {error ? (
          <ErrorView
            title="Couldn't load professor"
            description="Something went wrong fetching the professor details."
            onRetry={() => {
              refetch()
            }}
            technical={error.message}
          />
        ) : isPending || !data ? (
          <View>
            {/* Profile skeleton */}
            <View className="px-4 pt-4">
              <SkeletonCard />
            </View>
            {/* Courses skeleton */}
            <View className="mt-4">
              <SkeletonListRow />
              <SkeletonListRow />
            </View>
          </View>
        ) : (
          <View>
            {/* ─── Profile Card ─────────────────────── */}
            <View className="px-4 pt-4">
              <Card variant="elevated" padding="lg">
                <View className="flex-row items-center">
                  {data.professor.avatar_url ? (
                    <Image
                      source={{ uri: data.professor.avatar_url }}
                      className="w-16 h-16 rounded-full bg-border-subtle"
                      accessibilityLabel="Avatar"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-border-subtle items-center justify-center">
                      <GraduationCap color="#7A736A" size={28} />
                    </View>
                  )}
                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-sans-semibold text-fg-primary">
                      {data.professor.display_name ?? 'Unnamed Professor'}
                    </Text>
                    <Text className="text-sm font-sans text-fg-muted mt-0.5">
                      Professor
                    </Text>
                  </View>
                </View>

                {data.professor.bio ? (
                  <Text className="text-base font-sans text-fg-primary mt-4 leading-6">
                    {data.professor.bio}
                  </Text>
                ) : null}
              </Card>
            </View>

            {/* ─── Courses section ─────────────────── */}
            <View className="px-4 pt-6 pb-2">
              <Text className="text-xl font-sans-semibold text-fg-primary">
                Courses
              </Text>
            </View>

            {data.courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses yet"
                description="This professor isn't teaching any courses right now."
              />
            ) : (
              <View>
                {data.courses.map((course) => (
                  <ListRow
                    key={course.id}
                    title={course.title}
                    subtitle={course.code ?? course.description ?? undefined}
                    leftIcon={BookOpen}
                    showChevron={false}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View className="h-12" />
      </ScrollView>
    </>
  )
}
