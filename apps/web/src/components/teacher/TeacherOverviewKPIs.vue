<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import type { DashboardKPI } from '../../composables/teacher/useTeacherDashboard'


const props = defineProps<{
  kpi: DashboardKPI
}>()

const cards = computed(() => [
  { key: 'classes', icon: '🏫', value: props.kpi.totalClasses, color: '#22c55e', label: 'الفصول' },
  { key: 'students', icon: '🎓', value: props.kpi.totalStudents, color: '#3b82f6', label: 'الطلاب' },
  { key: 'reports', icon: '📄', value: props.kpi.totalReports, color: '#8b5cf6', label: 'التقارير' },
  { key: 'pending', icon: '⏳', value: props.kpi.pendingCount, color: '#f59e0b', label: 'بانتظار التصحيح' },
  { key: 'unopened', icon: '📬', value: props.kpi.unopenedCount, color: '#f87171', label: 'غير مفتوحة' },
  { key: 'overdue', icon: '🚨', value: props.kpi.overdueCount, color: '#ef4444', label: 'متأخرة' },
  { key: 'avg', icon: '⭐', value: `${props.kpi.avgGrade}%`, color: '#14b8a6', label: 'متوسط الدرجات' },
  { key: 'today', icon: '📅', value: props.kpi.gradedToday, color: '#a855f7', label: 'مصححة اليوم' },
])
</script>

<template>
  <div class="kpi-grid">
    <div v-for="c in cards" :key="c.key" class="kpi-card" :style="{ borderTopColor: c.color }">
      <div class="kpi-left">
        <span class="kpi-icon" :style="{ background: c.color + '10', color: c.color }">{{ c.icon }}</span>
      </div>
      <div class="kpi-right">
        <span class="kpi-value" :style="{ color: c.color }">{{ c.value }}</span>
        <span class="kpi-label">{{ c.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.6rem; margin-bottom: 1rem; }
.kpi-card { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; border-top: 3px solid; transition: background 0.12s; }
.kpi-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 1rem; }
.kpi-right { display: flex; flex-direction: column; }
.kpi-value { font-size: 1rem; font-weight: 800; line-height: 1.1; }
.kpi-label { font-size: 0.65rem; color: #64748b; font-weight: 500; }
</style>
