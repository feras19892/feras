import { SignJWT, jwtVerify } from 'jose';
function getSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return new TextEncoder().encode(jwtSecret);
}
export async function signAccessToken(payload) {
    return new SignJWT({ sub: payload.sub, email: payload.email, role: payload.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(getSecret());
}
export async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, getSecret(), { clockTolerance: 60 });
    return {
        sub: String(payload.sub),
        email: String(payload.email),
        role: payload.role,
        iat: Number(payload.iat),
        exp: Number(payload.exp),
    };
}
