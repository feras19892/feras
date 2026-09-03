<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { usePreferencesStore } from '@/stores/preferences.store'
import { useToast } from '@/composables/useToast'
import { fetchJson } from '@/services/http'

const auth = useAuthStore()
const prefs = usePreferencesStore()
const toast = useToast()
const newName = ref('')
const requestedName = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const requestedEmail = ref('')
const message = ref('')
const error = ref('')
const loadingName = ref(false)
const loadingReqName = ref(false)
const loadingPass = ref(false)
const loadingEmail = ref(false)

function setMessage(text: string) { message.value = text; error.value = '' }
function setError(text: string) { error.value = text; message.value = '' }

watch(() => prefs.prefs.theme, (v) => toast.success(`السمة: ${v === 'dark' ? 'داكن' : 'فاتح'}`))
watch(() => prefs.prefs.fontSize, (v) => toast.success(`حجم الخط: ${v === 'small' ? 'صغير' : v === 'large' ? 'كبير' : 'متوسط'}`))
watch(() => prefs.prefs.autoRefresh, (v) => toast.success(`التحديث التلقائي: ${v ? 'مفعّل' : 'معطّل'}`))
watch(() => prefs.prefs.compactTables, (v) => toast.success(`الجداول المضغوطة: ${v ? 'مفعّل' : 'معطّل'}`))
watch(() => prefs.prefs.soundNotifications, (v) => toast.success(`صوت الإشعارات: ${v ? 'مفعّل' : 'معطّل'}`))
watch(() => prefs.prefs.emailNotifications, (v) => toast.success(`إشعارات البريد: ${v ? 'مفعّل' : 'معطّل'}`))
watch(() => prefs.prefs.pushNotifications, (v) => toast.success(`الإشعارات الفورية: ${v ? 'مفعّل' : 'معطّل'}`))

async function updateName() {
  if (!newName.value.trim()) { setError('أدخل الاسم الجديد'); return }
  if (loadingName.value) return
  loadingName.value = true
  try {
    const res = await fetchJson<{ success: boolean; message?: string; user?: { name: string } }>('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.value }),
    })
    if (res.success) {
      setMessage('تم تحديث الاسم')
      toast.success('تم تحديث الاسم')
      if (res.user && auth.user) auth.user.name = res.user.name
      newName.value = ''
    } else {
      setError(res.message || 'فشل تحديث الاسم')
    }
  } catch (e: any) {
    setError(e?.message || 'فشل الاتصال بالخادم')
  } finally { loadingName.value = false }
}

async function requestName() {
  if (!requestedName.value.trim()) { setError('أدخل الاسم المطلوب'); return }
  if (loadingReqName.value) return
  loadingReqName.value = true
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/auth/name-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requested_name: requestedName.value }),
    })
    if (res.success) { setMessage('تم إرسال طلب تغيير الاسم'); toast.success('تم إرسال الطلب'); requestedName.value = '' }
    else { setError(res.message || 'فشل الطلب') }
  } catch (e: any) {
    setError(e?.message || 'فشل الاتصال بالخادم')
  } finally { loadingReqName.value = false }
}

async function changePassword() {
  if (!currentPassword.value || !newPassword.value) { setError('أدخل كلمة المرور الحالية والجديدة'); return }
  if (newPassword.value.length < 8) { setError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'); return }
  if (loadingPass.value) return
  loadingPass.value = true
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: auth.user?.id, current_password: currentPassword.value, new_password: newPassword.value }),
    })
    if (res.success) {
      setMessage('تم تغيير كلمة المرور')
      toast.success('تم تغيير كلمة المرور')
      currentPassword.value = ''
      newPassword.value = ''
    } else {
      setError(res.message || 'فشل تغيير كلمة المرور')
    }
  } catch (e: any) {
    setError(e?.message || 'فشل الاتصال بالخادم')
  } finally { loadingPass.value = false }
}

async function requestEmail() {
  if (!requestedEmail.value.trim()) { setError('أدخل البريد الجديد'); return }
  if (loadingEmail.value) return
  loadingEmail.value = true
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/auth/email-change-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requested_email: requestedEmail.value }),
    })
    if (res.success) { setMessage('تم إرسال طلب تغيير البريد'); toast.success('تم إرسال الطلب'); requestedEmail.value = '' }
    else { setError(res.message || 'فشل الطلب') }
  } catch (e: any) {
    setError(e?.message || 'فشل الاتصال بالخادم')
  } finally { loadingEmail.value = false }
}
</script>

<template>
  <div class="settings-page">
    <h2>إعدادات الحساب</h2>
    <div v-if="auth.user" class="user-summary">{{ auth.user.name }} — {{ auth.user.email }}</div>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="info-grid">
      <div v-if="auth.user?.role === 'teacher' || auth.user?.role === 'admin'" class="info-card">
        <h4>تعديل الاسم مباشرة</h4>
        <div class="form-group"><label>الاسم الجديد</label><input v-model="newName" class="form-input" type="text" @keyup.enter="updateName" /></div>
        <button class="btn btn-primary" @click="updateName" :disabled="loadingName">{{ loadingName ? '...' : 'تحديث الاسم' }}</button>
      </div>

      <div class="info-card">
        <h4>طلب تغيير الاسم</h4>
        <div class="form-group"><label>الاسم المطلوب</label><input v-model="requestedName" class="form-input" type="text" @keyup.enter="requestName" /></div>
        <button class="btn btn-primary" @click="requestName" :disabled="loadingReqName">{{ loadingReqName ? '...' : 'إرسال الطلب' }}</button>
      </div>

      <div class="info-card">
        <h4>تغيير كلمة المرور</h4>
        <div class="form-group"><label>كلمة المرور الحالية</label><input v-model="currentPassword" class="form-input" type="password" /></div>
        <div class="form-group"><label>كلمة المرور الجديدة</label><input v-model="newPassword" class="form-input" type="password" @keyup.enter="changePassword" /></div>
        <button class="btn btn-primary" @click="changePassword" :disabled="loadingPass">{{ loadingPass ? '...' : 'تغيير كلمة المرور' }}</button>
      </div>

      <div class="info-card">
        <h4>طلب تغيير البريد</h4>
        <div class="form-group"><label>البريد الإلكتروني الجديد</label><input v-model="requestedEmail" class="form-input" type="email" @keyup.enter="requestEmail" /></div>
        <button class="btn btn-primary" @click="requestEmail" :disabled="loadingEmail">{{ loadingEmail ? '...' : 'إرسال الطلب' }}</button>
      </div>

      <div class="info-card">
        <h4>تفضيلات العرض</h4>
        <div class="form-group form-inline"><label>السمة</label><select v-model="prefs.prefs.theme" class="form-input form-select"><option value="dark">داكن</option><option value="light">فاتح</option></select></div>
        <div class="form-group form-inline"><label>حجم الخط</label><select v-model="prefs.prefs.fontSize" class="form-input form-select"><option value="small">صغير</option><option value="medium">متوسط</option><option value="large">كبير</option></select></div>
        <label class="form-check"><input v-model="prefs.prefs.autoRefresh" type="checkbox" /><span>تحديث تلقائي</span></label>
        <label class="form-check"><input v-model="prefs.prefs.compactTables" type="checkbox" /><span>جداول مضغوطة</span></label>
      </div>

      <div class="info-card">
        <h4>تفضيلات الإشعارات</h4>
        <label class="form-check"><input v-model="prefs.prefs.emailNotifications" type="checkbox" /><span>إشعارات البريد</span></label>
        <label class="form-check"><input v-model="prefs.prefs.pushNotifications" type="checkbox" /><span>إشعارات الفورية</span></label>
        <label class="form-check"><input v-model="prefs.prefs.soundNotifications" type="checkbox" /><span>صوت الإشعارات</span></label>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/styles/classes-page.css"></style>
<style scoped>
.settings-page { padding: 16px; color: var(--as-text); overflow-y: auto; }
.settings-page > h2 { margin: 0 0 12px; font-size: 18px; color: var(--as-text); }
.user-summary { color: var(--as-text-muted); font-size: 13px; margin-bottom: 16px; }
.alert { padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; }
.alert-success { background: rgba(34,197,94,0.12); color: var(--as-success); }
.alert-error { background: rgba(239,68,68,0.12); color: var(--as-danger); }
.form-inline { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.form-inline .form-input { width: auto; min-width: 140px; }
.form-select { padding: 8px 12px; border-radius: 10px; }
.form-check { display: flex; align-items: center; gap: 8px; margin: 10px 0; font-size: 13px; color: var(--as-text-soft); cursor: pointer; }
.form-check input { width: 16px; height: 16px; accent-color: var(--as-accent); }
.info-card { background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 12px; padding: 16px; }
.info-card h4 { margin: 0 0 12px; font-size: 15px; color: var(--as-text); }
.info-card .form-group label { color: var(--as-text-soft); }
.info-card .form-input { background: var(--as-raised); color: var(--as-text); border: 1px solid var(--as-border); }
.info-card .form-input:focus { border-color: var(--as-accent); }
.btn-primary { background: var(--as-accent); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { background: var(--as-accent-hover); }
</style>
