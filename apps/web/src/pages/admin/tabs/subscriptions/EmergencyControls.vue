<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AlertTriangle, Power, Users, MessageSquare, FlaskConical, GraduationCap, CreditCard } from 'lucide-vue-next'
import { getSystemSettings, updateSystemSetting } from '@/services/core/settings.api'

interface Control {
  key: string
  label: string
  icon: any
  activeValue: string
  danger?: boolean
}

const controls: Control[] = [
  { key: 'stop_registration', label: 'إيقاف التسجيل', icon: Users, activeValue: 'true', danger: true },
  { key: 'maintenance_mode', label: 'وضع الصيانة', icon: AlertTriangle, activeValue: 'true', danger: true },
  { key: 'freeze_all_classes', label: 'تجميد الفصول', icon: GraduationCap, activeValue: 'true', danger: true },
  { key: 'registration_enabled', label: 'التسجيل مفعل', icon: Users, activeValue: 'true' },
  { key: 'chat_enabled', label: 'المحادثات', icon: MessageSquare, activeValue: 'true' },
  { key: 'experiment_physics_enabled', label: 'تجارب الفيزياء', icon: FlaskConical, activeValue: 'true' },
  { key: 'experiment_chemistry_enabled', label: 'تجارب الكيمياء', icon: FlaskConical, activeValue: 'true' },
  { key: 'experiment_biology_enabled', label: 'تجارب الأحياء', icon: FlaskConical, activeValue: 'true' },
  { key: 'experiment_math_enabled', label: 'تجارب الرياضيات', icon: FlaskConical, activeValue: 'true' },
  { key: 'maintenance_subscriptions', label: 'إيقاف المدفوعات', icon: CreditCard, activeValue: 'true', danger: true },
]

const settings = ref<Record<string, string | boolean | number>>({})
const loading = ref(false)
const saving = ref<Record<string, boolean>>({})
const message = ref<string | null>(null)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await getSystemSettings()
    if (res.success) settings.value = res.data
  } catch (e: any) {
    error.value = e?.message || 'فشل التحميل'
  } finally {
    loading.value = false
  }
}

function isActive(key: string) {
  const v = settings.value[key]
  return v === true || v === 'true'
}

async function toggle(control: Control) {
  saving.value[control.key] = true
  error.value = null
  message.value = null
  const current = isActive(control.key)
  const next = current ? 'false' : 'true'
  try {
    await updateSystemSetting(control.key, next)
    settings.value[control.key] = next === 'true'
    message.value = `تم ${current ? 'إيقاف' : 'تفعيل'} ${control.label}`
  } catch (e: any) {
    error.value = e?.message || 'فشل التحديث'
  } finally {
    saving.value[control.key] = false
  }
}

onMounted(load)
</script>

<template>
  <div class="emergency-controls">
    <div class="header">
      <AlertTriangle :size="20" />
      <span>لوحة التحكم الطارئ</span>
    </div>
    <div v-if="loading" class="state">جاري التحميل...</div>
    <div v-else class="grid">
      <div
        v-for="c in controls"
        :key="c.key"
        class="control-card"
        :class="{ active: isActive(c.key), danger: c.danger }"
      >
        <div class="control-icon">
          <component :is="c.icon" :size="22" />
        </div>
        <div class="control-label">{{ c.label }}</div>
        <div class="control-status">{{ isActive(c.key) ? 'مفعّل' : 'متوقف' }}</div>
        <button
          class="toggle-btn"
          :class="{ active: isActive(c.key), danger: c.danger }"
          :disabled="saving[c.key]"
          @click="toggle(c)"
        >
          <Power :size="16" />
          {{ isActive(c.key) ? 'إيقاف' : 'تفعيل' }}
        </button>
      </div>
    </div>
    <div v-if="message" class="success">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style scoped>
.emergency-controls { color: #e2e8f0; }
.header { display: flex; align-items: center; gap: 0.5rem; color: #facc15; font-weight: 700; margin-bottom: 1rem; }
.state { text-align: center; padding: 2rem; color: #94a3b8; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
.control-card { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; padding: 1rem; text-align: center; }
.control-card.active { border-color: #34d399; }
.control-card.danger.active { border-color: #f87171; }
.control-icon { color: #94a3b8; margin-bottom: 0.5rem; }
.control-label { font-weight: 600; margin-bottom: 0.25rem; }
.control-status { font-size: 0.8rem; color: #64748b; margin-bottom: 0.75rem; }
.toggle-btn { display: inline-flex; align-items: center; gap: 0.25rem; border: none; border-radius: 0.5rem; padding: 0.5rem 0.75rem; cursor: pointer; font-weight: 600; color: #0f172a; background: #34d399; }
.toggle-btn.active { background: #f87171; color: #fff; }
.toggle-btn.danger { background: #f87171; color: #fff; }
.toggle-btn.danger:not(.active) { background: #34d399; color: #0f172a; }
.toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.success { color: #34d399; margin-top: 1rem; }
.error { color: #f87171; margin-top: 1rem; }
</style>
