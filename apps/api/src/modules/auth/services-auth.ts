import type { User, RegisterCredentials, School } from '@my-modern-app/shared-types';
import { randomBytes, createHash } from 'crypto';
import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken, generateVerificationCode, hashVerificationCode } from './crypto.js';
import { signAccessToken } from './jwt.js';
import { recordConsent } from './services-consent.js';
import { sendVerificationEmail } from '../../shared/email.js';
import { validateInviteCode, useInviteCode } from '../invite-codes/services.js';
import { createSubscription } from '../subscriptions/services.js';

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
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[logLoginAttempt] DB error:', err);
  }
}

async function clearFailedAttempts(email: string): Promise<void> {
  try {
    await db.run(`DELETE FROM login_attempts WHERE email = ? AND success = 0`, email.toLowerCase());
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[clearFailedAttempts] DB error:', err);
  }
}

export { checkLockout, logLoginAttempt, clearFailedAttempts };

export async function issueTokensForUser(user: User): Promise<{ token: string; refreshToken: string }> {
  const token = await signAccessToken({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    school_id: user.school_id,
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

function computeFingerprint(ip: string, userAgent: string, input?: string | null): string {
  if (input) return createHash('sha256').update(input).digest('hex').slice(0, 32);
  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').slice(0, 32);
}

function getTrialDays(role: string): number {
  if (role === 'student') return 3;
  return 7;
}

export async function register(credentials: RegisterCredentials, ip: string = 'unknown', userAgent: string = '', fingerprint?: string): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    if (credentials.consent !== true) {
      return { success: false, message: 'يجب الموافقة على سياسة الخصوصية وشروط الاستخدام' };
    }
    if (credentials.age === undefined || credentials.age === null || credentials.age < 14) {
      return { success: false, message: 'يجب أن يكون العمر 14 عاماً أو أكثر، أو التسجيل عبر المدرسة بموافقة ولي الأمر' };
    }
    const existing = await db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', credentials.email);
    if (existing) {
      return { success: false, message: 'البريد الإلكتروني مسجل بالفعل' };
    }

    const regFingerprint = computeFingerprint(ip, userAgent, fingerprint);
    if (process.env.NODE_ENV === 'production') {
      const existingDevice = await db.get<{ id: number }>(
        'SELECT id FROM users WHERE registration_fingerprint = ? AND trial_used = 1',
        regFingerprint,
      );
      if (existingDevice) {
        return { success: false, message: 'هذا الجهاز/المتصفح استُخدم للتجربة من قبل' };
      }
    }

    let schoolId: number | null = null;
    let inviteUsed = false;
    const inviteCode: string | undefined = credentials.invite_code || undefined;
    const schoolCode: string | undefined = credentials.school_code || undefined;

    if (inviteCode) {
      const validation = await validateInviteCode(inviteCode);
      if (validation.ok) {
        if (validation.invite.owner_type === 'school') {
          schoolId = validation.invite.owner_id;
        }
        inviteUsed = true;
      }
    }

    if (!schoolId && schoolCode) {
      const school = await db.get<{ id: number; is_active: number; max_students: number; max_teachers: number }>(
        'SELECT id, is_active, max_students, max_teachers FROM schools WHERE code = ?',
        schoolCode,
      );
      if (!school) {
        return { success: false, message: 'رمز المدرسة غير صالح' };
      }
      if (!school.is_active) {
        return { success: false, message: 'المدرسة غير مفعلة' };
      }
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
    const now = new Date().toISOString();
    const result = await db.run(
      'INSERT INTO users (email, name, password_hash, role, school_id, age, email_verified_at, registration_ip, registration_user_agent, registration_fingerprint, trial_used, last_login_ip, last_login_fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      credentials.email,
      credentials.name,
      passwordHash,
      credentials.role || 'student',
      schoolId,
      credentials.age ?? null,
      now,
      ip,
      userAgent,
      regFingerprint,
      1,
      ip,
      regFingerprint,
    );

    const user: User = {
      id: Number(result.lastID),
      email: credentials.email,
      name: credentials.name,
      role: (credentials.role || 'student') as User['role'],
      school_id: schoolId,
    };

    await recordConsent(Number(result.lastID), 'terms_and_privacy', '1.0', ip, userAgent);

    if (inviteUsed) {
      await useInviteCode({ member_id: user.id, code: inviteCode! }).catch((err) => {
        if (process.env.NODE_ENV !== 'production') console.error('useInviteCode error:', err);
      });
    }

    if (schoolId && !inviteUsed) {
      await db.run(
        `INSERT INTO tenant_memberships (member_id, tenant_id, tenant_type, invite_code_id, joined_at, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        user.id,
        schoolId,
        'school',
        null,
        new Date().toISOString(),
        'active',
      );
    }

    const role = (credentials.role || 'student') as 'student' | 'teacher';
    const plan = await db.get<{ id: number; features: string | null }>('SELECT id, features FROM plans WHERE type = ? LIMIT 1', role);
    if (plan) {
      const startsAt = new Date().toISOString();
      const trialDays = getTrialDays(role);
      const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
      let maxStudents: number | null = null;
      let maxTeachers: number | null = null;
      if (plan.features) {
        try {
          const parsed = JSON.parse(plan.features) as Record<string, unknown>;
          if (typeof parsed.free_threshold === 'number') maxStudents = parsed.free_threshold;
          if (typeof parsed.free_teachers === 'number') maxTeachers = parsed.free_teachers;
        } catch {
          // ignore malformed features
        }
      }
      await createSubscription({
        owner_id: user.id,
        owner_type: 'user',
        plan_id: plan.id,
        status: 'TRIAL',
        starts_at: startsAt,
        expires_at: expiresAt,
        next_billing_at: expiresAt,
        max_students: role === 'teacher' ? maxStudents : null,
        max_teachers: role === 'teacher' ? (maxTeachers ?? 1) : null,
      }).catch((err) => {
        if (process.env.NODE_ENV !== 'production') console.error('createSubscription error:', err);
      });
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
  userAgent: string = '',
  fingerprint?: string,
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
      school_id: number | null;
      password_hash: string;
      blocked_at: string | null;
      block_until: string | null;
      email_verified_at: string | null;
    }>(
      'SELECT id, email, name, role, school_id, password_hash, blocked_at, block_until, email_verified_at FROM users WHERE email = ?',
      email
    );

    if (row) {
      const now = new Date().toISOString();
      if (row.blocked_at && (!row.block_until || row.block_until > now)) {
        const block = await db.get<{ block_reason: string | null }>('SELECT block_reason FROM users WHERE id = ?', row.id);
        const reason = block?.block_reason || 'الحساب محظور';
        return { success: false, message: `أنت معاقب: ${reason}` };
      }
      const valid = await comparePassword(password, row.password_hash);
      if (!valid) {
        await logLoginAttempt(email, ip, false);
        return { success: false, message: 'بيانات الدخول غير صحيحة' };
      }

      await clearFailedAttempts(email);
      await logLoginAttempt(email, ip, true);

      const loginFingerprint = computeFingerprint(ip, userAgent, fingerprint);
      await db.run('UPDATE users SET last_login_ip = ?, last_login_fingerprint = ? WHERE id = ?', ip, loginFingerprint, row.id);

      const user: User = {
        id: Number(row.id),
        email: row.email,
        name: row.name,
        role: row.role as User['role'],
        school_id: row.school_id,
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

      const loginFingerprint = computeFingerprint(ip, userAgent, fingerprint);
      await db.run('UPDATE schools SET last_login_ip = ?, last_login_fingerprint = ? WHERE id = ?', ip, loginFingerprint, schoolRow.id);

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
