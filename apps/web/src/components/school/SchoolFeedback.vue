<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, onMounted, computed } from 'vue';
import { getSchoolFeedback, updateSchoolFeedbackStatus, type SchoolFeedbackItem, type SchoolFeedbackStats } from '../../services/school.service';
type FeedbackItem = SchoolFeedbackItem;

const feedback = ref<FeedbackItem[]>([]);
const stats = ref<SchoolFeedbackStats>({ total: 0, open: 0, resolved: 0, dismissed: 0, avg_rating: 0 });
const loading = ref(false);
const filter = ref<'all' | 'open' | 'resolved' | 'dismissed'>('all');

const typeLabels = computed<Record<string, string>>(() => ({
  bug: '🐛 ' + t('admin.feedbackTypeBug'),
  feature: '✨ ' + t('admin.feedbackTypeFeature'),
  content: '📚 ' + t('admin.feedbackTypeContent'),
  other: '� ' + t('admin.feedbackTypeOther'),
}));

const statusLabels = computed<Record<string, string>>(() => ({
  open: t('school.feedbackOpen'),
  resolved: t('school.feedbackResolved'),
  dismissed: t('school.feedbackDismissed'),
}));

const filtered = computed(() => {
  if (filter.value === 'all') return feedback.value;
  return feedback.value.filter(f => f.status === filter.value);
});

async function load() {
  loading.value = true;
  try {
    const res = await getSchoolFeedback();
    if (res.success) {
      feedback.value = res.feedback;
      stats.value = res.stats;
    }
  } catch { /* ignore */ }
  loading.value = false;
}

async function updateStatus(id: number, status: string) {
  try {
    await updateSchoolFeedbackStatus(id, status);
    const item = feedback.value.find(f => f.id === id);
    if (item) item.status = status;
    await load();
  } catch { /* ignore */ }
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(locale.value === 'ar' ? 'ar-SA' : locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

onMounted(load);
</script>

<template>
  <div class="sf-container">
    <div class="sf-header">
      <h3>{{ t('school.feedbackTitle') }}</h3>
      <div class="sf-stats">
        <span class="sf-stat">{{ t('school.feedbackTotal') }}: {{ stats.total }}</span>
        <span class="sf-stat open">{{ t('school.feedbackOpen') }}: {{ stats.open }}</span>
        <span class="sf-stat resolved">{{ t('school.feedbackResolved') }}: {{ stats.resolved }}</span>
        <span class="sf-stat" v-if="stats.avg_rating > 0">{{ t('school.feedbackAvgRating') }}: {{ stats.avg_rating }}⭐</span>
      </div>
    </div>

    <div class="sf-filters">
      <button :class="['sf-filter-btn', { active: filter === 'all' }]" @click="filter = 'all'">{{ t('school.feedbackAll') }}</button>
      <button :class="['sf-filter-btn', { active: filter === 'open' }]" @click="filter = 'open'">{{ t('school.feedbackOpen') }}</button>
      <button :class="['sf-filter-btn', { active: filter === 'resolved' }]" @click="filter = 'resolved'">{{ t('school.feedbackResolved') }}</button>
      <button :class="['sf-filter-btn', { active: filter === 'dismissed' }]" @click="filter = 'dismissed'">{{ t('school.feedbackDismiss') }}</button>
    </div>

    <div v-if="loading" class="sf-loading">جاري التحميل...</div>
    <div v-else-if="filtered.length === 0" class="sf-empty">{{ t('school.feedbackEmpty') }}</div>
    <div v-else class="sf-list">
      <div v-for="f in filtered" :key="f.id" :class="['sf-item', f.status]">
        <div class="sf-item-header">
          <span class="sf-type">{{ typeLabels[f.type] || f.type }}</span>
          <span class="sf-user">{{ f.user_name }}</span>
          <span v-if="f.rating" class="sf-rating">{{ '⭐'.repeat(f.rating) }}</span>
          <span :class="['sf-status', f.status]">{{ statusLabels[f.status] || f.status }}</span>
          <span class="sf-date">{{ formatTime(f.created_at) }}</span>
        </div>
        <div v-if="f.experiment_name" class="sf-exp">{{ t('school.feedbackExperiment') }}: {{ f.experiment_name }}</div>
        <p class="sf-message">{{ f.message }}</p>
        <div class="sf-actions" v-if="f.status === 'open'">
          <button class="sf-btn resolve" @click="updateStatus(f.id, 'resolved')">{{ t('school.feedbackResolve') }}</button>
          <button class="sf-btn dismiss" @click="updateStatus(f.id, 'dismissed')">{{ t('school.feedbackDismiss') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sf-container { padding: 0.5rem; }
.sf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.sf-header h3 { color: #e2e8f0; margin: 0; font-size: 1rem; }
.sf-stats { display: flex; gap: 0.8rem; font-size: 0.78rem; color: #94a3b8; }
.sf-stat.open { color: #fbbf24; }
.sf-stat.resolved { color: #86efac; }

.sf-filters { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
.sf-filter-btn { padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #94a3b8; font-size: 0.78rem; cursor: pointer; font-family: inherit; }
.sf-filter-btn.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #a5b4fc; }

.sf-loading, .sf-empty { text-align: center; color: #64748b; padding: 2rem; }
.sf-list { display: flex; flex-direction: column; gap: 0.6rem; }
.sf-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 0.8rem; }
.sf-item.resolved { border-color: rgba(34,197,94,0.15); }
.sf-item.dismissed { opacity: 0.5; }
.sf-item-header { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
.sf-type { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.72rem; font-weight: 700; background: rgba(99,102,241,0.15); color: #a5b4fc; }
.sf-user { color: #e2e8f0; font-size: 0.82rem; font-weight: 600; }
.sf-rating { font-size: 0.75rem; }
.sf-status { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.68rem; font-weight: 700; }
.sf-status.open { background: rgba(251,191,36,0.15); color: #fbbf24; }
.sf-status.resolved { background: rgba(34,197,94,0.15); color: #86efac; }
.sf-status.dismissed { background: rgba(100,116,139,0.15); color: #94a3b8; }
.sf-date { color: #64748b; font-size: 0.7rem; margin-left: auto; }
.sf-exp { color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.3rem; }
.sf-message { color: #cbd5e1; font-size: 0.82rem; line-height: 1.5; margin: 0 0 0.5rem; }
.sf-actions { display: flex; gap: 0.4rem; }
.sf-btn { padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: none; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.sf-btn.resolve { background: rgba(34,197,94,0.15); color: #86efac; }
.sf-btn.dismiss { background: rgba(100,116,139,0.15); color: #94a3b8; }
</style>
