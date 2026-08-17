import { fetchJson, ApiError, setTokens, clearTokens } from '../../services/http'
import { useI18n } from '../useI18n'
import { useClassActions } from './useClassActions'
import type { User, School } from '@my-modern-app/shared-types'

export function useAuthActions(
  user: { value: User | null },
  loading: { value: boolean },
  error: { value: string | null },
  clearGuestState: () => void,
  setSchoolSession?: (s: School | null) => void,
) {
  const { t } = useI18n()
  const classActions = useClassActions(user, loading, error)
  function extractStatusCode(err: unknown): number | null {
    if (err instanceof ApiError) return err.status;
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
      const data = await fetchJson<{ success: boolean; user?: User; school?: School; accessToken?: string; refreshToken?: string }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      clearGuestState()
      if (data.accessToken || data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken)
      }
      if (data.school) {
        if (setSchoolSession) setSchoolSession(data.school)
        return { ok: true as const, school: data.school }
      }
      if (data.user) {
        if (setSchoolSession) setSchoolSession(null)
        user.value = data.user
        return true
      }
      return false
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

  async function registerWithRole(email: string, password: string, name: string, roleVal: 'teacher' | 'student', schoolCode?: string) {
    loading.value = true
    error.value = null
    try {
      const body: Record<string, string> = { email, password, name, role: roleVal }
      if (schoolCode) body.school_code = schoolCode
      const data = await fetchJson<{ success: boolean; user?: User }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!data.success || !data.user) {
        error.value = t('auth.errors.registerFailed')
        return { ok: false as const }
      }
      clearGuestState()
      return { ok: true as const }
    } catch (err) {
      const status = extractStatusCode(err)
      if (status === 409) error.value = t('auth.errors.emailAlreadyUsed')
      else if (status === 400) error.value = t('auth.errors.invalidRegistrationData')
      else if (isNetworkError(err)) error.value = t('auth.errors.cannotConnectToServer')
      else error.value = t('auth.errors.registerFailed')
      return { ok: false as const }
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const data = await fetchJson<{ success: boolean; user: User }>('/api/auth/me');
      if (data.success && data.user) {
        if (setSchoolSession) setSchoolSession(null)
        user.value = data.user;
      }
    } catch (err) {
      if (!isNetworkError(err)) {
        logout()
      }
    }
  }

  async function init() {
    try {
      const data = await fetchJson<{ success: boolean; user: User }>('/api/auth/me');
      if (data.success && data.user) {
        if (setSchoolSession) setSchoolSession(null)
        user.value = data.user;
      } else {
        user.value = null;
      }
    } catch {
      // auth failed (token expired and refresh failed) — clear user to force re-login
      user.value = null;
    }
  }

  async function tryRestore() {
    try {
      const data = await fetchJson<{ success: boolean; user: User }>('/api/auth/me');
      if (data.success && data.user) {
        if (setSchoolSession) setSchoolSession(null)
        user.value = data.user;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function updateProfileName(name: string) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchJson<{ success: boolean; user?: User; message?: string }>('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!data.success || !data.user) {
        return { ok: false as const, message: data.message || t('auth.errors.serverConnectionError') }
      }
      user.value = data.user
      return { ok: true as const, message: '' }
    } catch (err) {
      if (isNetworkError(err)) return { ok: false as const, message: t('auth.errors.cannotConnectToServer') }
      return { ok: false as const, message: t('auth.errors.serverConnectionError') }
    } finally {
      loading.value = false
    }
  }

  async function submitNameRequest(requestedName: string) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchJson<{ success: boolean; message?: string }>('/api/auth/name-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requested_name: requestedName }),
      })
      if (!data.success) {
        return { ok: false as const, message: data.message || t('auth.errors.serverConnectionError') }
      }
      return { ok: true as const, message: '' }
    } catch (err) {
      if (isNetworkError(err)) return { ok: false as const, message: t('auth.errors.cannotConnectToServer') }
      return { ok: false as const, message: t('auth.errors.serverConnectionError') }
    } finally {
      loading.value = false
    }
  }

  async function deleteMyAccount(password: string) {
    loading.value = true
    error.value = null
    try {
      const data = await fetchJson<{ success: boolean; message?: string }>('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!data.success) {
        return { ok: false as const, message: data.message || t('auth.errors.serverConnectionError') }
      }
      user.value = null
      return { ok: true as const, message: '' }
    } catch (err) {
      const status = extractStatusCode(err)
      if (status === 403) return { ok: false as const, message: t('account.wrongPassword') }
      if (isNetworkError(err)) return { ok: false as const, message: t('auth.errors.cannotConnectToServer') }
      return { ok: false as const, message: t('auth.errors.serverConnectionError') }
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(userId: number, newPassword: string, currentPassword?: string) {
    if (user.value?.id !== userId && user.value?.role !== 'admin') return false
    try {
      const body: Record<string, unknown> = { user_id: userId, new_password: newPassword }
      if (currentPassword) body.current_password = currentPassword
      await fetchJson('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    clearTokens()
    clearGuestState()
    user.value = null
    if (setSchoolSession) setSchoolSession(null)
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
    updateProfileName,
    submitNameRequest,
    deleteMyAccount,
    joinClass: classActions.joinClass,
    createClass: classActions.createClass,
    selectClass: classActions.selectClass,
    logout,
    setSession,
  }
}
