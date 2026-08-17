<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { gradeReport } from '../../services/report.service';
import type { Report } from '../../services/report.service';
import { analyzeReport } from '../../services/ai.service';
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{
  report: Report | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'graded'): void;
}>();

const { t } = useI18n();
const grade = ref(0);
const feedback = ref('');
const gradeAccuracy = ref<number | null>(null);
const gradePresentation = ref<number | null>(null);
const gradeConclusion = ref<number | null>(null);
const gradeInnovation = ref<number | null>(null);
const loading = ref(false);
const aiLoading = ref(false);
const aiError = ref('');
const aiAnalysis = ref('');
const showAiResult = ref(false);

const feedbackTemplates = computed(() => [
  { label: t('teacher.feedbackTplExcellent'), text: t('teacher.feedbackTplExcellentText') },
  { label: t('teacher.feedbackTplGood'), text: t('teacher.feedbackTplGoodText') },
  { label: t('teacher.feedbackTplNeedsWork'), text: t('teacher.feedbackTplNeedsWorkText') },
  { label: t('teacher.feedbackTplMissing'), text: t('teacher.feedbackTplMissingText') },
]);

const hasDims = computed(() =>
  gradeAccuracy.value != null || gradePresentation.value != null || gradeConclusion.value != null || gradeInnovation.value != null
);

const dimSum = computed(() =>
  (gradeAccuracy.value ?? 0) + (gradePresentation.value ?? 0) + (gradeConclusion.value ?? 0) + (gradeInnovation.value ?? 0)
);

function insertTemplate(text: string) {
  feedback.value = feedback.value ? feedback.value + '\n' + text : text;
}

watch(
  () => props.report,
  (r) => {
    if (r) {
      grade.value = r.grade ?? 0;
      feedback.value = r.feedback ?? '';
      gradeAccuracy.value = r.grade_accuracy ?? null;
      gradePresentation.value = r.grade_presentation ?? null;
      gradeConclusion.value = r.grade_conclusion ?? null;
      gradeInnovation.value = r.grade_innovation ?? null;
    }
  },
  { immediate: true }
);

async function aiSuggest() {
  if (!props.report) return;
  aiLoading.value = true;
  aiError.value = '';
  aiAnalysis.value = '';
  showAiResult.value = false;
  try {
    const res = await analyzeReport({
      experiment_name: props.report.experiment_name,
      student_name: props.report.student_name,
      readings: props.report.readings || '',
      columns: props.report.columns || '',
      equations: props.report.equations || '',
      plots: props.report.plots || '',
      conclusion: props.report.conclusion || '',
      chart_snapshot: props.report.chart_snapshot || '',
    });
    if (res.success && res.grade !== undefined) {
      grade.value = res.grade;
      feedback.value = res.analysis;
      aiAnalysis.value = res.analysis;
      showAiResult.value = true;
    } else {
      aiError.value = res.message || t('teacher.aiSuggestFailed');
    }
  } catch (err) {
    aiError.value = err instanceof Error ? err.message : t('teacher.aiSuggestFailed');
  } finally {
    aiLoading.value = false;
  }
}

async function submit() {
  if (!props.report) return;
  loading.value = true;
  try {
    const hasDims = gradeAccuracy.value != null || gradePresentation.value != null || gradeConclusion.value != null || gradeInnovation.value != null;
    const res = await gradeReport(props.report.id, {
      grade: grade.value,
      feedback: feedback.value,
      ...(hasDims ? {
        grade_accuracy: gradeAccuracy.value ?? 0,
        grade_presentation: gradePresentation.value ?? 0,
        grade_conclusion: gradeConclusion.value ?? 0,
        grade_innovation: gradeInnovation.value ?? 0,
      } : {}),
    });
    if (res.success) {
      emit('graded');
      emit('close');
    }
  } catch (err) {
    console.error('grade failed:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="open && report" class="modal-overlay" @click.self="emit('close')">
    <div class="grade-modal">
      <h3>{{ t('teacher.gradeTitle') }} — {{ report.student_name }}</h3>

      <div class="form-row">
        <label>{{ t('teacher.gradeLabel') }}</label>
        <div class="grade-control">
          <input v-model.number="grade" type="range" min="0" max="100" />
          <span class="grade-display">{{ grade }}/100</span>
        </div>
      </div>

      <div class="form-row">
        <label>{{ t('teacher.gradeBreakdown', 'تقييم متعدد الأبعاد (اختياري)') }}</label>
        <div class="grade-dims">
          <div class="dim-item">
            <span class="dim-label">{{ t('teacher.dimAccuracy', 'الدقة') }}</span>
            <input v-model.number="gradeAccuracy" type="number" min="0" max="25" placeholder="0-25" />
          </div>
          <div class="dim-item">
            <span class="dim-label">{{ t('teacher.dimPresentation', 'العرض') }}</span>
            <input v-model.number="gradePresentation" type="number" min="0" max="25" placeholder="0-25" />
          </div>
          <div class="dim-item">
            <span class="dim-label">{{ t('teacher.dimConclusion', 'الاستنتاج') }}</span>
            <input v-model.number="gradeConclusion" type="number" min="0" max="25" placeholder="0-25" />
          </div>
          <div class="dim-item">
            <span class="dim-label">{{ t('teacher.dimInnovation', 'الابتكار') }}</span>
            <input v-model.number="gradeInnovation" type="number" min="0" max="25" placeholder="0-25" />
          </div>
        </div>
        <span v-if="hasDims" class="dim-total">{{ t('teacher.dimTotal', 'المجموع') }}: {{ dimSum }}/100</span>
      </div>

      <div class="ai-section">
        <button class="btn-ai-suggest" :disabled="aiLoading" @click="aiSuggest">
          {{ aiLoading ? '⏳ ...' : '🤖 ' + t('teacher.aiSuggestGrade') }}
        </button>
        <span v-if="aiError" class="ai-error">{{ aiError }}</span>
        <div v-if="showAiResult && aiAnalysis" class="ai-preview">
          <span class="ai-preview-label">{{ t('teacher.aiAnalysisPreview') }}</span>
          <div class="ai-preview-text">{{ aiAnalysis.slice(0, 200) }}{{ aiAnalysis.length > 200 ? '…' : '' }}</div>
        </div>
      </div>

      <div class="form-row">
        <label>{{ t('teacher.feedbackLabel') }}</label>
        <div class="tpl-row">
          <button
            v-for="tpl in feedbackTemplates"
            :key="tpl.label"
            class="tpl-btn"
            @click="insertTemplate(tpl.text)"
          >{{ tpl.label }}</button>
        </div>
        <textarea
          v-model="feedback"
          rows="4"
          :placeholder="t('teacher.feedbackPlaceholder')"
        />
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="emit('close')">{{ t('teacher.cancelBtn') }}</button>
        <button class="btn-submit" :disabled="loading" @click="submit">
          {{ loading ? '...' : t('teacher.saveBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.grade-modal {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.grade-modal h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f1f5f9;
  text-align: center;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.form-row label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}
.grade-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.grade-control input[type='range'] {
  flex: 1;
  accent-color: #4f46e5;
}
.grade-display {
  font-size: 1.1rem;
  font-weight: 700;
  color: #67e8f9;
  min-width: 60px;
  text-align: center;
}
.grade-dims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.dim-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.dim-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
}
.dim-item input {
  padding: 0.35rem 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3);
  color: #e2e8f0;
  font-size: 0.82rem;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.dim-total {
  font-size: 0.78rem;
  color: #67e8f9;
  font-weight: 700;
  margin-top: 0.3rem;
}
.form-row textarea {
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}
.tpl-row { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
.tpl-btn { padding: 0.2rem 0.5rem; border-radius: 999px; border: 1px solid rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); color: #a5b4fc; font-size: 0.68rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.tpl-btn:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); }
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.55rem;
  border-radius: 0.55rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-submit {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: none;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ai-section { display: flex; flex-direction: column; gap: 0.4rem; }
.btn-ai-suggest { padding: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(168,85,247,0.3); background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.1)); color: #c4b5fd; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-ai-suggest:hover:not(:disabled) { background: linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.2)); border-color: rgba(168,85,247,0.5); }
.btn-ai-suggest:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-error { color: #fca5a5; font-size: 0.75rem; }
.ai-preview { background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.15); border-radius: 0.4rem; padding: 0.5rem; }
.ai-preview-label { font-size: 0.7rem; color: #c4b5fd; font-weight: 700; }
.ai-preview-text { font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; line-height: 1.4; }
</style>
