import bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomInt } from 'crypto';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateRefreshToken(): string {
  return randomBytes(64).toString('base64url');
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

export function generateVerificationCode(length = 6): string {
  const max = 10 ** length;
  const n = randomInt(0, max);
  return n.toString().padStart(length, '0');
}

export function hashVerificationCode(code: string): string {
  return createHash('sha256').update(code).digest('base64url');
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
