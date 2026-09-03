<template>
  <div class="dash-page">
    <h2>إعدادات المدرسة</h2>
    <SkeletonLoader v-if="loading" type="cards" :count="2" />
    <div v-else-if="school" class="expand-content" style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
      <div class="modal-content">
        <h3>الاشتراك والإحصائيات</h3>
        <div class="form-group"><span>كود الانضمام</span>
          <div class="modal-actions">
            <input :value="school.code" readonly class="form-input" />
            <button @click="copyCode" class="btn-sm btn-primary">{{ copied ? '✓' : 'نسخ' }}</button>
          </div>
        </div>
        <div class="form-group"><span>الطلاب: <strong>{{ stats?.students ?? 0 }} / {{ school.max_students }}</strong></span></div>
        <div class="form-group"><span>المدرسون: <strong>{{ stats?.teachers ?? 0 }} / {{ school.max_teachers }}</strong></span></div>
        <div class="form-group"><span>الفصول: <strong>{{ stats?.classes ?? 0 }}</strong></span></div>
      </div>

      <div class="modal-content">
        <h3>اسم المدرسة</h3>
        <div class="form-group"><input v-model="name" class="form-input" /></div>
        <div class="modal-actions">
          <button @click="saveName" class="btn-sm btn-success" :disabled="nameSaving">{{ nameSaving ? '...' : 'حفظ' }}</button>
        </div>
      </div>

      <div class="modal-content">
        <h3>تغيير كلمة المرور</h3>
        <div class="form-group"><label>الحالية</label><input v-model="currentPassword" type="password" class="form-input" /></div>
        <div class="form-group"><label>الجديدة</label><input v-model="newPassword" type="password" class="form-input" /></div>
        <div class="modal-actions">
          <button @click="savePassword" class="btn-sm btn-warn" :disabled="passSaving">{{ passSaving ? '...' : 'تغيير' }}</button>
        </div>
      </div>

      <div class="modal-content">
        <h3>تغيير البريد الإلكتروني</h3>
        <div class="form-group"><input v-model="requestedEmail" type="email" class="form-input" placeholder="البريد الجديد" /></div>
        <div class="modal-actions">
          <button @click="requestEmail" class="btn-sm btn-primary" :disabled="emailSaving">{{ emailSaving ? '...' : 'إرسال طلب' }}</button>
        </div>
      </div>

      <div class="modal-content">
        <h3>إرسال تنبيه عام</h3>
        <div class="form-group"><label>الجهة</label>
          <select v-model="alertTarget" class="form-input">
            <option value="all">الجميع</option>
            <option value="teacher">المدرسون</option>
            <option value="student">الطلاب</option>
          </select>
        </div>
        <div class="form-group"><label>العنوان</label><input v-model="alertTitle" class="form-input" /></div>
        <div class="form-group"><label>الرسالة</label><textarea v-model="alertMessage" class="form-input" rows="3"></textarea></div>
        <div class="modal-actions">
          <button @click="sendAlert" class="btn-sm btn-success" :disabled="alertLoading">{{ alertLoading ? '...' : 'إرسال' }}</button>
        </div>
      </div>
    </div>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="err" class="alert alert-danger">{{ err }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSchoolProfile, getSchoolStats, updateSchoolName, changeSchoolPassword, requestEmailChange, sendSchoolAlert, type School, type SchoolStats } from '@/services/school.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'

const school = ref<School | null>(null)
const stats = ref<SchoolStats | null>(null)
const name = ref('')
const loading = ref(true)
const currentPassword = ref('')
const newPassword = ref('')
const requestedEmail = ref('')
const nameSaving = ref(false)
const passSaving = ref(false)
const emailSaving = ref(false)
const alertTitle = ref('')
const alertMessage = ref('')
const alertTarget = ref<'all' | 'teacher' | 'student'>('all')
const alertLoading = ref(false)
const copied = ref(false)
const message = ref('')
const err = ref('')

onMounted(async () => {
  const [profileRes, statsRes] = await Promise.all([getSchoolProfile(), getSchoolStats()])
  if (profileRes.success) { school.value = profileRes.school; name.value = profileRes.school?.name || '' }
  if (statsRes.success) stats.value = statsRes.stats
  loading.value = false
})

function setMsg(text: string, isError = false) {
  if (isError) { err.value = text; message.value = '' }
  else { message.value = text; err.value = '' }
  setTimeout(() => { message.value = ''; err.value = '' }, 4000)
}

async function saveName() {
  if (!school.value) return
  nameSaving.value = true
  try {
    const res = await updateSchoolName(name.value)
    if (res.success) { setMsg('تم تحديث الاسم'); if (res.school) school.value = res.school }
    else setMsg(res.message || 'فشل', true)
  } catch (e: any) { setMsg(e?.message || 'فشل', true) }
  finally { nameSaving.value = false }
}

async function savePassword() {
  passSaving.value = true
  try {
    const res = await changeSchoolPassword(currentPassword.value, newPassword.value)
    if (res.success) { setMsg('تم تغيير كلمة المرور'); currentPassword.value = ''; newPassword.value = '' }
    else setMsg(res.message || 'فشل', true)
  } catch (e: any) { setMsg(e?.message || 'فشل', true) }
  finally { passSaving.value = false }
}

async function requestEmail() {
  emailSaving.value = true
  try {
    const res = await requestEmailChange(requestedEmail.value)
    if (res.success) { setMsg('تم إرسال طلب تغيير البريد'); requestedEmail.value = '' }
    else setMsg(res.message || 'فشل', true)
  } catch (e: any) { setMsg(e?.message || 'فشل', true) }
  finally { emailSaving.value = false }
}

async function copyCode() {
  if (!school.value?.code) return
  try {
    if (navigator.clipboard) await navigator.clipboard.writeText(school.value.code)
    else {
      const ta = document.createElement('textarea'); ta.value = school.value.code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    copied.value = true; setTimeout(() => copied.value = false, 2000)
  } catch { setMsg('فشل النسخ', true) }
}

async function sendAlert() {
  if (!alertMessage.value) return
  alertLoading.value = true
  try {
    const res = await sendSchoolAlert(alertTitle.value, alertMessage.value, alertTarget.value)
    if (res.success) { setMsg('تم إرسال التنبيه'); alertTitle.value = ''; alertMessage.value = '' }
    else setMsg(res.message || 'فشل', true)
  } catch (e: any) { setMsg(e?.message || 'فشل', true) }
  finally { alertLoading.value = false }
}
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.alert { padding: 12px; border-radius: 8px; margin-top: 16px; }
.alert-success { background: var(--success-bg); color: var(--success-text); }
.alert-danger { background: var(--danger-bg); color: var(--danger-text); }
</style>
