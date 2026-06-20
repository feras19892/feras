import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthActions } from '../../../composables/auth/useAuthActions'
import type { User, UserRole, ClassInfo } from '@my-modern-app/shared-types'

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
  const isGuest = computed(() => guestMode.value);
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

  const actions = useAuthActions(user, loading, error, clearGuestState)

  function loginAsGuest(role?: 'teacher' | 'student') {
    clearGuestState()
    guestMode.value = true
    guestRole.value = role || null
  }

  function selectClass(classId: string) {
    currentClassId.value = classId
  }

  function clearSession() {
    actions.logout()
  }

  const isAuthenticated = isLoggedIn;

  return {
    user, loading, error,
    guestMode, guestRole, currentClassId, classes,
    isLoggedIn, isAuthenticated, role,
    isGuest, isStudent, isTeacher, isResearcher, isAdmin,
    login: actions.login,
    registerWithRole: actions.registerWithRole,
    fetchMe: actions.fetchMe,
    init: actions.init,
    tryRestore: actions.tryRestore,
    updatePassword: actions.updatePassword,
    joinClass: (code: string) => actions.joinClass(code, classes, currentClassId),
    createClass: (name: string) => actions.createClass(name, classes, currentClassId),
    selectClass,
    loginAsGuest,
    logout: actions.logout,
    setSession: actions.setSession,
    clearSession,
  };
});
