import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Department, Profile } from '@/types/app.types'

/**
 * Single department detail + all professors assigned to it.
 *
 * Powers `app/(admin)/departments/[id].tsx`. The screen shows the department
 * name in the Stack header and a list of professors below.
 *
 * The hook accepts `departmentId | undefined` so it can be called with a
 * raw `useLocalSearchParams()` value without `!` non-null assertions in
 * the screen. When undefined, `enabled: false` prevents the query from
 * firing and `data` stays undefined.
 *
 * Requires migration 04 — without it the professors query returns empty
 * (admin can't see other professors' profiles).
 */
export interface AdminDepartmentDetail {
  department: Department
  professors: Profile[]
}

async function fetchDepartmentDetail(departmentId: string): Promise<AdminDepartmentDetail> {
  const [deptRes, profRes] = await Promise.all([
    supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single(),
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'professor')
      .eq('department_id', departmentId)
      .order('display_name', { ascending: true, nullsFirst: false }),
  ])

  if (deptRes.error) {
    throw new Error(`Failed to load department: ${deptRes.error.message}`)
  }
  if (!deptRes.data) {
    throw new Error(`Department ${departmentId} not found`)
  }
  if (profRes.error) {
    throw new Error(`Failed to load professors: ${profRes.error.message}`)
  }

  return {
    department: deptRes.data,
    professors: profRes.data ?? [],
  }
}

export function useAdminDepartmentDetail(
  departmentId: string | undefined,
): UseQueryResult<AdminDepartmentDetail, Error> {
  return useQuery<AdminDepartmentDetail, Error>({
    queryKey: ['admin', 'department', departmentId],
    queryFn: () => fetchDepartmentDetail(departmentId as string),
    enabled: Boolean(departmentId),
  })
}
