<template>
  <div class="dash-page">
    <h2>المستخدمون</h2>
    <div class="toolbar-right">
      <button class="btn-add" @click="showAddModal = true">➕ مستخدم جديد</button>
      <button class="btn-export" @click="handleExport">📊 تصدير CSV</button>
    </div>
    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث بالاسم أو البريد..." style="max-width: 240px;" />
      <select v-model="roleFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الأدوار</option>
        <option value="admin">مشرف</option>
        <option value="teacher">معلم</option>
        <option value="student">طالب</option>
        <option value="school">مدرسة</option>
      </select>
      <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الحالات</option>
        <option value="active">نشط</option>
        <option value="blocked">محظور</option>
      </select>
      <button class="toolbar-btn" :disabled="!pagedUsers.length" @click="toggleSelectAll">
        {{ allPageSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل (الصفحة)' }}
      </button>
    </div>

    <SkeletonLoader v-if="store.loading" type="cards" :count="3" />
    <ErrorState v-else-if="store.errorMsg" :error="store.errorMsg" show-retry @retry="load" />
    <div v-if="pagedUsers.length" class="class-toolbar">
      <button class="toolbar-btn" :disabled="!activeUser" @click="viewActive">👁️ تفاصيل</button>
      <button class="toolbar-btn" :disabled="!activeUser" @click="contactTarget = { id: activeUser!.id, name: activeUser!.name, type: 'message' }">✉️ رسالة</button>
      <button class="toolbar-btn" :disabled="!activeUser" @click="contactTarget = { id: activeUser!.id, name: activeUser!.name, type: 'warning' }">⚠️ تحذير</button>
      <button class="toolbar-btn" :disabled="!activeUser" @click="openReset(activeUser!)">🔑 إعادة تعيين</button>
      <button class="toolbar-btn" :disabled="!activeUser" @click="openEdit(activeUser!)">✏️ تعديل</button>
      <button v-if="activeUser?.blocked_at" class="toolbar-btn" :disabled="!activeUser" @click="unbanTarget = { id: activeUser.id, name: activeUser.name }">✅ إلغاء الحظر</button>
      <button v-else class="toolbar-btn" :disabled="!activeUser" @click="banTarget = { id: activeUser!.id, name: activeUser!.name }">🚫 حظر</button>
      <button class="toolbar-btn toolbar-danger" :disabled="!activeUser" @click="deleteTarget = { id: activeUser!.id, name: activeUser!.name }">🗑️ حذف</button>
    </div>

    <div v-if="selectedIds.length" class="class-toolbar">
      <span class="toolbar-btn" style="cursor: default;">المحدد: {{ selectedIds.length }}</span>
      <button class="toolbar-btn" :disabled="batchLoading" @click="banSelected">🚫 حظر المحدد</button>
      <button class="toolbar-btn toolbar-danger" :disabled="batchLoading" @click="deleteSelected">🗑️ حذف المحدد</button>
      <button class="toolbar-btn" :disabled="batchLoading" @click="selectedIds = []">❌ إلغاء</button>
    </div>

    <div v-if="pagedUsers.length" class="compact-list">
      <div
        v-for="u in pagedUsers"
        :key="u.id"
        class="compact-row"
        :class="{ 'row-selected': activeUser?.id === u.id, 'class-frozen': u.blocked_at }"
        @click="selectUser(u)"
      >
        <input type="checkbox" :checked="selectedIds.includes(u.id)" @click.stop="toggleSelect(u.id)">
        <span class="cr-icon">{{ u.blocked_at ? '🚫' : roleIcon(u.role) }}</span>
        <span class="cr-name">{{ u.name }}<span v-if="u.blocked_at" class="frozen-badge">محظور</span></span>
        <span class="cr-meta">
          <span :class="['role-pill', u.role]">{{ roleLabel(u.role) }}</span>
          <span>{{ statusLabel(u.blocked_at) }}</span>
          <span v-if="u.school_name" class="school-tag">🏫 {{ u.school_name }}</span>
          <span v-else-if="u.school_id" class="school-tag">🏫 مدرسة {{ u.school_id }}</span>
          <span v-else class="no-school">—</span>
          <span class="verify-badge" :class="{ unverified: !u.email_verified_at }">{{ u.email_verified_at ? '✓ مفعّل' : '✗ غير مفعّل' }}</span>
        </span>
        <span class="cr-action" @click.stop><span class="st-email">{{ u.email }}</span></span>
      </div>
    </div>
    <Pagination v-if="filteredUsers.length" :page="currentPage" :limit="pageLimit" :total="filteredUsers.length" @change="currentPage = $event" />
    <EmptyState v-else icon="👥" title="لا يوجد مستخدمون" />

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>إضافة مستخدم جديد</h3>
        <div class="form-group"><label>الاسم</label><input v-model="newUser.name" class="form-input" /></div>
        <div class="form-group"><label>البريد</label><input v-model="newUser.email" class="form-input" /></div>
        <div class="form-group"><label>كلمة المرور</label><input v-model="newUser.password" type="password" class="form-input" /></div>
        <div class="form-group"><label>الدور</label>
          <select v-model="newUser.role" class="form-input">
            <option value="student">طالب</option>
            <option value="teacher">معلم</option>
            <option value="admin">مشرف</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-sm btn-success" :disabled="adding" @click="handleAdd">{{ adding ? '...' : 'إضافة' }}</button>
          <button class="btn-sm btn-warn" @click="showAddModal = false">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="resetTarget" class="modal-overlay" @click.self="resetTarget = null">
      <div class="modal-content">
        <h3>إعادة تعيين كلمة المرور: {{ resetTarget.name }}</h3>
        <div class="form-group"><label>كلمة المرور الجديدة</label><input v-model="resetPassword" type="password" class="form-input" /></div>
        <div class="modal-actions">
          <button class="btn-sm btn-success" :disabled="resetLoading" @click="confirmReset">{{ resetLoading ? '...' : 'حفظ' }}</button>
          <button class="btn-sm btn-warn" @click="resetTarget = null">إلغاء</button>
        </div>
      </div>
    </div>

    <AdminUserEditModal v-if="editTarget" :user="editTarget" @close="editTarget = null" @saved="editTarget = null; store.fetchUsers()" />

    <ConfirmModal :open="banTarget !== null" icon="🚫" title="تأكيد الحظر" :message="banTarget ? `حظر ${banTarget.name}؟` : ''" confirm-label="حظر" cancel-label="إلغاء" variant="danger" :loading="banLoading" @confirm="confirmBan" @cancel="banTarget = null" />
    <ConfirmModal :open="unbanTarget !== null" icon="✅" title="إلغاء الحظر" :message="unbanTarget ? `إلغاء حظر ${unbanTarget.name}؟` : ''" confirm-label="إلغاء" cancel-label="تراجع" variant="success" :loading="unbanLoading" @confirm="confirmUnban" @cancel="unbanTarget = null" />
    <AdminUserMessageModal v-if="contactTarget" :user-id="contactTarget.id" :user-name="contactTarget.name" :mode="contactTarget.type" @close="contactTarget = null" @sent="contactTarget = null" />

    <ConfirmModal
      :open="deleteTarget !== null"
      icon="🗑️"
      title="تأكيد الحذف" :message="deleteTarget ? `حذف ${deleteTarget.name} نهائياً؟` : ''" confirm-label="حذف" cancel-label="إلغاء" variant="danger" :loading="deleteLoading" @confirm="confirmDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useSelectedUser } from '@/composables/shared/useSelectedUser'
import { useSelectedSchool } from '@/composables/shared/useSelectedSchool'
import { eventBus } from '@/composables/shared/useEventBus'
import { useToast } from '@/composables/useToast'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import AdminUserMessageModal from '@/components/admin/AdminUserMessageModal.vue'
import AdminUserEditModal from '@/components/admin/AdminUserEditModal.vue'
import { exportToCSV } from '@/composables/shared/useExport'
import { useAdminPasswordConfirm } from '@/composables/useAdminPasswordConfirm'
import { createAdminUser, resetUserPassword } from '@/services/admin.service'

const store = useAdminStore()
const toast = useToast()
const { adminPasswordConfirm } = useAdminPasswordConfirm()
const { setSelectedUser } = useSelectedUser()
const { selectedSchoolId } = useSelectedSchool()

const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)
const activeUser = ref<any>(null)
const contactTarget = ref<{ id: number; name: string; type: 'message' | 'warning' } | null>(null)
const selectedIds = ref<number[]>([])
const batchLoading = ref(false)

const showAddModal = ref(false)
const adding = ref(false)
const newUser = ref({ name: '', email: '', password: '', role: 'student' })

const resetTarget = ref<{ id: number; name: string } | null>(null)
const resetPassword = ref('')
const resetLoading = ref(false)

const editTarget = ref<any>(null)

const banTarget = ref<{ id: number; name: string } | null>(null)
const banLoading = ref(false)
const unbanTarget = ref<{ id: number; name: string } | null>(null)
const unbanLoading = ref(false)
const deleteTarget = ref<{ id: number; name: string } | null>(null)
const deleteLoading = ref(false)

function selectUser(u: any) { activeUser.value = activeUser.value?.id === u.id ? null : u }
function isSelected(id: number) { return selectedIds.value.includes(id) }
function toggleSelect(id: number) {
  selectedIds.value = isSelected(id) ? selectedIds.value.filter(x => x !== id) : [...selectedIds.value, id]
}
const allPageSelected = computed(() => pagedUsers.value.length > 0 && pagedUsers.value.every((u: any) => selectedIds.value.includes(u.id)))
function toggleSelectAll() {
  const pageIds = pagedUsers.value.map((u: any) => u.id)
  selectedIds.value = allPageSelected.value ? selectedIds.value.filter(id => !pageIds.includes(id)) : [...new Set([...selectedIds.value, ...pageIds])]
}
async function banSelected() {
  if (!selectedIds.value.length) return
  batchLoading.value = true
  try {
    await Promise.all(selectedIds.value.map(id => store.banUser(id, 'حظر جماعي من لوحة التحكم')))
    await store.fetchUsers()
    toast.success('تم حظر المستخدمين المحددين')
    selectedIds.value = []
  } catch (e: any) { toast.error(e?.message || 'فشل الحظر الجماعي') }
  finally { batchLoading.value = false }
}
async function deleteSelected() {
  if (!selectedIds.value.length) return
  batchLoading.value = true
  try {
    await Promise.all(selectedIds.value.map(id => store.handleRemoveUser(id)))
    await store.fetchUsers()
    toast.success('تم حذف المستخدمين المحددين')
    selectedIds.value = []
  } catch (e: any) { toast.error(e?.message || 'فشل الحذف الجماعي') }
  finally { batchLoading.value = false }
}
function viewActive() { if (activeUser.value) { setSelectedUser(activeUser.value.id); eventBus.emit('admin:switch-tab', { tabId: 'user-detail' }) } }

function openReset(u: any) { resetTarget.value = { id: u.id, name: u.name }; resetPassword.value = '' }
function openEdit(u: any) { editTarget.value = u }

const filteredUsers = computed(() => {
  let result = store.users ?? []
  if (selectedSchoolId.value) result = result.filter((u: any) => u.school_id === selectedSchoolId.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((u: any) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  }
  if (roleFilter.value) result = result.filter((u: any) => u.role === roleFilter.value)
  if (statusFilter.value === 'active') result = result.filter((u: any) => !u.blocked_at)
  if (statusFilter.value === 'blocked') result = result.filter((u: any) => u.blocked_at)
  return result
})

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredUsers.value.slice(start, start + pageLimit.value)
})

watch([search, roleFilter, statusFilter], () => { currentPage.value = 1 })

function roleLabel(role: string) { return { admin: 'مشرف', teacher: 'معلم', student: 'طالب', school: 'مدرسة' }[role] || role }
function roleIcon(role: string) { return { admin: '👤', teacher: '👨‍🏫', student: '👨‍🎓', school: '🏫' }[role] || '👤' }
function statusLabel(blocked: any) { return blocked ? 'محظور' : 'نشط' }

async function handleAdd() {
  const { name, email, password, role } = newUser.value
  if (!name.trim() || !email.trim() || !password) return
  adding.value = true
  try {
    await createAdminUser(name.trim(), email.trim(), password, role)
    await store.fetchUsers()
    toast.success('تمت الإضافة')
    showAddModal.value = false
    newUser.value = { name: '', email: '', password: '', role: 'student' }
  } catch (e: any) { toast.error(e?.message || 'فشل الإضافة') }
  finally { adding.value = false }
}

async function confirmReset() {
  if (!resetTarget.value || !resetPassword.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد إعادة التعيين' })
  if (!adminPassword) return
  resetLoading.value = true
  try {
    await resetUserPassword(resetTarget.value.id, resetPassword.value, adminPassword)
    toast.success('تم إعادة التعيين')
    resetTarget.value = null
    resetPassword.value = ''
  } catch (e: any) { toast.error(e?.message || 'فشل إعادة التعيين') }
  finally { resetLoading.value = false }
}

async function confirmBan() {
  if (!banTarget.value) return
  banLoading.value = true
  try {
    await store.banUser(banTarget.value.id, 'حظر من لوحة التحكم')
    await store.fetchUsers()
    toast.success('تم الحظر')
    banTarget.value = null
    activeUser.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل الحظر') }
  finally { banLoading.value = false }
}

async function confirmUnban() {
  if (!unbanTarget.value) return
  unbanLoading.value = true
  try {
    await store.unbanUser(unbanTarget.value.id)
    await store.fetchUsers()
    toast.success('تم إلغاء الحظر')
    unbanTarget.value = null
    activeUser.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل إلغاء الحظر') }
  finally { unbanLoading.value = false }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    await store.handleRemoveUser(deleteTarget.value.id)
    await store.fetchUsers()
    toast.success('تم الحذف')
    deleteTarget.value = null
    activeUser.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل الحذف') }
  finally { deleteLoading.value = false }
}

function handleExport() {
  exportToCSV(filteredUsers.value.map((u: any) => ({
    id: u.id, name: u.name, email: u.email, role: roleLabel(u.role),
    status: statusLabel(u.blocked_at), school: u.school_name || '—',
    verified: u.email_verified_at ? 'نعم' : 'لا',
  })), 'admin-users')
}

async function load() { await store.fetchUsers() }
onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
.class-toolbar { flex-wrap: wrap; gap: 6px; row-gap: 8px; }
.class-toolbar .toolbar-btn { padding: 7px 10px; font-size: 12px; white-space: nowrap; }
.role-pill { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.role-pill.admin { background: #450a0a; color: #fca5a5; }
.role-pill.teacher { background: #172554; color: #93c5fd; }
.role-pill.student { background: #064e3b; color: #86efac; }
.role-pill.school { background: #2e1065; color: #c4b5fd; }
.st-email { font-size: 11px; color: var(--text-muted); }
.frozen-badge { background: #ef4444; color: #fff; padding: 1px 6px; border-radius: 6px; font-size: 10px; margin-inline-start: 6px; }
.school-tag { background: #1e3a8a; color: #bfdbfe; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
.no-school { color: var(--text-muted); font-size: 11px; }
.verify-badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #064e3b; color: #86efac; }
.verify-badge.unverified { background: #451a03; color: #fcd34d; }
.compact-row { flex-wrap: wrap; }
</style>
