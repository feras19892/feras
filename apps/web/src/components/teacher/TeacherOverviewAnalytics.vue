<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import type { Report } from '../../services/report.service'
import type { ClassRow } from '../../composables/teacher/useTeacherDashboard'


const props = defineProps<{
  allReports: Report[]
  classRows: ClassRow[]
}>()

const statusCounts = computed(() => {
  const counts: Record<string, number> = { graded: 0, submitted: 0, resubmitted: 0, draft: 0 }
  for (const r of props.allReports) {
    if (counts[r.status] !== undefined) counts[r.status]++
    else counts[r.status] = 1
  }
  return counts
})

const maxCount = computed(() => Math.max(1, ...Object.values(statusCounts.value)))

const statusColor: Record<string, string> = {
  graded: '#22c55e',
  submitted: '#f59e0b',
  resubmitted: '#f87171',
  draft: '#64748b',
}

const statusLabel: Record<string, string> = {
  graded: 'مصححة',
  submitted: 'معلّقة',
  resubmitted: 'معاد إرسالها',
  draft: 'مسوّدة',
}

const topClasses = computed(() => {
  return [...props.classRows]
    .filter(c => c.classAverage > 0)
    .sort((a, b) => b.classAverage - a.classAverage)
    .slice(0, 6)
})

const maxAvg = computed(() => Math.max(1, ...topClasses.value.map(c => c.classAverage)))
</script>

<template>
  <div class="analytics">
    <div class="panel-card">
      <div class="pc-header"><h3>🏫 متوسط الدرجات للفصول</h3></div>
      <div v-if="topClasses.length === 0" class="pc-empty">لا توجد بيانات درجات</div>
      <div v-else class="bars">
        <div v-for="c in topClasses" :key="c.id" class="bar-row">
          <span class="bar-label">{{ c.name }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: (c.classAverage / maxAvg * 100) + '%', background: '#14b8a6' }"></div>
          </div>
          <span class="bar-value" style="color:#14b8a6">{{ c.classAverage }}%</span>
        </div>
      </div>
    </div>

    <div class="panel-card">
      <div class="pc-header"><h3>🍩 توزيع حالات التقارير</h3></div>
      <div class="bars">
        <div v-for="(count, status) in statusCounts" :key="status" class="bar-row">
          <span class="bar-label">{{ statusLabel[status] }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: (count / maxCount * 100) + '%', background: statusColor[status] }"></div>
          </div>
          <span class="bar-value" :style="{ color: statusColor[status] }">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics { display: flex; flex-direction: column; gap: 0.8rem; }
.panel-card { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 1rem; }
.pc-header { display: flex; align-items: center; margin-bottom: 0.7rem; }
.pc-header h3 { margin: 0; font-size: 0.85rem; font-weight: 700; color: #e5e7eb; }
.pc-empty { text-align: center; color: #475569; padding: 1rem; font-size: 0.78rem; }
.bars { display: flex; flex-direction: column; gap: 0.5rem; }
.bar-row { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 0.6rem; font-size: 0.78rem; }
.bar-label { color: #94a3b8; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-track { height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s; }
.bar-value { font-weight: 800; text-align: end; font-size: 0.75rem; }
</style>
