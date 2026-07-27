<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { getAdminSettings, updateAdminSetting } from '../../services/admin.service';

const { t } = useI18n();
const settings = ref<Record<string, string>>({});
const loading = ref(false);
const saving = ref<string | null>(null);
const error = ref('');

interface SettingItem {
  key: string;
  label: string;
  icon: string;
  type: 'toggle' | 'number';
}

const settingItems: SettingItem[] = [
  { key: 'experiment_physics_enabled', label: t('admin.physicsExperiments'), icon: '⚛️', type: 'toggle' },
  { key: 'experiment_chemistry_enabled', label: t('admin.chemistryExperiments'), icon: '🧪', type: 'toggle' },
  { key: 'experiment_biology_enabled', label: t('admin.biologyExperiments'), icon: '🧬', type: 'toggle' },
  { key: 'experiment_math_enabled', label: t('admin.mathExperiments'), icon: '📐', type: 'toggle' },
  { key: 'chat_enabled', label: t('admin.chatEnabled'), icon: '💬', type: 'toggle' },
  { key: 'registration_enabled', label: t('admin.registrationEnabled'), icon: '📝', type: 'toggle' },
  { key: 'max_class_size', label: t('admin.maxClassSize'), icon: '👥', type: 'number' },
];

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAdminSettings();
    if (res.success) settings.value = res.settings;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
  } finally {
    loading.value = false;
  }
}

async function toggleSetting(key: string) {
  const current = settings.value[key] === 'true';
  const next = !current;
  saving.value = key;
  try {
    const res = await updateAdminSetting(key, String(next));
    if (res.success) settings.value[key] = String(next);
  } catch { /* ignore */ }
  finally { saving.value = null; }
}

async function updateNumber(key: string, event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  saving.value = key;
  try {
    const res = await updateAdminSetting(key, value);
    if (res.success) settings.value[key] = value;
  } catch { /* ignore */ }
  finally { saving.value = null; }
}

onMounted(load);
</script>

<template>
  <div class="section">
    <h3>{{ t('admin.systemSettings') }}</h3>
    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <div v-else class="settings-grid">
      <div v-for="item in settingItems" :key="item.key" class="setting-card">
        <div class="setting-info">
          <span class="setting-icon">{{ item.icon }}</span>
          <span class="setting-label">{{ item.label }}</span>
        </div>
        <div class="setting-control">
          <template v-if="item.type === 'toggle'">
            <button
              class="toggle-btn"
              :class="{ on: settings[item.key] === 'true', saving: saving === item.key }"
              :disabled="saving === item.key"
              @click="toggleSetting(item.key)"
            >
              <span class="toggle-slider"></span>
              <span class="toggle-state">{{ settings[item.key] === 'true' ? t('admin.enabled') : t('admin.disabled') }}</span>
            </button>
          </template>
          <template v-else>
            <input
              type="number"
              class="number-input"
              :value="settings[item.key] || ''"
              :disabled="saving === item.key"
              @change="updateNumber(item.key, $event)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section h3 { font-size: 1.1rem; margin: 0 0 1rem; }
.loading { text-align: center; padding: 2rem; color: #64748b; }
.error { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }

.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.75rem; }
.setting-card { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.6rem; }
.setting-info { display: flex; align-items: center; gap: 0.6rem; }
.setting-icon { font-size: 1.2rem; }
.setting-label { font-size: 0.88rem; color: #e2e8f0; font-weight: 600; }

.toggle-btn { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 0.3rem 0.8rem; cursor: pointer; font-family: inherit; font-size: 0.78rem; color: #94a3b8; transition: all 0.2s; }
.toggle-btn.on { background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.3); color: #34d399; }
.toggle-btn.saving { opacity: 0.5; cursor: wait; }
.toggle-slider { width: 10px; height: 10px; border-radius: 50%; background: currentColor; transition: transform 0.2s; }
.toggle-btn.on .toggle-slider { transform: translateX(4px); }

.number-input { width: 70px; padding: 0.3rem 0.5rem; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; text-align: center; }
.number-input:disabled { opacity: 0.5; }
</style>
