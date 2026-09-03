import { type Ref } from 'vue'
import { useI18n } from './useI18n'
import { useToast } from './useToast'
import { useAdminPasswordConfirm } from './useAdminPasswordConfirm'
import { cacheService } from '@/services/core/cache.service'
import { eventBus } from '@/composables/shared/useEventBus'
import {
  deleteUser,
  updateUserRole,
  createAdminUser,
  deleteAdminClass,
  banUser as apiBanUser,
  unbanUser as apiUnbanUser,
} from '@/services/admin.service'
import type { AdminUser, AdminClassItem } from '@/services/admin.service'

export function useAdminUserActions(
  users: Ref<AdminUser[]>,
  classes: Ref<AdminClassItem[]>,
  loadAll: (force?: boolean) => Promise<void>,
) {
  const { t } = useI18n()
  const toast = useToast()
  const { adminPasswordConfirm } = useAdminPasswordConfirm()

  async function handleRemoveUser(id: number): Promise<boolean> {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx === -1) return false
    const adminPassword = await adminPasswordConfirm({ message: t('admin.confirmPasswordForAction', 'أدخل كلمة مرور الأدمن لتأكيد الحذف') })
    if (!adminPassword) return false
    const snapshot = users.value[idx]
    users.value.splice(idx, 1)
    try {
      const res = await deleteUser(id, adminPassword)
      if (!res.success) {
        users.value.splice(idx, 0, snapshot)
        toast.error(res.message || t('admin.deleteFailed', 'فشل الحذف'))
        return false
      }
      toast.success(t('admin.deleteSuccess', 'تم الحذف بنجاح'))
      return true
    } catch {
      users.value.splice(idx, 0, snapshot)
      toast.error(t('admin.deleteFailed', 'فشل الحذف'))
      return false
    }
  }

  async function handleBulkDelete(ids: number[]): Promise<number> {
    const adminPassword = await adminPasswordConfirm({ message: t('admin.confirmPasswordForAction', 'أدخل كلمة مرور الأدمن لتأكيد الحذف الجماعي') })
    if (!adminPassword) return ids.length
    const snapshots: { idx: number; user: AdminUser }[] = []
    for (const id of ids) {
      const idx = users.value.findIndex(u => u.id === id)
      if (idx !== -1) {
        snapshots.push({ idx, user: users.value[idx] })
        users.value.splice(idx, 1)
      }
    }
    let ok = 0, fail = 0
    for (const id of ids) {
      try {
        const res = await deleteUser(id, adminPassword)
        if (res.success) ok++; else fail++
      } catch { fail++ }
    }
    if (fail > 0) {
      for (const s of snapshots.reverse()) users.value.splice(s.idx, 0, s.user)
      toast.error(t('admin.bulkDeleteFailed', `فشل حذف ${fail} عنصر`))
    }
    if (ok > 0 && fail === 0) toast.success(t('admin.bulkDeleteSuccess', `تم حذف ${ok} عنصر`))
    return fail
  }

  async function handleChangeRole(id: number, role: string): Promise<boolean> {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx === -1) return false
    const adminPassword = await adminPasswordConfirm({ message: t('admin.confirmPasswordForAction', 'أدخل كلمة مرور الأدمن لتأكيد تغيير الدور') })
    if (!adminPassword) return false
    const oldRole = users.value[idx].role
    users.value[idx].role = role
    try {
      const res = await updateUserRole(id, role, adminPassword)
      if (!res.success) {
        users.value[idx].role = oldRole
        toast.error(res.message || t('admin.roleChangeFailed', 'فشل تغيير الدور'))
        return false
      }
      toast.success(t('admin.roleChanged', 'تم تغيير الدور'))
      return true
    } catch {
      users.value[idx].role = oldRole
      toast.error(t('admin.roleChangeFailed', 'فشل تغيير الدور'))
      return false
    }
  }

  async function handleBulkChangeRole(ids: number[], role: string): Promise<number> {
    const adminPassword = await adminPasswordConfirm({ message: t('admin.confirmPasswordForAction', 'أدخل كلمة مرور الأدمن لتأكيد التغيير الجماعي للدور') })
    if (!adminPassword) return ids.length
    const oldRoles: Record<number, string> = {}
    for (const id of ids) {
      const u = users.value.find(u => u.id === id)
      if (u) { oldRoles[id] = u.role; u.role = role }
    }
    let ok = 0, fail = 0
    for (const id of ids) {
      try {
        const res = await updateUserRole(id, role, adminPassword)
        if (res.success) ok++; else fail++
      } catch { fail++ }
    }
    if (fail > 0) {
      for (const id of ids) {
        const u = users.value.find(u => u.id === id)
        if (u && oldRoles[id]) u.role = oldRoles[id]
      }
      toast.error(t('admin.bulkRoleFailed', `فشل تغيير ${fail} عنصر`))
    }
    if (ok > 0 && fail === 0) toast.success(t('admin.bulkRoleSuccess', `تم تغيير ${ok} عنصر`))
    return fail
  }

  async function handleAddUser(name: string, email: string, password: string, role: string): Promise<boolean> {
    try {
      const res = await createAdminUser(name, email, password, role)
      if (!res.success) {
        toast.error(res.message || t('admin.createFailed', 'فشل الإنشاء'))
        return false
      }
      await loadAll(true)
      toast.success(t('admin.createSuccess', 'تم الإنشاء بنجاح'))
      return true
    } catch {
      toast.error(t('admin.createFailed', 'فشل الإنشاء'))
      return false
    }
  }

  async function handleRemoveClass(id: string): Promise<boolean> {
    const idx = classes.value.findIndex(c => c.id === id)
    if (idx === -1) return false
    const adminPassword = await adminPasswordConfirm({ message: t('admin.confirmPasswordForAction', 'أدخل كلمة مرور الأدمن لتأكيد حذف الفصل') })
    if (!adminPassword) return false
    const snapshot = classes.value[idx]
    classes.value.splice(idx, 1)
    try {
      const res = await deleteAdminClass(id, adminPassword)
      if (!res.success) {
        classes.value.splice(idx, 0, snapshot)
        toast.error(t('admin.classDeleteFailed', 'فشل حذف الفصل'))
        return false
      }
      toast.success(t('admin.classDeleted', 'تم حذف الفصل'))
      return true
    } catch {
      classes.value.splice(idx, 0, snapshot)
      toast.error(t('admin.classDeleteFailed', 'فشل حذف الفصل'))
      return false
    }
  }

  async function banUser(id: number, reason: string): Promise<boolean> {
    const adminPassword = await adminPasswordConfirm({ message: t('admin.confirmPasswordForAction', 'أدخل كلمة مرور الأدمن لتأكيد الحظر') })
    if (!adminPassword) return false
    const u = users.value.find(u => u.id === id)
    const prevBlocked = u?.blocked_at
    const prevReason = u?.block_reason
    if (u) { u.blocked_at = new Date().toISOString(); u.block_reason = reason }
    try {
      const res = await apiBanUser(id, reason, adminPassword)
      if (!res.success) {
        if (u) { u.blocked_at = prevBlocked; u.block_reason = prevReason }
        toast.error(t('admin.banFailed', 'فشل الحظر'))
        return false
      }
      toast.success(t('admin.banSuccess', 'تم الحظر'))
      cacheService.invalidatePattern('admin:users')
      eventBus.emit('user:banned', { userId: id })
      return true
    } catch {
      if (u) { u.blocked_at = prevBlocked; u.block_reason = prevReason }
      toast.error(t('admin.banFailed', 'فشل الحظر'))
      return false
    }
  }

  async function unbanUser(id: number): Promise<boolean> {
    const adminPassword = await adminPasswordConfirm({ message: t('admin.confirmPasswordForAction', 'أدخل كلمة مرور الأدمن لتأكيد إلغاء الحظر') })
    if (!adminPassword) return false
    const u = users.value.find(u => u.id === id)
    const prevBlocked = u?.blocked_at
    const prevReason = u?.block_reason
    if (u) { u.blocked_at = null; u.block_reason = null }
    try {
      const res = await apiUnbanUser(id, adminPassword)
      if (!res.success) {
        if (u) { u.blocked_at = prevBlocked; u.block_reason = prevReason }
        toast.error(t('admin.unbanFailed', 'فشل إلغاء الحظر'))
        return false
      }
      toast.success(t('admin.unbanSuccess', 'تم إلغاء الحظر'))
      cacheService.invalidatePattern('admin:users')
      eventBus.emit('user:unbanned', { userId: id })
      return true
    } catch {
      if (u) { u.blocked_at = prevBlocked; u.block_reason = prevReason }
      toast.error(t('admin.unbanFailed', 'فشل إلغاء الحظر'))
      return false
    }
  }

  return {
    handleRemoveUser,
    handleBulkDelete,
    handleChangeRole,
    handleBulkChangeRole,
    handleAddUser,
    handleRemoveClass,
    banUser,
    unbanUser,
  }
}
