import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Building2,
  GraduationCap,
  Library,
  Users,
} from 'lucide-react-native'
import {
  EmptyState,
  ErrorView,
  ListRow,
  SkeletonCard,
  SkeletonListRow,
} from '@/components/ui'
import { StatCard } from '@/components/admin/stat-card'
import { useAdminDepartments, useAdminStats } from '@/hooks/admin'

/**
 * Admin Dashboard — the home tab for admin role.
 *
 * Phase 4 deliverable for ADMIN-01 (stats grid) + ADMIN-02 (departments list).
 *
 * Two sections, each driven by its own useQuery hook:
 *   1. Stats grid — 4 numbers in a 2x2 layout (useAdminStats)
 *   2. Departments list — name + professor count, tappable (useAdminDepartments)
 *
 * 4-state contract per Phase 2 (each section renders independently):
 *   - Pending  -> SkeletonCard / SkeletonListRow
 *   - Error    -> ErrorView with onRetry
 *   - Empty    -> EmptyState (departments only — stats can't be "empty")
 *   - Success  -> StatCard / ListRow rendering data
 */
export default function AdminDashboard() {
  const router = useRouter()

  const {
    data: stats,
    isPending: statsPending,
    error: statsError,
    refetch: refetchStats,
  } = useAdminStats()

  const {
    data: departments,
    isPending: deptPending,
    error: deptError,
    refetch: refetchDept,
  } = useAdminDepartments()

  return (
    <ScrollView className="flex-1 bg-canvas">
      {/* ───────────────── Stats grid section ───────────────── */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-sans-semibold text-fg-primary mb-3">
          Institution overview
        </Text>

        {statsError ? (
          <ErrorView
            title="Couldn't load stats"
            description="Something went wrong fetching the dashboard counts."
            onRetry={() => {
              refetchStats()
            }}
            technical={statsError.message}
          />
        ) : statsPending || !stats ? (
          // 2x2 grid of skeleton cards
          <View className="flex-row flex-wrap -mx-1.5">
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <SkeletonCard />
            </View>
          </View>
        ) : (
          <View className="flex-row flex-wrap -mx-1.5">
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Students" count={stats.studentCount} icon={GraduationCap} />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Professors" count={stats.professorCount} icon={Users} />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Courses" count={stats.courseCount} icon={Library} />
            </View>
            <View className="w-1/2 px-1.5 mb-3">
              <StatCard label="Departments" count={stats.departmentCount} icon={Building2} />
            </View>
          </View>
        )}
      </View>

      {/* ───────────────── Departments section ───────────────── */}
      <View className="mt-4">
        <Text className="text-xl font-sans-semibold text-fg-primary px-4 mb-2">
          Departments
        </Text>

        {deptError ? (
          <View className="px-4">
            <ErrorView
              title="Couldn't load departments"
              description="Something went wrong fetching the departments list."
              onRetry={() => {
                refetchDept()
              }}
              technical={deptError.message}
            />
          </View>
        ) : deptPending || !departments ? (
          <View>
            <SkeletonListRow />
            <SkeletonListRow />
            <SkeletonListRow />
          </View>
        ) : departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No departments yet"
            description="Departments will appear here once they're added to Supabase."
          />
        ) : (
          <View>
            {departments.map((dept) => (
              <ListRow
                key={dept.id}
                title={dept.name}
                subtitle={
                  dept.professorCount === 1
                    ? '1 professor'
                    : `${dept.professorCount} professors`
                }
                leftIcon={Building2}
                onPress={() => {
                  router.push(`/(admin)/departments/${dept.id}` as never)
                }}
              />
            ))}
          </View>
        )}
      </View>

      {/* Bottom spacer so the last ListRow isn't clipped by the tab bar */}
      <View className="h-12" />
    </ScrollView>
  )
}
