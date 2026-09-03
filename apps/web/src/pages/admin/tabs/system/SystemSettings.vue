<template>
  <div>
    <h2 class="panel__title">{{ t('common.systemSettingsTitle') }}</h2>
    <SkeletonLoader v-if="loading" type="cards" :count="2" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <div class="charts-row">
        <div class="chart-panel wide">
          <h3 class="chart-title">{{ t('common.featureSettings') }}</h3>
          <div v-for="s in settingList" :key="s.key" class="toggle-row">
            <span>{{ t(s.label) }}</span>
            <input v-if="s.type === 'number'" v-model="settings[s.key]" type="number" class="number-input" @change="updateNumber(s.key)">
            <button v-else :class="['toggle-btn', { active: isOn(s.key) }]" @click="toggleSetting(s.key)">{{ isOn(s.key) ? t('common.enabled') : t('common.disabled') }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { getAdminSettings, updateAdminSetting } from '@/services/admin.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

const toast = useToast()
const loading = ref(true)
const error = ref('')
const settings = ref<Record<string, string>>({})

const settingList = [
  { key: 'experiment_physics_enabled', label: 'common.physicsExperiments', type: 'toggle' },
  { key: 'experiment_chemistry_enabled', label: 'common.chemistryExperiments', type: 'toggle' },
  { key: 'experiment_biology_enabled', label: 'common.biologyExperiments', type: 'toggle' },
  { key: 'experiment_math_enabled', label: 'common.mathExperiments', type: 'toggle' },
  { key: 'chat_enabled', label: 'common.chat', type: 'toggle' },
  { key: 'registration_enabled', label: 'common.publicRegistration', type: 'toggle' },
  { key: 'freeze_all_classes', label: 'common.freezeAllClasses', type: 'toggle' },
  { key: 'max_class_size', label: 'common.maxClassSize', type: 'number' },
] as const

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

async function saveSetting(key: string, value: string) {
  try {
    const res = await updateAdminSetting(key, value)
    if (!res.success) throw new Error()
    settings.value[key] = value
    toast.success(t('common.saved'))
  } catch (e) {
    toast.error(t('common.saveFailed'))
    await load()
  }
}

async function toggleSetting(key: string) {
  const newValue = isOn(key) ? 'false' : 'true'
  await saveSetting(key, newValue)
}

async function updateNumber(key: string) {
  const value = settings.value[key]
  const num = parseInt(value, 10)
  if (Number.isNaN(num) || num < 1) return toast.error(t('common.invalidValue'))
  await saveSetting(key, String(num))
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 1.2rem; }
.chart-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; }
.chart-panel.wide { grid-column: 1 / -1; }
.chart-title { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
.toggle-btn { padding: 4px 10px; border-radius: 4px; border: none; background: #475569; color: #fff; cursor: pointer; }
.toggle-btn.active { background: #10b981; }
.number-input { width: 80px; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; text-align: center; }
</style>
