import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
const SALT_ROUNDS = 12;
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function generateRefreshToken() {
    return randomBytes(64).toString('base64url');
}
export function hashRefreshToken(token) {
    return createHash('sha256').update(token).digest('base64url');
}
