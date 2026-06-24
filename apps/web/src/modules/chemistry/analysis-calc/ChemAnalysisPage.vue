<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useChemistryAnalysisStore } from '../../../stores/chemistry-analysis.store';
import { consumePendingPayload } from '../../../composables/chemistry/sendToAnalysis';
import { useI18n } from '../../../composables/useI18n';
import ChemAnalysisMenuBar from './ChemAnalysisMenuBar.vue';
import ChemAnalysisTabs from './ChemAnalysisTabs.vue';
import ChemDataTab from './ChemDataTab.vue';
import ChemAnalysisTab from './ChemAnalysisTab.vue';
import ChemReportTab from './ChemReportTab.vue';

const { t } = useI18n();
const router = useRouter();
const store = useChemistryAnalysisStore();
const activeTab = ref(0);
const reportOpen = ref(false);
const conclusionData = ref({ conclusion: '', errors: '', improvements: '' });
const chartSnapshot = ref('');
const analysisTabRef = ref<InstanceType<typeof ChemAnalysisTab> | null>(null);

onMounted(() => {
  const pending = consumePendingPayload();
  if (pending) store.setPayload(pending);
});

const hasData = computed(() => store.hasData);
const sourceName = computed(() => store.sourceName);
const readings = computed(() => store.readings);
const columns = computed(() => store.columns);
const equations = computed(() => store.equations);
const plots = computed(() => store.plots);
const studentInfo = computed(() => store.studentInfo);
const reportDate = computed(() => store.reportDate);
const solvedEquations = computed(() => analysisTabRef.value?.solvedEquations ?? []);
const regressionData = computed(() => analysisTabRef.value?.getRegression() ?? null);
const slopeCalcData = computed(() => analysisTabRef.value?.getSlopeCalc() ?? null);
const axesData = computed(() => analysisTabRef.value?.getAxes() ?? null);
const errorCalcData = computed(() => analysisTabRef.value?.errorCalcData ?? null);

function goBack() {
  const referrer = localStorage.getItem('chemistry-analysis-referrer');
  if (referrer) { router.push(referrer); }
  else { router.back(); }
}
function clearData() { store.clearData(); activeTab.value = 0; }
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
    .chem-analysis-page > *:not(.tab-content) { display: none !important; }
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
  const csv = ['\uFEFF' + [...meta, headers, ...rows].join('\n')];
  const blob = new Blob(csv, { type: 'text/csv;charset=utf-8;' });
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
  const canvas = analysisTabRef.value?.getCanvas?.();
  if (!canvas || canvas.width === 0) {
    if (prevTab !== 1) activeTab.value = prevTab;
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
  const canvas = analysisTabRef.value?.getCanvas?.();
  if (canvas && canvas.width > 0) {
    chartSnapshot.value = canvas.toDataURL('image/png');
  }
  if (prevTab !== 1) activeTab.value = prevTab;
}

async function sendToTeacher() {
  if (!hasData.value) return;
  await captureChart();
  reportOpen.value = true;
}

function loadDemoData() {
  store.setPayload({
    sourceExperiment: 'titration-demo',
    sourceNameAr: 'معايرة HCl - NaOH',
    readings: [
      { vAdded: 0.0, ph: 1.0, temperature: 25.0 },
      { vAdded: 5.0, ph: 1.3, temperature: 25.2 },
      { vAdded: 10.0, ph: 1.6, temperature: 25.3 },
      { vAdded: 15.0, ph: 2.0, temperature: 25.4 },
      { vAdded: 20.0, ph: 2.5, temperature: 25.5 },
      { vAdded: 22.0, ph: 3.0, temperature: 25.6 },
      { vAdded: 23.0, ph: 3.5, temperature: 25.7 },
      { vAdded: 23.5, ph: 4.0, temperature: 25.8 },
      { vAdded: 23.8, ph: 5.0, temperature: 25.9 },
      { vAdded: 24.0, ph: 6.0, temperature: 26.0 },
      { vAdded: 24.1, ph: 7.0, temperature: 26.2 },
      { vAdded: 24.2, ph: 8.5, temperature: 26.5 },
      { vAdded: 24.3, ph: 10.0, temperature: 26.8 },
      { vAdded: 24.5, ph: 11.0, temperature: 27.0 },
      { vAdded: 25.0, ph: 11.5, temperature: 27.2 },
      { vAdded: 26.0, ph: 12.0, temperature: 27.3 },
      { vAdded: 28.0, ph: 12.5, temperature: 27.4 },
      { vAdded: 30.0, ph: 12.8, temperature: 27.5 },
    ],
    columns: [
      { key: 'vAdded', label: 'حجم القاعدة المضافة', unit: 'mL' },
      { key: 'ph', label: 'pH', unit: '' },
      { key: 'temperature', label: 'درجة الحرارة', unit: '°C' },
    ],
    equations: [
      {
        name: 'حساب التركيز',
        formula: 'M_acid = (M_base * V_eq) / V_acid',
        variables: [
          { symbol: 'M_base', label: 'تركيز القاعدة المعروف', value: 0.1 },
          { symbol: 'V_eq', label: 'حجم التعادل', value: 24.1 },
          { symbol: 'V_acid', label: 'حجم الحمض', value: 25.0 },
        ],
        solveFor: ['M_acid'],
      },
      {
        name: 'حساب pH',
        formula: 'pH = -log10(H)',
        variables: [
          { symbol: 'H', label: 'تركيز H+', value: 1e-7 },
        ],
        solveFor: ['pH'],
      },
    ],
    suggestedPlots: [
      { xKey: 'vAdded', yKey: 'ph', xLabel: 'حجم القاعدة (mL)', yLabel: 'pH', type: 'scatter' as const },
      { xKey: 'vAdded', yKey: 'temperature', xLabel: 'حجم القاعدة (mL)', yLabel: 'درجة الحرارة (°C)', type: 'line' as const },
    ],
  });
}
</script>

<template>
  <div class="chem-analysis-page">
    <ChemAnalysisMenuBar :source-name="sourceName" @back="goBack" @clear="clearData" />

    <div v-if="!hasData" class="no-data">
      <div class="no-data-box">
        <h2>🧪 {{ t('experiments.chemistryAnalysisTitle') }}</h2>
        <p>{{ t('experiments.noDataSentYet') }}</p>
        <p class="hint">{{ t('experiments.goToExperimentRecordReadings') }}</p>
        <button class="btn-action" @click="goBack">{{ t('experiments.backToExperiments') }}</button>
        <button class="btn-action demo-btn" @click="loadDemoData">📊 تحميل بيانات تجريبية (معايرة)</button>
      </div>
    </div>

    <template v-else>
      <ChemAnalysisTabs :active="activeTab" @change="activeTab = $event" />
      <div class="tab-content">
        <Transition name="tab-fade" mode="out-in">
          <ChemDataTab
            v-show="activeTab === 0"
            :readings="readings"
            :columns="columns"
            @update-cell="updateCell"
            @add-row="addRow"
            @remove-row="removeRow"
          />
        </Transition>
        <Transition name="tab-fade" mode="out-in">
          <ChemAnalysisTab
            ref="analysisTabRef"
            v-show="activeTab === 1"
            :readings="readings"
            :columns="columns"
            :equations="equations"
            :plots="plots"
          />
        </Transition>
        <Transition name="tab-fade" mode="out-in">
          <ChemReportTab
            v-show="activeTab === 2"
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
            @print="printReport"
            @export-csv="exportCsv"
            @export-png="exportPng"
            @send-to-teacher="sendToTeacher"
            @conclusion-update="onConclusionUpdate"
          />
        </Transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chem-analysis-page {
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
.demo-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  margin-left: 0.5rem;
}
.tab-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>
