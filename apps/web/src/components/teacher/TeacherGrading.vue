<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getMyClasses, getPendingCount } from '../../services/class.service'
import { getReports } from '../../services/report.service'
import type { ClassItem } from '../../services/class.service'
import type { Report } from '../../services/report.service'
import { useAuthStore } from '../../modules/auth/stores/auth'

import GradeModal from './GradeModal.vue'
import CreateApprovalButton from '../shared/CreateApprovalButton.vue'
import ReportPreviewModal from '../shared/ReportPreviewModal.vue'
import { useGradingKeyboard, useBulkGrading } from './useGradingHelpers'





const router = useRouter()
const emit = defineEmits<{ graded: [] }>()
const auth = useAuthStore()

const classes = ref<ClassItem[]>([])
const selectedClassId = ref('')
const reports = ref<Report[]>([])
const loading = ref(false)
const pendingCount = ref(0)
const statusFilter = ref<'all' | 'pending' | 'graded' | 'resubmitted'>('all')
const studentSearch = ref('')
const gradeOpen = ref(false)
const gradeTarget = ref<Report | null>(null)
const selectedIds = ref<Set<number>>(new Set())
const previewReportId = ref<number | null>(null)

const stats = computed(() => {
  const total = reports.value.length
  const gradedReports = reports.value.filter(r => r.status === 'graded' && r.grade !== undefined)
  const graded = gradedReports.length
  const avg = graded > 0
    ? Math.round(gradedReports.reduce((s, r) => s + (r.grade || 0), 0) / graded)
    : 0
  return { total, graded, pending: total - graded, avg }
})

const filteredReports = computed(() => {
  let result = reports.value
  if (statusFilter.value !== 'all') result = result.filter(r => r.status === statusFilter.value)
  const q = studentSearch.value.trim().toLowerCase()
  if (q) result = result.filter(r => r.student_name?.toLowerCase().includes(q) || r.experiment_name?.toLowerCase().includes(q))
  return result
})

function openView(r: Report) { router.push(`/report/${r.id}`) }
function openPreview(r: Report) { previewReportId.value = r.id }
function closePreview() { previewReportId.value = null }
function openFullFromPreview(id: number) { closePreview(); router.push(`/report/${id}`) }
function openGrade(r: Report) { gradeTarget.value = r; gradeOpen.value = true }
function onGraded() { loadReports(); emit('graded') }

const { focusedIndex, handleKeydown } = useGradingKeyboard(filteredReports, gradeOpen, previewReportId, openView, openGrade, openPreview)
const { bulkMode, bulkGrade, bulkFeedback, bulkSaving, bulkError, toggleSelect, toggleAll, submitBulkGrade } = useBulkGrading(selectedIds, filteredReports, loadReports, () => emit('graded'))

watch([statusFilter, studentSearch], () => { focusedIndex.value = -1 })

async function loadClasses() {
  try {
    const res = await getMyClasses()
    if (res.success) {
      classes.value = res.classes
      if (res.classes.length > 0) { selectedClassId.value = res.classes[0].id; await loadReports() }
    }
    const p = await getPendingCount()
    if (p.success) pendingCount.value = p.pendingCount
  } catch (err) { if (import.meta.env.DEV) console.error('load classes failed:', err) }
}

async function loadReports() {
  if (!selectedClassId.value) return
  loading.value = true
  try {
    const res = await getReports({ class_id: selectedClassId.value })
    if (res.success) reports.value = res.reports
  } catch (err) { if (import.meta.env.DEV) console.error('load reports failed:', err) }
  finally { loading.value = false }
}

let refreshInterval: ReturnType<typeof setInterval> | null = null
function startAutoRefresh(intervalMs = 30000) {
  stopAutoRefresh()
  refreshInterval = setInterval(async () => {
    if (selectedClassId.value) await loadReports()
    try { const p = await getPendingCount(); if (p.success) pendingCount.value = p.pendingCount } catch { if (import.meta.env.DEV) console.warn('Failed to load pending count') }
  }, intervalMs)
}
function stopAutoRefresh() { if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null } }

onMounted(() => { loadClasses(); startAutoRefresh(); window.addEventListener('keydown', handleKeydown) })
onUnmounted(() => { stopAutoRefresh(); window.removeEventListener('keydown', handleKeydown) })
watch(() => auth.user?.id, (uid) => { if (uid) loadClasses() }, { immediate: false })
</script>

<template>
  <div class="grading-panel">
    <div class="grading-header">
      <div>
        <h2>{{ t('teacher.gradingTitle') }}</h2>
        <span v-if="pendingCount > 0" class="pending-badge">{{ pendingCount }} {{ t('teacher.newReports') }}</span>
      </div>
      <select v-model="selectedClassId" @change="loadReports">
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
    </div>

    <div class="stats-bar">
      <div class="stat">
        <span class="stat-val">{{ stats.total }}</span>
        <span class="stat-label">{{ t('teacher.reportsStat') }}</span>
      </div>
      <div class="stat">
        <span class="stat-val">{{ stats.graded }}</span>
        <span class="stat-label">{{ t('teacher.graded') }}</span>
      </div>
      <div class="stat">
        <span class="stat-val">{{ stats.pending }}</span>
        <span class="stat-label">{{ t('teacher.pendingStat') }}</span>
      </div>
      <div class="stat">
        <span class="stat-val">{{ stats.avg }}%</span>
        <span class="stat-label">{{ t('teacher.avgStat') }}</span>
      </div>
    </div>

    <div v-if="loading" class="empty">...</div>
    <div v-else-if="reports.length === 0" class="empty">
      <p>{{ t('teacher.noReports') }}</p>
    </div>
    <div v-else>
      <div class="kbd-hint">⌨️ ↑↓: تنقل • Enter: فتح • G: تصحيح • P: معاينة</div>
      <div class="filter-row">
        <input v-model="studentSearch" class="student-search" :placeholder="t('teacher.searchStudent')" />
        <button
          v-for="f in ['all','pending','graded','resubmitted']"
          :key="f"
          :class="['pill', { active: statusFilter === f }]"
          @click="statusFilter = f as 'all' | 'pending' | 'graded' | 'resubmitted'"
        >
          {{
            f === 'all' ? t('teacher.filterAll') :
            f === 'pending' ? t('teacher.filterPending') :
            f === 'graded' ? t('teacher.filterGraded') :
            t('teacher.filterResubmitted')
          }}
        </button>
        <button
          :class="['pill', { active: bulkMode }]"
          @click="bulkMode = !bulkMode; selectedIds = new Set()"
          style="margin-inline-start: auto"
        >
          {{ t('teacher.bulkGrade') }}
        </button>
      </div>

      <!-- Bulk grading bar -->
      <div v-if="bulkMode" class="bulk-bar">
        <label class="bulk-check">
          <input type="checkbox" :checked="selectedIds.size === filteredReports.length && filteredReports.length > 0" @change="toggleAll" />
          {{ t('teacher.bulkSelectAll') }}
        </label>
        <span class="bulk-count">{{ selectedIds.size }} {{ t('teacher.bulkSelected') }}</span>
        <input
          v-model.number="bulkGrade"
          type="number"
          min="0"
          max="100"
          :placeholder="t('teacher.bulkGradePlaceholder')"
          class="bulk-input"
          :disabled="selectedIds.size === 0"
        />
        <input
          v-model="bulkFeedback"
          :placeholder="t('teacher.bulkFeedbackPlaceholder')"
          class="bulk-input feedback"
          :disabled="selectedIds.size === 0"
        />
        <button
          @click="submitBulkGrade"
          :disabled="bulkSaving || selectedIds.size === 0 || bulkGrade === null || bulkGrade < 0 || bulkGrade > 100"
          class="bulk-submit"
        >
          {{ bulkSaving ? t('teacher.bulkSaving') : t('teacher.bulkApply') }}
        </button>
        <span v-if="bulkError" class="bulk-error-msg">{{ bulkError }}</span>
      </div>

      <div class="report-list">
        <div v-for="r in filteredReports" :key="r.id" class="report-row" :class="{ graded: r.status === 'graded', selected: selectedIds.has(r.id), focused: focusedIndex === filteredReports.indexOf(r) }" @click="bulkMode ? toggleSelect(r.id) : openView(r)">
          <div class="report-info">
            <input v-if="bulkMode" type="checkbox" :checked="selectedIds.has(r.id)" @click.stop="toggleSelect(r.id)" class="bulk-checkbox" />
            <span class="report-student">{{ r.student_name }}</span>
            <span class="report-exp">{{ r.experiment_name }}</span>
            <span class="report-date">{{ r.submitted_at?.slice(0, 10) }}</span>
          </div>
          <div class="report-status">
            <span v-if="r.status === 'graded'" class="badge graded">{{ r.grade }}/100</span>
            <span v-else class="badge pending">{{ t('teacher.pendingStatus') }}</span>
            <button class="preview-btn" @click.stop="openPreview(r)" :title="t('admin.openReport', 'معاينة')">👁️</button>
            <button class="grade-btn" @click.stop="openGrade(r)">
              {{ r.status === 'graded' ? t('teacher.editBtn') : t('teacher.gradeBtn') }}
            </button>
            <CreateApprovalButton
              type="penalty"
              approver-type="school"
              :target-user-id="r.student_id"
              :target-user-name="r.student_name || ''"
              :class-id="r.class_id || ''"
              :report-id="r.id"
            >
              <button class="penalty-btn" @click.stop>⚠️</button>
            </CreateApprovalButton>
            <CreateApprovalButton
              type="report_deletion"
              approver-type="school"
              :target-user-id="r.student_id"
              :target-user-name="r.student_name || ''"
              :class-id="r.class_id || ''"
              :report-id="r.id"
              :metadata="JSON.stringify({ report_id: r.id, experiment_name: r.experiment_name })"
            >
              <button class="delete-btn" @click.stop :title="t('teacher.deleteBtn')">
                🗑️
              </button>
            </CreateApprovalButton>
          </div>
        </div>
      </div>
    </div>

    <GradeModal
      :open="gradeOpen"
      :report="gradeTarget"
      @close="gradeOpen = false"
      @graded="onGraded"
    />

    <ReportPreviewModal
      :report-id="previewReportId"
      @close="closePreview"
      @open-full="openFullFromPreview"
    />
  </div>
</template>

<style scoped src="./teacher-grading.css"></style>
