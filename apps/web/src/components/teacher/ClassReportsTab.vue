<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getReports, deleteReport } from '../../services/report.service'
import type { Report } from '../../services/report.service'
import { useI18n } from '../../composables/useI18n'
import GradeModal from './GradeModal.vue'

const router = useRouter()

const props = defineProps<{ classId: string }>()
const { t } = useI18n()

const reports = ref<Report[]>([])
const loading = ref(false)
const statusFilter = ref<'all' | 'pending' | 'graded' | 'resubmitted'>('all')

const stats = computed(() => {
  const total = reports.value.length
  const graded = reports.value.filter(r => r.status === 'graded').length
  const avg = total > 0
    ? Math.round(reports.value.filter(r => r.grade !== undefined).reduce((s, r) => s + (r.grade || 0), 0) / (graded || 1))
    : 0
  return { total, graded, pending: total - graded, avg }
})

const filteredReports = computed(() => {
  if (statusFilter.value === 'all') return reports.value
  return reports.value.filter(r => r.status === statusFilter.value)
})

const gradeOpen = ref(false)
const gradeTarget = ref<Report | null>(null)

function openView(r: Report) {
  router.push(`/report/${r.id}`)
}

function openGrade(r: Report) {
  gradeTarget.value = r
  gradeOpen.value = true
}

function onGraded() {
  loadReports()
}

async function confirmDelete(r: Report) {
  if (!confirm(t('teacher.deleteConfirm') + ` "${r.experiment_name}" — ${r.student_name}?`)) return
  try {
    const res = await deleteReport(r.id)
    if (res.success) loadReports()
  } catch (err) { console.error('delete failed:', err) }
}

async function loadReports() {
  if (!props.classId) return
  loading.value = true
  try {
    const res = await getReports({ class_id: props.classId })
    if (res.success) reports.value = res.reports
  } catch (err) { console.error('load reports failed:', err) }
  finally { loading.value = false }
}

watch(() => props.classId, loadReports, { immediate: true })
</script>

<template>
  <div class="reports-tab">
    <div class="reports-stats-bar">
      <div class="rs-stat"><span class="rs-val">{{ stats.total }}</span><span class="rs-lab">{{ t('teacher.reportsStat') }}</span></div>
      <div class="rs-stat"><span class="rs-val">{{ stats.graded }}</span><span class="rs-lab">{{ t('teacher.graded') }}</span></div>
      <div class="rs-stat"><span class="rs-val">{{ stats.pending }}</span><span class="rs-lab">{{ t('teacher.pendingStat') }}</span></div>
      <div class="rs-stat"><span class="rs-val">{{ stats.avg }}%</span><span class="rs-lab">{{ t('teacher.avgStat') }}</span></div>
    </div>

    <div v-if="loading" class="rt-empty">...</div>
    <div v-else-if="reports.length === 0" class="rt-empty"><p>{{ t('teacher.noReports') }}</p></div>
    <div v-else>
      <div class="filter-row">
        <button v-for="f in ['all','pending','graded','resubmitted']" :key="f" :class="['pill', { active: statusFilter === f }]" @click="statusFilter = f as 'all' | 'pending' | 'graded' | 'resubmitted'">
          {{ f === 'all' ? t('teacher.filterAll') : f === 'pending' ? t('teacher.filterPending') : f === 'graded' ? t('teacher.filterGraded') : t('teacher.filterResubmitted') }}
        </button>
      </div>

      <div class="report-list">
        <div v-for="r in filteredReports" :key="r.id" class="report-row" :class="{ graded: r.status === 'graded' }" @click="openView(r)">
          <div class="report-info">
            <span class="report-student">{{ r.student_name }}</span>
            <span class="report-exp">{{ r.experiment_name }}</span>
            <span class="report-date">{{ r.submitted_at?.slice(0, 10) }}</span>
          </div>
          <div class="report-status">
            <span v-if="r.status === 'graded'" class="badge graded">{{ r.grade }}/100</span>
            <span v-else class="badge pending">{{ t('teacher.pendingStatus') }}</span>
            <button class="grade-btn" @click.stop="openGrade(r)">{{ r.status === 'graded' ? t('teacher.editBtn') : t('teacher.gradeBtn') }}</button>
            <button class="delete-btn" @click.stop="confirmDelete(r)" :title="t('teacher.deleteBtn')">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <GradeModal :open="gradeOpen" :report="gradeTarget" @close="gradeOpen = false" @graded="onGraded" />
  </div>
</template>

<style scoped>
.reports-tab { width: 100%; }
.reports-stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
.rs-stat { text-align: center; padding: 0.6rem; border-radius: 0.6rem; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); }
.rs-val { display: block; font-size: 1.2rem; font-weight: 800; color: #67e8f9; }
.rs-lab { font-size: 0.72rem; color: #94a3b8; }
.filter-row { display: flex; gap: 0.4rem; margin-bottom: 0.8rem; flex-wrap: wrap; }
.pill { padding: 0.35rem 0.7rem; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.04); color: #94a3b8; cursor: pointer; font-size: 0.78rem; font-weight: 700; transition: all 0.15s; }
.pill.active { background: rgba(99, 102, 241, 0.15); color: #c7d2fe; border-color: rgba(99, 102, 241, 0.25); }
.rt-empty { text-align: center; padding: 2rem 1rem; color: #64748b; }
.report-list { display: flex; flex-direction: column; gap: 0.5rem; }
.report-row { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0.9rem; border-radius: 0.6rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.07); transition: all 0.2s; cursor: pointer; }
.report-row:hover { border-color: rgba(99, 102, 241, 0.25); }
.report-row.graded { border-color: rgba(34, 197, 94, 0.2); }
.report-info { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
.report-student { font-weight: 700; color: #f1f5f9; font-size: 0.88rem; }
.report-exp { color: #94a3b8; font-size: 0.82rem; }
.report-date { color: #64748b; font-size: 0.78rem; }
.report-status { display: flex; align-items: center; gap: 0.5rem; }
.badge { padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.73rem; font-weight: 700; }
.badge.graded { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.badge.pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.grade-btn { padding: 0.3rem 0.7rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
.grade-btn:hover { opacity: 0.9; }
.delete-btn { padding: 0.3rem 0.5rem; border-radius: 0.4rem; border: none; background: rgba(239, 68, 68, 0.15); color: #f87171; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
.delete-btn:hover { background: rgba(239, 68, 68, 0.25); }
</style>
