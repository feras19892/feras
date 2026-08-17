<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { pendingChemicalFill, pendingSolidSelect } from '../../composables/chemistry/useChemistryLab';
import type { LabItem } from '../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../composables/chemistry/chemLabTypes';
import WorkspaceCanvas from '../../components/experiment/chemistry/WorkspaceCanvas.vue';
import LeftPanel from '../../components/experiment/chemistry/LeftPanel.vue';
import RightPanel from '../../components/experiment/chemistry/RightPanel.vue';
import ExperimentSelector from '../../components/experiment/chemistry/ExperimentSelector.vue';
import { type ExperimentDefinition, type TitrationReading, type ResolvedExperimentTheory, validateSteps as validateRegistrySteps } from '../../composables/chemistry/experiments';
import '../../composables/chemistry/experiments';
import { undo, redo, canUndo, canRedo, canMicroUndo, canMicroRedo } from '../../composables/chemistry/useChemistryHistory';
import { useI18n } from '../../composables/useI18n';
import { useChemistryResizing } from '../../composables/chemistry/useChemistryResizing';
import { useChemistryActions, expTheory } from '../../composables/chemistry/useChemistryActions';
import { encourageStep, tipForStep, startIdleMessages, stopIdleMessages } from '../../composables/chemistry/useLabAssistant';
import { clearTitrationReadings } from '../../composables/chemistry/useTitrationRecorder';
import ExperimentTheoryPanel from '../../components/experiment/chemistry/ExperimentTheoryPanel.vue';
import BuretteDisplay from '../../components/experiment/chemistry/BuretteDisplay.vue';
import WorkspaceActionsPanel from '../../components/experiment/chemistry/WorkspaceActionsPanel.vue';
import ChemAnalysisButton from '../../components/experiment/chemistry/ChemAnalysisButton.vue';
import TitrationDataTable from '../../components/experiment/chemistry/TitrationDataTable.vue';
import TitrationCurveChart from '../../components/experiment/chemistry/TitrationCurveChart.vue';
import ChemReportModal from '../../components/experiment/chemistry/ChemReportModal.vue';
import OnboardingOverlay from '../../components/experiment/chemistry/OnboardingOverlay.vue';
import { buretteWarning } from '../../composables/chemistry/useLabSimulation';

const { t } = useI18n();
const router = useRouter();
const { leftWidth, rightWidth, onLeftDown, onRightDown } = useChemistryResizing();
const activeTab = ref('glassware');
const showExperimentSelector = ref(false);
const activeExperiment = ref<ExperimentDefinition | null>(null);
const selectedItem = ref<LabItem | null>(null);
const showTheoryPanel = ref(false);
const titrationReadings = ref<TitrationReading[]>([]);
const selectedState = ref<ToolState | null>(null);
const canvasRef = ref<InstanceType<typeof WorkspaceCanvas> | null>(null);

const {
  showReport, reportData, reportFields, reportTemplate,
  buretteConsumption, showReportManual, addManualReading,
  restartExperiment, onChemicalClick,
} = useChemistryActions(activeExperiment, titrationReadings, selectedItem, selectedState, canvasRef as any);

const stepCompletion = computed(() => {
  if (!activeExperiment.value) return [];
  return validateRegistrySteps(activeExperiment.value);
});

const resolvedTheory = computed<ResolvedExperimentTheory | null>(() => {
  if (!showTheoryPanel.value || !activeExperiment.value?.theory) return null;
  return expTheory(activeExperiment.value, t) as ResolvedExperimentTheory | null;
});

watch(stepCompletion, (newVal, oldVal) => {
  if (!activeExperiment.value) return;
  for (let i = 0; i < newVal.length; i++) {
    if (newVal[i] && !oldVal?.[i]) {
      const step = activeExperiment.value.steps[i];
      if (step) { encourageStep(t(step.textKey)); tipForStep(i, activeExperiment.value.id); }
    }
  }
}, { flush: 'post' });

const canUndoNow = computed(() => canUndo());
const canRedoNow = computed(() => canRedo());
const canMicroUndoNow = computed(() => canMicroUndo());
const canMicroRedoNow = computed(() => canMicroRedo());

function onSelect(item: LabItem | null, state: ToolState | null) {
  selectedItem.value = item; selectedState.value = state;
}

function onSelectExperiment(exp: ExperimentDefinition) {
  activeExperiment.value = exp;
  titrationReadings.value = [];
  clearTitrationReadings();
  showExperimentSelector.value = false;
}

const expandedSections = ref<Record<string, boolean>>({
  containers: true, measuring: true, devices: true, helpers: true,
  liquids: true, solids: true, indicators: true,
});

watch(pendingChemicalFill, (val) => {
  if (val) { activeTab.value = 'chemicals'; expandedSections.value.liquids = true; expandedSections.value.solids = true; expandedSections.value.indicators = true; }
});

watch(pendingSolidSelect, (val) => {
  if (val) { activeTab.value = 'chemicals'; expandedSections.value.solids = true; }
});

onMounted(() => startIdleMessages());
onUnmounted(() => stopIdleMessages());
</script>

<template>
  <div class="chemistry-landing" :style="{ gridTemplateColumns: `${leftWidth}px 6px 1fr 6px ${rightWidth}px`, '--left-width': `${leftWidth}px` }">
    <LeftPanel v-model:active-tab="activeTab" @chemical-click="onChemicalClick" />
    <div class="resizer resizer-left" @mousedown="onLeftDown" @touchstart="onLeftDown" />
    <!-- Burette Data Display (top-left of workspace) -->
    <BuretteDisplay
      :remaining="buretteConsumption.initial - buretteConsumption.current"
      :initial="buretteConsumption.initial"
      :total-consumed="buretteConsumption.grandTotal"
      :warning="buretteWarning"
    />
    <!-- Undo/Redo buttons (bottom-left of workspace) -->
    <WorkspaceActionsPanel
      :can-undo="canUndoNow"
      :can-redo="canRedoNow"
      :can-step-undo="canMicroUndoNow"
      :can-step-redo="canMicroRedoNow"
      @undo="undo()"
      @redo="redo()"
      @step-undo="canvasRef?.stepUndo()"
      @step-redo="canvasRef?.stepRedo()"
    />
    <WorkspaceCanvas ref="canvasRef" @select="onSelect" />
    <div class="resizer resizer-right" @mousedown="onRightDown" @touchstart="onRightDown" />
    <RightPanel
      :selected-item="selectedItem"
      :selected-state="selectedState"
      :active-experiment="activeExperiment"
      :step-completion="stepCompletion"
      @select-experiment="showExperimentSelector = true"
      @open-theory="showTheoryPanel = true"
      @clear-experiment="activeExperiment = null"
      @reset-lab="canvasRef?.resetLab()"
      @show-report="showReportManual"
      @go-back="router.push('/home')"
    />
    <ExperimentSelector
      v-if="showExperimentSelector"
      @select="onSelectExperiment"
      @close="showExperimentSelector = false"
    />
    <ExperimentTheoryPanel
      v-if="showTheoryPanel && activeExperiment?.theory"
      :theory="resolvedTheory"
      @close="showTheoryPanel = false"
    />
    <!-- Titration Data Table (top-right of workspace) -->
    <TitrationDataTable
      v-if="activeExperiment && activeExperiment.id.startsWith('neutralization-')"
      :readings="titrationReadings"
      @add="addManualReading"
    />
    <TitrationCurveChart
      v-if="activeExperiment && activeExperiment.id.startsWith('neutralization-') && titrationReadings.length >= 2"
      :readings="titrationReadings"
      class="titration-chart-pos"
    />
    <!-- Final Report Modal -->
    <ChemReportModal
      v-if="showReport && (reportData || reportTemplate)"
      :data="reportData"
      :fields="reportFields"
      :template="reportTemplate"
      :readings="titrationReadings"
      @close="showReport = false"
      @restart="restartExperiment"
    />
    <ChemAnalysisButton />
    <OnboardingOverlay />
  </div>
</template>

<style src="./chemistry-landing.css" scoped></style>
