import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '@my-modern-app/shared-types';

function getSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(jwtSecret);
}

export async function signAccessToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<string> {
  return new SignJWT({ sub: payload.sub, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret(), { clockTolerance: 60 });
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as JWTPayload['role'],
    iat: Number(payload.iat),
    exp: Number(payload.exp),
  };
}
