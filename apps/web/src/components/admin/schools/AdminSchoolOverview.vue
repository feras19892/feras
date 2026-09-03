<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import type { AdminSchool, SchoolStats } from '../../../services/school.service';
defineProps<{ school: AdminSchool; stats: SchoolStats | null }>();
const emit = defineEmits<{ delete: []; toggle: [id: number] }>();

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );
}
</script>

<template>
  <div class="overview-grid">
    <div class="stat-card">
      <div class="stat-icon">🎓</div>
      <div class="stat-value">{{ stats?.students ?? 0 }}</div>
      <div class="stat-label">{{ t('admin.schoolStudentsLabel') }}</div>
      <div class="stat-max">{{ t('admin.schoolMaxStudents') }}: {{ school.max_students }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">👨‍🏫</div>
      <div class="stat-value">{{ stats?.teachers ?? 0 }}</div>
      <div class="stat-label">{{ t('admin.schoolTeachersLabel') }}</div>
      <div class="stat-max">{{ t('admin.schoolMaxTeachers') }}: {{ school.max_teachers }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📚</div>
      <div class="stat-value">{{ stats?.classes ?? 0 }}</div>
      <div class="stat-label">{{ t('admin.schoolClassesLabel') }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📄</div>
      <div class="stat-value">{{ stats?.reports ?? 0 }}</div>
      <div class="stat-label">{{ t('admin.schoolReportsLabel') }}</div>
    </div>
    <div class="info-card">
      <div class="info-row"><span>{{ t('admin.schoolEmailLabel') }}</span><span>{{ school.email }}</span></div>
      <div class="info-row"><span>{{ t('admin.schoolCodeLabel') }}</span><code>{{ school.code }}</code></div>
      <div class="info-row"><span>{{ t('admin.schoolStatusLabel') }}</span>
        <span class="status-badge" :class="school.is_active ? 'active' : 'suspended'">
          {{ school.is_active ? t('admin.schoolActive') : t('admin.schoolSuspended') }}
        </span>
      </div>
      <div class="info-row"><span>{{ t('admin.schoolDateLabel') }}</span><span>{{ formatDate(school.created_at) }}</span></div>
    </div>
    <div class="danger-zone">
      <button class="btn-danger" @click="emit('delete')">{{ t('admin.schoolDelete') }}</button>
    </div>
  </div>
</template>

<style scoped>
.overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.8rem; }
.stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; text-align: center; }
.stat-icon { font-size: 1.5rem; margin-bottom: 0.3rem; }
.stat-value { font-size: 1.8rem; font-weight: 700; color: #e2e8f0; }
.stat-label { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; }
.stat-max { font-size: 0.7rem; color: #475569; margin-top: 0.2rem; }

.info-card { grid-column: 1 / -1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.info-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #cbd5e1; }
.info-row span:first-child { color: #64748b; }

.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 0.3rem; }
.status-badge.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-badge.suspended { background: rgba(239,68,68,0.15); color: #fca5a5; }

.danger-zone { grid-column: 1 / -1; margin-top: 0.5rem; }
.btn-danger { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 0.5rem; padding: 0.6rem 1rem; color: #fca5a5; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
.btn-danger:hover { background: rgba(239,68,68,0.2); }
</style>
