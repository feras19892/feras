<script setup lang="ts">
import { experiments as legacyExperiments, type Experiment } from '../../../composables/chemistry/useExperiments';
import { listExperiments as listRegistryExperiments, type ExperimentDefinition } from '../../../composables/chemistry/experiments';
import { useI18n } from '../../../composables/useI18n';
import '../../../composables/chemistry/experiments'; // side-effect: registers all definitions
const { t } = useI18n();

const emit = defineEmits<{ select: [exp: Experiment | ExperimentDefinition]; close: [] }>();

// Merge: registry experiments + legacy experiments (deduped by id)
const registryIds = new Set(listRegistryExperiments().map((e) => e.id));
const mergedExperiments = [
  ...listRegistryExperiments(),
  ...legacyExperiments.filter((e) => !registryIds.has(e.id)),
];

function onSelect(exp: Experiment | ExperimentDefinition) {
  emit('select', exp as Experiment);
}
function onClose() {
  emit('close');
}
</script>

<template>
  <div class="modal-overlay" @click.self="onClose">
    <div class="modal-panel">
      <div class="modal-header">
        <h3>🔬 {{ t('chemistryLab.chooseExperiment') }}</h3>
        <button class="close-btn" @click="onClose">✕</button>
      </div>
      <div class="experiments-grid">
        <div
          v-for="exp in mergedExperiments"
          :key="exp.id"
          class="exp-card"
          @click="onSelect(exp)"
        >
          <div class="exp-icon">{{ exp.icon }}</div>
          <div class="exp-name">{{ t('nameKey' in exp ? exp.nameKey : exp.nameAr) }}</div>
          <div class="exp-desc">{{ t('descKey' in exp ? exp.descKey : exp.description) }}</div>
          <div class="exp-steps-count">{{ exp.steps.length }} {{ t('chemistryLab.steps') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal-panel {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  width: 520px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #334155;
}
.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { background: #e2e8f0; }
.experiments-grid {
  padding: 1.25rem;
  overflow-y: auto;
}
.exp-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.exp-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 16px rgba(16,185,129,0.12);
  transform: translateY(-2px);
}
.exp-icon { font-size: 2rem; line-height: 1; }
.exp-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.exp-desc { font-size: 0.72rem; color: #64748b; line-height: 1.5; }
.exp-steps-count {
  font-size: 0.65rem;
  color: #10b981;
  font-weight: 700;
  background: #ecfdf5;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  align-self: flex-start;
}
</style>
