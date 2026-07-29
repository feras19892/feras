<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchJson } from '../../services/http';

interface TeacherPerf {
  id: number;
  name: string;
  email: string;
  class_count: number;
  total_students: number;
  total_reports: number;
  graded_reports: number;
  pending_reports: number;
  grading_rate: number;
  last_graded_at: string | null;
  avg_grading_hours: number | null;
  is_blocked: boolean;
}

const teachers = ref<TeacherPerf[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await fetchJson<{ success: boolean; performance: TeacherPerf[] }>('/api/school/teachers/performance');
    if (res.success) teachers.value = res.performance;
  } catch {
    // ignore
  }
  loading.value = false;
}

function rateColor(rate: number): string {
  if (rate >= 80) return '#22c55e';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
}

onMounted(load);
</script>

<template>
  <div class="teacher-performance">
    <h3>📊 أداء المدرسين</h3>
    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="teachers.length === 0" class="empty">لا يوجد مدرسين</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>المدرس</th>
            <th>الفصول</th>
            <th>الطلاب</th>
            <th>التقارير</th>
            <th>المعلقة</th>
            <th>نسبة التصحيح</th>
            <th>متوسط وقت التصحيح</th>
            <th>آخر تصحيح</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in teachers" :key="t.id">
            <td class="name-cell">
              <div>{{ t.name }}</div>
              <div class="email">{{ t.email }}</div>
            </td>
            <td>{{ t.class_count }}</td>
            <td>{{ t.total_students }}</td>
            <td>{{ t.total_reports }}</td>
            <td :class="{ 'pending-warn': t.pending_reports > 5 }">{{ t.pending_reports }}</td>
            <td>
              <span class="rate-badge" :style="{ color: rateColor(t.grading_rate) }">
                {{ t.grading_rate }}%
              </span>
            </td>
            <td>{{ t.avg_grading_hours !== null ? `${t.avg_grading_hours}س` : '—' }}</td>
            <td class="date-cell">
              {{ t.last_graded_at ? new Date(t.last_graded_at).toLocaleDateString('ar-SA') : 'لم يصحح بعد' }}
            </td>
            <td>
              <span :class="['status-badge', t.is_blocked ? 'blocked' : 'active']">
                {{ t.is_blocked ? 'محظور' : 'نشط' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.teacher-performance { padding: 0.5rem; }
.teacher-performance h3 { color: #e2e8f0; margin-bottom: 0.75rem; font-size: 1rem; }
.loading, .empty { text-align: center; color: #64748b; padding: 1rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { color: #64748b; font-size: 0.7rem; text-align: right; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
td { color: #e2e8f0; font-size: 0.75rem; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.name-cell .email { color: #64748b; font-size: 0.65rem; }
.pending-warn { color: #f59e0b; font-weight: 600; }
.rate-badge { font-weight: 700; }
.date-cell { color: #94a3b8; font-size: 0.7rem; }
.status-badge { font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem; }
.status-badge.active { background: rgba(34,197,94,0.15); color: #22c55e; }
.status-badge.blocked { background: rgba(239,68,68,0.15); color: #ef4444; }
</style>
