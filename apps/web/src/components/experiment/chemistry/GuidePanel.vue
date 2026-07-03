<script setup lang="ts">
import type { Experiment } from '../../../composables/chemistry/useExperiments';
import { useI18n } from '../../../composables/useI18n';
const { t } = useI18n();

const props = defineProps<{
  experiment: Experiment | null;
}>();

const emit = defineEmits<{
  selectExperiment: [];
  openTheory: [];
}>();
</script>

<template>
  <div class="guide-panel">
    <!-- No experiment selected -->
    <template v-if="!experiment">
      <button class="exp-btn" @click="emit('selectExperiment')">
        <span class="exp-btn-icon">🔬</span>
        <span class="exp-btn-label">{{ t('chemistryLab.chooseExperiment') }}</span>
      </button>
      <div class="guide-hint">
        <span>💡</span>
        <p>{{ t('chemistryLab.startJourney') }}</p>
      </div>
    </template>

    <!-- Experiment selected -->
    <template v-else>
      <div class="exp-active-header">
        <span class="exp-active-icon">{{ experiment.icon }}</span>
        <div class="exp-active-info">
          <span class="exp-active-name">{{ t(experiment.nameAr) }}</span>
          <span class="exp-active-desc">{{ t(experiment.description) }}</span>
        </div>
      </div>
      <div class="exp-active-actions">
        <button v-if="experiment.theory" class="theory-btn" @click="emit('openTheory')">
          <span>📖</span>
          <span>{{ t('chemistryLab.theory') }}</span>
        </button>
        <button class="change-btn" @click="emit('selectExperiment')">
          <span>🔄</span>
          <span>{{ t('chemistryLab.changeExperiment') }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.guide-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.exp-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}
.exp-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16,185,129,0.35);
}
.exp-btn-icon { font-size: 1.2rem; }
.exp-btn-label { font-size: 0.85rem; }

.guide-hint {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 0.6rem;
  font-size: 0.7rem;
  color: #0369a1;
}
.guide-hint p { margin: 0; }

.exp-active-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}
.exp-active-icon { font-size: 1.8rem; }
.exp-active-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}
.exp-active-name {
  font-weight: 800;
  font-size: 0.85rem;
  color: #1e293b;
}
.exp-active-desc {
  font-size: 0.7rem;
  color: #64748b;
  line-height: 1.4;
}
.exp-active-actions {
  display: flex;
  gap: 0.4rem;
}
.exp-active-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 0.45rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.15s;
}
.theory-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}
.theory-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}
.change-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.change-btn:hover {
  background: #e2e8f0;
}
</style>
