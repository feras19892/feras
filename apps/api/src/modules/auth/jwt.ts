import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '@my-modern-app/shared-types';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
);

export async function signAccessToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<string> {
  return new SignJWT({ sub: payload.sub, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as JWTPayload['role'],
    iat: Number(payload.iat),
    exp: Number(payload.exp),
  };
}
