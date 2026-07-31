<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
              approverType="teacher"
              :targetUserId="auth.user?.id || 0"
              :targetUserName="auth.user?.name || ''"
              :reportId="report.id"
              :classId="report.class_id"
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

<style scoped>
.report-page { display: flex; min-height: 100vh; background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%); color: #e2e8f0; }
.rp-main { flex: 1; overflow-y: auto; padding: 1.5rem 2rem; max-width: calc(100vw - 320px); }
.rp-section { margin-bottom: 2rem; scroll-margin-top: 1rem; }
.sec-title { font-size: 1rem; font-weight: 700; color: #67e8f9; margin: 0 0 0.8rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(103, 232, 249, 0.15); }

.rp-loading, .rp-error { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.btn { padding: 0.5rem 1.2rem; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 0.5rem; background: rgba(99, 102, 241, 0.1); color: #c7d2fe; cursor: pointer; font-family: inherit; font-size: 0.85rem; }

.grade-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 400; }
.grade-modal { background: rgba(15, 23, 42, 0.97); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 480px; }
.grade-modal h3 { margin: 0 0 1rem; font-size: 1.1rem; color: #e5e7eb; }
.grade-form { display: flex; flex-direction: column; gap: 0.8rem; }
.grade-form label { display: flex; flex-direction: column; gap: 0.3rem; }
.grade-form label span { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
.grade-input { padding: 0.5rem 0.7rem; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.4rem; background: rgba(0, 0, 0, 0.3); color: #e2e8f0; font-size: 1rem; font-family: inherit; }
.feedback-input { padding: 0.5rem 0.7rem; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.4rem; background: rgba(0, 0, 0, 0.3); color: #e2e8f0; font-size: 0.85rem; font-family: inherit; resize: vertical; }
.grade-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
.btn-cancel, .btn-save { padding: 0.5rem 1.2rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; border: none; }
.btn-cancel { background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); }
.btn-save { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; }
.btn-save:disabled { opacity: 0.5; }

@media (max-width: 1024px) { .rp-main { max-width: 100%; padding: 1rem; } .report-page { flex-direction: column; } }

.appeal-box { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 0.6rem; padding: 1rem; }
.appeal-hint { font-size: 0.8rem; color: #94a3b8; margin: 0 0 0.8rem; line-height: 1.5; }

.avatar-upload-box { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; }
.avatar-upload-row { display: flex; align-items: center; gap: 1rem; }
.avatar-preview { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(99,102,241,0.3); flex-shrink: 0; }
.avatar-preview-placeholder { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; flex-shrink: 0; }
.avatar-upload-actions { flex: 1; }
.avatar-upload-btn { padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.1); color: #c7d2fe; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.avatar-upload-btn:hover { background: rgba(99,102,241,0.2); }
.avatar-upload-btn:disabled { opacity: 0.6; cursor: wait; }
.avatar-error { color: #f87171; font-size: 0.78rem; margin: 0.3rem 0 0; }
.avatar-hint { color: #64748b; font-size: 0.72rem; margin: 0.3rem 0 0; }
</style>
