<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, watch } from 'vue'
import { getMyClasses } from '../../services/class.service'
import { createReport } from '../../services/report.service'
import { getStudentQuestions, submitAnswers } from '@/services/experiment-questions.service'
import type { AnswerInput } from '@/services/experiment-questions.service'
import StudentQuestionsModal from '@/components/experiment-questions/StudentQuestionsModal.vue'
import { useAuthStore } from '../../modules/auth/stores/auth'

import type { ClassItem } from '../../services/class.service'





const auth = useAuthStore()

const props = defineProps<{
  show: boolean
  experimentType: string
  experimentName: string
  experimentId?: string
  readings: string
  params?: string
  studentInfo?: string
  conclusion?: string
  columns?: string
  equations?: string
  plots?: string
  chartSnapshot?: string
  solvedEquations?: string
  regressionData?: string
  slopeCalcData?: string
  axesData?: string
  errorCalcData?: string
}>()

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void
  (e: 'submitted'): void
}>()

const classes = ref<ClassItem[]>([])
const selectedClassId = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const showQuestions = ref(false)
const questionTemplateId = ref<number | null>(null)
const answers = ref<AnswerInput[]>([])
const hasQuestions = ref(false)

async function loadClasses() {
  if (!auth.isLoggedIn) {
    error.value = t('experiments.errorLogin')
    return
  }
  try {
    const res = await getMyClasses()
    if (res.success) {
      classes.value = res.classes
      if (res.classes.length > 0) selectedClassId.value = res.classes[0].id
    }
  } catch (err: unknown) {
    console.error('load classes failed:', err)
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('401') || msg.includes('Unauthorized')) {
      error.value = t('experiments.errorSession')
    } else {
      error.value = t('experiments.errorLoadClasses')
    }
  }
}

function safeParse(str: string | undefined) {
  if (!str) return undefined
  try { return JSON.parse(str) } catch { return undefined }
}

function reset() {
  classes.value = []
  selectedClassId.value = ''
  hasQuestions.value = false
  questionTemplateId.value = null
  answers.value = []
  showQuestions.value = false
  error.value = ''
  success.value = ''
  loading.value = false
}

async function loadQuestions() {
  hasQuestions.value = false
  questionTemplateId.value = null
  answers.value = []
  if (!props.experimentId || !selectedClassId.value) return
  try {
    const res = await getStudentQuestions(props.experimentId, selectedClassId.value)
    if (res.success && res.questions && res.questions.length > 0 && res.id) {
      hasQuestions.value = true
      questionTemplateId.value = res.id
    }
  } catch (err) { console.error('[Questions] load failed:', err) }
}

watch(selectedClassId, () => { if (selectedClassId.value && props.experimentId) loadQuestions() })

watch(() => props.experimentId, () => {
  if (props.show && selectedClassId.value) loadQuestions()
})

async function submit() {
  if (!auth.isLoggedIn) { error.value = t('experiments.errorLogin'); return }
  if (!selectedClassId.value) { error.value = t('experiments.errorSelectClass'); return }
  loading.value = true; error.value = ''; success.value = ''

  try {
    const conclusionData = props.conclusion ? JSON.parse(props.conclusion) : { conclusion: '', errors: '', improvements: '' }
    const extra = {
      solved_equations: safeParse(props.solvedEquations),
      regression_data: safeParse(props.regressionData),
      slope_calc_data: safeParse(props.slopeCalcData),
      axes_data: safeParse(props.axesData),
      error_calc_data: safeParse(props.errorCalcData),
    }
    const mergedParams = { ...(props.params ? JSON.parse(props.params) : {}), ...extra }
    const payload = {
      class_id: selectedClassId.value,
      experiment_type: props.experimentType,
      experiment_name: props.experimentName,
      experiment_id: props.experimentId,
      readings: props.readings,
      params: JSON.stringify(mergedParams),
      student_info: props.studentInfo,
      conclusion: conclusionData.conclusion,
      conclusion_errors: conclusionData.errors,
      conclusion_improvements: conclusionData.improvements,
      columns: props.columns,
      equations: props.equations,
      plots: props.plots,
      chart_snapshot: props.chartSnapshot,
      question_template_id: questionTemplateId.value ?? undefined,
    }
    const res = await createReport(payload)
    if (res.success && res.report?.id) {
      if (questionTemplateId.value && answers.value.length) {
        await submitAnswers(res.report.id, answers.value)
      }
      success.value = t('experiments.successSubmit')
      setTimeout(() => { emit('update:show', false); emit('submitted') }, 1200)
    } else {
      error.value = t('experiments.errorSubmit')
    }
  } catch (err: unknown) {
    console.error('[SubmitReport] error:', err)
    error.value = (err instanceof Error ? err.message : '') || t('experiments.errorServer')
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) { reset(); loadClasses() }
})
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('update:show', false)">
    <div class="report-modal">
      <h3>{{ t('experiments.submitReportTitle') }}</h3>

      <div v-if="!auth.isLoggedIn" class="form-row">
        <div class="login-required">
          {{ t('experiments.loginRequired') }}
        </div>
      </div>

      <div v-else class="form-row">
        <label>{{ t('experiments.selectClass') }}</label>
        <select v-model="selectedClassId">
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
        <p v-if="classes.length === 0" class="hint">{{ t('experiments.noClassHint') }}</p>
      </div>

      <div class="form-row">
        <label>{{ t('experiments.experimentLabel') }}</label>
        <p class="readonly">{{ experimentName }}</p>
      </div>

      <div class="form-row">
        <label>{{ t('experiments.readingsCountLabel') }}</label>
        <p class="readonly">{{ safeParse(readings)?.length ?? 0 }} {{ t('experiments.readingUnit') }}</p>
      </div>

      <div class="form-row">
        <label>{{ t('experiments.attachedData') }}</label>
        <div class="tags">
          <span v-if="studentInfo" class="tag">{{ t('experiments.tagStudentInfo') }}</span>
          <span v-if="conclusion" class="tag">{{ t('experiments.tagConclusion') }}</span>
          <span v-if="columns" class="tag">{{ t('experiments.tagColumns') }}</span>
          <span v-if="equations" class="tag">{{ t('experiments.tagEquations') }}</span>
          <span v-if="plots" class="tag">{{ t('experiments.tagPlots') }}</span>
          <span v-if="chartSnapshot" class="tag">{{ t('experiments.tagChartSnapshot') }}</span>
        </div>
      </div>

      <p v-if="error" class="msg error">{{ error }}</p>
      <p v-if="success" class="msg success">{{ success }}</p>

      <div v-if="hasQuestions && !answers.length" class="actions">
        <button class="btn-cancel" @click="$emit('update:show', false)">{{ t('experiments.cancelBtn') }}</button>
        <button class="btn-submit" :disabled="!auth.isLoggedIn || classes.length === 0" @click="showQuestions = true">
          أسئلة التجربة
        </button>
      </div>
      <div v-else class="actions">
        <button class="btn-cancel" @click="$emit('update:show', false)">{{ t('experiments.cancelBtn') }}</button>
        <button class="btn-submit" :disabled="loading || !auth.isLoggedIn || classes.length === 0" @click="submit">
          {{ loading ? '...' : t('experiments.submitBtn') }}
        </button>
      </div>
    </div>
  </div>

  <StudentQuestionsModal
    v-model:show="showQuestions"
    :experiment-id="props.experimentId"
    :class-id="selectedClassId"
    @done="({ templateId, answers: a }) => { questionTemplateId = templateId; answers = a }"
  />
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 300;
}
.report-modal {
  background: rgba(15,23,42,0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 90%; max-width: 400px;
  display: flex; flex-direction: column; gap: 1rem;
}
.report-modal h3 {
  margin: 0; font-size: 1.1rem; color: #f1f5f9; text-align: center;
}
.form-row { display: flex; flex-direction: column; gap: 0.3rem; }
.form-row label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
.form-row select, .readonly {
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3);
  color: #e2e8f0; font-size: 0.9rem;
}
.readonly { margin: 0; }
.hint { font-size: 0.8rem; color: #64748b; margin: 0; }
.msg { text-align: center; font-size: 0.85rem; margin: 0; }
.msg.error { color: #f87171; }
.msg.success { color: #4ade80; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.btn-cancel, .btn-submit { flex: 1; padding: 0.55rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.tag { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.35rem; border: 1px solid rgba(99, 102, 241, 0.2); }
.login-required { background: rgba(239, 68, 68, 0.1); color: #f87171; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-size: 0.9rem; border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
