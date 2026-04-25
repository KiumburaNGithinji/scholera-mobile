// Hand-typed Database schema for Scholera Mobile.
//
// Why hand-typed instead of `supabase gen types`:
// The Supabase project (htlolqbwhulyihguwdoq) is owned by a different account than
// the one the local Supabase CLI is logged into, so `gen types --project-id` returns
// 401. The DB password / DB URL fallback would also work, but the schema is small
// and stable for this assignment, so hand-typing is the most reliable path.
//
// These types mirror /Users/Kiumbura/Projects/scholera-mobile/supabase/migrations/00000000000001_initial_schema.sql
// exactly. If the migration changes, regenerate via:
//   npx supabase gen types typescript --db-url "postgresql://postgres.htlolqbwhulyihguwdoq:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres" --schema public > types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Postgres timestamptz / uuid show up as ISO-8601 strings over the wire
type Timestamptz = string
type UUID = string

export type Role = 'admin' | 'professor' | 'student'
export type ProfessorStatus = 'not_started' | 'in_progress' | 'complete'
export type StudentStatus = 'not_started' | 'in_progress' | 'complete'
export type ModuleItemType = 'link' | 'note' | 'file'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: UUID
          role: Role
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          department_id: UUID | null
          created_at: Timestamptz
          updated_at: Timestamptz
        }
        Insert: {
          id: UUID
          role: Role
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          department_id?: UUID | null
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Update: {
          id?: UUID
          role?: Role
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          department_id?: UUID | null
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Relationships: []
      }

      departments: {
        Row: {
          id: UUID
          name: string
          description: string | null
          created_at: Timestamptz
        }
        Insert: {
          id?: UUID
          name: string
          description?: string | null
          created_at?: Timestamptz
        }
        Update: {
          id?: UUID
          name?: string
          description?: string | null
          created_at?: Timestamptz
        }
        Relationships: []
      }

      programs: {
        Row: {
          id: UUID
          department_id: UUID
          name: string
          description: string | null
          created_at: Timestamptz
        }
        Insert: {
          id?: UUID
          department_id: UUID
          name: string
          description?: string | null
          created_at?: Timestamptz
        }
        Update: {
          id?: UUID
          department_id?: UUID
          name?: string
          description?: string | null
          created_at?: Timestamptz
        }
        Relationships: []
      }

      courses: {
        Row: {
          id: UUID
          professor_id: UUID
          program_id: UUID | null
          title: string
          code: string | null
          description: string | null
          created_at: Timestamptz
          updated_at: Timestamptz
        }
        Insert: {
          id?: UUID
          professor_id: UUID
          program_id?: UUID | null
          title: string
          code?: string | null
          description?: string | null
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Update: {
          id?: UUID
          professor_id?: UUID
          program_id?: UUID | null
          title?: string
          code?: string | null
          description?: string | null
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Relationships: []
      }

      enrollments: {
        Row: {
          id: UUID
          course_id: UUID
          student_id: UUID
          enrolled_at: Timestamptz
        }
        Insert: {
          id?: UUID
          course_id: UUID
          student_id: UUID
          enrolled_at?: Timestamptz
        }
        Update: {
          id?: UUID
          course_id?: UUID
          student_id?: UUID
          enrolled_at?: Timestamptz
        }
        Relationships: []
      }

      announcements: {
        Row: {
          id: UUID
          course_id: UUID
          professor_id: UUID
          title: string
          body: string
          created_at: Timestamptz
          updated_at: Timestamptz
        }
        Insert: {
          id?: UUID
          course_id: UUID
          professor_id: UUID
          title: string
          body: string
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Update: {
          id?: UUID
          course_id?: UUID
          professor_id?: UUID
          title?: string
          body?: string
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Relationships: []
      }

      modules: {
        Row: {
          id: UUID
          course_id: UUID
          title: string
          position: number
          created_at: Timestamptz
        }
        Insert: {
          id?: UUID
          course_id: UUID
          title: string
          position?: number
          created_at?: Timestamptz
        }
        Update: {
          id?: UUID
          course_id?: UUID
          title?: string
          position?: number
          created_at?: Timestamptz
        }
        Relationships: []
      }

      module_items: {
        Row: {
          id: UUID
          module_id: UUID
          title: string
          type: ModuleItemType
          url: string | null
          content: string | null
          position: number
          created_at: Timestamptz
        }
        Insert: {
          id?: UUID
          module_id: UUID
          title: string
          type: ModuleItemType
          url?: string | null
          content?: string | null
          position?: number
          created_at?: Timestamptz
        }
        Update: {
          id?: UUID
          module_id?: UUID
          title?: string
          type?: ModuleItemType
          url?: string | null
          content?: string | null
          position?: number
          created_at?: Timestamptz
        }
        Relationships: []
      }

      roadmap_items: {
        Row: {
          id: UUID
          module_item_id: UUID
          course_id: UUID
          professor_status: ProfessorStatus
          created_at: Timestamptz
          updated_at: Timestamptz
        }
        Insert: {
          id?: UUID
          module_item_id: UUID
          course_id: UUID
          professor_status?: ProfessorStatus
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Update: {
          id?: UUID
          module_item_id?: UUID
          course_id?: UUID
          professor_status?: ProfessorStatus
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Relationships: []
      }

      topics: {
        Row: {
          id: UUID
          roadmap_item_id: UUID
          label: string
          created_at: Timestamptz
        }
        Insert: {
          id?: UUID
          roadmap_item_id: UUID
          label: string
          created_at?: Timestamptz
        }
        Update: {
          id?: UUID
          roadmap_item_id?: UUID
          label?: string
          created_at?: Timestamptz
        }
        Relationships: []
      }

      student_progress: {
        Row: {
          id: UUID
          roadmap_item_id: UUID
          student_id: UUID
          status: StudentStatus
          created_at: Timestamptz
          updated_at: Timestamptz
        }
        Insert: {
          id?: UUID
          roadmap_item_id: UUID
          student_id: UUID
          status?: StudentStatus
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Update: {
          id?: UUID
          roadmap_item_id?: UUID
          student_id?: UUID
          status?: StudentStatus
          created_at?: Timestamptz
          updated_at?: Timestamptz
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
