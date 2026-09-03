<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { DashboardKPI } from '../../composables/teacher/useTeacherDashboard'

defineProps<{
  kpi: DashboardKPI
  userName: string
  userEmail: string
}>()

const emit = defineEmits<{
  (e: 'navigate', section: string): void
}>()
</script>

<template>
  <div class="section-panel">
    <div class="panel-card settings-card">
      <h3>{{ t('shared.tdProfile') }}</h3>
      <div class="settings-avatar">{{ userName?.charAt(0)?.toUpperCase() || 'T' }}</div>
      <p class="settings-name">{{ userName }}</p>
      <p class="settings-email">{{ userEmail }}</p>
      <p class="settings-role">{{ t('shared.roleTeacher') }}</p>
    </div>
    <div class="panel-card">
      <div class="pc-header"><h3>{{ t('shared.navOverview') }}</h3></div>
      <div class="settings-kpi-grid">
        <div class="settings-kpi-item"><span class="kpi-icon">🏫</span><span class="kpi-val">{{ kpi.totalClasses }}</span><span class="kpi-lab">{{ t('shared.kpiClasses') }}</span></div>
        <div class="settings-kpi-item"><span class="kpi-icon">🎓</span><span class="kpi-val">{{ kpi.totalStudents }}</span><span class="kpi-lab">{{ t('shared.kpiStudents') }}</span></div>
        <div class="settings-kpi-item"><span class="kpi-icon">📄</span><span class="kpi-val">{{ kpi.totalReports }}</span><span class="kpi-lab">{{ t('shared.kpiReports') }}</span></div>
        <div class="settings-kpi-item"><span class="kpi-icon">⏳</span><span class="kpi-val">{{ kpi.pendingCount }}</span><span class="kpi-lab">{{ t('shared.kpiPendingGrading') }}</span></div>
        <div class="settings-kpi-item"><span class="kpi-icon">📊</span><span class="kpi-val">{{ kpi.avgGrade }}%</span><span class="kpi-lab">{{ t('shared.kpiAvg') }}</span></div>
        <div class="settings-kpi-item"><span class="kpi-icon">📥</span><span class="kpi-val">{{ kpi.submittedToday }}</span><span class="kpi-lab">{{ t('shared.kpiSubmittedToday') }}</span></div>
      </div>
    </div>
    <div class="panel-card">
      <div class="pc-header"><h3>{{ t('shared.navWork') }}</h3></div>
      <div class="settings-actions">
        <button class="settings-action-btn" @click="emit('navigate', 'grading')">✅ {{ t('shared.navGrading') }} ({{ kpi.pendingCount }})</button>
        <button class="settings-action-btn" @click="emit('navigate', 'classes')">🏫 {{ t('shared.navClasses') }} ({{ kpi.totalClasses }})</button>
        <button class="settings-action-btn" @click="emit('navigate', 'students')">🎓 {{ t('shared.navStudents') }}</button>
        <button class="settings-action-btn" @click="emit('navigate', 'stats')">📈 {{ t('shared.navStats') }}</button>
        <button class="settings-action-btn" @click="emit('navigate', 'quizzes')">📝 {{ t('shared.navQuizzes') }}</button>
        <button class="settings-action-btn" @click="emit('navigate', 'enhancements')">🏆 {{ t('shared.navEnhancements') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-card {
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.8rem;
  padding: 1rem;
  margin-bottom: 0.8rem;
}
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }
.settings-card { text-align: center; padding: 2rem; }
.settings-card h3 { margin: 0 0 0.8rem; }
.settings-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 800; color: #fff;
  margin: 0 auto 0.8rem;
}
.settings-name { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0.3rem 0; }
.settings-email { font-size: 0.85rem; color: #94a3b8; margin: 0.2rem 0; }
.settings-role { font-size: 0.78rem; color: #a5b4fc; margin: 0.3rem 0; }
.settings-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.6rem;
}
.settings-kpi-item {
  display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
  padding: 0.6rem 0.4rem; border-radius: 0.6rem;
  background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05);
}
.kpi-icon { font-size: 1rem; }
.kpi-val { font-size: 1.05rem; font-weight: 800; color: #e5e7eb; line-height: 1; }
.kpi-lab { font-size: 0.6rem; color: #64748b; text-align: center; white-space: nowrap; }
.settings-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.6rem;
}
.settings-action-btn {
  padding: 0.7rem 1rem; border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15,23,42,0.5); color: #e2e8f0;
  font-family: inherit; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s; text-align: start;
}
.settings-action-btn:hover {
  border-color: rgba(165,180,252,0.3);
  background: rgba(165,180,252,0.06);
  transform: translateY(-1px);
}
</style>
