import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken } from './crypto.js';
import { signAccessToken } from './jwt.js';
export async function register(credentials) {
    try {
        const existing = await db.all('SELECT id FROM users WHERE email = ?', credentials.email);
        if (existing.length > 0) {
            return { success: false, message: 'Email already registered' };
        }
        const passwordHash = await hashPassword(credentials.password);
        const result = await db.run('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)', credentials.email, credentials.name, passwordHash, credentials.role || 'student');
        const user = {
            id: Number(result.lastID),
            email: credentials.email,
            name: credentials.name,
            role: credentials.role || 'student',
        };
        return { success: true, user };
    }
    catch (err) {
        console.error('register error:', err);
        return { success: false, message: 'Registration failed' };
    }
}
export async function login(email, password) {
    try {
        const rows = await db.all('SELECT id, email, name, role, password_hash, blocked_at FROM users WHERE email = ?', email);
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
        const user = {
            id: Number(row.id),
            email: row.email,
            name: row.name,
            role: row.role,
        };
        const token = await signAccessToken({
            sub: String(user.id),
            email: user.email,
            role: user.role,
        });
        const refreshToken = generateRefreshToken();
        const refreshHash = hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await db.run('INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)', refreshHash, user.id, expiresAt);
        return { success: true, user, token, refreshToken };
    }
    catch (err) {
        console.error('login error:', err);
        return { success: false, message: 'Login failed' };
    }
}
export async function refreshAccessToken(refreshToken) {
    try {
        const hash = hashRefreshToken(refreshToken);
        const rows = await db.all('SELECT user_id FROM refresh_tokens WHERE token_hash = ? AND expires_at > datetime("now")', hash);
        if (rows.length === 0) {
            return { success: false, message: 'Invalid or expired refresh token' };
        }
        const userId = Number(rows[0].user_id);
        // Delete the old refresh token (rotation)
        await db.run('DELETE FROM refresh_tokens WHERE token_hash = ?', hash);
        const userRows = await db.all('SELECT id, email, name, role FROM users WHERE id = ?', userId);
        if (userRows.length === 0) {
            return { success: false, message: 'User not found' };
        }
        const u = userRows[0];
        const token = await signAccessToken({
            sub: String(u.id),
            email: u.email,
            role: u.role,
        });
        // Generate and store new refresh token
        const newRefreshToken = generateRefreshToken();
        const newRefreshHash = hashRefreshToken(newRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await db.run('INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)', newRefreshHash, userId, expiresAt);
        return { success: true, token, refreshToken: newRefreshToken };
    }
    catch (err) {
        console.error('refresh error:', err);
        return { success: false, message: 'Refresh failed' };
    }
}
export async function logout(userId) {
    await db.run('DELETE FROM refresh_tokens WHERE user_id = ?', userId);
}
export async function getUserById(id) {
    const rows = await db.all('SELECT id, email, name, role FROM users WHERE id = ?', id);
    if (rows.length === 0)
        return null;
    const u = rows[0];
    return {
        id: Number(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
    };
}
export async function updatePassword(userId, newPassword) {
    try {
        const hash = await hashPassword(newPassword);
        await db.run('UPDATE users SET password_hash = ? WHERE id = ?', hash, userId);
        return true;
    }
    catch (err) {
        console.error('updatePassword error:', err);
        return false;
    }
}
export async function impersonateUser(targetId) {
    const rows = await db.all('SELECT id, email, name, role FROM users WHERE id = ?', targetId);
    if (rows.length === 0)
        return null;
    const target = rows[0];
    const token = await signAccessToken({
        sub: String(target.id),
        email: target.email,
        role: target.role,
    });
    return {
        user: { id: Number(target.id), email: target.email, name: target.name, role: target.role },
        token,
    };
}
