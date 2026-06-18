export type UserRole = 'guest' | 'student' | 'teacher' | 'researcher' | 'admin'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  created_at?: string
}

export interface ClassInfo {
  id: string
  name: string
  code: string
  role: 'student' | 'teacher'
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  role: 'student' | 'teacher'
}
