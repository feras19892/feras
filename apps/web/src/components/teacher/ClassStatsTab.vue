<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, watch } from 'vue'
import { getClassStats, exportClassReports, downloadGradebook } from '../../services/report.service'
import type { Report } from '../../services/report.service'

import TeacherStatsSummary from './TeacherStatsSummary.vue'
import TeacherStatsCharts from './TeacherStatsCharts.vue'
import TeacherStatsExpTable from './TeacherStatsExpTable.vue'
import TeacherStatsStudentTable from './TeacherStatsStudentTable.vue'
import TeacherStatsComparison from './TeacherStatsComparison.vue'
import TeacherStatsExport from './TeacherStatsExport.vue'





interface StudentStat { id: number; name: string; reports: number; avg: number; lastSubmitted?: string }
interface ExperimentStat { name: string; avg: number; count: number; highest: number; lowest: number }
interface StatsData {
  students: StudentStat[]
  experiments: ExperimentStat[]
  pending: number
  distribution: Record<string, number>
  total: number
  graded: number
  average: number
}

const props = defineProps<{ classId: string }>()

const loading = ref(false)
const stats = ref<StatsData | null>(null)
const comparisonIds = ref<number[]>([])

async function loadStats() {
  if (!props.classId) return
  loading.value = true
  try {
    const res = await getClassStats(props.classId)
    if (res.success) stats.value = res.stats
  } catch (err) {
    console.error('load stats failed:', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.classId, loadStats, { immediate: true })

function exportCsv() {
  if (!stats.value) return
  const rows = stats.value.students.map((s: StudentStat) =>
    `${s.name},${s.reports},${s.avg},${s.lastSubmitted?.slice(0, 10) || ''}`
  )
  const csv = ['Student,Reports,Average Grade,Last Submitted', ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `class_${props.classId}_stats.csv`; a.click()
  URL.revokeObjectURL(url)
}

function exportFullReports() {
  if (!props.classId) return
  exportClassReports(props.classId).then(res => {
    if (!res.success) return
    const headers = 'ID,Student,Experiment,Status,Grade,Submitted\n'
    const rows = res.reports.map((r: Report) =>
      `${r.id},"${r.student_name}","${r.experiment_name}",${r.status},${r.grade || ''},${r.submitted_at?.slice(0, 10) || ''}`
    )
    const csv = headers + rows.join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `class_${props.classId}_reports.csv`; a.click()
    URL.revokeObjectURL(url)
  })
}

const alerts = computed(() => {
  const list: { type: 'warning' | 'info' | 'success'; msg: string }[] = []
  if (!stats.value) return list
  const s = stats.value

  const now = Date.now()
  const week = 7 * 24 * 60 * 60 * 1000
  const inactive = s.students?.filter((st: StudentStat) => {
    if (!st.lastSubmitted) return true
    return now - new Date(st.lastSubmitted).getTime() > week
  }) || []
  if (inactive.length > 0) {
    list.push({ type: 'warning', msg: `${inactive.length} ${t('teacher.alerts.noReportsWeek')}` })
  }

  const lowExp = s.experiments?.filter((e: ExperimentStat) => e.avg > 0 && e.avg < 50) || []
  if (lowExp.length > 0) {
    list.push({ type: 'warning', msg: `${t('teacher.alerts.lowGrade')}: ${lowExp.map((e: ExperimentStat) => e.name).join(', ')}` })
  }

  if (s.pending > 0) {
    list.push({ type: 'info', msg: `${s.pending} ${t('teacher.alerts.pending')}` })
  }

  const top = s.students?.[0]
  if (top && top.avg >= 90) {
    list.push({ type: 'success', msg: `🎉 ${t('teacher.alerts.topStudent')}: ${top.name} (${top.avg}%)` })
  }

  return list
})

const comparedStudents = computed(() => {
  if (!stats.value) return []
  return stats.value.students?.filter((s: StudentStat) => comparisonIds.value.includes(s.id)) || []
})

function toggleCompare(id: number) {
  comparisonIds.value = comparisonIds.value.includes(id)
    ? comparisonIds.value.filter(x => x !== id)
    : [...comparisonIds.value, id]
}
</script>

<template>
  <div class="stats-tab">
    <div v-if="loading" class="st-empty">...</div>
    <template v-else-if="stats">
      <div v-if="alerts.length" class="alerts-bar">
        <div v-for="(a, i) in alerts" :key="i" :class="['alert-chip', a.type]">
          {{ a.msg }}
        </div>
      </div>

      <TeacherStatsSummary
        :total="stats.total"
        :average="stats.average"
        :pending="stats.pending"
        :graded="stats.graded"
      />
      <TeacherStatsCharts :stats="stats" />
      <TeacherStatsExpTable :experiments="stats.experiments" />
      <TeacherStatsStudentTable
        :students="stats.students"
        :comparison-ids="comparisonIds"
        @toggle-compare="toggleCompare"
      />
      <TeacherStatsComparison
        v-if="comparedStudents.length >= 2"
        :students="comparedStudents"
      />
      <TeacherStatsExport @export-csv="exportCsv" @export-full="exportFullReports" @export-gradebook="downloadGradebook(classId)" />
    </template>
    <div v-else class="st-empty">
      <p>{{ t('teacher.noReports') }}</p>
    </div>
  </div>
</template>

<style scoped>
.stats-tab { width: 100%; }

.st-empty { text-align: center; padding: 2rem 1rem; color: #64748b; }

.alerts-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.alert-chip { padding: 0.4rem 0.8rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }
.alert-chip.warning { background: rgba(239, 68, 68, 0.12); color: #f87171; }
.alert-chip.info { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.alert-chip.success { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
</style>
