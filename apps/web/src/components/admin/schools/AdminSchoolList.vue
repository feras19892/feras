<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale } = useI18n();
import type { AdminSchool } from '../../../services/school.service';
defineProps<{ schools: AdminSchool[]; loading: boolean; errorMsg: string }>();
const emit = defineEmits<{
  open: [school: AdminSchool];
  toggle: [id: number];
  refresh: [];
}>();

function formatDate(dateStr: string, locale: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale === 'ar' ? 'ar-SA' : locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );
}
</script>

<template>
  <div>
    <div class="manager-header">
      <h2>{{ t('admin.schools') }}</h2>
      <button class="btn-refresh" @click="emit('refresh')" :disabled="loading">🔄</button>
    </div>

    <div v-if="loading" class="loading-state">{{ t('admin.loading') }}</div>
    <div v-else-if="errorMsg" class="error-state">❌ {{ errorMsg }}</div>
    <div v-else-if="schools.length === 0" class="empty-state">
      <div class="empty-icon">🏫</div>
      <p>{{ t('admin.schoolNoData') }}</p>
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>{{ t('admin.schoolName') }}</th>
          <th>{{ t('admin.schoolEmail') }}</th>
          <th>{{ t('admin.schoolCode') }}</th>
          <th>{{ t('admin.schoolStudents') }}</th>
          <th>{{ t('admin.schoolTeachers') }}</th>
          <th>{{ t('admin.schoolStatus') }}</th>
          <th>{{ t('admin.schoolDate') }}</th>
          <th>{{ t('admin.schoolActions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in schools" :key="s.id" :class="{ inactive: !s.is_active }">
          <td class="school-name clickable" @click="emit('open', s)">{{ s.name }} 🔍</td>
          <td>{{ s.email }}</td>
          <td><code class="school-code">{{ s.code }}</code></td>
          <td>{{ s.student_count }} / {{ s.max_students }}</td>
          <td>{{ s.teacher_count }} / {{ s.max_teachers }}</td>
          <td>
            <span class="status-badge" :class="s.is_active ? 'active' : 'suspended'">
              {{ s.is_active ? t('admin.schoolActive') : t('admin.schoolSuspended') }}
            </span>
          </td>
          <td>{{ formatDate(s.created_at, locale) }}</td>
          <td class="actions-cell">
            <button class="btn-icon" @click="emit('open', s)" :title="t('admin.schoolDetailBtn')">🔍</button>
            <button class="btn-icon" @click="emit('toggle', s.id)" :title="s.is_active ? t('admin.schoolToggleOn') : t('admin.schoolToggleOff')">
              {{ s.is_active ? '⛔' : '✅' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.manager-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.manager-header h2 { font-size: 1.2rem; color: #e2e8f0; margin: 0; }
.btn-refresh { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem; padding: 0.3rem 0.6rem; cursor: pointer; color: #94a3b8; }
.btn-refresh:hover { background: rgba(255,255,255,0.1); }

.loading-state, .error-state, .empty-state { text-align: center; padding: 2rem; color: #64748b; }
.empty-icon { font-size: 2rem; margin-bottom: 0.5rem; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: start; padding: 0.6rem 0.8rem; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); text-transform: uppercase; letter-spacing: 0.5px; }
.data-table td { padding: 0.7rem 0.8rem; font-size: 0.85rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr.inactive { opacity: 0.5; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }

.school-name { font-weight: 600; color: #e2e8f0; }
.school-name.clickable { cursor: pointer; }
.school-name.clickable:hover { color: #67e8f9; }
.school-code { background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); border-radius: 0.3rem; padding: 0.15rem 0.4rem; font-size: 0.78rem; color: #67e8f9; }

.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 0.3rem; }
.status-badge.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-badge.suspended { background: rgba(239,68,68,0.15); color: #fca5a5; }

.actions-cell { display: flex; gap: 0.3rem; }
.btn-icon { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem; padding: 0.25rem 0.45rem; cursor: pointer; font-size: 0.85rem; }
.btn-icon:hover { background: rgba(255,255,255,0.1); }
</style>
