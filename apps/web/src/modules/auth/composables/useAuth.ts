import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const store = useAuthStore();

  return {
    login: store.login,
    logout: store.logout,
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    role: store.role,
    isGuest: store.isGuest,
  };
}
