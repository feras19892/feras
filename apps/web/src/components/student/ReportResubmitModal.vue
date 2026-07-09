<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { resubmitReport } from '../../services/report.service';
import { getMyClasses } from '../../services/class.service';
import type { Report } from '../../services/report.service';
import type { ClassItem } from '../../services/class.service';

const props = defineProps<{
  show: boolean;
  originalReport: Report | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void;
  (e: 'submitted'): void;
}>();

const { t } = useI18n();
const classes = ref<ClassItem[]>([]);
const selectedClassId = ref('');
const readings = ref('');
const conclusion = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

watch(() => props.show, async (val) => {
  if (val && props.originalReport) {
    selectedClassId.value = props.originalReport.class_id;
    try {
      const parsed = JSON.parse(props.originalReport.readings || '[]');
      readings.value = JSON.stringify(parsed, null, 2);
    } catch { readings.value = props.originalReport.readings; }
    conclusion.value = props.originalReport.conclusion || '';

    const res = await getMyClasses();
    if (res.success) classes.value = res.classes;
  }
});

async function submit() {
  if (!props.originalReport) return;
  loading.value = true; error.value = ''; success.value = '';

  try {
    const res = await resubmitReport(props.originalReport.id, {
      class_id: selectedClassId.value,
      experiment_type: props.originalReport.experiment_type,
      experiment_name: props.originalReport.experiment_name,
      experiment_id: props.originalReport.experiment_id,
      readings: readings.value,
      params: props.originalReport.params,
      student_info: props.originalReport.student_info,
      conclusion: conclusion.value,
      conclusion_errors: props.originalReport.conclusion_errors,
      conclusion_improvements: props.originalReport.conclusion_improvements,
      columns: props.originalReport.columns,
      equations: props.originalReport.equations,
      plots: props.originalReport.plots,
      chart_snapshot: props.originalReport.chart_snapshot,
    });
    if (res.success) {
      success.value = t('dashboard.resubmitSuccess');
      setTimeout(() => { emit('update:show', false); emit('submitted'); }, 1200);
    } else {
      error.value = t('dashboard.submitFailed');
    }
  } catch (err) {
    error.value = t('dashboard.serverConnFailed');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="show && originalReport" class="modal-overlay" @click.self="$emit('update:show', false)">
    <div class="resubmit-modal">
      <h3>{{ t('dashboard.resubmitTitle') }} — {{ originalReport.experiment_name }}</h3>

      <div class="form-row">
        <label>{{ t('dashboard.classes') }}</label>
        <select v-model="selectedClassId">
          <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>
      </div>

      <div class="form-row">
        <label>{{ t('dashboard.readingsJson') }}</label>
        <textarea v-model="readings" rows="5" />
      </div>

      <div class="form-row">
        <label>{{ t('dashboard.conclusionEdits') }}</label>
        <textarea v-model="conclusion" rows="3" :placeholder="t('dashboard.whatChanges')" />
      </div>

      <p v-if="error" class="msg error">{{ error }}</p>
      <p v-if="success" class="msg success">{{ success }}</p>

      <div class="actions">
        <button class="btn-cancel" @click="$emit('update:show', false)">{{ t('dashboard.cancelBtn') }}</button>
        <button class="btn-submit" :disabled="loading" @click="submit">
          {{ loading ? '...' : '↩️ ' + t('dashboard.resubmit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.resubmit-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 1.5rem; width: 90%; max-width: 450px; display: flex; flex-direction: column; gap: 1rem; }
.resubmit-modal h3 { margin: 0; font-size: 1.05rem; color: #f1f5f9; text-align: center; }
.form-row { display: flex; flex-direction: column; gap: 0.3rem; }
.form-row label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
.form-row select, .form-row textarea { padding: 0.6rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.85rem; font-family: inherit; }
.msg { text-align: center; font-size: 0.85rem; margin: 0; }
.msg.error { color: #f87171; }
.msg.success { color: #4ade80; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.btn-cancel, .btn-submit { flex: 1; padding: 0.55rem; border-radius: 0.55rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
