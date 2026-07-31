<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchJson } from '../../services/http';
import { useI18n } from '../../composables/useI18n';

const { t, locale } = useI18n();
const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

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
    <h3>{{ t('school.perfTitle') }}</h3>
    <div v-if="loading" class="loading">{{ t('school.loading') }}</div>
    <div v-else-if="teachers.length === 0" class="empty">{{ t('school.noTeachers') }}</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('school.thTeacher') }}</th>
            <th>{{ t('school.thClasses') }}</th>
            <th>{{ t('school.thStudents') }}</th>
            <th>{{ t('school.thReports') }}</th>
            <th>{{ t('school.thPending') }}</th>
            <th>{{ t('school.thGradingRate') }}</th>
            <th>{{ t('school.thAvgGradingTime') }}</th>
            <th>{{ t('school.thLastGraded') }}</th>
            <th>{{ t('school.thStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tp in teachers" :key="tp.id">
            <td class="name-cell">
              <div>{{ tp.name }}</div>
              <div class="email">{{ tp.email }}</div>
            </td>
            <td>{{ tp.class_count }}</td>
            <td>{{ tp.total_students }}</td>
            <td>{{ tp.total_reports }}</td>
            <td :class="{ 'pending-warn': tp.pending_reports > 5 }">{{ tp.pending_reports }}</td>
            <td>
              <span class="rate-badge" :style="{ color: rateColor(tp.grading_rate) }">
                {{ tp.grading_rate }}%
              </span>
            </td>
            <td>{{ tp.avg_grading_hours !== null ? `${tp.avg_grading_hours}${t('school.hoursShort')}` : '—' }}</td>
            <td class="date-cell">
              {{ tp.last_graded_at ? new Date(tp.last_graded_at).toLocaleDateString(dateLocaleStr) : t('school.notGradedYet') }}
            </td>
            <td>
              <span :class="['status-badge', tp.is_blocked ? 'blocked' : 'active']">
                {{ tp.is_blocked ? t('school.statusBlocked') : t('school.statusActive') }}
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
