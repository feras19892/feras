<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { getMyBadges, getLeaderboard, type StudentBadge, type LeaderboardEntry } from '../../services/gamification.service';
import { getMyPenalties, type Penalty } from '../../services/enhancements.service';
import { getMyClasses } from '../../services/class.service';
import { useI18n } from '../../composables/useI18n';

const { t, locale } = useI18n();
const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

const badges = ref<StudentBadge[]>([]);
const penalties = ref<Penalty[]>([]);
const leaderboard = ref<LeaderboardEntry[]>([]);
const myRank = ref<number | null>(null);
const lbError = ref(false);
const loading = ref(false);
const error = ref('');
const activeTab = ref<'badges' | 'penalties' | 'leaderboard'>('badges');
const myClasses = ref<{ id: string; name: string }[]>([]);
const selectedClass = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [b, p, c] = await Promise.all([getMyBadges(), getMyPenalties(), getMyClasses()]);
    if (b.success) badges.value = b.badges;
    if (p.success) penalties.value = p.penalties;
    if (c.success) myClasses.value = c.classes;
    if (myClasses.value.length > 0) {
      selectedClass.value = myClasses.value[0].id;
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('dashboard.dash.quizFailed');
    if (import.meta.env.DEV) console.error('enhancements load failed:', e);
  }
  loading.value = false;
}

async function loadLeaderboard() {
  if (!selectedClass.value) return;
  lbError.value = false;
  try {
    const res = await getLeaderboard(selectedClass.value);
    if (res.success) {
      leaderboard.value = res.leaderboard;
      myRank.value = res.myRank;
    }
  } catch (err) {
    lbError.value = true;
    if (import.meta.env.DEV) console.error('loadLeaderboard failed:', err);
  }
}

watch(selectedClass, () => {
  if (activeTab.value === 'leaderboard') loadLeaderboard();
});

watch(activeTab, (tab) => {
  if (tab === 'leaderboard' && selectedClass.value) loadLeaderboard();
});

onMounted(load);
</script>

<template>
  <div class="enhancements-tab">
    <div class="sub-tabs">
      <button :class="{ active: activeTab === 'badges' }" @click="activeTab = 'badges'">{{ t('dashboard.dash.enhBadges') }}</button>
      <button :class="{ active: activeTab === 'penalties' }" @click="activeTab = 'penalties'">{{ t('dashboard.dash.enhPenalties') }}</button>
      <button :class="{ active: activeTab === 'leaderboard' }" @click="activeTab = 'leaderboard'">{{ t('dashboard.dash.enhLeaderboard') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ t('dashboard.dash.quizLoading') }}</div>
    <div v-else-if="error" class="error-box">❌ {{ error }}</div>

    <!-- Badges -->
    <div v-if="activeTab === 'badges'" class="badges-grid">
      <div v-if="badges.length === 0" class="empty">{{ t('dashboard.dash.enhNoBadges') }}</div>
      <div v-for="b in badges" :key="b.id" class="badge-card">
        <div class="badge-icon">{{ b.icon }}</div>
        <div class="badge-info">
          <h4>{{ b.name }}</h4>
          <p>{{ b.description }}</p>
          <span class="badge-date">{{ new Date(b.awarded_at).toLocaleDateString(dateLocaleStr) }}</span>
          <span v-if="b.awarded_by_name" class="badge-by">{{ t('dashboard.dash.enhTeacher') }}: {{ b.awarded_by_name }}</span>
        </div>
      </div>
    </div>

    <!-- Penalties & Rewards -->
    <div v-if="activeTab === 'penalties'" class="penalties-list">
      <div v-if="penalties.length === 0" class="empty">{{ t('dashboard.dash.enhNoPenalties') }}</div>
      <div v-for="p in penalties" :key="p.id" :class="['penalty-card', p.type, p.status]">
        <div class="penalty-header">
          <span :class="['penalty-type', p.type]">{{ p.type === 'penalty' ? t('dashboard.dash.enhPenalty') : t('dashboard.dash.enhReward') }}</span>
          <span v-if="p.status === 'dismissed'" class="dismissed-badge">{{ t('dashboard.dash.enhDismissed') }}</span>
        </div>
        <p class="penalty-reason">{{ p.reason }}</p>
        <div class="penalty-meta">
          <span>{{ t('dashboard.dash.enhTeacher') }}: {{ p.teacher_name }}</span>
          <span v-if="p.class_name">{{ t('dashboard.dash.enhClass') }}: {{ p.class_name }}</span>
          <span :class="p.type === 'penalty' ? 'penalty-points' : 'reward-points'">{{ p.points > 0 ? '+' : '' }}{{ p.points }} {{ t('dashboard.dash.enhTotalPoints') }}</span>
        </div>
        <span class="penalty-date">{{ new Date(p.created_at).toLocaleDateString(dateLocaleStr) }}</span>
      </div>
    </div>

    <!-- Leaderboard -->
    <div v-if="activeTab === 'leaderboard'" class="leaderboard-section">
      <div class="lb-input-row">
        <select v-model="selectedClass" class="lb-class-select">
          <option value="">{{ t('dashboard.dash.enhSelectClass') }}</option>
          <option v-for="c in myClasses" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div v-if="myRank !== null" class="my-rank">{{ t('dashboard.dash.enhMyRank') }}: {{ myRank }}</div>
      <div v-if="lbError" class="error-retry">
        <span>⚠️ {{ t('dashboard.dash.leaderboardError', 'تعذر تحميل لوحة المتصدرين') }}</span>
        <button @click="loadLeaderboard">🔄 {{ t('common.retry', 'إعادة') }}</button>
      </div>
      <div v-else-if="leaderboard.length > 0" class="lb-list">
        <div v-for="(entry, i) in leaderboard" :key="entry.id" :class="['lb-row', { 'is-me': myRank === i + 1 }]">
          <span :class="['lb-rank', { gold: i === 0, silver: i === 1, bronze: i === 2 }]">{{ i + 1 }}</span>
          <span class="lb-name">{{ entry.name }}</span>
          <span class="lb-avg">{{ t('dashboard.dash.enhAvg') }}: {{ Math.round(entry.avg_grade) }}%</span>
          <span class="lb-reports">{{ t('dashboard.dash.enhReports') }}: {{ entry.report_count }}</span>
          <span class="lb-quiz">{{ t('dashboard.dash.enhQuizzes') }}: {{ entry.quiz_scores }}</span>
          <span class="lb-total">{{ entry.total_points }} {{ t('dashboard.dash.enhTotalPoints') }}</span>
        </div>
      </div>
      <div v-else-if="selectedClass && !loading" class="empty">{{ t('dashboard.dash.enhNoData') }}</div>
    </div>
  </div>
</template>

<style scoped>
.enhancements-tab { color: #e2e8f0; }
.sub-tabs { display: flex; gap: 0.3rem; margin-bottom: 1rem; }
.sub-tabs button { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.5); color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.sub-tabs button.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #c7d2fe; }

.loading, .empty { text-align: center; color: #64748b; padding: 2rem; }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }
.error-retry { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; color: #f87171; font-size: 0.8rem; }
.error-retry button { padding: 0.3rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.1); color: #c7d2fe; cursor: pointer; font-family: inherit; font-size: 0.75rem; }

.badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.8rem; }
.badge-card { display: flex; gap: 0.8rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; }
.badge-icon { font-size: 2rem; flex-shrink: 0; }
.badge-info h4 { margin: 0 0 0.2rem; font-size: 0.9rem; color: #f1f5f9; }
.badge-info p { margin: 0 0 0.3rem; font-size: 0.78rem; color: #94a3b8; }
.badge-date { font-size: 0.7rem; color: #64748b; }
.badge-by { font-size: 0.7rem; color: #a5b4fc; margin-inline-start: 0.5rem; }

.penalties-list { display: flex; flex-direction: column; gap: 0.5rem; }
.penalty-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.8rem; }
.penalty-card.penalty { border-color: rgba(245,158,11,0.15); }
.penalty-card.reward { border-color: rgba(34,197,94,0.15); }
.penalty-card.dismissed { opacity: 0.5; }
.penalty-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
.penalty-type { font-size: 0.75rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 0.3rem; }
.penalty-type.penalty { background: rgba(245,158,11,0.15); color: #fcd34d; }
.penalty-type.reward { background: rgba(34,197,94,0.15); color: #4ade80; }
.dismissed-badge { font-size: 0.7rem; color: #64748b; }
.penalty-reason { font-size: 0.85rem; color: #e2e8f0; margin: 0.2rem 0 0.4rem; }
.penalty-meta { display: flex; gap: 0.8rem; font-size: 0.72rem; color: #64748b; flex-wrap: wrap; }
.penalty-points { color: #fca5a5; font-weight: 700; }
.reward-points { color: #4ade80; font-weight: 700; }
.penalty-date { font-size: 0.68rem; color: #475569; }

.leaderboard-section { }
.lb-input-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.lb-input-row input { flex: 1; padding: 0.5rem 0.7rem; border-radius: 0.4rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.85rem; font-family: inherit; }
.lb-input-row button { padding: 0.5rem 1rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
.my-rank { text-align: center; font-size: 1rem; color: #67e8f9; margin-bottom: 0.8rem; font-weight: 700; }
.lb-list { display: flex; flex-direction: column; gap: 0.3rem; }
.lb-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.7rem; background: rgba(15,23,42,0.5); border-radius: 0.4rem; font-size: 0.8rem; }
.lb-row.is-me { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); }
.lb-rank { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; background: rgba(255,255,255,0.08); color: #94a3b8; flex-shrink: 0; }
.lb-rank.gold { background: rgba(251,191,36,0.2); color: #fcd34d; }
.lb-rank.silver { background: rgba(148,163,184,0.2); color: #cbd5e1; }
.lb-rank.bronze { background: rgba(180,83,9,0.2); color: #fdba74; }
.lb-name { flex: 1; color: #e2e8f0; font-weight: 600; }
.lb-avg, .lb-reports, .lb-quiz { font-size: 0.72rem; color: #64748b; }
.lb-total { font-weight: 700; color: #67e8f9; }
</style>
