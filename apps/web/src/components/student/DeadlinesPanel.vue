<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getStudentDeadlines, type Deadline } from '../../services/deadline.service';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const deadlines = ref<Deadline[]>([]);
const loading = ref(false);
const now = ref(Date.now());

async function load() {
  loading.value = true;
  try {
    const res = await getStudentDeadlines();
    if (res.success) deadlines.value = res.deadlines;
  } catch {
    // ignore
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.deadlines-panel { padding: 0.5rem; }
.deadlines-panel h3 { color: #e2e8f0; margin-bottom: 0.75rem; font-size: 1rem; }
.loading, .empty { text-align: center; color: #64748b; padding: 1rem; }
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
</style>
