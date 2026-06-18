export async function hashPassword(password: string): Promise<string> {
  // TODO: use bcrypt or argon2
  return `hashed_${password}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return hash === `hashed_${password}`;
}
