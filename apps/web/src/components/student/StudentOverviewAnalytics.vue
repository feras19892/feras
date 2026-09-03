<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction, locale } = useI18n();
import { computed } from 'vue'
import type { StudentReportRow } from '@/composables/student/useStudentDashboard'


const props = defineProps<{
  rows: StudentReportRow[]
  locale?: string
}>()

const gradeHistory = computed(() => {
  return [...props.rows]
    .filter(r => r.status === 'graded' && r.grade !== null && r.submittedAt)
    .sort((a, b) => new Date(a.submittedAt!).getTime() - new Date(b.submittedAt!).getTime())
    .slice(-10)
    .map(r => r.grade!)
})

const statusCounts = computed(() => {
  const counts: Record<string, number> = { graded: 0, submitted: 0, resubmitted: 0, draft: 0 }
  for (const r of props.rows) {
    if (counts[r.status] !== undefined) counts[r.status]++
    else counts[r.status] = 1
  }
  return counts
})

const maxCount = computed(() => Math.max(1, ...Object.values(statusCounts.value)))

const linePath = computed(() => {
  const data = gradeHistory.value
  if (data.length < 2) return ''
  const w = 280, h = 100, pad = 8
  const step = (w - pad * 2) / (data.length - 1)
  return data.map((v, i) => {
    const x = pad + i * step
    const y = h - pad - ((v / 100) * (h - pad * 2))
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

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
</script>

<template>
  <div class="analytics">
    <div class="panel-card">
      <div class="pc-header"><h3>📈 تطور الدرجات</h3></div>
      <div v-if="gradeHistory.length < 2" class="pc-empty">لا توجد درجات كافية لعرض التطور</div>
      <div v-else class="chart-wrap">
        <svg viewBox="0 0 280 100" preserveAspectRatio="none" class="line-chart">
          <line v-for="(g, i) in [20, 40, 60, 80]" :key="i" x1="0" :y1="g" x2="280" :y2="g" stroke="rgba(148,163,184,0.15)" stroke-width="0.5" />
          <polyline fill="none" :points="linePath" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="(v, i) in gradeHistory" :key="i" :cx="8 + i * ((280 - 16) / (gradeHistory.length - 1))" :cy="100 - 8 - ((v / 100) * 84)" r="3" fill="#8b5cf6" />
        </svg>
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
.chart-wrap { width: 100%; height: 120px; }
.line-chart { width: 100%; height: 100%; }
.bars { display: flex; flex-direction: column; gap: 0.5rem; }
.bar-row { display: grid; grid-template-columns: 90px 1fr 30px; align-items: center; gap: 0.6rem; font-size: 0.78rem; }
.bar-label { color: #94a3b8; font-weight: 600; }
.bar-track { height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s; }
.bar-value { font-weight: 800; text-align: end; }
</style>
