import { ScrollView, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Users } from 'lucide-react-native'
import {
  EmptyState,
  ErrorView,
  ListRow,
  SkeletonHeading,
  SkeletonListRow,
  SkeletonText,
} from '@/components/ui'
import { useAdminDepartmentDetail } from '@/hooks/admin'

/**
 * Admin → Department detail.
 *
 * Route: /(admin)/departments/[id]
 *
 * Shows the department name in the Stack header (set dynamically once the
 * useQuery resolves) and lists all professors assigned to this department
 * as tappable ListRows that drill into /(admin)/professors/[id].
 *
 * 4-state contract:
 *   - Pending  -> Skeleton heading + 3 SkeletonListRows
 *   - Error    -> ErrorView with onRetry
 *   - Empty    -> EmptyState ("No professors in this department")
 *   - Success  -> Department description (if any) + ListRow per professor
 */
export default function DepartmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data, isPending, error, refetch } = useAdminDepartmentDetail(id)

  // Stack header title — dynamic. While loading shows generic "Department".
  // Once data resolves, swaps to the actual department name.
  const headerTitle = data?.department.name ?? 'Department'

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />

      <ScrollView className="flex-1 bg-canvas">
        {error ? (
          <ErrorView
            title="Couldn't load department"
            description="Something went wrong fetching the department details."
            onRetry={() => {
              refetch()
            }}
            technical={error.message}
          />
        ) : isPending || !data ? (
          // Pending: heading skeleton + a few row skeletons
          <View>
            <View className="px-4 pt-4 pb-2">
              <SkeletonHeading />
              <View className="mt-3">
                <SkeletonText lines={2} />
              </View>
            </View>
            <View className="mt-4">
              <SkeletonListRow />
              <SkeletonListRow />
              <SkeletonListRow />
            </View>
          </View>
        ) : (
          <View>
            {/* Optional description block */}
            {data.department.description ? (
              <View className="px-4 pt-4 pb-2">
                <Text className="text-base font-sans text-fg-muted">
                  {data.department.description}
                </Text>
              </View>
            ) : null}

            {/* Section heading */}
            <View className="px-4 pt-4 pb-2">
              <Text className="text-xl font-sans-semibold text-fg-primary">
                Professors
              </Text>
            </View>

            {/* Professors list OR empty state */}
            {data.professors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No professors yet"
                description="No professors have been assigned to this department."
              />
            ) : (
              <View>
                {data.professors.map((prof) => (
                  <ListRow
                    key={prof.id}
                    title={prof.display_name ?? 'Unnamed Professor'}
                    subtitle={prof.bio ?? undefined}
                    leftAvatarUrl={prof.avatar_url ?? undefined}
                    onPress={() => {
                      router.push(`/(admin)/professors/${prof.id}` as never)
                    }}
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
