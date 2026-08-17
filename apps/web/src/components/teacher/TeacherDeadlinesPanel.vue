<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getTeacherDeadlines, deleteDeadline, type TeacherDeadline } from '../../services/deadline.service';
import { useI18n } from '../../composables/useI18n';

const { t, locale } = useI18n();

const deadlines = ref<TeacherDeadline[]>([]);
const loading = ref(false);
const now = ref(Date.now());

async function load() {
  loading.value = true;
  try {
    const res = await getTeacherDeadlines();
    if (res.success) deadlines.value = res.deadlines;
  } catch {
    // ignore
  }
  loading.value = false;
}

async function remove(id: number) {
  try {
    await deleteDeadline(id);
    deadlines.value = deadlines.value.filter(d => d.id !== id);
  } catch {
    // ignore
  }
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

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
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

defineExpose({ reload: load });
</script>

<template>
  <div class="tdl-panel">
    <div class="tdl-header">
      <h3>{{ t('dashboard.dash.deadlineTitle') }}</h3>
      <button class="tdl-refresh" @click="load">{{ t('approval.refresh') }}</button>
    </div>
    <div v-if="loading" class="tdl-loading"><div class="spinner"></div></div>
    <div v-else-if="sortedDeadlines.length === 0" class="tdl-empty">
      <div class="tdl-empty-icon">📅</div>
      <p>{{ t('dashboard.dash.deadlineEmpty') }}</p>
    </div>
    <div v-else class="tdl-list">
      <div
        v-for="d in sortedDeadlines"
        :key="d.id"
        :class="['tdl-item', { overdue: timeRemaining(d.due_at).overdue, urgent: timeRemaining(d.due_at).urgent }]"
      >
        <div class="tdl-info">
          <div class="tdl-exp">{{ d.experiment_name }}</div>
          <div class="tdl-class">🏫 {{ d.class_name }}</div>
          <div class="tdl-due">{{ fmtDate(d.due_at) }}</div>
        </div>
        <div class="tdl-right">
          <span v-if="timeRemaining(d.due_at).overdue" class="tdl-badge overdue">⚠️ {{ timeRemaining(d.due_at).text }}</span>
          <span v-else-if="timeRemaining(d.due_at).urgent" class="tdl-badge urgent">⏰ {{ timeRemaining(d.due_at).text }}</span>
          <span v-else class="tdl-badge normal">📅 {{ timeRemaining(d.due_at).text }}</span>
          <button class="tdl-del" @click.stop="remove(d.id)" title="حذف">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tdl-panel { padding: 0.5rem; }
.tdl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.tdl-header h3 { color: #e2e8f0; margin: 0; font-size: 1rem; }
.tdl-refresh { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(15,23,42,0.6); color: #94a3b8; cursor: pointer; font-size: 0.75rem; font-family: inherit; }
.tdl-refresh:hover { background: rgba(255,255,255,0.05); }
.tdl-loading { display: flex; justify-content: center; padding: 2rem; }
.spinner { width: 32px; height: 32px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.tdl-empty { text-align: center; color: #64748b; padding: 2rem; }
.tdl-empty-icon { font-size: 2rem; margin-bottom: 0.4rem; }
.tdl-list { display: flex; flex-direction: column; gap: 0.4rem; }
.tdl-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.6rem 0.7rem; border-radius: 0.4rem;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
}
.tdl-item.overdue { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
.tdl-item.urgent { border-color: rgba(251, 146, 60, 0.3); background: rgba(251, 146, 60, 0.05); }
.tdl-info { display: flex; flex-direction: column; gap: 0.15rem; }
.tdl-exp { color: #e2e8f0; font-size: 0.82rem; font-weight: 600; }
.tdl-class { color: #94a3b8; font-size: 0.72rem; }
.tdl-due { color: #64748b; font-size: 0.68rem; }
.tdl-right { display: flex; align-items: center; gap: 0.4rem; }
.tdl-badge { font-size: 0.72rem; font-weight: 600; }
.tdl-badge.overdue { color: #ef4444; }
.tdl-badge.urgent { color: #fb923c; }
.tdl-badge.normal { color: #64748b; }
.tdl-del { background: none; border: none; cursor: pointer; font-size: 0.8rem; opacity: 0.5; transition: opacity 0.15s; }
.tdl-del:hover { opacity: 1; }
</style>
