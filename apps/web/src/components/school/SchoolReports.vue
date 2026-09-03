<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale } = useI18n();
import { ref, onMounted, computed } from 'vue';
import { getSchoolDetailedReports, getOutstandingStudents, getStrugglingStudents, getTeacherEvaluation, type OutstandingStudent, type StrugglingStudent, type TeacherEvaluation } from '../../services/school.service';
import type { DailyReport } from './school-reports-types';
import SchoolReportsDaily from './SchoolReportsDaily.vue';
import SchoolReportsStudents from './SchoolReportsStudents.vue';
const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

const loading = ref(false);
const error = ref('');
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const activeSection = ref<'daily' | 'teachers' | 'outstanding' | 'struggling'>('daily');

const dailyReport = ref<DailyReport | null>(null);
const outstandingStudents = ref<OutstandingStudent[]>([]);
const strugglingStudents = ref<StrugglingStudent[]>([]);
const teacherEvals = ref<TeacherEvaluation[]>([]);

async function loadDaily() {
  loading.value = true; error.value = '';
  try {
    const res = await getSchoolDetailedReports(selectedDate.value);
    if (res.success) dailyReport.value = res.report;
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : t('school.loadError'); }
  loading.value = false;
}

async function loadOutstanding() {
  loading.value = true; error.value = '';
  try {
    const res = await getOutstandingStudents();
    if (res.success) outstandingStudents.value = res.students;
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : t('school.loadError'); }
  loading.value = false;
}

async function loadStruggling() {
  loading.value = true; error.value = '';
  try {
    const res = await getStrugglingStudents();
    if (res.success) strugglingStudents.value = res.students;
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : t('school.loadError'); }
  loading.value = false;
}

async function loadTeacherEvals() {
  loading.value = true; error.value = '';
  try {
    const res = await getTeacherEvaluation();
    if (res.success) teacherEvals.value = res.evaluations;
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : t('school.loadError'); }
  loading.value = false;
}

function switchSection(s: 'daily' | 'teachers' | 'outstanding' | 'struggling') {
  activeSection.value = s;
  if (s === 'daily') loadDaily();
  else if (s === 'teachers') loadTeacherEvals();
  else if (s === 'outstanding') loadOutstanding();
  else if (s === 'struggling') loadStruggling();
}

onMounted(() => loadDaily());
</script>

<template>
  <div class="school-reports">
    <div class="reports-tabs">
      <button :class="['tab-btn', { active: activeSection === 'daily' }]" @click="switchSection('daily')">{{ t('school.reportsDaily') }}</button>
      <button :class="['tab-btn', { active: activeSection === 'teachers' }]" @click="switchSection('teachers')">{{ t('school.reportsTeachersEval') }}</button>
      <button :class="['tab-btn', { active: activeSection === 'outstanding' }]" @click="switchSection('outstanding')">{{ t('school.reportsOutstanding') }}</button>
      <button :class="['tab-btn', { active: activeSection === 'struggling' }]" @click="switchSection('struggling')">{{ t('school.reportsStruggling') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ t('school.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <SchoolReportsDaily
      v-else-if="activeSection === 'daily' || activeSection === 'teachers'"
      :active-section="activeSection"
      :daily-report="dailyReport"
      :teacher-evals="teacherEvals"
      :date-locale-str="dateLocaleStr"
      :selected-date="selectedDate"
      @load-daily="loadDaily"
      @update:selected-date="selectedDate = $event"
    />
    <SchoolReportsStudents
      v-else-if="activeSection === 'outstanding' || activeSection === 'struggling'"
      :active-section="activeSection"
      :outstanding-students="outstandingStudents"
      :struggling-students="strugglingStudents"
      :date-locale-str="dateLocaleStr"
    />
  </div>
</template>

<style scoped>
.school-reports { padding: 0.5rem; }
.reports-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.tab-btn { padding: 0.5rem 1rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #94a3b8; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.tab-btn.active { background: rgba(59,130,246,0.15); color: #60a5fa; border-color: rgba(59,130,246,0.3); }
.tab-btn:hover { background: rgba(255,255,255,0.06); }
.loading, .error { text-align: center; color: #64748b; padding: 2rem; }
.error { color: #ef4444; }
</style>
