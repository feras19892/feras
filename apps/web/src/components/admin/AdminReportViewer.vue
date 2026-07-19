<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';
interface AdminReportItem {
  id: number;
  student_name: string;
  experiment_name: string;
  class_name: string;
  teacher_name: string;
  status: string;
  grade?: number | null;
  submitted_at?: string;
}
defineProps<{
  reports: AdminReportItem[];
}>();

const { t } = useI18n();

function statusLabel(status: string) {
  switch (status) {
    case 'submitted': return t('adminUser.statusSubmitted');
    case 'graded': return t('adminUser.statusGraded');
    case 'resubmitted': return t('adminUser.statusResubmitted');
    default: return status;
  }
}
</script>

<template>
  <div class="section">
    <h3>{{ t('admin.reports', { count: reports.length }) }}</h3>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>{{ t('adminUser.student') }}</th><th>{{ t('adminUser.experiment') }}</th><th>{{ t('adminUser.classLabel') }}</th><th>{{ t('admin.teacher') }}</th><th>{{ t('admin.status') }}</th><th>{{ t('adminUser.grade') }}</th><th>{{ t('admin.date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.student_name }}</td>
            <td>{{ r.experiment_name }}</td>
            <td>{{ r.class_name }}</td>
            <td>{{ r.teacher_name }}</td>
            <td>{{ statusLabel(r.status) }}</td>
            <td>{{ r.grade ?? '—' }}</td>
            <td>{{ r.submitted_at?.slice(0, 10) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="reports.length === 0" class="empty">{{ t('admin.noResults') }}</p>
    </div>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section h3 { font-size: 1.1rem; margin: 0 0 1rem; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: end; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.empty { text-align: center; color: #64748b; padding: 2rem; }
</style>
