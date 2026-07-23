export async function hashPassword(password) {
    // TODO: use bcrypt or argon2
    return `hashed_${password}`;
}
export async function verifyPassword(password, hash) {
    return hash === `hashed_${password}`;
}
