import { fetchJson, ApiError } from '../../services/http'
import { useI18n } from '../useI18n'
import type { User, ClassInfo } from '@my-modern-app/shared-types'

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

export function useClassActions(
  user: { value: User | null },
  loading: { value: boolean },
  error: { value: string | null },
) {
  const { t } = useI18n()

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
      if (import.meta.env.DEV) console.error('createClass failed:', err)
      error.value = 'Server connection error'
      return null
    } finally {
      loading.value = false
    }
  }

  function selectClass(classId: string, currentClassId: { value: string | null }) {
    currentClassId.value = classId
  }

  return { joinClass, createClass, selectClass }
}
