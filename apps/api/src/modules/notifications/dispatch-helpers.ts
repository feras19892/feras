import { db } from '../../db/index.js';

export type Recipient = { kind: 'user' | 'school'; id: number; priority: 'immediate' | 'cumulative' | 'periodic' };

export async function getTeacherForClass(classId: string): Promise<number | null> {
  const row = await db.get<{ teacher_id: number | null }>(`SELECT teacher_id FROM classes WHERE id = ?`, classId);
  return row?.teacher_id || null;
}

export async function getSchoolForClass(classId: string): Promise<number | null> {
  const row = await db.get<{ school_id: number | null }>(`SELECT school_id FROM classes WHERE id = ?`, classId);
  return row?.school_id || null;
}

export async function getStudentsForClass(classId: string): Promise<number[]> {
  const rows = await db.all<{ student_id: number }[]>(`SELECT student_id FROM class_students WHERE class_id = ?`, classId);
  return rows.map((r: any) => r.student_id);
}

export async function getAllAdmins(): Promise<number[]> {
  const rows = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = 'admin'`);
  return rows.map((r: any) => r.id);
}

export async function getAllUsers(): Promise<number[]> {
  const rows = await db.all<{ id: number }[]>(`SELECT id FROM users`);
  return rows.map((r: any) => r.id);
}

export async function getAllSchools(): Promise<number[]> {
  const rows = await db.all<{ id: number }[]>(`SELECT id FROM schools`);
  return rows.map((r: any) => r.id);
}

export async function getUsersForSchool(schoolId: number, role?: 'student' | 'teacher'): Promise<number[]> {
  let sql = `SELECT id FROM users WHERE school_id = ?`;
  if (role) sql += ` AND role = '${role}'`;
  const rows = await db.all<{ id: number }[]>(sql, schoolId);
  return rows.map((r: any) => r.id);
}

export async function getUserSchoolId(userId: number): Promise<number | null> {
  const row = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ?`, userId);
  return row?.school_id || null;
}

export async function getUserEmail(userId: number): Promise<string | null> {
  const row = await db.get<{ email: string }>(`SELECT email FROM users WHERE id = ?`, userId);
  return row?.email || null;
}

export async function getSchoolEmail(schoolId: number): Promise<string | null> {
  const row = await db.get<{ email: string }>(`SELECT email FROM schools WHERE id = ?`, schoolId);
  return row?.email || null;
}

export async function getReportAuthor(reportId: number): Promise<number | null> {
  const row = await db.get<{ student_id: number | null }>(`SELECT student_id FROM experiment_reports WHERE id = ?`, reportId);
  return row?.student_id || null;
}
