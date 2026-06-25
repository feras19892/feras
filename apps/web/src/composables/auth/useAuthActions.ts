import { fetchJson } from '../../services/http'
import { useI18n } from '../useI18n'
import type { User, ClassInfo } from '@my-modern-app/shared-types'

export function useAuthActions(
  user: { value: User | null },
  loading: { value: boolean },
  error: { value: string | null },
  clearGuestState: () => void,
) {
  const { t } = useI18n()
  function extractStatusCode(err: unknown): number | null {
    const msg = err instanceof Error ? err.message : String(err)
    const match = msg.match(/Request failed:\s*(\d{3})\b/)
    return match ? Number(match[1]) : null
  }

  function isNetworkError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err)
    return msg.includes('Failed to fetch') || msg.includes('fetch failed')
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      clearGuestState()
      user.value = data.user
      return true
    } catch (err) {
      const status = extractStatusCode(err)
      if (status === 401) error.value = t('auth.errors.invalidCredentials')
      else if (isNetworkError(err)) error.value = t('auth.errors.cannotConnectToServer')
      else error.value = t('auth.errors.serverConnectionError')
      return false
    } finally {
      loading.value = false
    }
  }

  async function registerWithRole(email: string, password: string, name: string, roleVal: 'teacher' | 'student') {
    loading.value = true
    error.value = null
    try {
      await fetchJson<{ success: boolean; user?: User }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: roleVal }),
      })
      const loginData = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      clearGuestState()
      user.value = loginData.user
      return true
    } catch (err) {
      const status = extractStatusCode(err)
      if (status === 409) error.value = t('auth.errors.emailAlreadyUsed')
      else if (status === 400) error.value = t('auth.errors.invalidRegistrationData')
      else if (isNetworkError(err)) error.value = t('auth.errors.cannotConnectToServer')
      else error.value = t('auth.errors.registerFailed')
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const data = await fetchJson<{ user: User }>('/api/auth/me')
      user.value = data.user
    } catch {
      logout()
    }
  }

  async function init() {
    try {
      const data = await fetchJson<{ user: User }>('/api/auth/me')
      user.value = data.user
    } catch {
      // auth failed (token expired and refresh failed) — clear user to force re-login
      user.value = null
    }
  }

  async function tryRestore() {
    try {
      const data = await fetchJson<{ user: User }>('/api/auth/me')
      user.value = data.user
      return true
    } catch {
      return false
    }
  }

  async function updatePassword(userId: number, newPassword: string) {
    if (user.value?.id !== userId && user.value?.role !== 'admin') return false
    try {
      await fetchJson('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, new_password: newPassword }),
      })
      return true
    } catch {
      return false
    }
  }

  async function joinClass(classCode: string, classes: { value: ClassInfo[] }, currentClassId: { value: string | null }) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchJson<{ class_id: string; name: string; code: string; already_joined?: boolean }>('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: classCode, student_id: user.value?.id }),
      })
      const cls: ClassInfo = {
        id: data.class_id || classCode,
        name: data.name || classCode,
        code: classCode,
        role: 'student',
      }
      if (!classes.value.find((c) => c.code === classCode)) {
        classes.value.push(cls)
      }
      currentClassId.value = cls.id
      return true
    } catch (err) {
      const status = extractStatusCode(err)
      if (status === 404) error.value = t('auth.errors.invalidCode')
      else if (isNetworkError(err)) error.value = t('auth.errors.cannotConnectToServer')
      else error.value = t('auth.errors.serverConnectionError')
      return false
    } finally {
      loading.value = false
    }
  }

  async function createClass(className: string, classes: { value: ClassInfo[] }, currentClassId: { value: string | null }) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchJson<{ id: string; name: string; code: string }>('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className, teacher_id: user.value?.id }),
      })
      const cls: ClassInfo = {
        id: data.id || data.code,
        name: className,
        code: data.code,
        role: 'teacher',
      }
      classes.value.push(cls)
      currentClassId.value = cls.id
      return data.code
    } catch (err) {
      console.error('createClass failed:', err)
      error.value = 'Server connection error'
      return null
    } finally {
      loading.value = false
    }
  }

  function selectClass(classId: string, currentClassId: { value: string | null }) {
    currentClassId.value = classId
  }

  async function logout() {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    clearGuestState()
    user.value = null
  }

  function setSession(u: User) {
    user.value = u
    clearGuestState()
  }

  return {
    login,
    registerWithRole,
    fetchMe,
    init,
    tryRestore,
    updatePassword,
    joinClass,
    createClass,
    selectClass,
    logout,
    setSession,
  }
}
