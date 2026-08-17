import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken } from '../auth/crypto.js';
import { signAccessToken } from '../auth/jwt.js';
import { createNotification, createSchoolNotification } from '../notifications/services.js';
import { checkLockout, logLoginAttempt, clearFailedAttempts } from '../auth/services-auth.js';
import type { School } from '@my-modern-app/shared-types';
import { randomBytes } from 'crypto';

function generateSchoolCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SCH-';
  const bytes = randomBytes(4);
  for (let i = 0; i < 4; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

async function issueTokensForSchool(school: School): Promise<{ token: string; refreshToken: string }> {
  const token = await signAccessToken({
    sub: String(school.id),
    email: school.email,
    role: 'school',
  });

  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.run(
    'INSERT INTO school_refresh_tokens (token_hash, school_id, expires_at) VALUES (?, ?, ?)',
    refreshHash,
    school.id,
    expiresAt,
  );

  return { token, refreshToken };
}

export async function registerSchool(
  name: string,
  email: string,
  password: string,
  maxStudents = 50,
  maxTeachers = 10,
): Promise<{ success: boolean; message?: string; school?: School; token?: string; refreshToken?: string; code?: string }> {
  try {
    const existing = await db.get<{ id: number }>('SELECT id FROM schools WHERE email = ?', email);
    if (existing) {
      return { success: false, message: 'Email already registered' };
    }

    const passwordHash = await hashPassword(password);
    const code = generateSchoolCode();
    const result = await db.run(
      'INSERT INTO schools (name, email, password_hash, code, max_students, max_teachers) VALUES (?, ?, ?, ?, ?, ?)',
      name, email, passwordHash, code, maxStudents, maxTeachers,
    );

    const school: School = {
      id: Number(result.lastID),
      email,
      name,
      code,
      max_students: maxStudents,
      max_teachers: maxTeachers,
      is_active: true,
    };

    const { token, refreshToken } = await issueTokensForSchool(school);
    return { success: true, school, token, refreshToken, code };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('registerSchool error:', err);
    return { success: false, message: 'Registration failed' };
  }
}

export async function loginSchool(
  email: string,
  password: string,
  ip: string = 'unknown',
): Promise<{ success: boolean; message?: string; school?: School; token?: string; refreshToken?: string }> {
  try {
    if (await checkLockout(email)) {
      return { success: false, message: 'تم تجاوز عدد محاولات الدخول. حاول مرة أخرى بعد 15 دقيقة.' };
    }
    const row = await db.get<{
      id: number;
      email: string;
      name: string;
      code: string;
      password_hash: string;
      max_students: number;
      max_teachers: number;
      is_active: number;
    }>(
      'SELECT id, email, name, code, password_hash, max_students, max_teachers, is_active FROM schools WHERE email = ?',
      email,
    );

    if (!row) {
      await logLoginAttempt(email, ip, false);
      return { success: false, message: 'Invalid credentials' };
    }

    if (!row.is_active) {
      return { success: false, message: 'School account is suspended' };
    }

    const valid = await comparePassword(password, row.password_hash);
    if (!valid) {
      await logLoginAttempt(email, ip, false);
      return { success: false, message: 'Invalid credentials' };
    }

    await clearFailedAttempts(email);
    await logLoginAttempt(email, ip, true);

    const school: School = {
      id: Number(row.id),
      email: row.email,
      name: row.name,
      code: row.code,
      max_students: row.max_students,
      max_teachers: row.max_teachers,
      is_active: true,
    };

    const { token, refreshToken } = await issueTokensForSchool(school);
    return { success: true, school, token, refreshToken };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('loginSchool error:', err);
    return { success: false, message: 'Login failed' };
  }
}

export async function getSchoolById(id: number): Promise<School | null> {
  const row = await db.get<{
    id: number;
    email: string;
    name: string;
    code: string;
    max_students: number;
    max_teachers: number;
    is_active: number;
  }>(
    'SELECT id, email, name, code, max_students, max_teachers, is_active FROM schools WHERE id = ?',
    id,
  );
  if (!row) return null;
  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    code: row.code,
    max_students: row.max_students,
    max_teachers: row.max_teachers,
    is_active: !!row.is_active,
  };
}

export async function getSchoolStats(schoolId: number): Promise<{
  students: number;
  teachers: number;
  classes: number;
  reports: number;
}> {
  const students = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'student'`,
    schoolId,
  );
  const teachers = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'teacher'`,
    schoolId,
  );
  const classes = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM classes c JOIN users u ON c.teacher_id = u.id WHERE u.school_id = ?`,
    schoolId,
  );
  const reports = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ?`,
    schoolId,
  );

  return {
    students: students?.count || 0,
    teachers: teachers?.count || 0,
    classes: classes?.count || 0,
    reports: reports?.count || 0,
  };
}

export async function getSchoolUsers(schoolId: number, page = 1, limit = 50): Promise<{ users: { id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]; total: number; page: number; limit: number; totalPages: number }> {
  const offset = (page - 1) * limit;
  const rows = await db.all<{ id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]>(
    'SELECT id, name, email, role, created_at, blocked_at FROM users WHERE school_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    schoolId, limit, offset,
  );
  const total = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE school_id = ?', schoolId);
  const count = total?.count || 0;
  return { users: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
}

export async function getSchoolClasses(schoolId: number): Promise<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]> {
  const rows = await db.all<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]>(
    `SELECT c.id, c.name, c.code, u.name as teacher_name,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
     c.created_at
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE u.school_id = ? ORDER BY c.created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function removeSchoolUser(schoolId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null }>('SELECT school_id FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };
  await db.run('DELETE FROM users WHERE id = ?', userId);
  return { success: true };
}

export async function getAllSchools(): Promise<{ id: number; email: string; name: string; code: string; max_students: number; max_teachers: number; is_active: boolean; created_at: string; student_count: number; teacher_count: number }[]> {
  const rows = await db.all<any[]>(
    `SELECT s.id, s.email, s.name, s.code, s.max_students, s.max_teachers, s.is_active, s.created_at,
     (SELECT COUNT(*) FROM users WHERE school_id = s.id AND role = 'student') as student_count,
     (SELECT COUNT(*) FROM users WHERE school_id = s.id AND role = 'teacher') as teacher_count
     FROM schools s ORDER BY s.created_at DESC`,
  );
  return rows.map((row: any) => ({
    ...row,
    is_active: !!row.is_active,
  }));
}

export async function toggleSchoolActive(schoolId: number): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ is_active: number; name: string }>('SELECT is_active, name FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };
  const newState = school.is_active ? 0 : 1;
  await db.run('UPDATE schools SET is_active = ? WHERE id = ?', newState, schoolId);
  await createSchoolNotification({
    school_id: schoolId,
    type: 'school_status',
    title: newState ? 'تم تفعيل المدرسة' : 'تم إيقاف المدرسة',
    message: newState ? `تم تفعيل مدرستك "${school.name}" من قبل الإدارة` : `تم إيقاف مدرستك "${school.name}" مؤقتاً من قبل الإدارة`,
  });
  return { success: true };
}

export async function updateSchool(schoolId: number, updates: { name?: string; email?: string; max_students?: number; max_teachers?: number }): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ id: number; name: string }>('SELECT id, name FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };

  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.name !== undefined) { sets.push('name = ?'); vals.push(updates.name); }
  if (updates.email !== undefined) { sets.push('email = ?'); vals.push(updates.email); }
  if (updates.max_students !== undefined) { sets.push('max_students = ?'); vals.push(updates.max_students); }
  if (updates.max_teachers !== undefined) { sets.push('max_teachers = ?'); vals.push(updates.max_teachers); }
  if (sets.length === 0) return { success: true };

  vals.push(schoolId);
  await db.run(`UPDATE schools SET ${sets.join(', ')}, updated_at = datetime("now") WHERE id = ?`, ...vals);
  const changedFields: string[] = [];
  if (updates.name !== undefined) changedFields.push('الاسم');
  if (updates.email !== undefined) changedFields.push('البريد');
  if (updates.max_students !== undefined) changedFields.push('حد الطلاب');
  if (updates.max_teachers !== undefined) changedFields.push('حد المدرسين');
  await createSchoolNotification({
    school_id: schoolId,
    type: 'school_updated',
    title: 'تم تحديث بيانات المدرسة',
    message: `تم تحديث: ${changedFields.join(', ')} من قبل الإدارة`,
  });
  return { success: true };
}

export { adminGetSchoolUsers, adminGetSchoolClasses, adminGetSchoolReports, adminRemoveSchoolUser, adminBlockSchoolUser, deleteSchool } from './services-admin.js';
