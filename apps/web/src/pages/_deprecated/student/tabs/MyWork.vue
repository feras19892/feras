<template>
  <div class="dash-page">
    <MyWorkReports
      :reports="store.reports"
      :loading="store.loading"
      :error="store.error"
      @create="showCreateModal = true"
      @view="viewReport"
      @retry="load"
    />

    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h3>{{ t('dashboard.dashNew.createNewReport') }}</h3>
        <div class="form-group"><label>{{ t('dashboard.dashNew.classLabel') }}</label>
          <select v-model="newReport.classId" class="form-input">
            <option value="" disabled selected>{{ t('dashboard.dashNew.selectClass') }}</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.experimentName') }}</label><input v-model="newReport.experimentName" class="form-input" /></div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.experimentType') }}</label><input v-model="newReport.experimentType" class="form-input" :placeholder="t('dashboard.dashNew.experimentExample')" /></div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.readingsJson') }}</label><textarea v-model="newReport.readings" class="form-input" rows="3" placeholder="[]"></textarea></div>
        <div class="form-group"><label>{{ t('dashboard.dashNew.conclusion') }}</label><textarea v-model="newReport.conclusion" class="form-input" rows="2"></textarea></div>
        <div class="modal-actions">
          <button @click="handleCreateReport" class="btn-sm btn-success" :disabled="creating || classes.length === 0">{{ creating ? '...' : t('dashboard.dashNew.create') }}</button>
          <button @click="showCreateModal = false" class="btn-sm btn-warn">{{ t('dashboard.dashNew.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- تفاصيل التقرير -->
    <DetailDrawer :open="detailOpen" :title="detailReport?.experiment_name || t('dashboard.dashNew.reportDetails')" @close="detailOpen = false">
      <div v-if="detailLoading" class="loading-text">{{ t('dashboard.dashNew.loadingContent') }}</div>
      <div v-else-if="detailReport" class="detail-content">
        <div class="detail-row"><span class="detail-label">{{ t('dashboard.dashNew.status') }}</span><span :class="['status-badge', detailReport.status]">{{ statusLabel(detailReport.status) }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('dashboard.dashNew.grade2') }}</span><span>{{ detailReport.grade ?? '—' }}/100</span></div>
        <div v-if="detailReport.grade !== null && detailReport.grade !== undefined" class="detail-section">
          <h4>{{ t('dashboard.dashNew.gradeDetails') }}</h4>
          <p>{{ t('dashboard.dashNew.gradeAccuracy') }}: {{ detailReport.grade_accuracy ?? 0 }}/25</p>
          <p>{{ t('dashboard.dashNew.gradePresentation') }}: {{ detailReport.grade_presentation ?? 0 }}/25</p>
          <p>{{ t('dashboard.dashNew.gradeConclusion') }}: {{ detailReport.grade_conclusion ?? 0 }}/25</p>
          <p>{{ t('dashboard.dashNew.gradeInnovation') }}: {{ detailReport.grade_innovation ?? 0 }}/25</p>
        </div>
        <div class="detail-row"><span class="detail-label">{{ t('dashboard.dashNew.classLabel') }}</span><span>{{ detailReport.class_name || '—' }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('dashboard.dashNew.creationDate') }}</span><span>{{ formatDate(detailReport.created_at) }}</span></div>
        <div v-if="detailReport.submitted_at" class="detail-row"><span class="detail-label">{{ t('dashboard.dashNew.submissionDate') }}</span><span>{{ formatDate(detailReport.submitted_at) }}</span></div>
        <div v-if="detailReport.feedback" class="detail-section">
          <h4>{{ t('dashboard.dashNew.teacherFeedback') }}</h4>
          <p>{{ detailReport.feedback }}</p>
        </div>
        <div v-if="detailReport.conclusion" class="detail-section">
          <h4>{{ t('dashboard.dashNew.conclusion') }}</h4>
          <p>{{ detailReport.conclusion }}</p>
        </div>
        <div v-if="detailReport.readings" class="detail-section">
          <h4>{{ t('dashboard.dashNew.readings') }}</h4>
          <pre class="readings-pre">{{ detailReport.readings }}</pre>
        </div>
        <div class="modal-actions">
          <button v-if="detailReport.status === 'draft'" class="btn-sm btn-danger" @click="requestDelete(detailReport)">{{ t('dashboard.dashNew.delete') }}</button>
          <button v-if="detailReport.status === 'graded' && detailReport.allow_resubmit" class="btn-sm btn-warn" @click="requestResubmit(detailReport)">{{ t('dashboard.dashNew.resubmit') }}</button>
        </div>
      </div>
    </DetailDrawer>

    <!-- تأكيد حذف مسودة -->
    <ConfirmModal
      :open="deleteTarget !== null"
      icon="🗑️"
      :title="t('dashboard.dashNew.confirmDeleteReportTitle')"
      :message="deleteTarget ? t('dashboard.dashNew.confirmDeleteReportMsg', { name: deleteTarget.experiment_name }) : ''"
      :confirm-label="t('dashboard.dashNew.delete')"
      :cancel-label="t('dashboard.dashNew.cancel')"
      variant="danger"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <!-- تأكيد إعادة إرسال -->
    <ConfirmModal
      :open="resubmitTarget !== null"
      icon="🔄"
      :title="t('dashboard.dashNew.confirmResubmitTitle')"
      :message="resubmitTarget ? t('dashboard.dashNew.confirmResubmitMsg', { name: resubmitTarget.experiment_name }) : ''"
      :confirm-label="t('dashboard.dashNew.resubmit')"
      :cancel-label="t('dashboard.dashNew.cancel')"
      variant="warning"
      :loading="resubmitLoading"
      @confirm="confirmResubmit"
      @cancel="resubmitTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, onMounted, computed } from 'vue'
import { useStudentStore } from '@/stores/student.store'
import MyWorkReports from './MyWorkReports.vue'
import DetailDrawer from '@/components/shared/DetailDrawer.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import { useToast } from '@/composables/useToast'
import { createReport, deleteReport, getReport, resubmitReport } from '@/services/report.service'
import { statusLabel } from '@/composables/shared/useLabels'

import { useI18nStore } from '@/stores/i18n.store'





const i18nStore = useI18nStore()
const store = useStudentStore()
const toast = useToast()
const showCreateModal = ref(false)
const creating = ref(false)
const classes = computed(() => store.classes)
const newReport = ref({ classId: '', experimentName: '', experimentType: 'physics', readings: '[]', conclusion: '' })
const detailOpen = ref(false)
const detailReport = ref<any | null>(null)
const detailLoading = ref(false)
const deleteTarget = ref<any | null>(null)
const deleteLoading = ref(false)
const resubmitTarget = ref<any | null>(null)
const resubmitLoading = ref(false)

function formatDate(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString(i18nStore.locale) : '—'
}

async function viewReport(id: number) {
  detailOpen.value = true
  detailLoading.value = true
  detailReport.value = null
  try {
    const res = await getReport(id)
    if (res.success) detailReport.value = res.report
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.reportLoadFailed'))
    detailOpen.value = false
  } finally { detailLoading.value = false }
}

function requestDelete(report: any) {
  deleteTarget.value = report
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  if (deleteLoading.value) return
  deleteLoading.value = true
  try {
    await deleteReport(deleteTarget.value.id)
    toast.success(t('dashboard.dashNew.deletedSuccessfully'))
    deleteTarget.value = null
    detailOpen.value = false
    await store.fetchReports(true)
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.deleteFailed3'))
  } finally { deleteLoading.value = false }
}

function requestResubmit(report: any) {
  resubmitTarget.value = report
}

async function confirmResubmit() {
  if (!resubmitTarget.value) return
  if (resubmitLoading.value) return
  resubmitLoading.value = true
  try {
    await resubmitReport(resubmitTarget.value.id, {
      class_id: resubmitTarget.value.class_id || '',
      experiment_type: resubmitTarget.value.experiment_type || 'physics',
      experiment_name: resubmitTarget.value.experiment_name,
      readings: resubmitTarget.value.readings || '{}',
      conclusion: resubmitTarget.value.conclusion || '',
    })
    toast.success(t('dashboard.dashNew.resubmittedSuccessfully'))
    resubmitTarget.value = null
    detailOpen.value = false
    await store.fetchReports(true)
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.resubmitFailed'))
  } finally { resubmitLoading.value = false }
}

async function load() {
  await store.fetchReports(true)
}

async function handleCreateReport() {
  if (!newReport.value.classId || !newReport.value.experimentName) return
  try { JSON.parse(newReport.value.readings) } catch { toast.error(t('dashboard.dashNew.invalidJson')); return }
  creating.value = true
  try {
    await createReport({
      class_id: newReport.value.classId,
      experiment_type: newReport.value.experimentType,
      experiment_name: newReport.value.experimentName,
      readings: newReport.value.readings,
      conclusion: newReport.value.conclusion,
    })
    toast.success(t('dashboard.dashNew.createdSuccessfully'))
    showCreateModal.value = false
    newReport.value = { classId: '', experimentName: '', experimentType: 'physics', readings: '{}', conclusion: '' }
    await store.fetchReports(true)
  } catch (e: any) {
    toast.error(e?.message || t('dashboard.dashNew.createFailed'))
  } finally { creating.value = false }
}

onMounted(async () => {
  await store.fetchReports()
  await store.fetchClasses()
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.status-badge.draft { background: rgba(107,114,128,0.2); color: #9ca3af; }
.status-badge.submitted { background: rgba(245,158,11,0.2); color: #fbbf24; }
.status-badge.graded { background: rgba(16,185,129,0.2); color: #34d399; }
.status-badge.resubmitted { background: rgba(59,130,246,0.2); color: #60a5fa; }

.loading-text { text-align: center; padding: 40px; color: #94a3b8; }
.detail-content { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155; font-size: 14px; color: #e2e8f0; }
.detail-label { color: #94a3b8; font-weight: 500; }
.detail-section { margin-top: 12px; }
.detail-section h4 { margin: 0 0 8px; font-size: 14px; color: #e2e8f0; }
.detail-section p { margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.6; }
.readings-pre {
  background: #0f172a; padding: 12px; border-radius: 8px; font-size: 12px;
  overflow-x: auto; white-space: pre-wrap; word-break: break-word; color: #cbd5e1;
}
</style>
