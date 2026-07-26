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
): Promise<{ success: boolean; message?: string; user?: User }> {
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

    return { success: true, user };
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
