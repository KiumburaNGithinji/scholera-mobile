import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, Profile } from '@/types/app.types'

/**
 * Single professor's profile + all courses they teach.
 *
 * Powers `app/(admin)/professors/[id].tsx`. The screen shows the professor's
 * display_name + bio + avatar in a Card and lists their courses below.
 *
 * Notes on RLS:
 *   - profiles read: requires migration 04's admin-read-all policy (Plan 04-01)
 *   - courses read: original schema (initial_schema.sql line 232) already has
 *     "courses: admin read all" — that policy uses an EXISTS subquery against
 *     profiles, but it's NOT recursive because it's checking the calling user's
 *     own row (which the "profiles: own read/write" policy permits). Works fine.
 *
 * The hook accepts `professorId | undefined` so screens can pass raw
 * useLocalSearchParams() values; `enabled: false` prevents firing without an id.
 */
export interface AdminProfessorDetail {
  professor: Profile
  courses: Course[]
}

async function fetchProfessorDetail(professorId: string): Promise<AdminProfessorDetail> {
  const [profRes, courseRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', professorId)
      .eq('role', 'professor')
      .single(),
    supabase
      .from('courses')
      .select('*')
      .eq('professor_id', professorId)
      .order('title', { ascending: true }),
  ])

  if (profRes.error) {
    throw new Error(`Failed to load professor: ${profRes.error.message}`)
  }
  if (!profRes.data) {
    throw new Error(`Professor ${professorId} not found`)
  }
  if (courseRes.error) {
    throw new Error(`Failed to load courses: ${courseRes.error.message}`)
  }

  return {
    professor: profRes.data,
    courses: courseRes.data ?? [],
  }
}

export function useAdminProfessorDetail(
  professorId: string | undefined,
): UseQueryResult<AdminProfessorDetail, Error> {
  return useQuery<AdminProfessorDetail, Error>({
    queryKey: ['admin', 'professor', professorId],
    queryFn: () => fetchProfessorDetail(professorId as string),
    enabled: Boolean(professorId),
  })
}
