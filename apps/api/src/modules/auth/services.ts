import type { User, RegisterCredentials } from '@my-modern-app/shared-types';
import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken, generateVerificationCode, hashVerificationCode } from './crypto.js';
import { signAccessToken } from './jwt.js';

async function issueTokensForUser(user: User): Promise<{ token: string; refreshToken: string }> {
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

async function createEmailVerificationCode(userId: number): Promise<{ code: string }> {
  const code = generateVerificationCode(6);
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  await db.run(
    'INSERT INTO email_verification_codes (user_id, code_hash, expires_at) VALUES (?, ?, ?)',
    userId,
    codeHash,
    expiresAt,
  );

  return { code };
}

export async function register(credentials: RegisterCredentials): Promise<{ success: boolean; message?: string; user?: User; devVerificationCode?: string }> {
  try {
    const existing = await db.all<{ id: number }[]>('SELECT id FROM users WHERE email = ?', credentials.email);
    if (existing.length > 0) {
      return { success: false, message: 'Email already registered' };
    }
    const passwordHash = await hashPassword(credentials.password);
    const result = await db.run(
      'INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)',
      credentials.email,
      credentials.name,
      passwordHash,
      credentials.role || 'student',
    );

    const user: User = {
      id: Number(result.lastID),
      email: credentials.email,
      name: credentials.name,
      role: credentials.role || 'student',
    };

    let devVerificationCode: string | undefined;
    try {
      const { code } = await createEmailVerificationCode(user.id);
      if (process.env.NODE_ENV !== 'production') {
        devVerificationCode = code;
        console.log(`[auth] Dev email verification code for ${user.email}: ${code}`);
      }
    } catch (e) {
      console.error('createEmailVerificationCode error:', e);
    }

    return { success: true, user, devVerificationCode };
  } catch (err) {
    console.error('register error:', err);
    return { success: false, message: 'Registration failed' };
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string; user?: User; token?: string; refreshToken?: string }> {
  try {
    const rows = await db.all<{
      id: number;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      blocked_at: string | null;
    }[]>(
      'SELECT id, email, name, role, password_hash, blocked_at FROM users WHERE email = ?',
      email
    );
    if (rows.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    const row = rows[0];
    if (row.blocked_at) {
      return { success: false, message: 'Account is suspended' };
    }
    const valid = await comparePassword(password, row.password_hash);
    if (!valid) {
      return { success: false, message: 'Invalid credentials' };
    }

    const user: User = {
      id: Number(row.id),
      email: row.email,
      name: row.name,
      role: row.role as User['role'],
    };

    const { token, refreshToken } = await issueTokensForUser(user);

    return { success: true, user, token, refreshToken };
  } catch (err) {
    console.error('login error:', err);
    return { success: false, message: 'Login failed' };
  }
}

export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<{ success: boolean; message?: string; user?: User; token?: string; refreshToken?: string }> {
  try {
    const users = await db.all<{
      id: number;
      email: string;
      name: string;
      role: string;
      email_verified_at: string | null;
    }[]>(
      'SELECT id, email, name, role, email_verified_at FROM users WHERE email = ?',
      email,
    );
    if (users.length === 0) {
      return { success: false, message: 'Invalid code' };
    }

    const userRow = users[0];

    const codes = await db.all<{
      id: number;
      code_hash: string;
      attempts: number;
    }[]>(
      'SELECT id, code_hash, attempts FROM email_verification_codes WHERE user_id = ? AND used_at IS NULL AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
      userRow.id,
    );

    if (codes.length === 0) {
      return { success: false, message: 'Invalid or expired code' };
    }

    const row = codes[0];
    const hashedInput = hashVerificationCode(code);
    if (hashedInput !== row.code_hash) {
      try {
        await db.run('UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = ?', row.id);
      } catch (e) {
        console.error('verifyEmailCode attempts update error:', e);
      }
      return { success: false, message: 'Invalid code' };
    }

    const nowIso = new Date().toISOString();
    await db.run('UPDATE email_verification_codes SET used_at = ? WHERE id = ?', nowIso, row.id);
    await db.run('UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?', nowIso, userRow.id);

    const user: User = {
      id: Number(userRow.id),
      email: userRow.email,
      name: userRow.name,
      role: userRow.role as User['role'],
    };

    const { token, refreshToken } = await issueTokensForUser(user);

    return { success: true, user, token, refreshToken };
  } catch (err) {
    console.error('verifyEmailCode error:', err);
    return { success: false, message: 'Verification failed' };
  }
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ success: boolean; message?: string; token?: string; refreshToken?: string }> {
  try {
    const hash = hashRefreshToken(refreshToken);
    const rows = await db.all<{ user_id: number }[]>(
      'SELECT user_id FROM refresh_tokens WHERE token_hash = ? AND expires_at > datetime("now")',
      hash
    );
    if (rows.length === 0) {
      return { success: false, message: 'Invalid or expired refresh token' };
    }

    const userId = Number(rows[0].user_id);

    // Delete the old refresh token (rotation)
    await db.run('DELETE FROM refresh_tokens WHERE token_hash = ?', hash);

    const userRows = await db.all<{ id: number; email: string; name: string; role: string }[]>(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      userId
    );
    if (userRows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const u = userRows[0];
    const token = await signAccessToken({
      sub: String(u.id),
      email: u.email,
      role: u.role as User['role'],
    });

    // Generate and store new refresh token
    const newRefreshToken = generateRefreshToken();
    const newRefreshHash = hashRefreshToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.run(
      'INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
      newRefreshHash, userId, expiresAt
    );

    return { success: true, token, refreshToken: newRefreshToken };
  } catch (err) {
    console.error('refresh error:', err);
    return { success: false, message: 'Refresh failed' };
  }
}

export async function logout(userId: number): Promise<void> {
  await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', userId);
}

export async function getUserById(id: number): Promise<User | null> {
  const rows = await db.all<{ id: number; email: string; name: string; role: string }[]>(
    'SELECT id, email, name, role FROM users WHERE id = ?',
    id
  );
  if (rows.length === 0) return null;
  const u = rows[0];
  return {
    id: Number(u.id),
    email: u.email,
    name: u.name,
    role: u.role as User['role'],
  };
}

export async function updatePassword(userId: number, newPassword: string): Promise<boolean> {
  try {
    const hash = await hashPassword(newPassword);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', hash, userId);
    return true;
  } catch (err) {
    console.error('updatePassword error:', err);
    return false;
  }
}

export async function updateProfileName(userId: number, name: string): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    await db.run('UPDATE users SET name = ? WHERE id = ?', name, userId);
    const updated = await getUserById(userId);
    if (!updated) return { success: false, message: 'Update failed' };
    return { success: true, user: updated };
  } catch (err) {
    console.error('updateProfileName error:', err);
    return { success: false, message: 'Update failed' };
  }
}

export async function deleteAccount(userId: number, password: string): Promise<{ success: boolean; message?: string }> {
  const rows = await db.all<{ id: number; password_hash: string }[]>(
    'SELECT id, password_hash FROM users WHERE id = ?', userId,
  );
  if (rows.length === 0) return { success: false, message: 'User not found' };

  const valid = await comparePassword(password, rows[0].password_hash);
  if (!valid) return { success: false, message: 'Invalid password' };

  await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', userId);
  await db.run('DELETE FROM users WHERE id = ?', userId);
  return { success: true };
}

export async function createNameRequest(userId: number, requestedName: string): Promise<{ success: boolean; message?: string }> {
  const pending = await db.all<{ id: number }[]>(
    'SELECT id FROM name_change_requests WHERE user_id = ? AND status = ?', userId, 'pending',
  );
  if (pending.length > 0) {
    await db.run('UPDATE name_change_requests SET requested_name = ? WHERE id = ?', requestedName, pending[0].id);
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
  if (!req) return { success: false, message: 'Request not found' };
  if (req.status !== 'pending') return { success: false, message: 'Already resolved' };

  const status = approved ? 'approved' : 'rejected';
  await db.run(
    'UPDATE name_change_requests SET status = ?, teacher_id = ?, resolved_at = datetime(\'now\') WHERE id = ?',
    status, teacherId, requestId,
  );

  if (approved) {
    await db.run('UPDATE users SET name = ? WHERE id = ?', req.requested_name, req.user_id);
  }

  return { success: true };
}

export async function impersonateUser(targetId: number): Promise<{ user: User; token: string } | null> {
  const rows = await db.all<{ id: number; email: string; name: string; role: string }[]>(
    'SELECT id, email, name, role FROM users WHERE id = ?', targetId
  );
  if (rows.length === 0) return null;
  const target = rows[0];
  const token = await signAccessToken({
    sub: String(target.id),
    email: target.email,
    role: target.role as User['role'],
  });
  return {
    user: { id: Number(target.id), email: target.email, name: target.name, role: target.role as User['role'] },
    token,
  };
}
