<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import type { StudentKPI } from '@/composables/student/useStudentDashboard'


const props = defineProps<{ kpi: StudentKPI }>()

const items = computed(() => [
  { icon: '📄', label: 'كل التقارير', value: props.kpi.totalReports, color: '#3b82f6' },
  { icon: '✅', label: 'مصححة', value: props.kpi.gradedCount, color: '#10b981' },
  { icon: '⏳', label: 'معلّقة', value: props.kpi.pendingCount, color: '#f59e0b' },
  { icon: '📝', label: 'مسوّدة', value: props.kpi.draftCount, color: '#64748b' },
  { icon: '📊', label: 'متوسط الدرجات', value: `${props.kpi.avgGrade}%`, color: '#8b5cf6' },
  { icon: '🌟', label: 'أفضل درجة', value: `${props.kpi.bestGrade}%`, color: '#06b6d4' },
  { icon: '🏫', label: 'الفصول', value: props.kpi.totalClasses, color: '#ef4444' },
  { icon: '💬', label: 'تغذية جديدة', value: props.kpi.newFeedback, color: '#f97316' },
])
</script>

<template>
  <div class="kpi-grid">
    <div v-for="item in items" :key="item.label" class="kpi-card" :style="{ borderColor: item.color + '30' }">
      <div class="kpi-top">
        <span class="kpi-icon" :style="{ background: item.color + '18', color: item.color }">{{ item.icon }}</span>
        <span class="kpi-value" :style="{ color: item.color }">{{ item.value }}</span>
      </div>
      <div class="kpi-label">{{ item.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.kpi-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: transform 0.12s, background 0.12s;
}
.kpi-card:hover { background: rgba(255, 255, 255, 0.03); }
.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.kpi-icon {
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.85rem;
}
.kpi-value {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
}
.kpi-label {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
}
</style>
