<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { getAllBadges, awardBadge, removeBadge, getStudentBadges, getLeaderboard, type Badge, type StudentBadge, type LeaderboardEntry } from '../../services/gamification.service';
import { createPenalty, getClassPenalties, dismissPenalty, deletePenalty, type Penalty } from '../../services/enhancements.service';
import { fetchJson } from '../../services/http';
import { useI18n } from '../../composables/useI18n';

const { t, locale } = useI18n();
const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

const props = defineProps<{
  classRows: { id: string; name: string; code: string }[];
}>();

const activeTab = ref<'badges' | 'penalties' | 'leaderboard'>('badges');
const loading = ref(false);

// Badges
const allBadges = ref<Badge[]>([]);
const selectedClass = ref('');
const classStudents = ref<{ id: number; name: string }[]>([]);
const studentBadges = ref<StudentBadge[]>([]);
const selectedStudent = ref<number | null>(null);

// Penalties
const penalties = ref<Penalty[]>([]);

// Leaderboard
const leaderboard = ref<LeaderboardEntry[]>([]);
const myRank = ref<number | null>(null);

async function loadBadges() {
  const res = await getAllBadges();
  if (res.success) allBadges.value = res.badges;
}

async function loadClassStudents() {
  if (!selectedClass.value) return;
  try {
    const data = await fetchJson<{ success: boolean; students: { id: number; name: string }[] }>(`/api/classes/${selectedClass.value}/students`);
    if (data.success) classStudents.value = data.students;
  } catch { /* ignore */ }
}

async function loadStudentBadges(studentId: number) {
  const res = await getStudentBadges(studentId);
  if (res.success) studentBadges.value = res.badges;
}

async function handleAwardBadge(studentId: number, badgeId: number) {
  const res = await awardBadge(studentId, badgeId);
  if (res.success) {
    await loadStudentBadges(studentId);
  }
}

async function handleRemoveBadge(studentId: number, badgeId: number) {
  const res = await removeBadge(studentId, badgeId);
  if (res.success) {
    await loadStudentBadges(studentId);
  }
}

// Penalties
const penaltyForm = ref({ student_id: 0, type: 'penalty' as 'penalty' | 'reward', reason: '', points: 0 });

async function loadPenalties() {
  if (!selectedClass.value) return;
  const res = await getClassPenalties(selectedClass.value);
  if (res.success) penalties.value = res.penalties;
}

async function handleCreatePenalty() {
  if (!penaltyForm.value.student_id || !penaltyForm.value.reason.trim()) return;
  const res = await createPenalty(
    penaltyForm.value.student_id,
    penaltyForm.value.type,
    penaltyForm.value.reason.trim(),
    penaltyForm.value.points,
    selectedClass.value
  );
  if (res.success) {
    penaltyForm.value = { student_id: 0, type: 'penalty', reason: '', points: 0 };
    await loadPenalties();
  }
}

async function handleDismissPenalty(id: number) {
  await dismissPenalty(id);
  await loadPenalties();
}

async function handleDeletePenalty(id: number) {
  await deletePenalty(id);
  await loadPenalties();
}

// Leaderboard
async function loadLeaderboard() {
  if (!selectedClass.value) return;
  const res = await getLeaderboard(selectedClass.value);
  if (res.success) {
    leaderboard.value = res.leaderboard;
    myRank.value = res.myRank;
  }
}

watch(selectedClass, async () => {
  studentBadges.value = [];
  selectedStudent.value = null;
  penalties.value = [];
  leaderboard.value = [];
  await loadClassStudents();
  await loadPenalties();
  await loadLeaderboard();
});

watch(selectedStudent, async (id) => {
  if (id) await loadStudentBadges(id);
});

onMounted(async () => {
  loading.value = true;
  await loadBadges();
  loading.value = false;
});
</script>

<template>
  <div class="enh-tab">
    <!-- Class selector -->
    <div class="class-selector">
      <label>{{ t('dashboard.dash.enhClass') }}:</label>
      <select v-model="selectedClass" class="class-select">
        <option value="">{{ t('dashboard.dash.enhSelectClass') }}</option>
        <option v-for="c in props.classRows" :key="c.id" :value="c.id">{{ c.name }} ({{ c.code }})</option>
      </select>
    </div>

    <div v-if="!selectedClass" class="empty">{{ t('dashboard.dash.enhSelectClass') }}</div>

    <template v-else>
      <div class="sub-tabs">
        <button :class="{ active: activeTab === 'badges' }" @click="activeTab = 'badges'">{{ t('dashboard.dash.enhBadges') }}</button>
        <button :class="{ active: activeTab === 'penalties' }" @click="activeTab = 'penalties'">{{ t('dashboard.dash.enhPenalties') }}</button>
        <button :class="{ active: activeTab === 'leaderboard' }" @click="activeTab = 'leaderboard'">{{ t('dashboard.dash.enhLeaderboard') }}</button>
      </div>

      <div v-if="loading" class="loading">{{ t('dashboard.dash.quizLoading') }}</div>

      <!-- Badges -->
      <div v-if="activeTab === 'badges'" class="badges-section">
        <div class="badge-controls">
          <label>{{ t('dashboard.dash.studentName') }}:</label>
          <select v-model="selectedStudent" class="student-select">
            <option :value="null">{{ t('dashboard.dash.enhSelectClass') }}</option>
            <option v-for="s in classStudents" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div v-if="selectedStudent" class="badges-grid">
          <div class="awarded-section">
            <h4>{{ t('dashboard.dash.enhBadges') }}</h4>
            <div v-if="studentBadges.length === 0" class="empty-small">{{ t('dashboard.dash.enhNoBadges') }}</div>
            <div v-for="b in studentBadges" :key="b.id" class="badge-card">
              <span class="badge-icon">{{ b.icon }}</span>
              <div class="badge-info">
                <strong>{{ b.name }}</strong>
                <p>{{ b.description }}</p>
              </div>
              <button class="btn-mini remove" @click="handleRemoveBadge(selectedStudent, b.badge_id)">{{ t('common.delete') }}</button>
            </div>
          </div>

          <div class="available-section">
            <h4>{{ t('dashboard.dash.enhBadges') }}</h4>
            <div v-for="b in allBadges" :key="b.id" class="badge-card avail">
              <span class="badge-icon">{{ b.icon }}</span>
              <div class="badge-info">
                <strong>{{ b.name }}</strong>
                <p>{{ b.description }}</p>
              </div>
              <button class="btn-mini award" @click="handleAwardBadge(selectedStudent, b.id)">{{ t('common.save') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Penalties -->
      <div v-if="activeTab === 'penalties'" class="penalties-section">
        <div class="penalty-form">
          <h4>{{ t('dashboard.dash.enhPenalties') }}</h4>
          <div class="form-row">
            <select v-model.number="penaltyForm.student_id" class="form-input">
              <option :value="0">{{ t('dashboard.dash.enhSelectClass') }}</option>
              <option v-for="s in classStudents" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <select v-model="penaltyForm.type" class="form-input">
              <option value="penalty">{{ t('dashboard.dash.enhPenalty') }}</option>
              <option value="reward">{{ t('dashboard.dash.enhReward') }}</option>
            </select>
            <input v-model.number="penaltyForm.points" type="number" :placeholder="t('dashboard.dash.enhTotalPoints')" class="form-input narrow" />
          </div>
          <input v-model="penaltyForm.reason" :placeholder="t('dashboard.dash.enhPenalty')" class="form-input" />
          <button class="btn-submit" :disabled="!penaltyForm.student_id || !penaltyForm.reason.trim()" @click="handleCreatePenalty">{{ t('common.save') }}</button>
        </div>

        <div class="penalties-list">
          <h4>{{ t('dashboard.dash.enhPenalties') }}</h4>
          <div v-if="penalties.length === 0" class="empty-small">{{ t('dashboard.dash.enhNoPenalties') }}</div>
          <div v-for="p in penalties" :key="p.id" :class="['penalty-card', p.type, p.status]">
            <div class="penalty-header">
              <span :class="['type-tag', p.type]">{{ p.type === 'penalty' ? t('dashboard.dash.enhPenalty') : t('dashboard.dash.enhReward') }}</span>
              <span class="penalty-student">{{ p.student_name }}</span>
              <span :class="p.type === 'penalty' ? 'penalty-points' : 'reward-points'">{{ p.points > 0 ? '+' : '' }}{{ p.points }} {{ t('dashboard.dash.enhTotalPoints') }}</span>
            </div>
            <p class="penalty-reason">{{ p.reason }}</p>
            <div class="penalty-actions">
              <span class="penalty-date">{{ new Date(p.created_at).toLocaleDateString(dateLocaleStr) }}</span>
              <button v-if="p.status === 'active'" class="btn-mini" @click="handleDismissPenalty(p.id)">{{ t('dashboard.dash.enhDismissed') }}</button>
              <button class="btn-mini delete" @click="handleDeletePenalty(p.id)">{{ t('common.delete') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div v-if="activeTab === 'leaderboard'" class="leaderboard-section">
        <div v-if="myRank !== null" class="my-rank">{{ t('dashboard.dash.enhMyRank') }}: {{ myRank }}</div>
        <div v-if="leaderboard.length > 0" class="lb-list">
          <div v-for="(entry, i) in leaderboard" :key="entry.id" :class="['lb-row', { 'is-me': myRank === i + 1 }]">
            <span :class="['lb-rank', { gold: i === 0, silver: i === 1, bronze: i === 2 }]">{{ i + 1 }}</span>
            <span class="lb-name">{{ entry.name }}</span>
            <span class="lb-avg">{{ t('dashboard.dash.enhAvg') }}: {{ Math.round(entry.avg_grade) }}%</span>
            <span class="lb-reports">{{ t('dashboard.dash.enhReports') }}: {{ entry.report_count }}</span>
            <span class="lb-quiz">{{ t('dashboard.dash.enhQuizzes') }}: {{ entry.quiz_scores }}</span>
            <span class="lb-total">{{ entry.total_points }} {{ t('dashboard.dash.enhTotalPoints') }}</span>
          </div>
        </div>
        <div v-else class="empty-small">{{ t('dashboard.dash.enhNoData') }}</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.enh-tab { color: #e2e8f0; }
.class-selector { margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.class-selector label { font-size: 0.85rem; color: #94a3b8; }
.class-select, .student-select {
  padding: 0.4rem 0.7rem; border-radius: 0.4rem; border: 1px solid #334155;
  background: #0f172a; color: #e2e8f0; font-size: 0.85rem; font-family: inherit;
}
.sub-tabs { display: flex; gap: 0.3rem; margin-bottom: 1rem; }
.sub-tabs button { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.5); color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.sub-tabs button.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: #c7d2fe; }

.loading, .empty { text-align: center; color: #64748b; padding: 2rem; }
.empty-small { text-align: center; color: #64748b; padding: 1rem; font-size: 0.82rem; }

.badge-controls { margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.badges-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.awarded-section h4, .available-section h4 { font-size: 0.9rem; margin: 0 0 0.5rem; color: #f1f5f9; }
.badge-card { display: flex; align-items: center; gap: 0.5rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.6rem; margin-bottom: 0.4rem; }
.badge-card.avail { border-style: dashed; }
.badge-icon { font-size: 1.5rem; flex-shrink: 0; }
.badge-info { flex: 1; }
.badge-info strong { font-size: 0.82rem; color: #f1f5f9; }
.badge-info p { margin: 0.1rem 0 0; font-size: 0.72rem; color: #94a3b8; }

.btn-mini { padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); cursor: pointer; font-size: 0.7rem; font-family: inherit; color: #94a3b8; }
.btn-mini.award { color: #4ade80; border-color: rgba(34,197,94,0.2); }
.btn-mini.remove { color: #fca5a5; border-color: rgba(239,68,68,0.2); }
.btn-mini.delete { color: #f87171; }
.btn-mini:hover { opacity: 0.8; }

.penalty-form { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.8rem; margin-bottom: 1rem; }
.penalty-form h4 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #f1f5f9; }
.form-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.form-input { flex: 1; padding: 0.4rem 0.6rem; border-radius: 0.4rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.form-input.narrow { max-width: 80px; }
.btn-submit { margin-top: 0.5rem; padding: 0.4rem 1rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-size: 0.82rem; }
.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.penalties-list h4 { font-size: 0.9rem; margin: 0 0 0.5rem; color: #f1f5f9; }
.penalty-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.6rem; margin-bottom: 0.4rem; }
.penalty-card.penalty { border-color: rgba(245,158,11,0.15); }
.penalty-card.reward { border-color: rgba(34,197,94,0.15); }
.penalty-card.dismissed { opacity: 0.5; }
.penalty-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
.type-tag { font-size: 0.72rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 0.3rem; }
.type-tag.penalty { background: rgba(245,158,11,0.15); color: #fcd34d; }
.type-tag.reward { background: rgba(34,197,94,0.15); color: #4ade80; }
.penalty-student { font-size: 0.82rem; color: #e2e8f0; flex: 1; }
.penalty-points { font-weight: 700; font-size: 0.78rem; }
.penalty-points { color: #fca5a5; }
.reward-points { color: #4ade80; }
.penalty-reason { font-size: 0.82rem; color: #cbd5e1; margin: 0.2rem 0 0.4rem; }
.penalty-actions { display: flex; align-items: center; gap: 0.5rem; }
.penalty-date { font-size: 0.68rem; color: #475569; flex: 1; }

.leaderboard-section { }
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
