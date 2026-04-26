import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Departments list for the admin dashboard.
 *
 * Each row carries a per-department professor count, so the ListRow can show
 * a meaningful subtitle like "3 professors" instead of just the department name.
 *
 * Implementation:
 *   1. Fetch all departments (small table — no pagination needed for v1).
 *   2. Fetch all professor profiles with their department_id in one query.
 *   3. Build a Map<department_id, count> client-side.
 *   4. Merge counts into the departments list.
 *
 * Why two queries instead of a JOIN: PostgREST does not expose a "count
 * children grouped by parent" aggregate without an SQL VIEW. Two small
 * queries + a Map is cheaper than maintaining a view for v1, and the data
 * volume here (departments < 20, professors < 100 in a real institution)
 * makes the merge essentially free.
 *
 * Requires migration 04 — without it the professors query returns empty
 * (admin can't read other profiles).
 */
export interface AdminDepartmentSummary {
  id: string
  name: string
  description: string | null
  professorCount: number
}

async function fetchAdminDepartments(): Promise<AdminDepartmentSummary[]> {
  const [deptRes, profRes] = await Promise.all([
    supabase
      .from('departments')
      .select('id, name, description')
      .order('name', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, department_id')
      .eq('role', 'professor'),
  ])

  if (deptRes.error) {
    throw new Error(`Failed to load departments: ${deptRes.error.message}`)
  }
  if (profRes.error) {
    throw new Error(`Failed to load professors for department counts: ${profRes.error.message}`)
  }

  const departments = deptRes.data ?? []
  const professors = profRes.data ?? []

  // Build Map<departmentId, count>
  const countByDept = new Map<string, number>()
  for (const p of professors) {
    if (!p.department_id) continue
    countByDept.set(p.department_id, (countByDept.get(p.department_id) ?? 0) + 1)
  }

  return departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    professorCount: countByDept.get(d.id) ?? 0,
  }))
}

export function useAdminDepartments(): UseQueryResult<AdminDepartmentSummary[], Error> {
  return useQuery<AdminDepartmentSummary[], Error>({
    queryKey: ['admin', 'departments'],
    queryFn: fetchAdminDepartments,
  })
}
