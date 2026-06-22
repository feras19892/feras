<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();
const conclusion = ref('');
const errors = ref('');
const improvements = ref('');

const emit = defineEmits<{
  (e: 'update', data: { conclusion: string; errors: string; improvements: string }): void;
}>();

function onChange() {
  emit('update', { conclusion: conclusion.value, errors: errors.value, improvements: improvements.value });
}
</script>

<template>
  <div class="conclusion-panel">
    <div class="panel-header">{{ t('analysis.conclusion') }}</div>
    <div class="form">
      <div class="field">
        <label>{{ t('analysis.mainConclusion') }}</label>
        <textarea v-model="conclusion" @input="onChange" rows="2" :placeholder="t('analysis.conclusionPlaceholder')"></textarea>
      </div>
      <div class="field">
        <label>{{ t('analysis.errorSources') }}</label>
        <textarea v-model="errors" @input="onChange" rows="2" :placeholder="t('analysis.errorSourcesPlaceholder')"></textarea>
      </div>
      <div class="field">
        <label>{{ t('analysis.improvements') }}</label>
        <textarea v-model="improvements" @input="onChange" rows="2" :placeholder="t('analysis.improvementsPlaceholder')"></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conclusion-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.panel-header {
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.95rem;
  color: #67e8f9;
  font-weight: 700;
}
.form { padding: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
label { font-size: 0.82rem; color: #94a3b8; font-weight: 600; }
textarea {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.3rem;
  padding: 0.4rem 0.5rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}
</style>
