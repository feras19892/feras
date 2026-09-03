<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue';
import type { ExperimentDefinition } from '../../../composables/chemistry/experiments';

const props = defineProps<{
  experiment: ExperimentDefinition | null;
  stepCompletion: boolean[];
}>();

const emit = defineEmits<{
  clear: [];
  showReport: [];
}>();

const completedCount = computed(() => props.stepCompletion.filter(Boolean).length);
const totalCount = computed(() => props.experiment?.steps.length || 0);
const progressPct = computed(() => totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0);
</script>

<template>
  <div class="right-exp-panel">
    <div v-if="experiment" class="right-exp-content">
      <div class="right-exp-header">
        <span class="right-exp-title">📋 {{ t(experiment.nameKey) }}</span>
        <button class="right-exp-reset" @click="emit('clear')">❌</button>
      </div>
      <div class="progress-bar-wrapper">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressPct + '%' }" />
        </div>
        <span class="progress-bar-label">{{ completedCount }}/{{ totalCount }} ({{ progressPct }}%)</span>
      </div>
      <ol class="right-exp-list">
        <li
          v-for="(step, idx) in experiment.steps"
          :key="step.id"
          :class="[
            'right-exp-step',
            { completed: stepCompletion[idx] },
            { active: !stepCompletion[idx] && (idx === 0 || stepCompletion[idx - 1]) }
          ]"
        >
          <span class="right-exp-num">
            <span v-if="stepCompletion[idx]">✓</span>
            <span v-else>{{ step.id }}</span>
          </span>
          <span class="right-exp-text">{{ t(step.textKey) }}</span>
        </li>
      </ol>
      <button
        v-if="stepCompletion.length > 0 && stepCompletion.every(Boolean)"
        class="show-report-btn"
        @click="emit('showReport')"
      >
        {{ t('chemistryLab.showFinalReport') }}
      </button>
    </div>
    <div v-else class="right-exp-empty">
      <span class="right-exp-empty-icon">📋</span>
      <span>{{ t('chemistryLab.noExperimentChosen') }}</span>
      <span class="right-exp-empty-hint">{{ t('chemistryLab.clickChooseExperiment') }}</span>
    </div>
  </div>
</template>

<style scoped>
.right-exp-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
}
.right-exp-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.right-exp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.5rem;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #a7f3d0;
  border-radius: 0.4rem;
}
.right-exp-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #065f46;
}
.right-exp-reset {
  background: #fff;
  border: 1px solid #6ee7b7;
  border-radius: 0.3rem;
  padding: 0.05rem 0.3rem;
  font-size: 0.6rem;
  cursor: pointer;
  color: #065f46;
}
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;
}
.progress-bar-track {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.progress-bar-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.right-exp-list {
  margin: 0;
  padding-inline-end: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.right-exp-step {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.15s;
}
.right-exp-step.active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  font-weight: 600;
}
.right-exp-step.completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.right-exp-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.05rem;
}
.right-exp-step.completed .right-exp-num {
  background: #22c55e;
  color: #fff;
}
.right-exp-text {
  flex: 1;
  line-height: 1.4;
}
.right-exp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 1.5rem 0;
  color: #94a3b8;
  font-size: 0.8rem;
}
.right-exp-empty-icon { font-size: 2rem; }
.right-exp-empty-hint {
  font-size: 0.7rem;
  color: #cbd5e1;
}
.show-report-btn {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}
.show-report-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}
</style>
