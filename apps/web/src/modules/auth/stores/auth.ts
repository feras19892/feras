import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { fetchJson } from '../../../services/http';
import type { User, UserRole, ClassInfo, RegisterCredentials } from '@my-modern-app/shared-types';

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const guestMode = ref<boolean>(loadJson('auth_guest_mode', false));
  const guestRole = ref<'teacher' | 'student' | null>(loadJson('auth_guest_role', null));
  const currentClassId = ref<string | null>(loadJson('auth_current_class_id', null));
  const classes = ref<ClassInfo[]>(loadJson('auth_classes', []));

  const isLoggedIn = computed(() => !!user.value);
  const role = computed((): UserRole | null => {
    if (guestMode.value) return guestRole.value || 'guest';
    return user.value?.role ?? null;
  });
  const isGuest = computed(() => role.value === 'guest');
  const isStudent = computed(() => role.value === 'student');
  const isTeacher = computed(() => role.value === 'teacher');
  const isResearcher = computed(() => role.value === 'researcher');
  const isAdmin = computed(() => role.value === 'admin');

  watch([guestMode, guestRole, currentClassId, classes], () => persistGuest(), { deep: true });

  function persistGuest() {
    localStorage.setItem('auth_guest_mode', JSON.stringify(guestMode.value));
    localStorage.setItem('auth_guest_role', JSON.stringify(guestRole.value));
    localStorage.setItem('auth_current_class_id', JSON.stringify(currentClassId.value));
    localStorage.setItem('auth_classes', JSON.stringify(classes.value));
  }

  function clearGuestState() {
    guestMode.value = false;
    guestRole.value = null;
    currentClassId.value = null;
    classes.value = [];
    localStorage.removeItem('auth_guest_mode');
    localStorage.removeItem('auth_guest_role');
    localStorage.removeItem('auth_current_class_id');
    localStorage.removeItem('auth_classes');
  }

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('auth_token', t);
    localStorage.setItem('auth_token_set_at', String(Date.now()));
  }

  function clearToken() {
    token.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_set_at');
  }

  function isTokenExpired(): boolean {
    const setAt = localStorage.getItem('auth_token_set_at');
    if (!setAt) return true;
    return Date.now() - Number(setAt) > TOKEN_MAX_AGE_MS;
  }

  function extractStatusCode(err: unknown): number | null {
    const msg = err instanceof Error ? err.message : String(err);
    const match = msg.match(/Request failed:\s*(\d{3})\b/);
    return match ? Number(match[1]) : null;
  }

  function isNetworkError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes('Failed to fetch') || msg.includes('fetch failed');
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      clearGuestState();
      user.value = data.user;
      setToken(data.token);
      return true;
    } catch (err) {
      const status = extractStatusCode(err);
      if (status === 401) error.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      else if (isNetworkError(err)) error.value = 'تعذر الاتصال بالخادم (تأكد من تشغيل backend)';
      else error.value = 'Server connection error';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function registerWithRole(email: string, password: string, name: string, roleVal: 'teacher' | 'student') {
    loading.value = true;
    error.value = null;
    try {
      await fetchJson<{ user: User }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: roleVal }),
      });
      const loginData = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      clearGuestState();
      user.value = loginData.user;
      setToken(loginData.token);
      return true;
    } catch (err) {
      const status = extractStatusCode(err);
      if (status === 409) error.value = 'هذا البريد الإلكتروني مستخدم مسبقًا';
      else if (status === 400) error.value = 'بيانات التسجيل غير صحيحة';
      else if (isNetworkError(err)) error.value = 'تعذر الاتصال بالخادم (تأكد من تشغيل backend)';
      else error.value = 'فشل إنشاء الحساب';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!token.value || isTokenExpired()) {
      logout();
      return;
    }
    try {
      const data = await fetchJson<{ user: User }>('/api/auth/me');
      user.value = data.user;
    } catch {
      logout();
    }
  }

  async function updatePassword(userId: number, newPassword: string) {
    if (user.value?.id !== userId && user.value?.role !== 'admin') return false;
    try {
      await fetchJson('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, new_password: newPassword }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async function joinClass(classCode: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchJson<{ class_id: string; name: string; code: string; already_joined?: boolean }>('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: classCode, student_id: user.value?.id }),
      });
      const cls: ClassInfo = {
        id: data.class_id || classCode,
        name: data.name || classCode,
        code: classCode,
        role: 'student',
      };
      if (!classes.value.find((c) => c.code === classCode)) {
        classes.value.push(cls);
      }
      currentClassId.value = cls.id;
      return true;
    } catch (err) {
      const status = extractStatusCode(err);
      if (status === 404) error.value = 'الكود غير صحيح';
      else if (isNetworkError(err)) error.value = 'تعذر الاتصال بالخادم';
      else error.value = 'Server connection error';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function createClass(className: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchJson<{ id: string; name: string; code: string }>('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className, teacher_id: user.value?.id }),
      });
      const cls: ClassInfo = {
        id: data.id || data.code,
        name: className,
        code: data.code,
        role: 'teacher',
      };
      classes.value.push(cls);
      currentClassId.value = cls.id;
      return data.code;
    } catch (err) {
      console.error('createClass failed:', err);
      error.value = 'Server connection error';
      return null;
    } finally {
      loading.value = false;
    }
  }

  function selectClass(classId: string) {
    currentClassId.value = classId;
  }

  function loginAsGuest(role?: 'teacher' | 'student') {
    clearGuestState();
    guestMode.value = true;
    guestRole.value = role || null;
  }

  function logout() {
    clearToken();
    clearGuestState();
    user.value = null;
  }

  return {
    user, token, loading, error,
    guestMode, currentClassId, classes,
    isLoggedIn, role,
    isGuest, isStudent, isTeacher, isResearcher, isAdmin,
    login, registerWithRole, fetchMe, updatePassword,
    joinClass, createClass, selectClass, loginAsGuest, logout,
  };
});
