import type { Database } from './database.types'

export type Role = 'admin' | 'professor' | 'student'

export type Profile          = Database['public']['Tables']['profiles']['Row']
export type Department       = Database['public']['Tables']['departments']['Row']
export type Program          = Database['public']['Tables']['programs']['Row']
export type Course           = Database['public']['Tables']['courses']['Row']
export type Enrollment       = Database['public']['Tables']['enrollments']['Row']
export type Announcement     = Database['public']['Tables']['announcements']['Row']
export type Module           = Database['public']['Tables']['modules']['Row']
export type ModuleItem       = Database['public']['Tables']['module_items']['Row']
export type RoadmapItem      = Database['public']['Tables']['roadmap_items']['Row']
export type Topic            = Database['public']['Tables']['topics']['Row']
export type StudentProgress  = Database['public']['Tables']['student_progress']['Row']

export type ProfessorStatus  = 'not_started' | 'in_progress' | 'complete'
export type StudentStatus    = 'not_started' | 'in_progress' | 'complete'
export type ModuleItemType   = 'link' | 'note' | 'file'
