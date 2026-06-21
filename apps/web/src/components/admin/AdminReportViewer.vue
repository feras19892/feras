<script setup lang="ts">
interface AdminReportItem {
  id: number;
  student_name: string;
  experiment_name: string;
  class_name: string;
  teacher_name: string;
  status: string;
  grade?: number;
  submitted_at?: string;
}
defineProps<{
  reports: AdminReportItem[];
}>();

function statusLabel(status: string) {
  switch (status) {
    case 'submitted': return '⏳ معلق';
    case 'graded': return '✅ مصحح';
    case 'resubmitted': return '↩️ مُعاد';
    default: return status;
  }
}
</script>

<template>
  <div class="section">
    <h3>📋 التقارير ({{ reports.length }})</h3>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>الطالب</th><th>التجربة</th><th>الفصل</th><th>المدرس</th><th>الحالة</th><th>الدرجة</th><th>التاريخ</th>
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
      <p v-if="reports.length === 0" class="empty">لا توجد تقارير</p>
    </div>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section h3 { font-size: 1.1rem; margin: 0 0 1rem; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: right; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.empty { text-align: center; color: #64748b; padding: 2rem; }
</style>
