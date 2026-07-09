import type { User, RegisterCredentials } from '@my-modern-app/shared-types';
import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken } from './crypto.js';
import { signAccessToken } from './jwt.js';

export async function register(credentials: RegisterCredentials): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    const existing = await db.all<{ id: number }[]>('SELECT id FROM users WHERE email = ?', credentials.email);
    if (existing.length > 0) {
      return { success: false, message: 'Email already registered' };
    }

    const passwordHash = await hashPassword(credentials.password);
    const result = await db.run(
      'INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)',
      credentials.email, credentials.name, passwordHash, credentials.role || 'student'
    );

    const user: User = {
      id: Number(result.lastID),
      email: credentials.email,
      name: credentials.name,
      role: credentials.role || 'student',
    };
    return { success: true, user };
  } catch (err) {
    console.error('register error:', err);
    return { success: false, message: 'Registration failed' };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: User; token?: string; refreshToken?: string }> {
  try {
    const rows = await db.all<{ id: number; email: string; name: string; role: string; password_hash: string; blocked_at: string | null }[]>(
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
      refreshHash, user.id, expiresAt
    );

    return { success: true, user, token, refreshToken };
  } catch (err) {
    console.error('login error:', err);
    return { success: false, message: 'Login failed' };
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
