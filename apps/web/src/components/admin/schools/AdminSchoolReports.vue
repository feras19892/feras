<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';

const { t, locale } = useI18n();

defineProps<{ reports: any[] }>();

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );
}

function statusLabel(s: string) {
  if (s === 'draft') return t('admin.statusDraft');
  if (s === 'submitted') return t('admin.statusSubmitted');
  if (s === 'graded') return t('admin.statusGraded');
  return s;
}
</script>

<template>
  <div class="tab-content">
    <div v-if="reports.length === 0" class="empty-state">
      <p>{{ t('admin.schoolNoReports') }}</p>
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>{{ t('admin.experiment') }}</th>
          <th>{{ t('admin.roleStudent') }}</th>
          <th>{{ t('admin.className') }}</th>
          <th>{{ t('admin.schoolStatus') }}</th>
          <th>{{ t('admin.grade') }}</th>
          <th>{{ t('admin.createdAt') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reports" :key="r.id">
          <td>{{ r.experiment_name }}</td>
          <td>{{ r.student_name }}</td>
          <td>{{ r.class_name || '—' }}</td>
          <td>
            <span class="status-badge" :class="r.status === 'graded' ? 'active' : r.status === 'submitted' ? 'pending' : 'draft'">
              {{ statusLabel(r.status) }}
            </span>
          </td>
          <td>{{ r.grade ?? '—' }}</td>
          <td>{{ formatDate(r.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tab-content { padding: 0.5rem 0; }
.empty-state { text-align: center; padding: 2rem; color: #64748b; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: start; padding: 0.6rem 0.8rem; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); text-transform: uppercase; letter-spacing: 0.5px; }
.data-table td { padding: 0.7rem 0.8rem; font-size: 0.85rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 0.3rem; }
.status-badge.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; }
.status-badge.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }
</style>
