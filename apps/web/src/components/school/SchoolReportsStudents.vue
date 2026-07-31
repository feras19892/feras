<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';
import type { OutstandingStudent, StrugglingStudent } from './school-reports-types';

const { t } = useI18n();

defineProps<{
  activeSection: string;
  outstandingStudents: OutstandingStudent[];
  strugglingStudents: StrugglingStudent[];
  dateLocaleStr: string;
}>();

function gradeColor(grade: number): string {
  if (grade >= 90) return '#22c55e';
  if (grade >= 70) return '#3b82f6';
  if (grade >= 50) return '#f59e0b';
  return '#ef4444';
}

function formatDate(d: string | null, localeStr: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(localeStr);
}
</script>

<template>
  <!-- Outstanding Students -->
  <template v-if="activeSection === 'outstanding'">
    <div v-if="outstandingStudents.length === 0" class="empty">{{ t('school.noOutstanding') }}</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('school.thStudent') }}</th>
            <th>{{ t('school.thReports') }}</th>
            <th>{{ t('school.thAverage') }}</th>
            <th>{{ t('school.thExcellent') }}</th>
            <th>{{ t('school.thBadges') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in outstandingStudents" :key="s.id">
            <td class="name-cell">
              <div>{{ s.name }}</div>
              <div class="code">{{ s.email }}</div>
            </td>
            <td>{{ s.report_count }}</td>
            <td><span class="grade-badge" :style="{ color: gradeColor(s.avg_grade) }">{{ s.avg_grade }}</span></td>
            <td class="excellent">{{ s.excellent_count }}</td>
            <td>🏆 {{ s.badge_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <!-- Struggling Students -->
  <template v-else-if="activeSection === 'struggling'">
    <div v-if="strugglingStudents.length === 0" class="empty">{{ t('school.noStruggling') }}</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('school.thStudent') }}</th>
            <th>{{ t('school.thReports') }}</th>
            <th>{{ t('school.thAverage') }}</th>
            <th>{{ t('school.thPending') }}</th>
            <th>{{ t('school.thFailing') }}</th>
            <th>{{ t('school.thLastActivity') }}</th>
            <th>{{ t('school.thDaysInactive') }}</th>
            <th>{{ t('school.thNeedsEncouragement') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in strugglingStudents" :key="s.id" :class="{ 'row-warning': s.needs_encouragement }">
            <td class="name-cell">
              <div>{{ s.name }}</div>
              <div class="code">{{ s.email }}</div>
            </td>
            <td>{{ s.report_count }}</td>
            <td><span class="grade-badge" :style="{ color: gradeColor(s.avg_grade) }">{{ s.avg_grade }}</span></td>
            <td :class="{ 'warn-text': s.pending_count > 3 }">{{ s.pending_count }}</td>
            <td :class="{ 'danger-text': s.failing_count > 0 }">{{ s.failing_count }}</td>
            <td>{{ formatDate(s.last_activity, dateLocaleStr) }}</td>
            <td :class="{ 'warn-text': s.days_inactive && s.days_inactive > 7 }">{{ s.days_inactive !== null ? `${s.days_inactive} ${t('school.daysUnit')}` : '—' }}</td>
            <td>
              <span v-if="s.needs_encouragement" class="encourage-tag">{{ t('school.encourageYes') }}</span>
              <span v-else class="ok-tag">✓</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>

<style scoped>
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { color: #64748b; font-size: 0.7rem; text-align: right; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
td { color: #e2e8f0; font-size: 0.75rem; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); white-space: nowrap; }
.name-cell .code { color: #64748b; font-size: 0.65rem; }
.row-warning { background: rgba(245,158,11,0.04); }
.warn-text { color: #f59e0b; font-weight: 600; }
.danger-text { color: #ef4444; font-weight: 600; }
.excellent { color: #22c55e; font-weight: 600; }
.grade-badge { font-weight: 700; }
.ok-tag { color: #22c55e; font-size: 0.8rem; }
.encourage-tag { font-size: 0.7rem; padding: 0.15rem 0.4rem; background: rgba(245,158,11,0.15); color: #f59e0b; border-radius: 0.2rem; }
.empty { text-align: center; color: #64748b; padding: 2rem; }
</style>
