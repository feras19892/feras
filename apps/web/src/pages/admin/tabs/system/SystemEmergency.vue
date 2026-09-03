<template>
  <div>
    <h2 class="panel__title">🛑 وضع الطوارئ</h2>
    <p class="panel__note">إجراءات حساسة تؤثر على عمل النظام. استخدمها بحذر.</p>
    <SkeletonLoader v-if="loading" type="cards" :count="2" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <div class="charts-row">
        <div v-for="s in statusList" :key="s.key" :class="['chart-panel', 'status-card', isOn(s.key) ? 'on' : 'off']">
          <h3 class="chart-title">{{ s.label }}</h3>
          <p class="status-text">{{ isOn(s.key) ? 'مفعّل' : 'معطّل' }}</p>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">كلمة مرور الطوارئ</h3>
          <input v-model="emergencyPassword" type="password" class="input" placeholder="أدخل كلمة مرور الطوارئ" />
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">أزرار التحكم الطارئ</h3>
          <div class="control-grid">
            <button class="btn danger" :disabled="!emergencyPassword" @click="run(enableMaintenance)">تفعيل وضع الصيانة</button>
            <button class="btn" :disabled="!emergencyPassword" @click="run(disableMaintenance)">إيقاف وضع الصيانة</button>
            <button class="btn danger" :disabled="!emergencyPassword" @click="run(stopRegistration)">إيقاف التسجيل</button>
            <button class="btn" :disabled="!emergencyPassword" @click="run(resumeRegistration)">استئناف التسجيل</button>
            <button class="btn danger" :disabled="!emergencyPassword" @click="run(freezeAllClasses)">تجميد كل الفصول</button>
            <button class="btn" :disabled="!emergencyPassword" @click="run(unfreezeAllClasses)">إلغاء تجميد الفصول</button>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">تغيير كلمة مرور الطوارئ</h3>
          <input v-model="changeForm.current" type="password" class="input" placeholder="كلمة المرور الحالية" />
          <input v-model="changeForm.newPassword" type="password" class="input" placeholder="كلمة المرور الجديدة" />
          <input v-model="changeForm.confirm" type="password" class="input" placeholder="تأكيد كلمة المرور الجديدة" />
          <button class="btn" :disabled="!canChange" @click="doChange">تغيير</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { getAdminSettings } from '@/services/admin.service'
import {
  stopRegistration, resumeRegistration,
  enableMaintenance, disableMaintenance,
  freezeAllClasses, unfreezeAllClasses,
  changeEmergencyPassword,
} from '@/services/admin-emergency.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

const toast = useToast()
const loading = ref(true)
const error = ref('')
const settings = ref<Record<string, string>>({})
const emergencyPassword = ref('')
const changeForm = ref({ current: '', newPassword: '', confirm: '' })

const statusList = [
  { key: 'maintenance_mode', label: 'وضع الصيانة' },
  { key: 'stop_registration', label: 'إيقاف التسجيل' },
  { key: 'freeze_all_classes', label: 'تجميد كل الفصول' },
]

function isOn(key: string) { return settings.value[key] === 'true' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const st = await getAdminSettings()
    if (st.success) settings.value = st.settings
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function run(fn: (pwd: string) => Promise<{ success: boolean; message?: string }>) {
  if (!emergencyPassword.value) return toast.error('كلمة مرور الطوارئ مطلوبة')
  try {
    const res = await fn(emergencyPassword.value)
    if (!res.success) throw new Error(res.message || 'فشل')
    toast.success(res.message || 'تم التنفيذ')
    await load()
  } catch (e: any) {
    toast.error(e.message || 'فشل التنفيذ')
  }
}

const canChange = computed(() => changeForm.value.current && changeForm.value.newPassword && changeForm.value.newPassword === changeForm.value.confirm)

async function doChange() {
  if (!canChange.value) return toast.error('كلمات المرور غير متطابقة أو ناقصة')
  try {
    const res = await changeEmergencyPassword(changeForm.value.current, changeForm.value.newPassword)
    if (!res.success) throw new Error(res.message || 'فشل')
    toast.success(res.message || 'تم تغيير كلمة المرور')
    changeForm.value = { current: '', newPassword: '', confirm: '' }
  } catch (e: any) {
    toast.error(e.message || 'فشل تغيير كلمة المرور')
  }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.panel__note { color: #94a3b8; font-size: 0.85rem; margin: -0.5rem 0 1rem; }

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 1.2rem; }
.chart-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; }
.chart-panel.wide { grid-column: 1 / -1; }
.chart-title { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }

.status-card { text-align: center; border-top: 4px solid #ef4444; }
.status-card.on { border-top-color: #10b981; }
.status-text { font-size: 1.25rem; font-weight: 800; color: #e2e8f0; margin: 0; }

.input { width: 100%; margin-bottom: 0.6rem; padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-family: inherit; }
.control-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.btn { padding: 10px 14px; border: none; border-radius: 6px; background: #6366f1; color: #fff; cursor: pointer; font-family: inherit; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.danger { background: #ef4444; }
</style>
