import type { User, RegisterCredentials } from '@my-modern-app/shared-types';

const users: Map<string, User> = new Map();

export async function login(email: string, password: string) {
  const user = Array.from(users.values()).find((u) => u.email === email);
  if (!user || password !== '123456') {
    return { success: false, message: 'Invalid credentials' };
  }
  return { success: true, data: { user, token: 'fake-jwt-token' } };
}

export async function register(credentials: RegisterCredentials) {
  const id = users.size + 1;
  const user: User = {
    id,
    email: credentials.email,
    name: credentials.name,
    role: credentials.role || 'student',
  };
  users.set(String(id), user);
  return { success: true, data: user };
}
