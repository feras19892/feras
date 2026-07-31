export type UserRole = 'guest' | 'student' | 'teacher' | 'researcher' | 'admin' | 'school'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  school_id?: number | null
  avatar_url?: string | null
  created_at?: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  role: 'student' | 'teacher'
  school_code?: string
}

export interface School {
  id: number
  email: string
  name: string
  code: string
  max_students: number
  max_teachers: number
  is_active: boolean
  email_verified_at?: string | null
  created_at?: string
}
