<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref } from 'vue';

import { useReportTemplates } from '../../../composables/useReportTemplates';





const { templates, applyTemplate } = useReportTemplates();
const conclusion = ref('');
const errors = ref('');
const improvements = ref('');

const emit = defineEmits<{
  (e: 'update', data: { conclusion: string; errors: string; improvements: string }): void;
}>();

function onChange() {
  emit('update', { conclusion: conclusion.value, errors: errors.value, improvements: improvements.value });
}

function useTemplate(id: string) {
  const tpl = templates.find(t => t.id === id);
  if (!tpl) return;
  const data = applyTemplate(tpl);
  conclusion.value = data.conclusion;
  errors.value = data.errors;
  improvements.value = data.improvements;
  onChange();
}
</script>

<template>
  <div class="conclusion-panel">
    <div class="panel-header">{{ t('analysis.conclusion') }}</div>
    <div class="tpl-row">
      <span class="tpl-label">{{ t('common.reportTemplates.title', 'قوالب جاهزة') }}:</span>
      <button v-for="tpl in templates" :key="tpl.id" class="tpl-btn" @click="useTemplate(tpl.id)">{{ tpl.label }}</button>
    </div>
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
.tpl-row { display: flex; gap: 0.3rem; flex-wrap: wrap; padding: 0.4rem 0.6rem; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.04); }
.tpl-label { font-size: 0.72rem; color: #64748b; font-weight: 600; }
.tpl-btn { padding: 0.15rem 0.5rem; border-radius: 999px; border: 1px solid rgba(99,102,241,0.2); background: rgba(99,102,241,0.06); color: #a5b4fc; font-size: 0.68rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.tpl-btn:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); }
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
