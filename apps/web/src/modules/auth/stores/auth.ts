import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthActions } from '../../../composables/auth/useAuthActions'
import type { User, UserRole, ClassInfo, School } from '@my-modern-app/shared-types'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(loadJson<User | null>('auth_user', null));
  const schoolSession = ref<School | null>(loadJson<School | null>('school_session', null));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const guestMode = ref<boolean>(loadJson('auth_guest_mode', false));
  const guestRole = ref<'teacher' | 'student' | null>(loadJson('auth_guest_role', null));
  const guestExpiresAt = ref<number | null>(loadJson('auth_guest_expires_at', null));
  const currentClassId = ref<string | null>(loadJson('auth_current_class_id', null));
  const classes = ref<ClassInfo[]>(loadJson('auth_classes', []));

  // Auto-clear expired guest mode on load
  if (guestMode.value && guestExpiresAt.value && Date.now() > guestExpiresAt.value) {
    clearGuestState();
  }

  // Runtime check: clear guest mode if it expires while app is open
  if (guestMode.value && guestExpiresAt.value) {
    const msUntilExpiry = guestExpiresAt.value - Date.now();
    if (msUntilExpiry > 0) {
      setTimeout(() => {
        if (guestMode.value && guestExpiresAt.value && Date.now() > guestExpiresAt.value) {
          clearGuestState();
        }
      }, msUntilExpiry + 1000);
    }
  }

  watch(user, (u) => {
    try { localStorage.setItem('auth_user', JSON.stringify(u)); } catch { /* ignore */ }
  }, { deep: true });

  watch(schoolSession, (s) => {
    try { if (s) localStorage.setItem('school_session', JSON.stringify(s)); else localStorage.removeItem('school_session'); } catch { /* ignore */ }
  }, { deep: true });

  const isLoggedIn = computed(() => !!user.value || !!schoolSession.value);
  const role = computed((): UserRole | null => {
    if (guestMode.value) return guestRole.value || 'guest';
    if (schoolSession.value) return 'school';
    return user.value?.role ?? null;
  });
  const isGuest = computed(() => guestMode.value);
  const isStudent = computed(() => role.value === 'student');
  const isTeacher = computed(() => role.value === 'teacher');
  const isAdmin = computed(() => role.value === 'admin');
  const isSchool = computed(() => role.value === 'school' || !!schoolSession.value);

  watch([guestMode, guestRole, guestExpiresAt, currentClassId, classes], () => persistGuest(), { deep: true });

  function persistGuest() {
    localStorage.setItem('auth_guest_mode', JSON.stringify(guestMode.value));
    localStorage.setItem('auth_guest_role', JSON.stringify(guestRole.value));
    localStorage.setItem('auth_guest_expires_at', JSON.stringify(guestExpiresAt.value));
    localStorage.setItem('auth_current_class_id', JSON.stringify(currentClassId.value));
    localStorage.setItem('auth_classes', JSON.stringify(classes.value));
  }

  function clearGuestState() {
    guestMode.value = false;
    guestRole.value = null;
    guestExpiresAt.value = null;
    currentClassId.value = null;
    classes.value = [];
    localStorage.removeItem('auth_guest_mode');
    localStorage.removeItem('auth_guest_role');
    localStorage.removeItem('auth_guest_expires_at');
    localStorage.removeItem('auth_current_class_id');
    localStorage.removeItem('auth_classes');
  }

  function setSchoolSession(s: School | null) {
    schoolSession.value = s;
  }

  function clearSchoolSession() {
    schoolSession.value = null;
    localStorage.removeItem('school_session');
  }

  const actions = useAuthActions(user, loading, error, clearGuestState, setSchoolSession)

  function loginAsGuest(role?: 'teacher' | 'student') {
    clearGuestState()
    guestMode.value = true
    guestRole.value = role || null
    guestExpiresAt.value = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    const msUntilExpiry = 24 * 60 * 60 * 1000;
    setTimeout(() => {
      if (guestMode.value && guestExpiresAt.value && Date.now() > guestExpiresAt.value) {
        clearGuestState();
      }
    }, msUntilExpiry + 1000);
  }

  function selectClass(classId: string) {
    currentClassId.value = classId
  }

  function clearSession() {
    actions.logout()
  }

  const isAuthenticated = isLoggedIn;

  return {
    user, schoolSession, loading, error,
    guestMode, guestRole, currentClassId, classes,
    isLoggedIn, isAuthenticated, role,
    isGuest, isStudent, isTeacher, isAdmin, isSchool,
    setSchoolSession, clearSchoolSession,
    login: actions.login,
    registerWithRole: actions.registerWithRole,
    fetchMe: actions.fetchMe,
    init: actions.init,
    tryRestore: actions.tryRestore,
    updatePassword: actions.updatePassword,
    updateProfileName: actions.updateProfileName,
    submitNameRequest: actions.submitNameRequest,
    deleteMyAccount: actions.deleteMyAccount,
    joinClass: (code: string) => actions.joinClass(code, classes, currentClassId),
    createClass: (name: string) => actions.createClass(name, classes, currentClassId),
    selectClass,
    loginAsGuest,
    logout: actions.logout,
    setSession: actions.setSession,
    clearSession,
  };
});
