<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getReport, getGradeHistory, markReportSeen, markFeedbackSeen, gradeReport } from '../services/report.service'
import type { Report, GradeHistoryEntry } from '../services/report.service'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useReportParser } from '../composables/teacher/useReportParser'
import ReportSidebar from '../components/teacher/ReportSidebar.vue'
import ReportReadingsSection from '../components/teacher/ReportReadingsSection.vue'
import ReportCalculationsSection from '../components/teacher/ReportCalculationsSection.vue'
import ReportConclusionSection from '../components/teacher/ReportConclusionSection.vue'
import ReportAIAnalyzer from '../components/teacher/ReportAIAnalyzer.vue'
import CreateApprovalButton from '../components/shared/CreateApprovalButton.vue'
import { updateAvatar } from '../services/enhancements.service'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

const isTeacher = computed(() => auth.isTeacher || auth.isAdmin)

const report = ref<Report | null>(null)
const history = ref<GradeHistoryEntry[]>([])
const loading = ref(true)
const error = ref(false)
const activeSection = ref('overview')
const gradeOpen = ref(false)
const gradeValue = ref(0)
const feedbackValue = ref('')
const saving = ref(false)
const avatarUploading = ref(false)
const avatarError = ref('')

const parser = useReportParser(report as any)

const fileInput = ref<HTMLInputElement | null>(null)

function triggerAvatarUpload() {
  fileInput.value?.click()
}

async function handleAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    avatarError.value = t('shared.avatarTooLarge')
    return
  }
  avatarUploading.value = true
  avatarError.value = ''
  try {
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const res = await updateAvatar(dataUrl)
      if (res.success) {
        if (report.value) report.value.student_avatar_url = dataUrl
        if (auth.user) auth.user.avatar_url = dataUrl
      } else {
        avatarError.value = res.message || t('shared.avatarUploadFailed')
      }
      avatarUploading.value = false
    }
    reader.onerror = () => {
      avatarError.value = t('shared.avatarReadFailed')
      avatarUploading.value = false
    }
    reader.readAsDataURL(file)
  } catch {
    avatarError.value = t('shared.avatarUploadFailed')
    avatarUploading.value = false
  }
  input.value = ''
}

async function loadReport() {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  error.value = false
  try {
    const res = await getReport(id)
    if (res.success) {
      report.value = res.report
      gradeValue.value = res.report.grade || 0
      feedbackValue.value = res.report.feedback || ''
      if (!res.report.teacher_seen && isTeacher.value) {
        markReportSeen(id).catch(() => {})
        res.report.teacher_seen = true
      }
      if (res.report.feedback && !res.report.feedback_seen && auth.user?.role === 'student') {
        markFeedbackSeen(id).catch(() => {})
        res.report.feedback_seen = true
      }
      loadHistory(id)
    } else { error.value = true }
  } catch { error.value = true }
  loading.value = false
}

async function loadHistory(id: number) {
  try {
    const res = await getGradeHistory(id)
    if (res.success) history.value = res.history
  } catch { /* ignore */ }
}

function scrollTo(id: string) {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function submitGrade() {
  if (!report.value) return
  saving.value = true
  try {
    await gradeReport(report.value.id, { grade: gradeValue.value, feedback: feedbackValue.value })
    report.value.status = 'graded'
    report.value.grade = gradeValue.value
    report.value.feedback = feedbackValue.value
    gradeOpen.value = false
    loadHistory(report.value.id)
  } catch (err) { if (import.meta.env.DEV) console.error('grade failed:', err) }
  saving.value = false
}

onMounted(loadReport)
watch(() => route.params.id, loadReport)
</script>

<template>
  <div class="report-page">
    <div v-if="loading" class="rp-loading">
      <div class="spinner"></div>
      <p>{{ t('report.loading') }}</p>
    </div>

    <div v-else-if="error || !report" class="rp-error">
      <p>❌ {{ t('report.loadError') }}</p>
      <button class="btn" @click="router.back()">{{ t('report.backToReports') }}</button>
    </div>

    <template v-else>
      <ReportSidebar
        :report="report"
        :history="history"
        :active-section="activeSection"
        @scroll-to="scrollTo"
        @grade="gradeOpen = true"
        @back="router.back()"
      />

      <main class="rp-main">
        <!-- Overview -->
        <section id="overview" class="rp-section">
          <ReportConclusionSection :report="report" :student-info="parser.studentInfo.value" :plots="parser.plots.value" />
        </section>

        <!-- Readings -->
        <section id="readings" class="rp-section">
          <ReportReadingsSection :readings="parser.readings.value" :columns="parser.columns.value" :column-stats="parser.columnStats.value" :quality="parser.dataQuality.value" />
        </section>

        <!-- Calculations -->
        <section id="calculations" class="rp-section">
          <ReportCalculationsSection :equations="parser.equations.value" :solved-equations="parser.solvedEquations.value" :regression-data="parser.regressionData.value" :slope-calc-data="parser.slopeCalcData.value" :axes-data="parser.axesData.value" :error-calc-data="parser.errorCalcData.value" />
        </section>

        <!-- Assessment -->
        <section id="ai" class="rp-section">
          <h3 class="sec-title">🎯 {{ t('report.assessment') }}</h3>
          <ReportAIAnalyzer :report="report" />
        </section>

        <!-- Student Grade Appeal -->
        <section v-if="auth.isStudent && report.status === 'graded'" class="rp-section">
          <div class="appeal-box">
            <h3 class="sec-title">📝 {{ t('shared.rvAppealTitle') }}</h3>
            <p class="appeal-hint">{{ t('shared.rvAppealHint') }}</p>
            <CreateApprovalButton
              type="grade_appeal"
              approver-type="teacher"
              :target-user-id="auth.user?.id || 0"
              :target-user-name="auth.user?.name || ''"
              :report-id="report.id"
              :class-id="report.class_id"
            >
              📝 {{ t('shared.rvSubmitAppeal') }}
            </CreateApprovalButton>
          </div>
        </section>

        <!-- Avatar Upload (student only, for their own reports) -->
        <section v-if="auth.isStudent && report.student_id === auth.user?.id" class="rp-section">
          <div class="avatar-upload-box">
            <h3 class="sec-title">📷 صورة البروفايل</h3>
            <div class="avatar-upload-row">
              <img v-if="report.student_avatar_url" :src="report.student_avatar_url" class="avatar-preview" alt="avatar" />
              <div v-else class="avatar-preview-placeholder">{{ (auth.user?.name || '?').charAt(0).toUpperCase() }}</div>
              <div class="avatar-upload-actions">
                <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleAvatarChange" />
                <button class="avatar-upload-btn" :disabled="avatarUploading" @click="triggerAvatarUpload">
                  {{ avatarUploading ? '...' : '📷 إضافة / تغيير الصورة' }}
                </button>
                <p v-if="avatarError" class="avatar-error">{{ avatarError }}</p>
                <p class="avatar-hint">يمكنك رفع صورة بروفايل (JPG, PNG - أقل من 2MB)</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Grade Modal (teacher/admin only) -->
      <div v-if="gradeOpen && isTeacher" class="grade-overlay" @click.self="gradeOpen = false">
        <div class="grade-modal">
          <h3>{{ t('report.gradeReport') }}</h3>
          <div class="grade-form">
            <label>
              <span>{{ t('report.gradeLabel') }}</span>
              <input type="number" v-model="gradeValue" min="0" max="100" class="grade-input" />
            </label>
            <label>
              <span>{{ t('report.feedbackLabel') }}</span>
              <textarea v-model="feedbackValue" class="feedback-input" rows="4" :placeholder="t('report.feedbackPlaceholder')"></textarea>
            </label>
            <div class="grade-actions">
              <button class="btn-cancel" @click="gradeOpen = false">{{ t('report.cancel') }}</button>
              <button class="btn-save" :disabled="saving" @click="submitGrade">{{ saving ? '...' : t('report.save') }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>


<style scoped src='./report-view.css'></style>
