<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { pendingChemicalFill, getLiquid, getBurette, selectedChemical, hasSelectedChemicalMap, items, isBurette, buretteTotalConsumedMap, buretteConsumedThisRefill, buretteInitialVolumeMap } from '../../composables/chemistry/useChemistryLab';
import type { Chemical } from '../../composables/chemistry/useChemistryLab';
import type { ToolDef, LabItem } from '../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../components/experiment/chemistry/InspectorPanel.vue';
import WorkspaceCanvas from '../../components/experiment/chemistry/WorkspaceCanvas.vue';
import LeftPanel from '../../components/experiment/chemistry/LeftPanel.vue';
import RightPanel from '../../components/experiment/chemistry/RightPanel.vue';
import GuidePanel from '../../components/experiment/chemistry/GuidePanel.vue';
import ExperimentSelector from '../../components/experiment/chemistry/ExperimentSelector.vue';
import LabStatsPanel from '../../components/experiment/chemistry/LabStatsPanel.vue';
import { experiments, type Experiment, validateExperimentSteps } from '../../composables/chemistry/useExperiments';
import { undo, redo, canUndo, canRedo, canMicroUndo, canMicroRedo } from '../../composables/chemistry/useChemistryHistory';
import { applyIndicator } from '../../composables/chemistry/useReactionEngine';
import { buretteWarning } from '../../composables/chemistry/useLabSimulation';
import ExperimentTheoryPanel from '../../components/experiment/chemistry/ExperimentTheoryPanel.vue';
import LabAssistant from '../../components/experiment/chemistry/LabAssistant.vue';
import BuretteDisplay from '../../components/experiment/chemistry/BuretteDisplay.vue';
import WorkspaceActionsPanel from '../../components/experiment/chemistry/WorkspaceActionsPanel.vue';
import ExperimentStepsPanel from '../../components/experiment/chemistry/ExperimentStepsPanel.vue';
import ChemAnalysisButton from '../../components/experiment/chemistry/ChemAnalysisButton.vue';
import {
  welcomeMessage, warnDangerousChemical, quickFactAbout,
  encourageStep, tipForStep, warnOnAction,
  startIdleMessages, stopIdleMessages
} from '../../composables/chemistry/useLabAssistant';

const leftWidth = ref(280);
const rightWidth = ref(280);
const resizingLeft = ref(false);
const resizingRight = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const activeTab = ref('glassware');
const showExperimentSelector = ref(false);
const activeExperiment = ref<Experiment | null>(null);
const selectedItem = ref<LabItem | null>(null);
const showTheoryPanel = ref(false);

// Auto-check experiment steps against workspace state
const stepCompletion = computed(() => {
  if (!activeExperiment.value) return [];
  return validateExperimentSteps(activeExperiment.value);
});

// ── Lab Assistant watchers ──
let prevStepCompletion: boolean[] = [];

// Watch experiment changes → welcome
watch(activeExperiment, (exp) => {
  if (exp) welcomeMessage(exp.nameAr);
});

// Watch selected chemical → warnings + facts
watch(selectedChemical, (chem) => {
  if (chem && activeExperiment.value) {
    warnDangerousChemical(chem.nameAr, chem.id);
    quickFactAbout(chem.id);
  }
});

// Watch step completion → encouragement + tips
watch(stepCompletion, (newVal, oldVal) => {
  if (!activeExperiment.value) return;
  for (let i = 0; i < newVal.length; i++) {
    if (newVal[i] && !oldVal?.[i]) {
      const step = activeExperiment.value.steps[i];
      if (step) {
        encourageStep(step.text);
        tipForStep(i, activeExperiment.value.id);
      }
    }
  }
  prevStepCompletion = [...newVal];
}, { flush: 'post' });

// Watch burette warning → alerts
watch(buretteWarning, (warn) => {
  if (warn === 'approaching') warnOnAction('equivalenceApproaching');
  if (warn === 'equivalence') warnOnAction('equivalenceReached');
  if (warn === 'exceeded') warnOnAction('equivalenceExceeded');
});

// Burette consumption tracker for active experiment
const buretteConsumption = computed(() => {
  let total = 0;
  let current = 0;
  let initial = 0;
  items.value.forEach((item) => {
    if (isBurette(item.id)) {
      total += buretteTotalConsumedMap[item.uid] || 0;
      current += buretteConsumedThisRefill[item.uid] || 0;
      initial = buretteInitialVolumeMap[item.uid] || getBurette(item.uid).maxVolume;
    }
  });
  return { total, current, initial, grandTotal: total + current };
});

const canUndoNow = computed(() => canUndo());
const canRedoNow = computed(() => canRedo());
const canMicroUndoNow = computed(() => canMicroUndo());
const canMicroRedoNow = computed(() => canMicroRedo());
const selectedState = ref<ToolState | null>(null);
const canvasRef = ref<InstanceType<typeof WorkspaceCanvas> | null>(null);

function onSelect(item: LabItem | null, state: ToolState | null) {
  selectedItem.value = item;
  selectedState.value = state;
}

// Auto-switch to chemical shelf when pending fill is set
watch(pendingChemicalFill, (val) => {
  if (val) {
    activeTab.value = 'chemicals';
    // Expand all chemical sections
    expandedSections.value.liquids = true;
    expandedSections.value.solids = true;
    expandedSections.value.indicators = true;
  }
});

function onChemicalClick(chem: Chemical) {
  if (!pendingChemicalFill.value) return;
  const { uid, amount } = pendingChemicalFill.value;
  hasSelectedChemicalMap[uid] = true;
  const targetItem = items.value.find((i: LabItem) => i.uid === uid);
  if (targetItem && isBurette(targetItem.id)) {
    const s = getBurette(uid);
    s.volume = Math.min(s.maxVolume, s.volume + amount);
    s.color = chem.color;
    s.opacity = chem.opacity;
    s.chemicalId = chem.id;
  } else {
    const liq = getLiquid(uid);
    if (chem.category === 'indicator') {
      const dropAmount = 5;
      liq.volume = Math.min(liq.maxVolume, liq.volume + dropAmount);
      if (!liq.indicators) liq.indicators = [];
      if (!liq.indicators.includes(chem.id)) liq.indicators.push(chem.id);
      // Update label: if empty/water, show indicator name; if has chemical, append
      if (!liq.chemicalId || liq.label === 'ماء') {
        liq.label = chem.nameAr;
      } else if (!liq.label.includes(chem.nameAr)) {
        liq.label = liq.label + ' + ' + chem.nameAr;
      }
      applyIndicator(chem.id, uid);
    } else {
      liq.volume = Math.min(liq.maxVolume, liq.volume + amount);
      liq.color = chem.color;
      liq.opacity = chem.opacity;
      liq.label = chem.nameAr;
      liq.chemicalId = chem.id;
      liq.ph = chem.ph ?? null;
      liq.baseColor = chem.color;
    }
  }
  pendingChemicalFill.value = null;
}

const expandedSections = ref<Record<string, boolean>>({
  containers: true, measuring: true, devices: true, helpers: true,
  liquids: true, solids: true, indicators: true,
});

function toggleSection(id: string) { expandedSections.value[id] = !expandedSections.value[id]; }

function onDragStart(e: DragEvent, item: ToolDef) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  }
}

function onLeftDown(e: MouseEvent) {
  resizingLeft.value = true;
  startX.value = e.clientX;
  startWidth.value = leftWidth.value;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

function onRightDown(e: MouseEvent) {
  resizingRight.value = true;
  startX.value = e.clientX;
  startWidth.value = rightWidth.value;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

function onMove(e: MouseEvent) {
  if (resizingLeft.value) {
    const delta = startX.value - e.clientX;
    leftWidth.value = Math.max(160, Math.min(480, startWidth.value + delta));
  }
  if (resizingRight.value) {
    const delta = e.clientX - startX.value;
    rightWidth.value = Math.max(160, Math.min(480, startWidth.value + delta));
  }
}

function onUp() {
  resizingLeft.value = false;
  resizingRight.value = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}

onMounted(() => {
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  startIdleMessages();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', onUp);
  stopIdleMessages();
});
</script>

<template>
  <div class="chemistry-landing" :style="{ gridTemplateColumns: `${leftWidth}px 6px 1fr 6px ${rightWidth}px`, '--left-width': `${leftWidth}px` }">
    <LeftPanel v-model:active-tab="activeTab" @chemical-click="onChemicalClick" />
    <div class="resizer resizer-left" @mousedown="onLeftDown" />
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
    <div class="resizer resizer-right" @mousedown="onRightDown" />
    <RightPanel
      :selected-item="selectedItem"
      :selected-state="selectedState"
      :active-experiment="activeExperiment"
      :step-completion="stepCompletion"
      @select-experiment="showExperimentSelector = true"
      @open-theory="showTheoryPanel = true"
      @clear-experiment="activeExperiment = null"
      @reset-lab="canvasRef?.resetLab()"
    />
    <ExperimentSelector
      v-if="showExperimentSelector"
      @select="(exp) => { activeExperiment = exp; showExperimentSelector = false; }"
      @close="showExperimentSelector = false"
    />
    <ExperimentTheoryPanel
      v-if="showTheoryPanel && activeExperiment?.theory"
      :theory="activeExperiment.theory"
      @close="showTheoryPanel = false"
    />
    <ChemAnalysisButton />
  </div>
</template>

<style scoped>
.chemistry-landing {
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  display: grid;
  overflow: hidden;
  position: relative;
}
.panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow-y: auto;
}
.resizer {
  width: 6px;
  background: #e2e8f0;
  cursor: col-resize;
  transition: background 0.2s;
  z-index: 10;
}
.resizer:hover { background: #94a3b8; }
</style>
