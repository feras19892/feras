<script setup lang="ts">
import { ref, watch } from 'vue';
import { gradeReport } from '../../services/report.service';
import type { Report } from '../../services/report.service';
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
const loading = ref(false);

watch(
  () => props.report,
  (r) => {
    if (r) {
      grade.value = r.grade ?? 0;
      feedback.value = r.feedback ?? '';
    }
  },
  { immediate: true }
);

async function submit() {
  if (!props.report) return;
  loading.value = true;
  try {
    const res = await gradeReport(props.report.id, { grade: grade.value, feedback: feedback.value });
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
        <label>{{ t('teacher.feedbackLabel') }}</label>
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
</style>
