import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { UserRole } from '@my-modern-app/shared-types'

export function usePermissions(role: UserRole, allowedPermissions?: string[]) {
  const auth = useAuthStore()

  const userRole = computed<UserRole | null>(() => auth.role ?? null)

  const isReady = computed<boolean>(() => {
    if (userRole.value === 'admin') return !!auth.user
    if (userRole.value === 'school') return !!auth.schoolSession && auth.schoolSession.id != null
    if (userRole.value === 'teacher' || userRole.value === 'student') {
      return !!auth.user
    }
    return !!userRole.value
  })

  const permissions = computed<string[]>(() => {
    if (allowedPermissions?.length) return allowedPermissions
    if (userRole.value) return [userRole.value]
    return []
  })

  function hasPermission(required: string): boolean {
    if (!isReady.value) return false
    if (!userRole.value) return false
    if (userRole.value !== role) return false
    if (!permissions.value.length) return true
    return permissions.value.some(p => {
      if (required === p) return true
      const prefix = p.endsWith(':') ? p : `${p}:`
      return required.startsWith(prefix) && required.length > prefix.length
    })
  }

  function hasAnyPermission(required: string[]): boolean {
    return required.some(hasPermission)
  }

  function hasAllPermissions(required: string[]): boolean {
    return required.every(hasPermission)
  }

  function getUserSchoolId(): number | null {
    if (userRole.value === 'school') return auth.schoolSession?.id ?? null
    if (auth.user?.school_id != null) return auth.user.school_id
    return null
  }

  function hasSchoolScope(resourceSchoolId?: number | null): boolean {
    if (!isReady.value) return false
    if (userRole.value === 'admin') return true
    const schoolId = getUserSchoolId()
    if (resourceSchoolId == null || resourceSchoolId === undefined) return schoolId != null
    return schoolId === resourceSchoolId
  }

  function hasClassScope(resourceClassId?: string | null): boolean {
    if (!isReady.value) return false
    if (userRole.value === 'admin') return true
    if (userRole.value === 'school') {
      const schoolId = getUserSchoolId()
      if (schoolId == null) return false
      if (resourceClassId == null || resourceClassId === undefined) return auth.classes.length > 0
      return auth.classes.some(c => c.id === resourceClassId)
    }
    if (resourceClassId == null || resourceClassId === undefined) {
      return auth.currentClassId != null || auth.classes.length > 0
    }
    if (auth.currentClassId === resourceClassId) return true
    return auth.classes.some(c => c.id === resourceClassId)
  }

  const isAllowed = computed(() => userRole.value === role && isReady.value)

  return {
    userRole,
    permissions,
    isReady,
    isAllowed,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasSchoolScope,
    hasClassScope,
  }
}
