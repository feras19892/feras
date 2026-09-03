<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import LabStatsPanel from './LabStatsPanel.vue';
import GuidePanel from './GuidePanel.vue';
import LabAssistant from './LabAssistant.vue';
import ExperimentStepsPanel from './ExperimentStepsPanel.vue';
import type { ExperimentDefinition } from '../../../composables/chemistry/experiments';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../../composables/chemistry/chemLabTypes';

const props = defineProps<{
  selectedItem: LabItem | null;
  selectedState: ToolState | null;
  activeExperiment: ExperimentDefinition | null;
  stepCompletion: boolean[];
}>();

const emit = defineEmits<{
  selectExperiment: [];
  openTheory: [];
  clearExperiment: [];
  resetLab: [];
  showReport: [];
  goBack: [];
}>();
</script>

<template>
  <aside class="panel panel-right">
    <div class="panel-header">
      <span>{{ t('chemistryLab.infoPanel') }}</span>
      <div class="header-buttons">
        <button class="back-btn" @click="emit('goBack')" :title="t('experiments.back')">
          ← {{ t('experiments.back') }}
        </button>
        <button class="reset-btn" @click="emit('resetLab')" :title="t('chemistryLab.resetLab')">
          {{ t('chemistryLab.reset') }}
        </button>
      </div>
    </div>
    <LabStatsPanel :item="selectedItem" />
    <GuidePanel :experiment="activeExperiment" @select-experiment="emit('selectExperiment')" @open-theory="emit('openTheory')" />
    <LabAssistant />
    <ExperimentStepsPanel :experiment="activeExperiment" :step-completion="stepCompletion" @clear="emit('clearExperiment')" @show-report="emit('showReport')" />
  </aside>
</template>

<style scoped>
.panel-right {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  gap: 0.75rem;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}
.header-buttons {
  display: flex;
  gap: 0.4rem;
}
.back-btn {
  padding: 0.35rem 0.7rem; border-radius: 0.4rem;
  border: 1px solid #cbd5e1; background: rgba(255,255,255,0.9);
  color: #475569; cursor: pointer; font-family: inherit; font-size: 0.7rem;
  transition: all 0.2s;
}
.back-btn:hover { background: #f1f5f9; border-color: #94a3b8; }
.reset-btn {
  padding: 0.35rem 0.7rem; border-radius: 0.4rem;
  border: none; background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff; cursor: pointer; font-family: inherit; font-size: 0.7rem;
  font-weight: 700; transition: all 0.15s;
}
.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239,68,68,0.25);
}
</style>
