import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Aggregate counts powering the admin dashboard 2x2 stats grid.
 * All four counts come from a single useQuery — staying as one cache entry
 * means a single skeleton during the initial load and a single error path.
 *
 * Each subquery uses Supabase's HEAD-count pattern:
 *   .select('*', { count: 'exact', head: true })
 * — no rows transferred, server returns the count in the Content-Range header.
 *
 * Why students/professors are separate counts on the same table:
 *   public.profiles has a `role` column — we filter twice with .eq('role', X).
 *
 * Requires migration 04 (admin RLS unblock) — without it studentCount and
 * professorCount return 1 (admin's own row) instead of the true count.
 */
export interface AdminStats {
  studentCount: number
  professorCount: number
  courseCount: number
  departmentCount: number
}

async function fetchAdminStats(): Promise<AdminStats> {
  // Run all 4 counts in parallel — 4x lower latency than sequential
  const [studentRes, professorRes, courseRes, departmentRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'professor'),
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('departments')
      .select('*', { count: 'exact', head: true }),
  ])

  // Surface the first error if any subquery failed.
  const firstError =
    studentRes.error ?? professorRes.error ?? courseRes.error ?? departmentRes.error
  if (firstError) {
    throw new Error(`Failed to load admin stats: ${firstError.message}`)
  }

  return {
    studentCount: studentRes.count ?? 0,
    professorCount: professorRes.count ?? 0,
    courseCount: courseRes.count ?? 0,
    departmentCount: departmentRes.count ?? 0,
  }
}

export function useAdminStats(): UseQueryResult<AdminStats, Error> {
  return useQuery<AdminStats, Error>({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  })
}
