import type { User } from '@my-modern-app/shared-types';
import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken, generateVerificationCode, hashVerificationCode, timingSafeEqual } from './crypto.js';
import { sendPasswordResetEmail } from '../../shared/email.js';
import { signAccessToken } from './jwt.js';
import { deleteUserCompletely } from '../../shared/delete-user.js';

export async function getUserById(id: number): Promise<User | null> {
  const u = await db.get<{ id: number; email: string; name: string; role: string; school_id: number | null; avatar_url: string | null }>(
    'SELECT id, email, name, role, school_id, avatar_url FROM users WHERE id = ?',
    id
  );
  if (!u) return null;
  return {
    id: Number(u.id),
    email: u.email,
    name: u.name,
    role: u.role as User['role'],
    school_id: u.school_id,
    avatar_url: u.avatar_url,
  };
}

export async function updatePassword(userId: number, newPassword: string, currentPassword?: string): Promise<{ success: boolean; message?: string }> {
  try {
    if (currentPassword !== undefined) {
      const row = await db.get<{ password_hash: string }>(
        'SELECT password_hash FROM users WHERE id = ?', userId,
      );
      if (!row) return { success: false, message: 'المستخدم غير موجود' };
      const valid = await comparePassword(currentPassword, row.password_hash);
      if (!valid) return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
    }
    const hash = await hashPassword(newPassword);
    await db.run('BEGIN IMMEDIATE');
    try {
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', hash, userId);
      await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', userId);
      await db.run('COMMIT');
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('updatePassword error:', err);
    return { success: false, message: 'فشل التحديث' };
  }
}

export async function updateProfileName(userId: number, name: string): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    await db.run('UPDATE users SET name = ? WHERE id = ?', name, userId);
    const updated = await getUserById(userId);
    if (!updated) return { success: false, message: 'فشل التحديث' };
    return { success: true, user: updated };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('updateProfileName error:', err);
    return { success: false, message: 'فشل التحديث' };
  }
}

export async function deleteAccount(userId: number, password: string): Promise<{ success: boolean; message?: string }> {
  const row = await db.get<{ id: number; password_hash: string }>(
    'SELECT id, password_hash FROM users WHERE id = ?', userId,
  );
  if (!row) return { success: false, message: 'المستخدم غير موجود' };

  const valid = await comparePassword(password, row.password_hash);
  if (!valid) return { success: false, message: 'كلمة المرور غير صحيحة' };

  await deleteUserCompletely(userId);
  return { success: true };
}

export async function createNameRequest(userId: number, requestedName: string): Promise<{ success: boolean; message?: string }> {
  const pending = await db.get<{ id: number }>(
    'SELECT id FROM name_change_requests WHERE user_id = ? AND status = ?', userId, 'pending',
  );
  if (pending) {
    await db.run('UPDATE name_change_requests SET requested_name = ? WHERE id = ?', requestedName, pending.id);
    return { success: true };
  }
  await db.run('INSERT INTO name_change_requests (user_id, requested_name) VALUES (?, ?)', userId, requestedName);
  return { success: true };
}

export async function getPendingNameRequests(teacherId: number): Promise<{ id: number; user_id: number; user_name: string; user_email: string; requested_name: string; created_at: string }[]> {
  const requests = await db.all<{ id: number; user_id: number; user_name: string; user_email: string; requested_name: string; created_at: string }[]>(
    `SELECT ncr.id, ncr.user_id, u.name as user_name, u.email as user_email, ncr.requested_name, ncr.created_at
     FROM name_change_requests ncr
     JOIN users u ON ncr.user_id = u.id
     JOIN class_students cs ON cs.student_id = ncr.user_id
     JOIN classes c ON c.id = cs.class_id
     WHERE ncr.status = 'pending' AND c.teacher_id = ?
     GROUP BY ncr.id
     ORDER BY ncr.created_at DESC`,
    teacherId,
  );
  return requests;
}

export async function resolveNameRequest(requestId: number, teacherId: number, approved: boolean): Promise<{ success: boolean; message?: string }> {
  const req = await db.get<{ id: number; user_id: number; requested_name: string; status: string }>(
    'SELECT id, user_id, requested_name, status FROM name_change_requests WHERE id = ?', requestId,
  );
  if (!req) return { success: false, message: 'الطلب غير موجود' };
  if (req.status !== 'pending') return { success: false, message: 'تمت معالجة هذا الطلب بالفعل' };

  // Verify this teacher owns a class that the student belongs to
  const owns = await db.get<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM class_students cs JOIN classes c ON c.id = cs.class_id WHERE cs.student_id = ? AND c.teacher_id = ?`,
    req.user_id, teacherId,
  );
  if (!owns || owns.cnt === 0) return { success: false, message: 'غير مصرح — هذا الطالب ليس في فصولك' };

  const status = approved ? 'approved' : 'rejected';
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run(
      'UPDATE name_change_requests SET status = ?, teacher_id = ?, resolved_at = datetime(\'now\') WHERE id = ?',
      status, teacherId, requestId,
    );

    if (approved) {
      await db.run('UPDATE users SET name = ? WHERE id = ?', req.requested_name, req.user_id);
    }
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }

  return { success: true };
}

export async function impersonateUser(targetId: number): Promise<{ user: User; token: string; refreshToken: string } | null> {
  const target = await db.get<{ id: number; email: string; name: string; role: string; school_id: number | null; avatar_url: string | null }>(
    'SELECT id, email, name, role, school_id, avatar_url FROM users WHERE id = ?', targetId
  );
  if (!target) return null;
  const token = await signAccessToken({
    sub: String(target.id),
    email: target.email,
    role: target.role as User['role'],
  });
  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.run(
    'INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    refreshHash, target.id, expiresAt
  );
  return {
    user: { id: Number(target.id), email: target.email, name: target.name, role: target.role as User['role'], school_id: target.school_id, avatar_url: target.avatar_url },
    token,
    refreshToken,
  };
}

// ─── Forgot Password ───
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ id: number; email: string; name: string }>(
    'SELECT id, email, name FROM users WHERE email = ?', email
  );
  // Always return success to prevent email enumeration
  if (!user) return { success: true };
  
  const code = generateVerificationCode(6);
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Delete old codes and insert new one atomically
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run('DELETE FROM password_reset_codes WHERE user_id = ?', user.id);
    await db.run(
      'INSERT INTO password_reset_codes (user_id, code_hash, expires_at) VALUES (?, ?, ?)',
      user.id, codeHash, expiresAt
    );
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }

  await sendPasswordResetEmail(user.email, user.name, code);
  return { success: true };
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ id: number; email: string }>(
    'SELECT id, email FROM users WHERE email = ?', email
  );
  if (!user) return { success: false, message: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية' };

  const resetRow = await db.get<{ id: number; code_hash: string; expires_at: string; attempts: number }>(
    'SELECT id, code_hash, expires_at, attempts FROM password_reset_codes WHERE user_id = ? AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
    user.id
  );
  if (!resetRow) return { success: false, message: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية' };

  if (resetRow.attempts >= 5) {
    await db.run('DELETE FROM password_reset_codes WHERE user_id = ?', user.id);
    return { success: false, message: 'تم تجاوز الحد الأقصى من المحاولات. يرجى طلب رمز جديد' };
  }

  const hashedInput = hashVerificationCode(code);
  if (!timingSafeEqual(hashedInput, resetRow.code_hash)) {
    await db.run('UPDATE password_reset_codes SET attempts = attempts + 1 WHERE id = ?', resetRow.id);
    return { success: false, message: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية' };
  }

  const hash = await hashPassword(newPassword);
  await db.run('BEGIN IMMEDIATE');
  try {
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', hash, user.id);
    await db.run('DELETE FROM password_reset_codes WHERE user_id = ?', user.id);
    await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', user.id);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }

  return { success: true };
}
