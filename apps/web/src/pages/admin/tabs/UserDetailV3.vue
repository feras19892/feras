<template>
  <div class="dash-page role-admin">
    <button class="link-btn" @click="goBack">← {{ t('dashboard.dashNew.back') }}</button>
    <SkeletonLoader v-if="loading" type="cards" :count="3" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="retryLoad" />
    <template v-else-if="profile?.user">
      <section class="dash-welcome">
        <div class="dash-welcome__text">
          <h1 class="dash-welcome__title">{{ profile.user.name }}</h1>
          <p class="dash-welcome__subtitle">{{ profile.user.email }}</p>
          <p class="dash-welcome__subtitle">
            <span class="badge" :class="profile.user.blocked_at ? 'badge-danger' : 'badge-success'">{{ profile.user.blocked_at ? t('dashboard.dashNew.blocked') : t('dashboard.dashNew.active') }}</span>
            <span class="badge badge-info" style="margin-inline-start:6px">{{ roleLabel(profile.user.role) }}</span>
          </p>
        </div>
      </section>

      <AdminUserActionBar
        :role="profile.user.role"
        :blocked="!!profile.user.blocked_at"
        :school-id="profile.user.school_id"
        @reports="goToTab('reports')"
        @classes="goToTab('classes')"
        @school="goToSchool()"
        @edit="showEditModal = true"
        @message="openMessage('message')"
        @warn="openMessage('warning')"
        @reset="showResetModal = true"
        @ban="showBanModal = true"
        @unban="openUnbanConfirm"
        @impersonate="openImpersonate()"
      />

      <AdminUserStats :profile="profile" @classes="goToTab('classes')" @reports="goToTab('reports')" />

      <section class="lists-grid">
        <div class="list-card">
          <div class="list-header"><h3>معلومات أساسية</h3></div>
          <div class="list-row"><span>الرقم</span><strong>{{ profile.user.id }}</strong></div>
          <div class="list-row"><span>البريد</span><strong>{{ profile.user.email }}</strong></div>
          <div class="list-row"><span>الدور</span><strong>{{ roleLabel(profile.user.role) }}</strong></div>
          <div v-if="profile.user.school" class="list-row clickable" @click="goToSchool()"><span>المدرسة</span><strong>🏫 {{ profile.user.school.name }}</strong></div>
          <div v-else-if="profile.user.school_id" class="list-row"><span>المدرسة</span><strong>#{{ profile.user.school_id }}</strong></div>
          <div class="list-row"><span>التسجيل</span><strong>{{ formatDate(profile.user.created_at) }}</strong></div>
          <div class="list-row"><span>تأكيد البريد</span><strong>{{ formatDate(profile.user.email_verified_at) }}</strong></div>
          <div v-if="profile.lastLogin" class="list-row"><span>آخر دخول</span><strong>{{ formatDate(profile.lastLogin) }}</strong></div>
          <div v-if="profile.user.blocked_at" class="list-row"><span>محظور منذ</span><strong class="text-danger">{{ formatDate(profile.user.blocked_at) }}</strong></div>
          <div v-if="profile.user.block_reason" class="list-row"><span>السبب</span><strong class="text-danger">{{ profile.user.block_reason }}</strong></div>
        </div>

        <div class="list-card">
          <div class="list-header"><h3>الفصول ({{ profile.classes?.length ?? 0 }})</h3></div>
          <div v-if="profile.classes?.length" class="compact-list">
            <div v-for="c in profile.classes" :key="c.id" class="compact-row clickable" @click="goToClass(c)"><span class="cr-icon">🏫</span><span class="cr-name">{{ c.name }}</span><span class="cr-meta"><span>{{ c.student_count }} طالب</span></span></div>
          </div>
          <p v-else class="list-empty">لا توجد فصول</p>
        </div>

        <div class="list-card">
          <div class="list-header"><h3>التقارير ({{ profile.reports?.length ?? 0 }})</h3></div>
          <div v-if="profile.reports?.length" class="compact-list">
            <div v-for="r in profile.reports" :key="r.id" class="compact-row clickable" @click="goToTab('reports')"><span class="cr-icon">📄</span><span class="cr-name">{{ r.experiment_name }}</span><span class="cr-meta"><span :class="['status-pill', r.status]">{{ r.status }}</span><span v-if="r.grade">{{ r.grade }}</span><span>{{ formatDate(r.submitted_at) }}</span></span></div>
          </div>
          <p v-else class="list-empty">لا توجد تقارير</p>
        </div>

        <div class="list-card">
          <div class="list-header"><h3>التحذيرات ({{ profile.warnings?.length ?? 0 }})</h3></div>
          <div v-if="profile.warnings?.length" class="compact-list">
            <div v-for="w in profile.warnings" :key="w.id" class="compact-row"><span class="cr-icon">⚠️</span><span class="cr-name" :class="w.severity">{{ w.title }}</span><span class="cr-meta"><span class="badge" :class="'badge-' + (w.severity === 'critical' ? 'danger' : w.severity === 'high' ? 'warning' : 'info')">{{ w.severity }}</span><span>{{ w.is_read ? '✓' : '●' }}</span></span></div>
          </div>
          <p v-else class="list-empty">لا توجد تحذيرات</p>
        </div>

        <div class="list-card">
          <div class="list-header"><h3>الملاحظات</h3></div>
          <div v-if="profile.notes?.length" class="compact-list">
            <div v-for="n in profile.notes" :key="n.id" class="compact-row"><span class="cr-icon">📝</span><span class="cr-name">{{ n.admin_name }}</span><span class="cr-meta"><span>{{ n.note }}</span><span>{{ formatDate(n.created_at) }}</span></span></div>
          </div>
          <p v-else class="list-empty">لا توجد ملاحظات</p>
          <div class="note-input"><input v-model="newNote" :placeholder="t('dashboard.dashNew.addNotePlaceholder')" @keyup.enter="onAddNote" /><button class="btn-sm btn-primary" :disabled="noteLoading" @click="onAddNote">+</button></div>
        </div>

        <div class="list-card">
          <div class="list-header"><h3>الجلسات النشطة ({{ profile.sessions?.length ?? 0 }})</h3></div>
          <div v-if="profile.sessions?.length" class="compact-list">
            <div v-for="s in profile.sessions" :key="s.id" class="compact-row"><span class="cr-icon">🌐</span><span class="cr-name">{{ formatDate(s.login_at) }}</span><span class="cr-meta"><span>{{ s.ip_address || '—' }}</span></span></div>
          </div>
          <p v-else class="list-empty">لا توجد جلسات نشطة</p>
        </div>
      </section>

      <section class="list-card" style="margin-top: var(--spacing-lg);">
        <div class="list-header"><h3>الاشتراك</h3></div>
        <div v-if="profile?.subscription" class="list-row"><span>الحالة</span><strong>{{ profile.subscription.status }}</strong></div>
        <div v-if="profile?.subscription" class="list-row"><span>الخطة</span><strong>{{ profile.subscription.plan_name }}</strong></div>
        <div v-if="profile?.subscription" class="list-row"><span>يبدأ</span><strong>{{ formatDate(profile.subscription.starts_at) }}</strong></div>
        <div v-if="profile?.subscription" class="list-row"><span>ينتهي</span><strong>{{ formatDate(profile.subscription.expires_at) }}</strong></div>
        <div v-else class="list-empty">لا يوجد اشتراك نشط</div>
        <div class="sub-actions">
          <div class="extend-row">
            <input v-model.number="extendDays" type="number" min="1" class="form-input" style="width:80px" />
            <button class="btn-sm btn-primary" :disabled="extendLoading" @click="handleExtend">{{ extendLoading ? '...' : 'تمديد' }}</button>
          </div>
          <select v-model="newStatus" class="form-input" style="min-width:120px">
            <option value="">تغيير الحالة</option>
            <option value="TRIAL">TRIAL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
          <button class="btn-sm btn-primary" :disabled="!newStatus" @click="handleChangeStatus">حفظ</button>
        </div>
      </section>

      <section class="list-card" style="margin-top: var(--spacing-lg);">
        <div class="list-header"><h3>الإشعارات ({{ profile?.notifications?.length ?? 0 }})</h3></div>
        <div v-if="profile?.notifications?.length" class="compact-list">
          <div v-for="n in profile.notifications" :key="n.id" class="compact-row">
            <span class="cr-icon">🔔</span>
            <span class="cr-name">{{ n.title }}</span>
            <span class="cr-meta"><span>{{ n.is_read ? '✓ مقروء' : '● غير مقروء' }}</span><span>{{ formatDate(n.created_at) }}</span></span>
          </div>
        </div>
        <p v-else class="list-empty">لا توجد إشعارات</p>
      </section>

      <section class="list-card" style="margin-top: var(--spacing-lg);">
        <div class="list-header"><h3>التنبيهات المجدولة ({{ profile?.notificationQueue?.length ?? 0 }})</h3></div>
        <div v-if="profile?.notificationQueue?.length" class="compact-list">
          <div v-for="q in profile.notificationQueue" :key="q.id" class="compact-row">
            <span class="cr-icon">⏰</span>
            <span class="cr-name">{{ q.title }}</span>
            <span class="cr-meta"><span :class="['status-pill', q.status]">{{ q.status }}</span><span>{{ formatDate(q.scheduled_at) }}</span></span>
          </div>
        </div>
      </section>
      <section class="list-card" style="margin-top: var(--spacing-lg);">
        <div class="list-header"><h3>النشاط الأخير</h3></div>
        <div v-if="profile.activity?.length" class="compact-list">
          <div v-for="a in profile.activity" :key="a.created_at" class="compact-row"><span class="cr-icon">🔄</span><span class="cr-name">{{ a.action }}</span><span class="cr-meta"><span v-if="a.details">{{ a.details }}</span><span>{{ formatDate(a.created_at) }}</span></span></div>
        </div>
        <p v-else class="list-empty">لا يوجد نشاط</p>
      </section>
  </template>

    <div v-if="showBanModal" class="modal-overlay" @click.self="showBanModal = false"><div class="modal-content"><h3>{{ t('dashboard.dashNew.banUserTitle') }}</h3><div class="form-group"><input v-model="banReason" :placeholder="t('dashboard.dashNew.banReason')" class="form-input" /></div><div class="modal-actions"><button class="btn-sm btn-danger" :disabled="banLoading" @click="handleBan">{{ banLoading ? '...' : t('dashboard.dashNew.ban') }}</button><button class="btn-sm btn-warn" @click="showBanModal = false">{{ t('dashboard.dashNew.cancel') }}</button></div></div></div>
    <div v-if="showImpersonateModal" class="modal-overlay" @click.self="showImpersonateModal = false"><div class="modal-content"><h3>{{ t('dashboard.dashNew.impersonateTitle') }}</h3><p style="color:var(--warning-text); margin-bottom:16px;">{{ t('dashboard.dashNew.impersonateWarning', { name: profile?.user?.name ?? '' }) }}</p><div class="form-group"><input v-model="impersonatePassword" type="password" :placeholder="t('dashboard.dashNew.impersonatePassword')" class="form-input" /></div><div class="modal-actions"><button class="btn-sm btn-primary" :disabled="impersonateLoading" @click="handleImpersonate">{{ impersonateLoading ? '...' : t('dashboard.dashNew.continue') }}</button><button class="btn-sm btn-warn" @click="showImpersonateModal = false">{{ t('dashboard.dashNew.cancel') }}</button></div></div></div>
    <AdminUserEditModal v-if="showEditModal && profile" :user="{ id: profile.user.id, name: profile.user.name, email: profile.user.email, role: profile.user.role }" @close="showEditModal = false" @saved="onEditSaved" />
    <ConfirmModal :open="showUnbanConfirm" icon="✅" title="تأكيد فك الحظر" :message="profile?.user?.name ? `فك حظر ${profile.user.name}؟` : ''" confirm-label="فك الحظر" cancel-label="إلغاء" variant="success" :loading="unbanLoading" @confirm="confirmUnban" @cancel="showUnbanConfirm = false" />
    <AdminUserMessageModal v-if="messageTarget && profile" :user-id="profile.user.id" :user-name="profile.user.name" :mode="messageMode" @close="messageTarget = false" @sent="load(profile.user.id)" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale } = useI18n();
import { ref, onMounted } from 'vue'

import { useI18nStore } from '@/stores/i18n.store'
import { eventBus } from '@/composables/shared/useEventBus'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import { useToast } from '@/composables/useToast'
import { useAdminPasswordConfirm } from '@/composables/useAdminPasswordConfirm'
import { useAdminUserDetail } from '@/composables/admin/useAdminUserDetail'
import { setTokens } from '@/services/http'
import { resetUserPassword, impersonateUser, extendAdminUserTrial, changeAdminUserSubscription } from '@/services/admin.service'
import { useSelectedUser } from '@/composables/shared/useSelectedUser'
import { useSelectedClass } from '@/composables/shared/useSelectedClass'
import { useSelectedSchool } from '@/composables/shared/useSelectedSchool'
import AdminUserActionBar from '@/components/admin/AdminUserActionBar.vue'
import AdminUserStats from '@/components/admin/AdminUserStats.vue'
import AdminUserEditModal from '@/components/admin/AdminUserEditModal.vue'
import AdminUserMessageModal from '@/components/admin/AdminUserMessageModal.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'





const i18nStore = useI18nStore()
const toast = useToast()
const { adminPasswordConfirm } = useAdminPasswordConfirm()
const { selectedUserId, clearSelectedUser } = useSelectedUser()
const { setSelectedClass } = useSelectedClass()
const { setSelectedSchool } = useSelectedSchool()
const { profile, loading, error, load, ban, unban, addNote } = useAdminUserDetail()

const showResetModal = ref(false)
const showBanModal = ref(false)
const showImpersonateModal = ref(false)
const showEditModal = ref(false)
const messageTarget = ref(false)
const messageMode = ref<'message' | 'warning'>('message')
const resetPassword = ref('')
const resetLoading = ref(false)
const banReason = ref('')
const banLoading = ref(false)
const impersonatePassword = ref('')
const impersonateLoading = ref(false)
const newNote = ref('')
const noteLoading = ref(false)
const showUnbanConfirm = ref(false)
const unbanLoading = ref(false)
const extendDays = ref(7)
const extendLoading = ref(false)
const newStatus = ref('')

onMounted(() => { if (selectedUserId.value) load(selectedUserId.value) })

function goBack() { clearSelectedUser(); eventBus.emit('admin:switch-tab', { tabId: 'users' }) }
function retryLoad() { if (selectedUserId.value) load(selectedUserId.value) }
function goToTab(tabId: string) { eventBus.emit('admin:switch-tab', { tabId }) }
function goToClass(c: { id: number | string; code?: string }) { if (c.code) setSelectedClass(c.code); eventBus.emit('admin:switch-tab', { tabId: 'class-detail' }) }
function goToSchool() { if (profile.value?.user.school?.id) setSelectedSchool(profile.value.user.school.id); else if (profile.value?.user.school_id) setSelectedSchool(profile.value.user.school_id); eventBus.emit('admin:switch-tab', { tabId: 'school-detail' }) }
function openMessage(mode: 'message' | 'warning') { messageMode.value = mode; messageTarget.value = true }

function roleLabel(role: string) {
  const labels: Record<string, string> = { admin: t('dashboard.dashNew.adminRole'), teacher: t('dashboard.dashNew.teacherRole'), student: t('dashboard.dashNew.studentRole'), school: t('dashboard.dashNew.schoolRole') }
  return labels[role] || role
}

function formatDate(d: string | null | undefined) { return d ? new Date(d).toLocaleDateString(i18nStore.locale) : '—' }

async function handleReset() {
  if (!resetPassword.value || !selectedUserId.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد إعادة التعيين' })
  if (!adminPassword) return
  resetLoading.value = true
  try {
    await resetUserPassword(selectedUserId.value, resetPassword.value, adminPassword)
    toast.success(t('dashboard.dashNew.passwordResetSuccess'))
    showResetModal.value = false; resetPassword.value = ''
  } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.passwordResetFailed')) }
  finally { resetLoading.value = false }
}

async function handleBan() {
  if (!banReason.value.trim() || !selectedUserId.value) return
  banLoading.value = true
  try {
    await ban(selectedUserId.value, banReason.value.trim())
    toast.success(t('dashboard.dashNew.blockedSuccessfully'))
    showBanModal.value = false; banReason.value = ''
  } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.banFailed')) }
  finally { banLoading.value = false }
}

function openUnbanConfirm() { showUnbanConfirm.value = true }

async function confirmUnban() {
  if (!selectedUserId.value) return
  unbanLoading.value = true
  try {
    await unban(selectedUserId.value)
    toast.success(t('dashboard.dashNew.unblockedSuccessfully'))
    showUnbanConfirm.value = false
  } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.unbanFailed')) }
  finally { unbanLoading.value = false }
}

async function handleImpersonate() {
  if (!impersonatePassword.value || !selectedUserId.value) return
  impersonateLoading.value = true
  try {
    const res = await impersonateUser(selectedUserId.value, impersonatePassword.value)
    if (res.success && res.token) { setTokens(res.token, res.refreshToken); localStorage.setItem('auth_user', JSON.stringify(res.user)); localStorage.removeItem('school_session'); showImpersonateModal.value = false; window.location.href = `/#/${res.user.role}` }
    else toast.error(t('dashboard.dashNew.adminCheckFailed'))
  } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.checkFailed')) }
  finally { impersonateLoading.value = false }
}

function openImpersonate() {
  if (profile.value?.user?.role === 'admin') { toast.error(t('dashboard.dashNew.noImpersonateAdmin')); return }
  impersonatePassword.value = ''; showImpersonateModal.value = true
}

async function onAddNote() {
  if (!newNote.value.trim() || noteLoading.value || !selectedUserId.value) return
  noteLoading.value = true
  try {
    await addNote(selectedUserId.value, newNote.value)
    toast.success(t('dashboard.dashNew.noteAdded')); newNote.value = ''
  } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.noteAddFailed')) }
  finally { noteLoading.value = false }
}

function onEditSaved() { if (selectedUserId.value) load(selectedUserId.value) }

async function handleExtend() {
  if (!selectedUserId.value || !extendDays.value) return
  extendLoading.value = true
  try {
    await extendAdminUserTrial(selectedUserId.value, extendDays.value)
    toast.success(`تم التمديد ${extendDays.value} أيام`)
    if (selectedUserId.value) load(selectedUserId.value)
  } catch (e: any) { toast.error(e?.message || 'فشل التمديد') }
  finally { extendLoading.value = false }
}

async function handleChangeStatus() {
  if (!selectedUserId.value || !newStatus.value) return
  try {
    await changeAdminUserSubscription(selectedUserId.value, { status: newStatus.value })
    toast.success('تم تغيير الحالة')
    if (selectedUserId.value) load(selectedUserId.value)
  } catch (e: any) { toast.error(e?.message || 'فشل التغيير') }
}
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.text-danger { color: var(--danger-text); }
.clickable { cursor: pointer; }
.note-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border-light); }
.note-input input { flex: 1; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); }
.sub-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border-light); flex-wrap: wrap; align-items: center; }
.extend-row { display: flex; gap: 8px; align-items: center; }
</style>
