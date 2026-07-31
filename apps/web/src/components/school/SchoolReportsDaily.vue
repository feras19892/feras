<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';
import type { DailyReport, TeacherEval } from './school-reports-types';

const { t } = useI18n();

defineProps<{
  activeSection: string;
  dailyReport: DailyReport | null;
  teacherEvals: TeacherEval[];
  dateLocaleStr: string;
  selectedDate: string;
}>();

const emit = defineEmits<{
  loadDaily: [];
  'update:selectedDate': [string];
}>();

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function gradeColor(grade: number): string {
  if (grade >= 90) return '#22c55e';
  if (grade >= 70) return '#3b82f6';
  if (grade >= 50) return '#f59e0b';
  return '#ef4444';
}
</script>

<template>
  <!-- Daily Reports -->
  <template v-if="activeSection === 'daily'">
    <div class="date-picker">
      <label>{{ t('school.dateLabel') }}: </label>
      <input type="date" :value="selectedDate" @input="emit('update:selectedDate', ($event.target as HTMLInputElement).value)" @change="emit('loadDaily')" />
      <button class="btn-primary" @click="emit('loadDaily')">{{ t('school.refresh') }}</button>
    </div>

    <div v-if="dailyReport" class="daily-report">
      <div class="summary-grid">
        <div class="summary-card"><span class="val">{{ dailyReport.summary.total_students }}</span><span class="lbl">{{ t('school.sumStudents') }}</span></div>
        <div class="summary-card"><span class="val">{{ dailyReport.summary.total_teachers }}</span><span class="lbl">{{ t('school.sumTeachers') }}</span></div>
        <div class="summary-card"><span class="val">{{ dailyReport.summary.total_classes }}</span><span class="lbl">{{ t('school.sumClasses') }}</span></div>
        <div class="summary-card"><span class="val">{{ dailyReport.summary.reports_today }}</span><span class="lbl">{{ t('school.sumReportsToday') }}</span></div>
        <div class="summary-card warn" v-if="dailyReport.summary.pending_reports > 0"><span class="val">{{ dailyReport.summary.pending_reports }}</span><span class="lbl">{{ t('school.sumPending') }}</span></div>
        <div class="summary-card danger" v-if="dailyReport.summary.overdue_reports > 0"><span class="val">{{ dailyReport.summary.overdue_reports }}</span><span class="lbl">{{ t('school.sumOverdue') }}</span></div>
      </div>

      <div class="section-title">{{ t('school.classDetails') }} — {{ dailyReport.date }}</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('school.thClass') }}</th>
              <th>{{ t('school.thTeacher') }}</th>
              <th>{{ t('school.thStudents') }}</th>
              <th>{{ t('school.thActiveToday') }}</th>
              <th>{{ t('school.thReportsToday') }}</th>
              <th>{{ t('school.thGradedToday') }}</th>
              <th>{{ t('school.thPending') }}</th>
              <th>{{ t('school.thOverdue') }}</th>
              <th>{{ t('school.thQuizzesToday') }}</th>
              <th>{{ t('school.thAverage') }}</th>
              <th>{{ t('school.thIssues') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cls in dailyReport.classes" :key="cls.class_id" :class="{ 'row-frozen': cls.is_frozen, 'row-inactive': !cls.is_active }">
              <td class="name-cell">
                <div>{{ cls.class_name }}</div>
                <div class="code">{{ cls.class_code }}</div>
              </td>
              <td>{{ cls.teacher_name }}</td>
              <td>{{ cls.student_count }}</td>
              <td>{{ cls.active_today }}</td>
              <td>{{ cls.reports_today }}</td>
              <td>{{ cls.graded_today }}</td>
              <td :class="{ 'warn-text': cls.pending_reports > 5 }">{{ cls.pending_reports }}</td>
              <td :class="{ 'danger-text': cls.overdue_reports > 0 }">{{ cls.overdue_reports }}</td>
              <td>{{ cls.quiz_submissions_today }}</td>
              <td><span class="grade-badge" :style="{ color: gradeColor(cls.class_average) }">{{ cls.class_average || '—' }}</span></td>
              <td>
                <div v-if="cls.issues.length" class="issues-list">
                  <span v-for="(issue, i) in cls.issues" :key="i" class="issue-tag">{{ issue }}</span>
                </div>
                <span v-else class="ok-tag">✓</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <!-- Teacher Evaluation -->
  <template v-else-if="activeSection === 'teachers'">
    <div v-if="teacherEvals.length === 0" class="empty">{{ t('school.noTeachers') }}</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('school.thTeacher') }}</th>
            <th>{{ t('school.thClasses') }}</th>
            <th>{{ t('school.thStudents') }}</th>
            <th>{{ t('school.thReports') }}</th>
            <th>{{ t('school.thGraded') }}</th>
            <th>{{ t('school.thPending') }}</th>
            <th>{{ t('school.thGradingRate') }}</th>
            <th>{{ t('school.thAverage') }}</th>
            <th>{{ t('school.thQuizzes') }}</th>
            <th>{{ t('school.thAvgGradingTime') }}</th>
            <th>{{ t('school.thEvaluation') }}</th>
            <th>{{ t('school.thStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="te in teacherEvals" :key="te.id">
            <td class="name-cell">
              <div>{{ te.name }}</div>
              <div class="code">{{ te.email }}</div>
            </td>
            <td>{{ te.class_count }}</td>
            <td>{{ te.total_students }}</td>
            <td>{{ te.total_reports }}</td>
            <td>{{ te.graded_reports }}</td>
            <td :class="{ 'warn-text': te.pending_reports > 5 }">{{ te.pending_reports }}</td>
            <td><span class="rate-badge" :style="{ color: scoreColor(te.grading_rate) }">{{ te.grading_rate }}%</span></td>
            <td><span class="grade-badge" :style="{ color: gradeColor(te.avg_grade) }">{{ te.avg_grade || '—' }}</span></td>
            <td>{{ te.quiz_count }}</td>
            <td>{{ te.avg_grading_hours !== null ? `${te.avg_grading_hours}${t('school.hoursShort')}` : '—' }}</td>
            <td>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${te.teaching_score}%`, background: scoreColor(te.teaching_score) }"></div>
                <span class="score-text">{{ te.teaching_score }}</span>
              </div>
            </td>
            <td>
              <span :class="['status-badge', te.is_blocked ? 'blocked' : 'active']">{{ te.is_blocked ? t('school.statusBlocked') : t('school.statusActive') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>

<style scoped>
.date-picker { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
.date-picker label { color: #94a3b8; font-size: 0.8rem; }
.date-picker input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 0.375rem; padding: 0.3rem 0.5rem; font-size: 0.8rem; }
.btn-primary { padding: 0.3rem 0.8rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.8rem; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
.summary-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.75rem; text-align: center; }
.summary-card .val { display: block; font-size: 1.5rem; font-weight: 700; color: #e2e8f0; }
.summary-card .lbl { display: block; font-size: 0.7rem; color: #64748b; margin-top: 0.2rem; }
.summary-card.warn { border-color: rgba(245,158,11,0.3); }
.summary-card.warn .val { color: #f59e0b; }
.summary-card.danger { border-color: rgba(239,68,68,0.3); }
.summary-card.danger .val { color: #ef4444; }
.section-title { color: #e2e8f0; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { color: #64748b; font-size: 0.7rem; text-align: right; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
td { color: #e2e8f0; font-size: 0.75rem; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); white-space: nowrap; }
.name-cell .code { color: #64748b; font-size: 0.65rem; }
.row-frozen { opacity: 0.6; }
.row-inactive { opacity: 0.5; }
.warn-text { color: #f59e0b; font-weight: 600; }
.danger-text { color: #ef4444; font-weight: 600; }
.grade-badge { font-weight: 700; }
.rate-badge { font-weight: 700; }
.issues-list { display: flex; flex-direction: column; gap: 0.15rem; }
.issue-tag { font-size: 0.6rem; padding: 0.1rem 0.3rem; background: rgba(239,68,68,0.1); color: #f87171; border-radius: 0.2rem; white-space: nowrap; }
.ok-tag { color: #22c55e; font-size: 0.8rem; }
.empty { text-align: center; color: #64748b; padding: 2rem; }
.status-badge { font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem; }
.status-badge.active { background: rgba(34,197,94,0.15); color: #22c55e; }
.status-badge.blocked { background: rgba(239,68,68,0.15); color: #ef4444; }
.score-bar { position: relative; width: 60px; height: 18px; background: rgba(255,255,255,0.06); border-radius: 0.25rem; overflow: hidden; }
.score-fill { height: 100%; border-radius: 0.25rem; transition: width 0.3s; }
.score-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.65rem; font-weight: 700; color: #fff; }
</style>
