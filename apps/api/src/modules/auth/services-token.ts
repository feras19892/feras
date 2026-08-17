import type { User } from '@my-modern-app/shared-types';
import { db } from '../../db/index.js';
import { generateRefreshToken, hashRefreshToken, hashVerificationCode, timingSafeEqual } from './crypto.js';
import { signAccessToken } from './jwt.js';
import { issueTokensForUser } from './services-auth.js';

export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<{ success: boolean; message?: string; user?: User; token?: string; refreshToken?: string }> {
  try {
    const userRow = await db.get<{
      id: number;
      email: string;
      name: string;
      role: string;
      email_verified_at: string | null;
    }>(
      'SELECT id, email, name, role, email_verified_at FROM users WHERE email = ?',
      email,
    );
    if (!userRow) {
      return { success: false, message: 'رمز غير صالح' };
    }

    const row = await db.get<{
      id: number;
      code_hash: string;
      attempts: number;
    }>(
      'SELECT id, code_hash, attempts FROM email_verification_codes WHERE user_id = ? AND used_at IS NULL AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
      userRow.id,
    );

    if (!row) {
      return { success: false, message: 'رمز غير صالح أو منتهي الصلاحية' };
    }
    if (row.attempts >= 5) {
      await db.run('UPDATE email_verification_codes SET used_at = ? WHERE id = ?', new Date().toISOString(), row.id);
      return { success: false, message: 'تم تجاوز الحد الأقصى من المحاولات. يرجى طلب رمز جديد' };
    }
    const hashedInput = hashVerificationCode(code);
    if (!timingSafeEqual(hashedInput, row.code_hash)) {
      try {
        await db.run('UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = ?', row.id);
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.error('verifyEmailCode attempts update error:', e);
      }
      return { success: false, message: 'رمز غير صالح' };
    }

    const nowIso = new Date().toISOString();
    await db.run('BEGIN IMMEDIATE');
    try {
      await db.run('UPDATE email_verification_codes SET used_at = ? WHERE id = ?', nowIso, row.id);
      await db.run('UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?', nowIso, userRow.id);
      await db.run('COMMIT');
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }

    const user: User = {
      id: Number(userRow.id),
      email: userRow.email,
      name: userRow.name,
      role: userRow.role as User['role'],
    };

    const { token, refreshToken } = await issueTokensForUser(user);

    return { success: true, user, token, refreshToken };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('verifyEmailCode error:', err);
    return { success: false, message: 'فشل التحقق' };
  }
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ success: boolean; message?: string; token?: string; refreshToken?: string }> {
  try {
    const hash = hashRefreshToken(refreshToken);

    // Try user refresh tokens first
    const userRow = await db.get<{ user_id: number; expires_at: string }>(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = ?',
      hash
    );

    if (userRow) {
      const expiresAt = new Date(userRow.expires_at).getTime();
      if (Date.now() >= expiresAt) {
        await db.run('DELETE FROM refresh_tokens WHERE token_hash = ?', hash);
        return { success: false, message: 'انتهت صلاحية رمز التحديث' };
      }
      const userId = Number(userRow.user_id);
      let token: string;
      let newRefreshToken: string;
      await db.run('BEGIN IMMEDIATE');
      try {
        await db.run('DELETE FROM refresh_tokens WHERE token_hash = ?', hash);

        const u = await db.get<{ id: number; email: string; name: string; role: string; blocked_at: string | null }>(
          'SELECT id, email, name, role, blocked_at FROM users WHERE id = ?', userId
        );
        if (!u) { await db.run('ROLLBACK'); return { success: false, message: 'المستخدم غير موجود' }; }
        if (u.blocked_at) { await db.run('ROLLBACK'); return { success: false, message: 'الحساب محظور' }; }

        token = await signAccessToken({ sub: String(u.id), email: u.email, role: u.role as User['role'] });
        newRefreshToken = generateRefreshToken();
        await db.run(
          'INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
          hashRefreshToken(newRefreshToken), userId,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        );
        await db.run('COMMIT');
      } catch (err) {
        await db.run('ROLLBACK');
        throw err;
      }
      return { success: true, token, refreshToken: newRefreshToken };
    }

    // Try school refresh tokens
    const schoolRow = await db.get<{ school_id: number; expires_at: string }>(
      'SELECT school_id, expires_at FROM school_refresh_tokens WHERE token_hash = ?',
      hash
    );

    if (schoolRow) {
      const expiresAt = new Date(schoolRow.expires_at).getTime();
      if (Date.now() >= expiresAt) {
        await db.run('DELETE FROM school_refresh_tokens WHERE token_hash = ?', hash);
        return { success: false, message: 'انتهت صلاحية رمز التحديث' };
      }
      const schoolId = Number(schoolRow.school_id);
      let token: string;
      let newRefreshToken: string;
      await db.run('BEGIN IMMEDIATE');
      try {
        await db.run('DELETE FROM school_refresh_tokens WHERE token_hash = ?', hash);

        const s = await db.get<{ id: number; email: string; name: string; is_active: number }>(
          'SELECT id, email, name, is_active FROM schools WHERE id = ?', schoolId
        );
        if (!s) { await db.run('ROLLBACK'); return { success: false, message: 'المدرسة غير موجودة' }; }
        if (!s.is_active) { await db.run('ROLLBACK'); return { success: false, message: 'المدرسة غير مفعلة' }; }

        token = await signAccessToken({ sub: String(s.id), email: s.email, role: 'school' });
        newRefreshToken = generateRefreshToken();
        await db.run(
          'INSERT INTO school_refresh_tokens (token_hash, school_id, expires_at) VALUES (?, ?, ?)',
          hashRefreshToken(newRefreshToken), schoolId,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        );
        await db.run('COMMIT');
      } catch (err) {
        await db.run('ROLLBACK');
        throw err;
      }
      return { success: true, token, refreshToken: newRefreshToken };
    }

    return { success: false, message: 'رمز التحديث غير صالح أو منتهي الصلاحية' };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('refresh error:', err);
    return { success: false, message: 'فشل التحديث' };
  }
}

export async function logout(userId: number): Promise<void> {
  await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', userId);
}

export async function logoutSchool(schoolId: number): Promise<void> {
  await db.run('DELETE FROM school_refresh_tokens WHERE school_id = ?', schoolId);
}
