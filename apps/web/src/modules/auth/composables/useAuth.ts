import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const store = useAuthStore();

  async function login(email: string, password: string) {
    // TODO: استدعاء API للتسجيل
    store.setSession({ id: 1, email, name: 'User', role: 'student' as const }, 'fake-token');
  }

  function logout() {
    store.clearSession();
  }

  return { login, logout, isAuthenticated: store.isAuthenticated, user: store.user };
}
