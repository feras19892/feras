<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { ClassRow } from '../../composables/teacher/useTeacherDashboard'

const { t } = useI18n()

defineProps<{
  classRows: ClassRow[]
}>()

const AnnouncementsPanel = defineAsyncComponent(() => import('../shared/AnnouncementsPanel.vue'))
const CreateAnnouncementForm = defineAsyncComponent(() => import('./CreateAnnouncementForm.vue'))

const selectedClass = ref('')
</script>

<template>
  <div class="section-panel">
    <div class="ann-grid">
      <div class="panel-card">
        <div class="pc-header">
          <h3>{{ t('shared.tdAnnouncements') }}</h3>
        </div>
        <AnnouncementsPanel />
      </div>
      <div class="panel-card">
        <div class="pc-header">
          <h3>{{ t('shared.tdCreateAnnouncement') }}</h3>
        </div>
        <div class="ann-create-wrap">
          <div class="class-select-row">
            <label>{{ t('shared.tdSelectClass') }}</label>
            <select v-model="selectedClass" class="class-select">
              <option value="">{{ t('shared.tdSelectClassPlaceholder') }}</option>
              <option v-for="c in classRows" :key="c.id" :value="c.id">{{ c.name }} ({{ c.code }})</option>
            </select>
          </div>
          <CreateAnnouncementForm v-if="selectedClass" :class-id="selectedClass" />
          <p v-else class="ann-hint">{{ t('shared.tdSelectClassHint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-card {
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.8rem;
  padding: 1rem;
  margin-bottom: 0.8rem;
}
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }
.ann-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
@media (max-width: 768px) { .ann-grid { grid-template-columns: 1fr; } }
.ann-create-wrap { padding: 0.5rem 0; }
.class-select-row { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.6rem; }
.class-select-row label { font-size: 0.78rem; color: #94a3b8; }
.class-select {
  padding: 0.5rem 0.7rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(15,23,42,0.6);
  color: #e2e8f0;
  font-size: 0.82rem;
  font-family: inherit;
}
.class-select:focus { outline: none; border-color: rgba(165,180,252,0.5); }
.ann-hint { color: #64748b; font-size: 0.8rem; text-align: center; padding: 1rem; }
</style>
