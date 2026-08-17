import type { User, RegisterCredentials, School } from '@my-modern-app/shared-types';
import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken, generateVerificationCode, hashVerificationCode } from './crypto.js';
import { signAccessToken } from './jwt.js';
import { sendVerificationEmail } from '../../shared/email.js';

const DUMMY_HASH = '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function checkLockout(email: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS).toISOString();
  const result = await db.get<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM login_attempts WHERE email = ? AND success = 0 AND created_at > ?`,
    email.toLowerCase(), since
  );
  return (result?.cnt ?? 0) >= MAX_FAILED_ATTEMPTS;
}

async function logLoginAttempt(email: string, ip: string, success: boolean): Promise<void> {
  try {
    await db.run(
      `INSERT INTO login_attempts (email, ip, success, created_at) VALUES (?, ?, ?, ?)`,
      email.toLowerCase(), ip, success ? 1 : 0, new Date().toISOString()
    );
  } catch { /* table may not exist yet */ }
}

async function clearFailedAttempts(email: string): Promise<void> {
  try {
    await db.run(`DELETE FROM login_attempts WHERE email = ? AND success = 0`, email.toLowerCase());
  } catch { /* ignore */ }
}

export { checkLockout, logLoginAttempt, clearFailedAttempts };

export async function issueTokensForUser(user: User): Promise<{ token: string; refreshToken: string }> {
  const token = await signAccessToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.run(
    'INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    refreshHash,
    user.id,
    expiresAt,
  );

  return { token, refreshToken };
}

export async function createEmailVerificationCode(userId: number, email?: string, name?: string): Promise<{ code: string }> {
  const code = generateVerificationCode(6);
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  await db.run(
    'INSERT INTO email_verification_codes (user_id, code_hash, expires_at) VALUES (?, ?, ?)',
    userId,
    codeHash,
    expiresAt,
  );

  if (email) {
    await sendVerificationEmail(email, name || '', code);
  }

  return { code };
}

export async function register(credentials: RegisterCredentials): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    const existing = await db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', credentials.email);
    if (existing) {
      return { success: false, message: 'البريد الإلكتروني مسجل بالفعل' };
    }

    let schoolId: number | null = null;
    if (credentials.school_code) {
      const school = await db.get<{ id: number; is_active: number; max_students: number; max_teachers: number }>(
        'SELECT id, is_active, max_students, max_teachers FROM schools WHERE code = ?',
        credentials.school_code,
      );
      if (!school) {
        return { success: false, message: 'رمز المدرسة غير صالح' };
      }
      if (!school.is_active) {
        return { success: false, message: 'المدرسة غير مفعلة' };
      }
      // Count current users in this school
      const counts = await db.get<{ students: number; teachers: number }>(
        `SELECT SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students, SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teachers FROM users WHERE school_id = ?`,
        school.id,
      );
      const studentCount = counts?.students || 0;
      const teacherCount = counts?.teachers || 0;
      const role = credentials.role || 'student';
      if (role === 'student' && studentCount >= school.max_students) {
        return { success: false, message: 'المدرسة بلغت الحد الأقصى لعدد الطلاب' };
      }
      if (role === 'teacher' && teacherCount >= school.max_teachers) {
        return { success: false, message: 'المدرسة بلغت الحد الأقصى لعدد المعلمين' };
      }
      schoolId = school.id;
    }

    const passwordHash = await hashPassword(credentials.password);
    const result = await db.run(
      'INSERT INTO users (email, name, password_hash, role, school_id) VALUES (?, ?, ?, ?, ?)',
      credentials.email,
      credentials.name,
      passwordHash,
      credentials.role || 'student',
      schoolId,
    );

    const user: User = {
      id: Number(result.lastID),
      email: credentials.email,
      name: credentials.name,
      role: (credentials.role || 'student') as User['role'],
      school_id: schoolId,
    };

    try {
      await createEmailVerificationCode(user.id, user.email, user.name);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('createEmailVerificationCode error:', e);
      return { success: false, message: 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.' };
    }

    return { success: true, user };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('register error:', err);
    return { success: false, message: 'فشل التسجيل' };
  }
}

export async function login(
  email: string,
  password: string,
  ip: string = 'unknown',
): Promise<{ success: boolean; message?: string; user?: User; token?: string; refreshToken?: string; school?: School }> {
  try {
    if (await checkLockout(email)) {
      return { success: false, message: 'تم تجاوز عدد محاولات الدخول. حاول مرة أخرى بعد 15 دقيقة.' };
    }
    // First: check users table
    const row = await db.get<{
      id: number;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      blocked_at: string | null;
      email_verified_at: string | null;
    }>(
      'SELECT id, email, name, role, password_hash, blocked_at, email_verified_at FROM users WHERE email = ?',
      email
    );

    if (row) {
      if (row.blocked_at) {
        return { success: false, message: 'بيانات الدخول غير صحيحة' };
      }
      const valid = await comparePassword(password, row.password_hash);
      if (!valid) {
        await logLoginAttempt(email, ip, false);
        return { success: false, message: 'بيانات الدخول غير صحيحة' };
      }
      if (!row.email_verified_at && row.role !== 'admin') {
        return { success: false, message: 'يرجى تأكيد بريدك الإلكتروني أولاً' };
      }

      await clearFailedAttempts(email);
      await logLoginAttempt(email, ip, true);

      const user: User = {
        id: Number(row.id),
        email: row.email,
        name: row.name,
        role: row.role as User['role'],
      };

      const { token, refreshToken } = await issueTokensForUser(user);
      return { success: true, user, token, refreshToken };
    }

    // Fallback: check schools table
    const schoolRow = await db.get<{
      id: number;
      email: string;
      name: string;
      code: string;
      password_hash: string;
      max_students: number;
      max_teachers: number;
      is_active: number;
    }>('SELECT id, email, name, code, password_hash, max_students, max_teachers, is_active FROM schools WHERE email = ?', email);

    if (schoolRow) {
      if (!schoolRow.is_active) {
        return { success: false, message: 'بيانات الدخول غير صحيحة' };
      }
      const valid = await comparePassword(password, schoolRow.password_hash);
      if (!valid) {
        await logLoginAttempt(email, ip, false);
        return { success: false, message: 'بيانات الدخول غير صحيحة' };
      }

      await clearFailedAttempts(email);
      await logLoginAttempt(email, ip, true);

      const school = {
        id: Number(schoolRow.id),
        email: schoolRow.email,
        name: schoolRow.name,
        code: schoolRow.code,
        max_students: schoolRow.max_students,
        max_teachers: schoolRow.max_teachers,
        is_active: true,
      };

      const token = await signAccessToken({
        sub: String(schoolRow.id),
        email: schoolRow.email,
        role: 'school',
      });
      const refreshToken = generateRefreshToken();
      try {
        await db.run(
          'INSERT INTO school_refresh_tokens (token_hash, school_id, expires_at) VALUES (?, ?, ?)',
          hashRefreshToken(refreshToken),
          schoolRow.id,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        );
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.error('school refresh token storage error:', e);
      }

      return { success: true, school, token, refreshToken };
    }

    // No user or school found — dummy bcrypt to prevent timing oracle
    try { await comparePassword(password, DUMMY_HASH); } catch { /* ignore */ }
    await logLoginAttempt(email, ip, false);
    return { success: false, message: 'بيانات الدخول غير صحيحة' };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('login error:', err);
    return { success: false, message: 'فشل تسجيل الدخول' };
  }
}

export async function resendVerificationCode(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await db.get<{ id: number; name: string; email_verified_at: string | null }>(
      'SELECT id, name, email_verified_at FROM users WHERE email = ?',
      email,
    );
    if (!user) {
      return { success: false, message: 'إذا كان البريد مسجلاً، فقد تم إرسال رمز التحقق' };
    }
    if (user.email_verified_at) {
      return { success: false, message: 'البريد الإلكتروني مؤكد بالفعل' };
    }

    await db.run('BEGIN IMMEDIATE');
    try {
      await db.run('DELETE FROM email_verification_codes WHERE user_id = ? AND used_at IS NULL', user.id);
      await createEmailVerificationCode(user.id, email, user.name);
      await db.run('COMMIT');
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('resendVerificationCode error:', err);
    return { success: false, message: 'فشل إعادة إرسال الرمز' };
  }
}

export { verifyEmailCode, refreshAccessToken, logout, logoutSchool } from './services-token.js';
