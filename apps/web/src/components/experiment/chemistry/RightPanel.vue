<script setup lang="ts">
import LabStatsPanel from './LabStatsPanel.vue';
import GuidePanel from './GuidePanel.vue';
import LabAssistant from './LabAssistant.vue';
import ExperimentStepsPanel from './ExperimentStepsPanel.vue';
import type { Experiment } from '../../../composables/chemistry/useExperiments';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from './InspectorPanel.vue';

const props = defineProps<{
  selectedItem: LabItem | null;
  selectedState: ToolState | null;
  activeExperiment: Experiment | null;
  stepCompletion: boolean[];
}>();

const emit = defineEmits<{
  selectExperiment: [];
  openTheory: [];
  clearExperiment: [];
  resetLab: [];
  showReport: [];
}>();
</script>

<template>
  <aside class="panel panel-right">
    <div class="panel-header">
      <span>🔬 لوحة المعلومات</span>
      <button class="reset-btn" @click="emit('resetLab')" title="تصفير المختبر">
        🔄 تصفير
      </button>
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
.reset-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  border: none;
  border-radius: 0.4rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239,68,68,0.25);
}
</style>
