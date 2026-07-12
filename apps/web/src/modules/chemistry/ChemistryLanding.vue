<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { pendingChemicalFill, pendingSolidSelect, getLiquid, getBurette, getPipette, selectedChemical, hasSelectedChemicalMap, items, isBurette, isPipette, buretteTotalConsumedMap, buretteConsumedThisRefill, buretteInitialVolumeMap } from '../../composables/chemistry/useChemistryLab';
import { isReactionVessel } from '../../composables/chemistry/chemLabIds';
import type { Chemical } from '../../composables/chemistry/useChemistryLab';
import type { LabItem } from '../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../composables/chemistry/chemLabTypes';
import WorkspaceCanvas from '../../components/experiment/chemistry/WorkspaceCanvas.vue';
import LeftPanel from '../../components/experiment/chemistry/LeftPanel.vue';
import RightPanel from '../../components/experiment/chemistry/RightPanel.vue';
import ExperimentSelector from '../../components/experiment/chemistry/ExperimentSelector.vue';
import { type Experiment, type TitrationReading, type ReportData, validateExperimentSteps } from '../../composables/chemistry/useExperiments';
import { type ExperimentDefinition, validateSteps as validateRegistrySteps } from '../../composables/chemistry/experiments';
import { generateReport } from '../../composables/chemistry/experiments/reports';
import '../../composables/chemistry/experiments'; // side-effect: registers all definitions
import { undo, redo, canUndo, canRedo, canMicroUndo, canMicroRedo } from '../../composables/chemistry/useChemistryHistory';
import { applyIndicator } from '../../composables/chemistry/useReactionEngine';
import { buretteWarning } from '../../composables/chemistry/useLabSimulation';
import { useI18n } from '../../composables/useI18n';
import { useChemistryResizing } from '../../composables/chemistry/useChemistryResizing';
import ExperimentTheoryPanel from '../../components/experiment/chemistry/ExperimentTheoryPanel.vue';
import BuretteDisplay from '../../components/experiment/chemistry/BuretteDisplay.vue';
import WorkspaceActionsPanel from '../../components/experiment/chemistry/WorkspaceActionsPanel.vue';
import ChemAnalysisButton from '../../components/experiment/chemistry/ChemAnalysisButton.vue';
import TitrationDataTable from '../../components/experiment/chemistry/TitrationDataTable.vue';
import ChemReportModal from '../../components/experiment/chemistry/ChemReportModal.vue';
import {
  welcomeMessage, warnDangerousChemical, quickFactAbout,
  encourageStep, tipForStep, warnOnAction,
  startIdleMessages, stopIdleMessages
} from '../../composables/chemistry/useLabAssistant';
import { useChemicalLocale } from '../../composables/chemistry/useChemicalLocale';
import { clearTitrationReadings } from '../../composables/chemistry/useTitrationRecorder';

const { t } = useI18n();
const { leftWidth, rightWidth, onLeftDown, onRightDown } = useChemistryResizing();
const activeTab = ref('glassware');
const showExperimentSelector = ref(false);
const activeExperiment = ref<Experiment | ExperimentDefinition | null>(null);
const selectedItem = ref<LabItem | null>(null);
const showTheoryPanel = ref(false);
const titrationReadings = ref<TitrationReading[]>([]);
const showReport = ref(false);
const reportData = ref<ReportData | null>(null);
const reportFields = ref<Record<string, string | number | null>>({});
const reportTemplate = ref<{ type: string; fields: { key: string; labelKey: string; source: string }[] } | null>(null);

// Helpers: unify Experiment (legacy) and ExperimentDefinition (new registry)
function expNameKey(exp: Experiment | ExperimentDefinition): string {
  return 'nameKey' in exp ? exp.nameKey : exp.nameAr;
}
function stepTextKey(step: { text?: string; textKey?: string }): string {
  return step.textKey || step.text || '';
}
function expTheory(exp: Experiment | ExperimentDefinition): { title: string; sections: { heading: string; content: string }[] } | null {
  if (!exp.theory) return null;
  if ('title' in exp.theory) return exp.theory as any;
  // Convert registry theory (titleKey/headingKey/contentKey) to legacy shape
  const t2 = exp.theory as any;
  return {
    title: t(t2.titleKey),
    sections: t2.sections.map((s: any) => ({ heading: t(s.headingKey), content: t(s.contentKey) })),
  };
}

// Auto-check experiment steps against workspace state
const stepCompletion = computed(() => {
  if (!activeExperiment.value) return [];
  const exp = activeExperiment.value;
  // Use registry validator for ExperimentDefinition, legacy validator for Experiment
  if ('nameKey' in exp) return validateRegistrySteps(exp);
  return validateExperimentSteps(exp);
});

// ── Lab Assistant watchers ──

// Watch experiment changes → welcome
watch(activeExperiment, (exp) => {
  if (exp) welcomeMessage(t(expNameKey(exp)));
});

// Watch selected chemical → warnings + facts
watch(selectedChemical, (chem) => {
  if (chem && activeExperiment.value) {
    const { getName } = useChemicalLocale();
    warnDangerousChemical(getName(chem.id), chem.id);
    quickFactAbout(chem.id);
  }
});

// Watch step completion → encouragement + tips
watch(stepCompletion, (newVal, oldVal) => {
  if (!activeExperiment.value) return;
  for (let i = 0; i < newVal.length; i++) {
    if (newVal[i] && !oldVal?.[i]) {
      const step = activeExperiment.value.steps[i] as any;
      if (step) {
        encourageStep(t(stepTextKey(step)));
        tipForStep(i, activeExperiment.value.id);
      }
    }
  }
}, { flush: 'post' });

// Burette consumption tracker (must be defined before watchers that use it)
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

// Watch burette warning → alerts
watch(buretteWarning, (warn) => {
  if (warn === 'approaching') warnOnAction('equivalenceApproaching');
  if (warn === 'equivalence') warnOnAction('equivalenceReached');
  if (warn === 'exceeded') warnOnAction('equivalenceExceeded');
});

function showReportManual() {
  if (!activeExperiment.value) return;
  const exp = activeExperiment.value;

  // Use new declarative report system for ExperimentDefinition
  if ('nameKey' in exp && exp.reportTemplate) {
    const fields = generateReport(exp.reportTemplate, titrationReadings.value.length);
    reportFields.value = fields;
    reportTemplate.value = exp.reportTemplate;
    showReport.value = true;
    return;
  }

  // Legacy report for old Experiment type
  const consumed = buretteConsumption.value.grandTotal;
  const target = items.value.find((i) => {
    if (!isReactionVessel(i.id)) return false;
    const liq = getLiquid(i.uid);
    return liq && liq.indicators && liq.indicators.includes('phenolphthalein');
  });
  const liq = target ? getLiquid(target.uid) : null;
  reportData.value = {
    experimentName: t(expNameKey(exp)),
    consumedVolume: consumed,
    acidVolume: 50,
    baseMolarity: 0.1,
    calculatedAcidMolarity: consumed > 0 ? (0.1 * consumed) / 50 : 0,
    phAtEquivalence: liq ? liq.ph : null,
    colorAtEquivalence: liq ? liq.color : '#3b82f6',
    readingsCount: titrationReadings.value.length,
  };
  showReport.value = true;
}

function addManualReading() {
  const grandTotal = buretteConsumption.value.grandTotal;
  const target = items.value.find((i) => {
    if (!isReactionVessel(i.id)) return false;
    const liq = getLiquid(i.uid);
    return liq && liq.indicators && liq.indicators.includes('phenolphthalein');
  });
  const liq = target ? getLiquid(target.uid) : null;
  const last = titrationReadings.value[titrationReadings.value.length - 1];
  // If last reading is within 0.05 mL, update it instead of adding a duplicate row
  if (last && Math.abs(last.volume - grandTotal) < 0.05) {
    last.ph = liq ? liq.ph : null;
    last.color = liq ? liq.color : '#3b82f6';
    return;
  }
  titrationReadings.value.push({
    n: titrationReadings.value.length + 1,
    volume: grandTotal,
    ph: liq ? liq.ph : null,
    color: liq ? liq.color : '#3b82f6',
  });
}

function onSelectExperiment(exp: Experiment | ExperimentDefinition) {
  activeExperiment.value = exp;
  titrationReadings.value = [];
  clearTitrationReadings();
  showExperimentSelector.value = false;
}

function restartExperiment() {
  showReport.value = false;
  reportData.value = null;
  reportFields.value = {};
  reportTemplate.value = null;
  titrationReadings.value = [];
  clearTitrationReadings();
  selectedItem.value = null;
  selectedState.value = null;
  canvasRef.value?.resetLab();
}

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

const expandedSections = ref<Record<string, boolean>>({
  containers: true, measuring: true, devices: true, helpers: true,
  liquids: true, solids: true, indicators: true,
});

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

// Auto-switch to chemical shelf when pending solid select (from spatula)
watch(pendingSolidSelect, (val) => {
  if (val) {
    activeTab.value = 'chemicals';
    expandedSections.value.solids = true;
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
  } else if (targetItem && isPipette(targetItem.id)) {
    const pip = getPipette(uid);
    pip.volume = Math.min(pip.maxVolume, pip.volume + amount);
    pip.color = chem.color;
    pip.opacity = chem.opacity;
    pip.label = chem.id;
    pip.chemicalId = chem.id;
  } else {
    const liq = getLiquid(uid);
    if (chem.category === 'indicator') {
      const dropAmount = 5;
      liq.volume = Math.min(liq.maxVolume, liq.volume + dropAmount);
      if (!liq.indicators) liq.indicators = [];
      if (!liq.indicators.includes(chem.id)) liq.indicators.push(chem.id);
      // Update label: if empty/water, show indicator name; if has chemical, append
      if (!liq.chemicalId) {
        liq.label = chem.id;
      } else if (!liq.label.includes(chem.id)) {
        liq.label = liq.label + ' + ' + chem.id;
      }
      applyIndicator(chem.id, uid);
    } else {
      liq.volume = Math.min(liq.maxVolume, liq.volume + amount);
      liq.color = chem.color;
      liq.opacity = chem.opacity;
      liq.label = chem.id;
      liq.chemicalId = chem.id;
      liq.ph = chem.ph ?? null;
      liq.baseColor = chem.color;
      if (!liq.reactants) liq.reactants = {};
      liq.reactants[chem.id] = (liq.reactants[chem.id] || 0) + amount;
    }
  }
  pendingChemicalFill.value = null;
}

onMounted(() => startIdleMessages());
onUnmounted(() => stopIdleMessages());
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
      :active-experiment="activeExperiment as any"
      :step-completion="stepCompletion"
      @select-experiment="showExperimentSelector = true"
      @open-theory="showTheoryPanel = true"
      @clear-experiment="activeExperiment = null"
      @reset-lab="canvasRef?.resetLab()"
      @show-report="showReportManual"
    />
    <ExperimentSelector
      v-if="showExperimentSelector"
      @select="onSelectExperiment"
      @close="showExperimentSelector = false"
    />
    <ExperimentTheoryPanel
      v-if="showTheoryPanel && activeExperiment?.theory"
      :theory="expTheory(activeExperiment)"
      @close="showTheoryPanel = false"
    />
    <!-- Titration Data Table (top-right of workspace) -->
    <TitrationDataTable
      v-if="activeExperiment && activeExperiment.id.startsWith('neutralization-')"
      :readings="titrationReadings"
      @add="addManualReading"
    />
    <!-- Final Report Modal -->
    <ChemReportModal
      v-if="showReport && (reportData || reportTemplate)"
      :data="reportData"
      :fields="reportFields"
      :template="reportTemplate"
      @close="showReport = false"
      @restart="restartExperiment"
    />
    <ChemAnalysisButton />
  </div>
</template>

<style src="./chemistry-landing.css" scoped></style>
