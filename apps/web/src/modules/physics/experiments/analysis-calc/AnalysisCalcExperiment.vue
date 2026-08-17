<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAnalysisStore } from '../../../../stores/analysis.store';
import { consumePendingPayload } from '../../../../composables/analysis/sendToAnalysis';
import { useI18n } from '../../../../composables/useI18n';
import AnalysisMenuBar from '../../../../components/experiment/analysis-calc/AnalysisMenuBar.vue';
import AnalysisTabs from '../../../../components/experiment/analysis-calc/AnalysisTabs.vue';
import DataTab from '../../../../components/experiment/analysis-calc/DataTab.vue';
import AnalysisTab from '../../../../components/experiment/analysis-calc/AnalysisTab.vue';
import ReportTab from '../../../../components/experiment/analysis-calc/ReportTab.vue';
import SubmitReportModal from '../../../../components/experiment/SubmitReportModal.vue';
import CalcTabContent from '../../../../components/experiment/analysis-calc/CalcTabContent.vue';

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
  if (pending) { store.setPayload(pending); }
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
  activeTab.value = reportTabIdx.value;
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
    if (import.meta.env.DEV) console.warn('[exportPng] no chart canvas available');
    return;
  }
  const link = document.createElement('a');
  link.download = `${sourceName.value}_chart.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  if (prevTab !== 1) activeTab.value = prevTab;
}

async function captureChart() {
  const prevTab = activeTab.value;
  if (prevTab !== 1) {
    activeTab.value = 1;
    await nextTick();
    await new Promise<void>(r => setTimeout(r, 300));
    analysisTabRef.value?.drawChart?.();
    await new Promise<void>(r => setTimeout(r, 200));
  }
  const canvas = analysisTabRef.value?.getCanvas();
  if (canvas && canvas.width > 0) {
    chartSnapshot.value = canvas.toDataURL('image/png');
  } else if (import.meta.env.DEV) {
    console.warn('[captureChart] no canvas or empty canvas');
  }
  if (prevTab !== 1) activeTab.value = prevTab;
}

async function sendToTeacher() {
  if (!hasData.value) return;
  await captureChart();
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
          <CalcTabContent
            v-show="activeTab === 2"
            :source-experiment="store.payload?.sourceExperiment ?? ''"
            :first-reading="firstReading"
          />
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

</style>
