<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAnalysisStore } from '../../../../stores/analysis.store';
import { consumePendingPayload } from '../../../../composables/analysis/sendToAnalysis';
import { useI18n } from '../../../../composables/useI18n';
import type { AnalysisPayload } from '../../../../types/physics';
import AnalysisMenuBar from '../../../../components/experiment/analysis-calc/AnalysisMenuBar.vue';
import AnalysisTabs from '../../../../components/experiment/analysis-calc/AnalysisTabs.vue';
import DataTab from '../../../../components/experiment/analysis-calc/DataTab.vue';
import AnalysisTab from '../../../../components/experiment/analysis-calc/AnalysisTab.vue';
import ReportTab from '../../../../components/experiment/analysis-calc/ReportTab.vue';
import SubmitReportModal from '../../../../components/experiment/SubmitReportModal.vue';
import SpecificHeatWorksheetPanel from '../../../../components/experiment/specific-heat/panels/SpecificHeatWorksheetPanel.vue';
import SpecificHeatReferencePanel from '../../../../components/experiment/specific-heat/panels/SpecificHeatReferencePanel.vue';
import SpringWorksheetPanel from '../../../../components/experiment/spring/panels/SpringWorksheetPanel.vue';
import SpringReferencePanel from '../../../../components/experiment/spring/panels/SpringReferencePanel.vue';
import PendulumWorksheetPanel from '../../../../components/experiment/pendulum/panels/PendulumWorksheetPanel.vue';
import PendulumReferencePanel from '../../../../components/experiment/pendulum/panels/PendulumReferencePanel.vue';
import FreeFallWorksheetPanel from '../../../../components/experiment/freefall/panels/FreeFallWorksheetPanel.vue';
import FreeFallReferencePanel from '../../../../components/experiment/freefall/panels/FreeFallReferencePanel.vue';
import ProjectileWorksheetPanel from '../../../../components/experiment/projectile/panels/ProjectileWorksheetPanel.vue';
import ProjectileReferencePanel from '../../../../components/experiment/projectile/panels/ProjectileReferencePanel.vue';
import LightRayWorksheetPanel from '../../../../components/experiment/lightray/panels/LightRayWorksheetPanel.vue';
import LightRayReferencePanel from '../../../../components/experiment/lightray/panels/LightRayReferencePanel.vue';
import PrismWorksheetPanel from '../../../../components/experiment/prism/panels/PrismWorksheetPanel.vue';
import PrismReferencePanel from '../../../../components/experiment/prism/panels/PrismReferencePanel.vue';
import InterferenceWorksheetPanel from '../../../../components/experiment/interference/panels/InterferenceWorksheetPanel.vue';
import InterferenceReferencePanel from '../../../../components/experiment/interference/panels/InterferenceReferencePanel.vue';
import DiffractionWorksheetPanel from '../../../../components/experiment/diffraction/panels/DiffractionWorksheetPanel.vue';
import DiffractionReferencePanel from '../../../../components/experiment/diffraction/panels/DiffractionReferencePanel.vue';
import PolarizationWorksheetPanel from '../../../../components/experiment/polarization/panels/PolarizationWorksheetPanel.vue';
import PolarizationReferencePanel from '../../../../components/experiment/polarization/panels/PolarizationReferencePanel.vue';
import SpeedOfSoundWorksheetPanel from '../../../../components/experiment/speed-of-sound/panels/SpeedOfSoundWorksheetPanel.vue';
import SpeedOfSoundReferencePanel from '../../../../components/experiment/speed-of-sound/panels/SpeedOfSoundReferencePanel.vue';
import ResonanceWorksheetPanel from '../../../../components/experiment/resonance/panels/ResonanceWorksheetPanel.vue';
import ResonanceReferencePanel from '../../../../components/experiment/resonance/panels/ResonanceReferencePanel.vue';
import WaveInterferenceWorksheetPanel from '../../../../components/experiment/wave-interference/panels/WaveInterferenceWorksheetPanel.vue';
import WaveInterferenceReferencePanel from '../../../../components/experiment/wave-interference/panels/WaveInterferenceReferencePanel.vue';
import CalorimetryWorksheetPanel from '../../../../components/experiment/calorimetry/panels/CalorimetryWorksheetPanel.vue';
import CalorimetryReferencePanel from '../../../../components/experiment/calorimetry/panels/CalorimetryReferencePanel.vue';
import IdealGasWorksheetPanel from '../../../../components/experiment/ideal-gas/panels/IdealGasWorksheetPanel.vue';
import IdealGasReferencePanel from '../../../../components/experiment/ideal-gas/panels/IdealGasReferencePanel.vue';
import BoylesLawWorksheetPanel from '../../../../components/experiment/boyles-law/panels/BoylesLawWorksheetPanel.vue';
import BoylesLawReferencePanel from '../../../../components/experiment/boyles-law/panels/BoylesLawReferencePanel.vue';
import ThermalExpansionWorksheetPanel from '../../../../components/experiment/thermal-expansion/panels/ThermalExpansionWorksheetPanel.vue';
import ThermalExpansionReferencePanel from '../../../../components/experiment/thermal-expansion/panels/ThermalExpansionReferencePanel.vue';
import LatentHeatWorksheetPanel from '../../../../components/experiment/latent-heat/panels/LatentHeatWorksheetPanel.vue';
import LatentHeatReferencePanel from '../../../../components/experiment/latent-heat/panels/LatentHeatReferencePanel.vue';
import ThinLensWorksheetPanel from '../../../../components/experiment/thinlens/panels/ThinLensWorksheetPanel.vue';
import ThinLensReferencePanel from '../../../../components/experiment/thinlens/panels/ThinLensReferencePanel.vue';
import MirrorWorksheetPanel from '../../../../components/experiment/mirror/panels/MirrorWorksheetPanel.vue';
import MirrorReferencePanel from '../../../../components/experiment/mirror/panels/MirrorReferencePanel.vue';
import InclinedWorksheetPanel from '../../../../components/experiment/inclined/panels/InclinedWorksheetPanel.vue';
import InclinedReferencePanel from '../../../../components/experiment/inclined/panels/InclinedReferencePanel.vue';
import CollisionWorksheetPanel from '../../../../components/experiment/collision/panels/CollisionWorksheetPanel.vue';
import CollisionReferencePanel from '../../../../components/experiment/collision/panels/CollisionReferencePanel.vue';
import LeverWorksheetPanel from '../../../../components/experiment/lever/panels/LeverWorksheetPanel.vue';
import LeverReferencePanel from '../../../../components/experiment/lever/panels/LeverReferencePanel.vue';
import OhmsLawWorksheetPanel from '../../../../components/experiment/electric-lab/panels/OhmsLawWorksheetPanel.vue';
import OhmsLawReferencePanel from '../../../../components/experiment/electric-lab/panels/OhmsLawReferencePanel.vue';
import KirchhoffWorksheetPanel from '../../../../components/experiment/electric-lab/panels/KirchhoffWorksheetPanel.vue';
import KirchhoffReferencePanel from '../../../../components/experiment/electric-lab/panels/KirchhoffReferencePanel.vue';
import ParallelWorksheetPanel from '../../../../components/experiment/electric-lab/panels/ParallelWorksheetPanel.vue';
import ParallelReferencePanel from '../../../../components/experiment/electric-lab/panels/ParallelReferencePanel.vue';
import PowerWorksheetPanel from '../../../../components/experiment/electric-lab/panels/PowerWorksheetPanel.vue';
import PowerReferencePanel from '../../../../components/experiment/electric-lab/panels/PowerReferencePanel.vue';
import ResistivityWorksheetPanel from '../../../../components/experiment/electric-lab/panels/ResistivityWorksheetPanel.vue';
import ResistivityReferencePanel from '../../../../components/experiment/electric-lab/panels/ResistivityReferencePanel.vue';
import RCWorksheetPanel from '../../../../components/experiment/electric-lab/panels/RCWorksheetPanel.vue';
import RCReferencePanel from '../../../../components/experiment/electric-lab/panels/RCReferencePanel.vue';
import LampWorksheetPanel from '../../../../components/experiment/electric-lab/panels/LampWorksheetPanel.vue';
import LampReferencePanel from '../../../../components/experiment/electric-lab/panels/LampReferencePanel.vue';
import GalvanometerWorksheetPanel from '../../../../components/experiment/electric-lab/panels/GalvanometerWorksheetPanel.vue';
import GalvanometerReferencePanel from '../../../../components/experiment/electric-lab/panels/GalvanometerReferencePanel.vue';
import WheatstoneWorksheetPanel from '../../../../components/experiment/electric-lab/panels/WheatstoneWorksheetPanel.vue';
import WheatstoneReferencePanel from '../../../../components/experiment/electric-lab/panels/WheatstoneReferencePanel.vue';
import VoltageDividerWorksheetPanel from '../../../../components/experiment/electric-lab/panels/VoltageDividerWorksheetPanel.vue';
import VoltageDividerReferencePanel from '../../../../components/experiment/electric-lab/panels/VoltageDividerReferencePanel.vue';
import InternalResistanceWorksheetPanel from '../../../../components/experiment/electric-lab/panels/InternalResistanceWorksheetPanel.vue';
import InternalResistanceReferencePanel from '../../../../components/experiment/electric-lab/panels/InternalResistanceReferencePanel.vue';
import SeriesWorksheetPanel from '../../../../components/experiment/electric-lab/panels/SeriesWorksheetPanel.vue';
import SeriesReferencePanel from '../../../../components/experiment/electric-lab/panels/SeriesReferencePanel.vue';
import CapacitorsComboWorksheetPanel from '../../../../components/experiment/electric-lab/panels/CapacitorsComboWorksheetPanel.vue';
import CapacitorsComboReferencePanel from '../../../../components/experiment/electric-lab/panels/CapacitorsComboReferencePanel.vue';
import PotentiometerWorksheetPanel from '../../../../components/experiment/electric-lab/panels/PotentiometerWorksheetPanel.vue';
import PotentiometerReferencePanel from '../../../../components/experiment/electric-lab/panels/PotentiometerReferencePanel.vue';
import NonOhmicWorksheetPanel from '../../../../components/experiment/electric-lab/panels/NonOhmicWorksheetPanel.vue';
import NonOhmicReferencePanel from '../../../../components/experiment/electric-lab/panels/NonOhmicReferencePanel.vue';
import GenericWorksheetPanel from '../../../../components/experiment/electric-lab/panels/GenericWorksheetPanel.vue';
import GenericReferencePanel from '../../../../components/experiment/electric-lab/panels/GenericReferencePanel.vue';

const { t } = useI18n();
const router = useRouter();
const store = useAnalysisStore();
const activeTab = ref(0);
const reportOpen = ref(false);
const conclusionData = ref({ conclusion: '', errors: '', improvements: '' });
const chartSnapshot = ref('');
const analysisTabRef = ref<InstanceType<typeof AnalysisTab> | null>(null);

onMounted(() => {
  const pending = consumePendingPayload();
  if (pending) { store.setPayload(pending); return; }
  // Fallback: read payload from experiments that use /analysis route directly
  try {
    const raw = localStorage.getItem('analysis_payload');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sourceExperiment) {
        store.setPayload(parsed as AnalysisPayload);
        localStorage.removeItem('analysis_payload');
      }
    }
  } catch { /* ignore */ }
});

const hasData = computed(() => store.hasData);
const sourceName = computed(() => store.sourceName);
const experimentId = computed(() => {
  const source = store.payload?.sourceExperiment;
  return source ? `physics-${source}` : undefined;
});
const readings = computed(() => store.readings);
const columns = computed(() => store.columns);
const equations = computed(() => store.equations);
const plots = computed(() => store.plots);
const studentInfo = computed(() => store.studentInfo);
const reportDate = computed(() => store.reportDate);
const mediumType = computed(() => store.mediumType);
const mediumN2 = computed(() => store.mediumN2);
const solvedEquations = computed(() => analysisTabRef.value?.solvedEquations ?? []);
const regressionData = computed(() => analysisTabRef.value?.getRegression() ?? null);
const slopeCalcData = computed(() => analysisTabRef.value?.getSlopeCalc() ?? null);
const axesData = computed(() => analysisTabRef.value?.getAxes() ?? null);
const errorCalcData = computed(() => analysisTabRef.value?.errorCalcData ?? null);
const hasCalcTab = computed(() => {
  const payload = store.payload;
  if (!payload) return false;
  return payload.hasCalcTab === true;
});
const extraTabs = computed(() => hasCalcTab.value ? ['حسابات'] : []);
const firstReading = computed(() => readings.value[0]);
const reportTabIdx = computed(() => hasCalcTab.value ? 3 : 2);

function goBack() {
  const referrer = localStorage.getItem('analysis-referrer');
  if (referrer) { router.push(referrer); }
  else { router.back(); }
}
function clearData() { store.clearData(); activeTab.value = 0; }
function selectMedium(n2: number) { store.generateTheoreticalReadings(n2); }
function updateCell(row: number, key: string, value: number) { store.updateCell(row, key, value); }
function addRow() { store.addRow(); }
function removeRow(index: number) { store.removeRow(index); }
function onConclusionUpdate(data: { conclusion: string; errors: string; improvements: string }) { conclusionData.value = data; }

async function printReport() {
  const prevTab = activeTab.value;
  activeTab.value = 2;
  await nextTick();
  const style = document.createElement('style');
  style.id = 'print-hide-style';
  style.innerHTML = `@media print {
    .analysis-calc-page > *:not(.tab-content) { display: none !important; }
    .tab-content { display: flex !important; flex-direction: column !important; }
    .data-tab, .analysis-tab { display: none !important; }
    .report-tab .btn-preview, .report-tab .readiness, .report-tab .export-panel { display: none !important; }
    .report-tab .preview-box { display: block !important; }
  }`;
  document.head.appendChild(style);
  await new Promise<void>(r => setTimeout(r, 100));
  window.print();
  setTimeout(() => {
    const s = document.getElementById('print-hide-style');
    if (s) s.remove();
    activeTab.value = prevTab;
  }, 500);
}

function exportCsv() {
  if (!readings.value.length) return;
  const headers = columns.value.map(c => `${c.label}${c.unit ? ` (${c.unit})` : ''}`).join(',');
  const rows = readings.value.map((r, i) => [i + 1, ...columns.value.map(c => r[c.key] ?? '')].join(','));
  const meta = [`Experiment: ${sourceName.value}`, `Date: ${reportDate.value}`, `Student: ${studentInfo.value.name}`, ''];
  const csv = [...meta, headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${sourceName.value}_report.csv`; a.click(); URL.revokeObjectURL(url);
}

async function exportPng() {
  const prevTab = activeTab.value;
  if (prevTab !== 1) {
    activeTab.value = 1;
    await nextTick();
    await new Promise<void>(r => setTimeout(r, 300));
    analysisTabRef.value?.drawChart?.();
    await new Promise<void>(r => setTimeout(r, 200));
  }
  const canvas = analysisTabRef.value?.getCanvas();
  if (!canvas || canvas.width === 0) {
    if (prevTab !== 1) activeTab.value = prevTab;
    console.warn('[exportPng] no chart canvas available');
    return;
  }
  const link = document.createElement('a');
  link.download = `${sourceName.value}_chart.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  if (prevTab !== 1) activeTab.value = prevTab;
}

async function captureChart() {
  console.log('[captureChart] start, current tab:', activeTab.value);
  const prevTab = activeTab.value;
  if (prevTab !== 1) {
    activeTab.value = 1;
    await nextTick();
    await new Promise<void>(r => setTimeout(r, 300));
    analysisTabRef.value?.drawChart?.();
    await new Promise<void>(r => setTimeout(r, 200));
  }
  console.log('[captureChart] analysisTabRef exists?', !!analysisTabRef.value);
  const canvas = analysisTabRef.value?.getCanvas();
  console.log('[captureChart] canvas exists?', !!canvas, 'width:', canvas?.width);
  if (canvas && canvas.width > 0) {
    chartSnapshot.value = canvas.toDataURL('image/png');
    console.log('[captureChart] snapshot captured, length:', chartSnapshot.value.length);
  } else {
    console.warn('[captureChart] no canvas or empty canvas');
  }
  if (prevTab !== 1) activeTab.value = prevTab;
}

async function sendToTeacher() {
  console.log('[sendToTeacher] called, hasData:', hasData.value);
  if (!hasData.value) { console.warn('[sendToTeacher] no data'); return; }
  await captureChart();
  console.log('[sendToTeacher] opening modal, snapshot length:', chartSnapshot.value.length);
  reportOpen.value = true;
}
</script>

<template>
  <div class="analysis-calc-page">
    <AnalysisMenuBar :source-name="sourceName" @back="goBack" @clear="clearData" />

    <div v-if="!hasData" class="no-data">
      <div class="no-data-box">
        <h2>📊 {{ t('experiments.analysisCalcTitle') }}</h2>
        <p>{{ t('experiments.noDataSentYet') }}</p>
        <p class="hint">{{ t('experiments.goToExperimentRecordReadings') }}</p>
        <button class="btn-action" @click="goBack">{{ t('experiments.backToExperiments') }}</button>
      </div>
    </div>

    <template v-else>
      <AnalysisTabs :active="activeTab" :extra-tabs="extraTabs" @change="activeTab = $event" />
      <div class="tab-content">
        <Transition name="tab-fade" mode="out-in">
          <DataTab
            v-show="activeTab === 0"
            :readings="readings"
            :columns="columns"
            @update-cell="updateCell"
            @add-row="addRow"
            @remove-row="removeRow"
          />
        </Transition>
        <Transition name="tab-fade" mode="out-in">
          <AnalysisTab
            ref="analysisTabRef"
            v-show="activeTab === 1"
            :readings="readings"
            :columns="columns"
            :equations="equations"
            :plots="plots"
            :medium-type="mediumType"
            :medium-n2="mediumN2"
            @select-medium="selectMedium"
          />
        </Transition>
        <Transition v-if="hasCalcTab" name="tab-fade" mode="out-in">
          <div v-show="activeTab === 2" class="calc-tab">
            <template v-if="store.payload?.sourceExperiment === 'specific-heat'">
              <SpecificHeatWorksheetPanel
                :metal-mass="firstReading?.metalMass ?? 0"
                :water-mass="firstReading?.waterMass ?? 0"
                :water-temp="firstReading?.waterTemp ?? 0"
                :metal-temp="100"
                :display-t="firstReading?.finalTemp ?? 0"
              />
              <SpecificHeatReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'spring'">
              <SpringWorksheetPanel
                :mass="firstReading?.mass ?? 0"
                :period="firstReading?.T ?? 0"
                :k-actual="firstReading?.kCalc ?? 0"
              />
              <SpringReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'pendulum'">
              <PendulumWorksheetPanel
                :length="firstReading?.length ?? 0"
                :period="firstReading?.T ?? 0"
                :g-actual="firstReading?.gCalc ?? 0"
              />
              <PendulumReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'freefall'">
              <FreeFallWorksheetPanel
                :height="firstReading?.h ?? 0"
                :time="firstReading?.t ?? 0"
                :g-actual="firstReading?.gCalc ?? 0"
              />
              <FreeFallReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'projectile'">
              <ProjectileWorksheetPanel
                :v0="firstReading?.initialVelocity ?? 0"
                :angle-deg="firstReading?.angleDegrees ?? 0"
                :g="9.81"
                :range="firstReading?.rangeMeters ?? 0"
                :max-height="firstReading?.maxHeightMeters ?? 0"
              />
              <ProjectileReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'light-ray'">
              <LightRayWorksheetPanel
                :angle-incidence="firstReading?.theta_i ?? 0"
                :angle-refraction="firstReading?.theta_t ?? 0"
                :n1="firstReading?.n1 ?? 1"
                :n2="firstReading?.n2 ?? 1.5"
              />
              <LightRayReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'prism'">
              <PrismWorksheetPanel
                :angle-incidence="firstReading?.angleIncidence ?? 0"
                :prism-angle="firstReading?.prismAngle ?? 60"
                :n="firstReading?.n ?? 1.5"
                :deviation="firstReading?.deviation ?? 0"
              />
              <PrismReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'interference'">
              <InterferenceWorksheetPanel
                :slit-distance="firstReading?.d ?? 0.1"
                :screen-distance="firstReading?.D ?? 1.5"
                :wavelength="firstReading?.lambda ?? 580"
                :fringe-spacing="firstReading?.delta_y ?? 0"
              />
              <InterferenceReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'diffraction'">
              <DiffractionWorksheetPanel
                :slit-width="firstReading?.a ?? 0.1"
                :screen-distance="firstReading?.D ?? 1"
                :wavelength="firstReading?.lambda ?? 580"
                :central-width="firstReading?.w ?? 0"
              />
              <DiffractionReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'polarization'">
              <PolarizationWorksheetPanel
                :polarizer-angle="firstReading?.theta1 ?? 0"
                :analyzer-angle="firstReading?.theta2 ?? 45"
                :I0="firstReading?.I0 ?? 100"
                :output-intensity="firstReading?.Iout ?? 0"
              />
              <PolarizationReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'speed-of-sound'">
              <SpeedOfSoundWorksheetPanel
                :tube-length="firstReading?.L ?? 0.25"
                :frequency="firstReading?.f ?? 343"
                :temperature="firstReading?.T ?? 20"
                :v-measured="firstReading?.v ?? 0"
              />
              <SpeedOfSoundReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'resonance'">
              <ResonanceWorksheetPanel
                :string-length="firstReading?.L ?? 1"
                :tension="firstReading?.T ?? 10"
                :harmonic="firstReading?.n ?? 1"
                :frequency="firstReading?.f ?? 0"
              />
              <ResonanceReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'wave-interference'">
              <WaveInterferenceWorksheetPanel
                :source-distance="firstReading?.d ?? 0.05"
                :wavelength="firstReading?.lambda ?? 0.02"
                :frequency="firstReading?.f ?? 20"
                :screen-distance="firstReading?.D ?? 1"
              />
              <WaveInterferenceReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'calorimetry'">
              <CalorimetryWorksheetPanel
                :m-water="firstReading?.mWater ?? 0.2"
                :t-water="firstReading?.tWater ?? 25"
                :m-metal="firstReading?.mMetal ?? 0.05"
                :t-metal="firstReading?.tMetal ?? 100"
                :c-metal="firstReading?.cMetal ?? 385"
                :tf="firstReading?.tf ?? 30"
              />
              <CalorimetryReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'ideal-gas'">
              <IdealGasWorksheetPanel
                :n="firstReading?.n ?? 1"
                :T="firstReading?.T ?? 300"
                :V="firstReading?.V ?? 0.0224"
              />
              <IdealGasReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'boyles-law'">
              <BoylesLawWorksheetPanel
                :p="firstReading?.p ?? 1"
                :v="firstReading?.v ?? 1"
              />
              <BoylesLawReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'thermal-expansion'">
              <ThermalExpansionWorksheetPanel
                :L0="firstReading?.L0 ?? 1"
                :t0="firstReading?.t0 ?? 20"
                :t1="firstReading?.t1 ?? 100"
                :alpha="firstReading?.alpha ?? 16.5"
              />
              <ThermalExpansionReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'latent-heat'">
              <LatentHeatWorksheetPanel
                :mass="firstReading?.mass ?? 0.5"
                :L="firstReading?.L ?? 334000"
                :Q="firstReading?.Q ?? 0"
              />
              <LatentHeatReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'thin-lens'">
              <ThinLensWorksheetPanel
                :focal-length="firstReading?.f ?? 10"
                :object-distance="firstReading?.do ?? 30"
                :object-height="firstReading?.ho ?? 5"
                :image-distance="firstReading?.di ?? null"
                :image-height="firstReading?.hi ?? null"
              />
              <ThinLensReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'mirrors'">
              <MirrorWorksheetPanel
                :focal-length="firstReading?.f ?? 10"
                :object-distance="firstReading?.do ?? 30"
                :object-height="firstReading?.ho ?? 5"
                :image-distance="firstReading?.di ?? null"
                :image-height="firstReading?.hi ?? null"
              />
              <MirrorReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'inclined'">
              <InclinedWorksheetPanel
                :theta-deg="firstReading?.thetaDeg ?? 0"
                :length="firstReading?.length ?? 0"
                :g="9.81"
                :mu="0"
                :acceleration="firstReading?.acceleration ?? 0"
              />
              <InclinedReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'collision'">
              <CollisionWorksheetPanel
                :m1="firstReading?.m1 ?? 0"
                :m2="firstReading?.m2 ?? 0"
                :v1i="firstReading?.v1i ?? 0"
                :v2i="firstReading?.v2i ?? 0"
                :v1f="firstReading?.v1f ?? 0"
                :v2f="firstReading?.v2f ?? 0"
              />
              <CollisionReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'lever'">
              <LeverWorksheetPanel
                :sum-fx="firstReading?.sumFx ?? 0"
                :sum-fy="firstReading?.sumFy ?? 0"
                :resultant-mag="firstReading?.resultantMag ?? 0"
                :eq-force-mag="firstReading?.eqForceMag ?? 0"
                :is-balanced="firstReading?.isBalanced ?? 0"
              />
              <LeverReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab'">
              <OhmsLawWorksheetPanel
                :voltage="firstReading?.V ?? 0"
                :current="firstReading?.I ?? 0"
                :resistance="firstReading?.R ?? 0"
              />
              <OhmsLawReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-kirchhoff'">
              <KirchhoffWorksheetPanel
                :V1="firstReading?.V1 ?? 0"
                :V2="firstReading?.V2 ?? 0"
                :R1="firstReading?.R1 ?? 0"
                :R2="firstReading?.R2 ?? 0"
                :R3="firstReading?.R3 ?? 0"
                :I1="firstReading?.I1 ?? 0"
                :I2="firstReading?.I2 ?? 0"
                :I3="firstReading?.I3 ?? 0"
              />
              <KirchhoffReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-parallel'">
              <ParallelWorksheetPanel
                :V="firstReading?.V ?? 0"
                :R1="firstReading?.R1 ?? 0"
                :R2="firstReading?.R2 ?? 0"
                :I1="firstReading?.I1 ?? 0"
                :I2="firstReading?.I2 ?? 0"
                :Itotal="firstReading?.Itotal ?? 0"
                :Req="firstReading?.Req ?? 0"
              />
              <ParallelReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-power'">
              <PowerWorksheetPanel
                :V="firstReading?.V ?? 0"
                :I="firstReading?.I ?? 0"
                :R="firstReading?.R ?? 0"
                :P="firstReading?.P ?? 0"
              />
              <PowerReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-resistivity'">
              <ResistivityWorksheetPanel
                :V="firstReading?.V ?? 0"
                :I="firstReading?.I ?? 0"
                :R="firstReading?.R ?? 0"
                :rho="firstReading?.rho ?? 0"
                :L="firstReading?.L ?? 1"
                :A="firstReading?.A ?? 1e-6"
              />
              <ResistivityReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-rc'">
              <RCWorksheetPanel
                :V0="firstReading?.V0 ?? 0"
                :R="firstReading?.R ?? 0"
                :C="firstReading?.C ?? 0"
                :tau="firstReading?.tau ?? 0"
                :Vc="firstReading?.V ?? 0"
                :I="firstReading?.I ?? 0"
                :t="firstReading?.t ?? 0"
                :charging="true"
              />
              <RCReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-lamp'">
              <LampWorksheetPanel
                :V="firstReading?.V ?? 0"
                :I="firstReading?.I ?? 0"
                :R="firstReading?.R ?? 0"
                :P="firstReading?.P ?? 0"
                :PLight="firstReading?.PLight ?? 0"
                :PHeat="firstReading?.PHeat ?? 0"
              />
              <LampReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-galvanometer'">
              <GalvanometerWorksheetPanel
                :N="firstReading?.N ?? 0"
                :speed="firstReading?.speed ?? 0"
                :emf="firstReading?.emf ?? 0"
                :IuA="firstReading?.IuA ?? 0"
              />
              <GalvanometerReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-wheatstone'">
              <WheatstoneWorksheetPanel
                :R1="200"
                :R2="200"
                :R3="firstReading?.R3 ?? 0"
                :Rx="150"
                :Vg="firstReading?.Vg ?? 0"
                :Ig="firstReading?.Ig ?? 0"
              />
              <WheatstoneReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-voltage-divider'">
              <VoltageDividerWorksheetPanel
                :V="9"
                :R1="200"
                :R2="firstReading?.R2 ?? 0"
                :V1="(9 * 200 / (200 + (firstReading?.R2 ?? 0)))"
                :V2="firstReading?.V2 ?? 0"
                :I="firstReading?.I ?? 0"
              />
              <VoltageDividerReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-internal-resistance'">
              <InternalResistanceWorksheetPanel
                :Vt="firstReading?.V ?? 0"
                :I="firstReading?.I ?? 0"
                :emf="12"
                :r="2"
              />
              <InternalResistanceReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-series'">
              <SeriesWorksheetPanel
                :V="firstReading?.V ?? 0"
                :I="firstReading?.I ?? 0"
                :Req="firstReading?.R ?? 0"
                :V1="0"
                :V2="0"
                :V3="0"
              />
              <SeriesReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-capacitors-combo'">
              <CapacitorsComboWorksheetPanel
                :Ceq="firstReading?.R ?? 0"
                :tau="firstReading?.R ?? 0"
                :C1="100"
                :C2="100"
              />
              <CapacitorsComboReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-potentiometer'">
              <PotentiometerWorksheetPanel
                :Vref="6"
                :Vx="3"
                :Vslide="firstReading?.V ?? 0"
                :Ig="firstReading?.I ?? 0"
                :balanced="false"
              />
              <PotentiometerReferencePanel />
            </template>
            <template v-else-if="store.payload?.sourceExperiment === 'electric-lab-non-ohmic'">
              <NonOhmicWorksheetPanel
                :V="firstReading?.V ?? 0"
                :I_ohmic="firstReading?.I ?? 0"
                :I_lamp="firstReading?.I ?? 0"
                :R_dyn="firstReading?.R ?? 0"
              />
              <NonOhmicReferencePanel />
            </template>
            <template v-else>
              <GenericWorksheetPanel
                :source-experiment="store.payload?.sourceExperiment ?? ''"
                :reading="firstReading ?? {}"
              />
              <GenericReferencePanel
                :source-experiment="store.payload?.sourceExperiment ?? ''"
              />
            </template>
          </div>
        </Transition>
        <Transition name="tab-fade" mode="out-in">
          <ReportTab
            v-show="activeTab === reportTabIdx"
            :source-name="sourceName"
            :report-date="reportDate"
            :student-info="studentInfo"
            :readings="readings"
            :columns="columns"
            :equations="equations"
            :plots="plots"
            :has-data="hasData"
            :solved-equations="solvedEquations"
            :regression-data="regressionData"
            :slope-calc-data="slopeCalcData"
            :axes-data="axesData"
            :error-calc-data="errorCalcData"
            :chart-snapshot="chartSnapshot"
            :calculated-n2="store.calculatedN2"
            :expected-n2="store.expectedN2"
            @print="printReport"
            @export-csv="exportCsv"
            @export-png="exportPng"
            @send-to-teacher="sendToTeacher"
            @conclusion-update="onConclusionUpdate"
          />
        </Transition>
      </div>
    </template>

    <SubmitReportModal
      v-model:show="reportOpen"
      experiment-type="analysis"
      :experiment-id="experimentId"
      :experiment-name="sourceName || t('experiments.physicsExperiment')"
      :readings="JSON.stringify(readings)"
      :params="JSON.stringify(columns.map((c) => ({ key: c.key, label: c.label, unit: c.unit })))"
      :student-info="JSON.stringify(studentInfo)"
      :conclusion="JSON.stringify(conclusionData)"
      :columns="JSON.stringify(columns)"
      :equations="JSON.stringify(equations)"
      :plots="JSON.stringify(plots)"
      :chart-snapshot="chartSnapshot"
      :solved-equations="JSON.stringify(solvedEquations)"
      :regression-data="JSON.stringify(regressionData)"
      :slope-calc-data="JSON.stringify(slopeCalcData)"
      :axes-data="JSON.stringify(axesData)"
      :error-calc-data="JSON.stringify(errorCalcData)"
      @submitted="reportOpen = false"
    />
  </div>
</template>

<style scoped>
.analysis-calc-page {
  height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}
.no-data { flex: 1; display: flex; align-items: center; justify-content: center; }
.no-data-box { text-align: center; max-width: 420px; padding: 2rem; }
.no-data-box h2 { color: #67e8f9; margin: 0 0 0.5rem; }
.no-data-box p { color: #94a3b8; margin: 0 0 0.5rem; }
.no-data-box .hint { color: #64748b; font-size: 0.85rem; }
.btn-action {
  margin-top: 1rem; padding: 0.5rem 1.2rem; border: none; border-radius: 0.5rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; cursor: pointer; font-weight: 600;
}
.tab-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

.calc-tab {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  display: flex;
  gap: 1.5rem;
}
.calc-tab > :first-child {
  flex: 2;
  min-width: 0;
}
.calc-tab > :last-child {
  flex: 1;
  min-width: 280px;
  max-width: 360px;
}
@media (max-width: 900px) {
  .calc-tab { flex-direction: column; }
  .calc-tab > :last-child { max-width: none; }
}
</style>
