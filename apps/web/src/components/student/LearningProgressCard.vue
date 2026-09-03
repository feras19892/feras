<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { onMounted, computed } from 'vue'
import { useLearningProgress } from '../../composables/useLearningProgress'


const { progress, loading, loadProgress } = useLearningProgress()

onMounted(loadProgress)

const levelProgress = computed(() => {
  if (!progress.value) return 0
  const current = progress.value.totalReports % progress.value.nextLevelAt
  const span = progress.value.nextLevelAt - (progress.value.level - 1) * 5
  return Math.min(100, Math.round((current / span) * 100))
})
</script>

<template>
  <div class="progress-card">
    <h3>تقدم التعلم</h3>
    <div v-if="loading" class="loading">...</div>
    <div v-else-if="progress" class="progress-body">
      <div class="level-row">
        <span class="level-badge">المستوى {{ progress.level }}</span>
        <span class="level-next">{{ progress.totalReports }}/{{ progress.nextLevelAt }} تقرير للمستوى التالي</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: levelProgress + '%' }" />
      </div>
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-val">{{ progress.totalReports }}</span>
          <span class="stat-label">إجمالي التقارير</span>
        </div>
        <div class="stat">
          <span class="stat-val">{{ progress.gradedReports }}</span>
          <span class="stat-label">مصححة</span>
        </div>
        <div class="stat">
          <span class="stat-val">{{ progress.pendingReports }}</span>
          <span class="stat-label">قيد الانتظار</span>
        </div>
        <div class="stat">
          <span class="stat-val">{{ progress.averageGrade }}%</span>
          <span class="stat-label">المعدل</span>
        </div>
      </div>
    </div>
    <div v-else class="empty">لا توجد بيانات</div>
  </div>
</template>

<style scoped>
.progress-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}
.progress-card h3 { margin: 0 0 0.75rem; font-size: 1rem; color: #e2e8f0; }
.loading, .empty { color: #64748b; text-align: center; padding: 1rem; }
.level-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.level-badge {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff; font-size: 0.8rem; font-weight: 700;
  padding: 0.2rem 0.6rem; border-radius: 999px;
}
.level-next { font-size: 0.75rem; color: #64748b; }
.progress-bar {
  height: 8px; background: rgba(255,255,255,0.06); border-radius: 999px;
  overflow: hidden; margin-bottom: 0.75rem;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 999px; transition: width 0.5s ease;
}
.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;
}
.stat { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
.stat-val { font-size: 1.1rem; font-weight: 800; color: #67e8f9; }
.stat-label { font-size: 0.7rem; color: #64748b; }
</style>
