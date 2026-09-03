<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getStudentDeadlines, type Deadline } from '../../services/deadline.service';

import { downloadICS, generateGoogleCalendarURL, type CalendarEvent } from '../../composables/useCalendarExport';





const deadlines = ref<Deadline[]>([]);
const loading = ref(false);
const loadError = ref(false);
const now = ref(Date.now());

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    const res = await getStudentDeadlines();
    if (res.success) deadlines.value = res.deadlines;
  } catch {
    loadError.value = true;
  }
  loading.value = false;
}

function timeRemaining(dueAt: string): { text: string; overdue: boolean; urgent: boolean } {
  const due = new Date(dueAt).getTime();
  const diff = due - now.value;
  if (diff <= 0) return { text: t('dashboard.dash.deadlineOverdue'), overdue: true, urgent: false };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return { text: `${days} ${t('dashboard.dash.deadlineDay')}`, overdue: false, urgent: days <= 1 };
  if (hours > 0) return { text: `${hours} ${t('dashboard.dash.deadlineHour')}`, overdue: false, urgent: true };
  const minutes = Math.floor(diff / (1000 * 60));
  return { text: `${minutes} ${t('dashboard.dash.deadlineMinute')}`, overdue: false, urgent: true };
}

const sortedDeadlines = computed(() => {
  return [...deadlines.value].sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
});

function exportAllToICS() {
  const events: CalendarEvent[] = sortedDeadlines.value.map(d => ({
    title: d.experiment_name,
    description: `موعد تسليم تجربة: ${d.experiment_name}`,
    startDate: new Date(d.due_at),
  }));
  downloadICS(events, 'deadlines.ics');
}

function addToGoogleCalendar(d: Deadline) {
  const event: CalendarEvent = {
    title: d.experiment_name,
    description: `موعد تسليم تجربة: ${d.experiment_name}`,
    startDate: new Date(d.due_at),
  };
  window.open(generateGoogleCalendarURL(event), '_blank');
}

let nowInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  load();
  nowInterval = setInterval(() => { now.value = Date.now(); }, 60000);
});

onUnmounted(() => {
  if (nowInterval) clearInterval(nowInterval);
});
</script>

<template>
  <div class="deadlines-panel">
    <h3>{{ t('dashboard.dash.deadlineTitle') }}</h3>
    <div v-if="loading" class="loading">{{ t('dashboard.dash.deadlineLoading') }}</div>
    <div v-else-if="loadError" class="error-retry">
      <span>⚠️ {{ t('dashboard.dash.deadlineError', 'تعذر تحميل المواعيد') }}</span>
      <button @click="load">🔄 {{ t('common.retry', 'إعادة') }}</button>
    </div>
    <div v-else-if="sortedDeadlines.length === 0" class="empty">{{ t('dashboard.dash.deadlineEmpty') }}</div>
    <div v-else class="list">
      <div
        v-for="d in sortedDeadlines"
        :key="d.id"
        :class="['deadline-item', { overdue: timeRemaining(d.due_at).overdue, urgent: timeRemaining(d.due_at).urgent }]"
      >
        <div class="exp-name">{{ d.experiment_name }}</div>
        <div class="time-remaining">
          <span v-if="timeRemaining(d.due_at).overdue" class="overdue-badge">⚠️ {{ timeRemaining(d.due_at).text }}</span>
          <span v-else-if="timeRemaining(d.due_at).urgent" class="urgent-badge">⏰ {{ timeRemaining(d.due_at).text }}</span>
          <span v-else class="normal-badge">📅 {{ timeRemaining(d.due_at).text }}</span>
        </div>
        <button class="cal-btn" @click="addToGoogleCalendar(d)" title="إضافة إلى Google Calendar">📅</button>
      </div>
      <button class="export-ics-btn" @click="exportAllToICS">📥 تصدير الكل إلى التقويم (.ics)</button>
    </div>
  </div>
</template>

<style scoped>
.deadlines-panel { padding: 0.5rem; }
.deadlines-panel h3 { color: #e2e8f0; margin-bottom: 0.75rem; font-size: 1rem; }
.loading, .empty { text-align: center; color: #64748b; padding: 1rem; }
.error-retry { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; color: #f87171; font-size: 0.8rem; }
.error-retry button { padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.1); color: #c7d2fe; cursor: pointer; font-family: inherit; font-size: 0.75rem; }
.list { display: flex; flex-direction: column; gap: 0.4rem; }
.deadline-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 0.6rem; border-radius: 0.4rem;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
}
.deadline-item.overdue { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
.deadline-item.urgent { border-color: rgba(251, 146, 60, 0.3); background: rgba(251, 146, 60, 0.05); }
.exp-name { color: #e2e8f0; font-size: 0.8rem; font-weight: 500; }
.overdue-badge { color: #ef4444; font-size: 0.75rem; }
.urgent-badge { color: #fb923c; font-size: 0.75rem; }
.normal-badge { color: #64748b; font-size: 0.75rem; }
.cal-btn { padding: 0.2rem 0.4rem; border-radius: 0.3rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #94a3b8; cursor: pointer; font-size: 0.75rem; }
.cal-btn:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); }
.export-ics-btn { margin-top: 0.5rem; padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); color: #a5b4fc; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.export-ics-btn:hover { background: rgba(99,102,241,0.15); }
</style>
