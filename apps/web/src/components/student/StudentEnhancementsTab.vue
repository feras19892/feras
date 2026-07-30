<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyBadges, getLeaderboard, type StudentBadge, type LeaderboardEntry } from '../../services/gamification.service';
import { getMyPenalties, type Penalty } from '../../services/enhancements.service';

const badges = ref<StudentBadge[]>([]);
const penalties = ref<Penalty[]>([]);
const leaderboard = ref<LeaderboardEntry[]>([]);
const myRank = ref<number | null>(null);
const loading = ref(false);
const error = ref('');
const activeTab = ref<'badges' | 'penalties' | 'leaderboard'>('badges');
const classIdForLeaderboard = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [b, p] = await Promise.all([getMyBadges(), getMyPenalties()]);
    if (b.success) badges.value = b.badges;
    if (p.success) penalties.value = p.penalties;
  } catch (e: any) {
    error.value = e?.message || 'Failed to load';
  }
  loading.value = false;
}

async function loadLeaderboard() {
  if (!classIdForLeaderboard.value.trim()) return;
  const res = await getLeaderboard(classIdForLeaderboard.value.trim());
  if (res.success) {
    leaderboard.value = res.leaderboard;
    myRank.value = res.myRank;
  }
}

onMounted(load);
</script>

<template>
  <div class="enhancements-tab">
    <div class="sub-tabs">
      <button :class="{ active: activeTab === 'badges' }" @click="activeTab = 'badges'">🏆 الشارات</button>
      <button :class="{ active: activeTab === 'penalties' }" @click="activeTab = 'penalties'">⚠️ العقوبات والمكافآت</button>
      <button :class="{ active: activeTab === 'leaderboard' }" @click="activeTab = 'leaderboard'">📊 لوحة الشرف</button>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="error" class="error-box">❌ {{ error }}</div>

    <!-- Badges -->
    <div v-if="activeTab === 'badges'" class="badges-grid">
      <div v-if="badges.length === 0" class="empty">لا توجد شارات بعد</div>
      <div v-for="b in badges" :key="b.id" class="badge-card">
        <div class="badge-icon">{{ b.icon }}</div>
        <div class="badge-info">
          <h4>{{ b.name }}</h4>
          <p>{{ b.description }}</p>
          <span class="badge-date">{{ new Date(b.awarded_at).toLocaleDateString('ar-SA') }}</span>
          <span v-if="b.awarded_by_name" class="badge-by">من: {{ b.awarded_by_name }}</span>
        </div>
      </div>
    </div>

    <!-- Penalties & Rewards -->
    <div v-if="activeTab === 'penalties'" class="penalties-list">
      <div v-if="penalties.length === 0" class="empty">لا توجد عقوبات أو مكافآت</div>
      <div v-for="p in penalties" :key="p.id" :class="['penalty-card', p.type, p.status]">
        <div class="penalty-header">
          <span :class="['penalty-type', p.type]">{{ p.type === 'penalty' ? '⚠️ عقوبة' : '🎁 مكافأة' }}</span>
          <span v-if="p.status === 'dismissed'" class="dismissed-badge">تم الإلغاء</span>
        </div>
        <p class="penalty-reason">{{ p.reason }}</p>
        <div class="penalty-meta">
          <span>المدرس: {{ p.teacher_name }}</span>
          <span v-if="p.class_name">الفصل: {{ p.class_name }}</span>
          <span :class="p.type === 'penalty' ? 'penalty-points' : 'reward-points'">{{ p.points > 0 ? '+' : '' }}{{ p.points }} نقطة</span>
        </div>
        <span class="penalty-date">{{ new Date(p.created_at).toLocaleDateString('ar-SA') }}</span>
      </div>
    </div>

    <!-- Leaderboard -->
    <div v-if="activeTab === 'leaderboard'" class="leaderboard-section">
      <div class="lb-input-row">
        <input v-model="classIdForLeaderboard" placeholder="أدخل معرف الفصل لعرض الترتيب" />
        <button @click="loadLeaderboard">عرض</button>
      </div>
      <div v-if="myRank !== null" class="my-rank">ترتيبك: {{ myRank }}</div>
      <div v-if="leaderboard.length > 0" class="lb-list">
        <div v-for="(entry, i) in leaderboard" :key="entry.id" :class="['lb-row', { 'is-me': myRank === i + 1 }]">
          <span :class="['lb-rank', { gold: i === 0, silver: i === 1, bronze: i === 2 }]">{{ i + 1 }}</span>
          <span class="lb-name">{{ entry.name }}</span>
          <span class="lb-avg">متوسط: {{ Math.round(entry.avg_grade) }}%</span>
          <span class="lb-reports">تقارير: {{ entry.report_count }}</span>
          <span class="lb-quiz">امتحانات: {{ entry.quiz_scores }}</span>
          <span class="lb-total">{{ entry.total_points }} نقطة</span>
        </div>
      </div>
      <div v-else-if="classIdForLeaderboard && !loading" class="empty">لا توجد بيانات</div>
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
