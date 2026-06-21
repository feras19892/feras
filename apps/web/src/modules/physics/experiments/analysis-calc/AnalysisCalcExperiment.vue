<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAnalysisStore } from '../../../../stores/analysis.store';
import { consumePendingPayload } from '../../../../composables/analysis/sendToAnalysis';
import AnalysisMenuBar from '../../../../components/experiment/analysis-calc/AnalysisMenuBar.vue';
import StudentInfoPanel from '../../../../components/experiment/analysis-calc/StudentInfoPanel.vue';
import AnalysisDataTable from '../../../../components/experiment/analysis-calc/AnalysisDataTable.vue';
import AnalysisChartWorkspace from '../../../../components/experiment/analysis-calc/AnalysisChartWorkspace.vue';
import AnalysisEquationsPanel from '../../../../components/experiment/analysis-calc/AnalysisEquationsPanel.vue';
import AnalysisStatsPanel from '../../../../components/experiment/analysis-calc/AnalysisStatsPanel.vue';
import AnalysisConclusionPanel from '../../../../components/experiment/analysis-calc/AnalysisConclusionPanel.vue';
import AnalysisReportPreview from '../../../../components/experiment/analysis-calc/AnalysisReportPreview.vue';
import AnalysisReportExport from '../../../../components/experiment/analysis-calc/AnalysisReportExport.vue';
import SubmitReportModal from '../../../../components/experiment/SubmitReportModal.vue';

const router = useRouter();
const store = useAnalysisStore();
const showPreview = ref(false);
const reportOpen = ref(false);
const conclusionData = ref({ conclusion: '', errors: '', improvements: '' });

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

function goBack() { router.push('/physics/mechanics'); }
function clearData() { store.clearData(); showPreview.value = false; }
function updateCell(row: number, key: string, value: number) { store.updateCell(row, key, value); }
function onConclusionUpdate(data: { conclusion: string; errors: string; improvements: string }) { conclusionData.value = data; }

function printReport() {
  const style = document.createElement('style');
  style.id = 'print-hide-style';
  style.innerHTML = `@media print {
    .analysis-calc-page > *:not(.main-body) { display: none !important; }
    .main-body { display: block !important; }
    .left-col { display: none !important; }
    .right-col { width: 100% !important; }
    .btn-preview, .chart-panel { display: none !important; }
    .preview-box { display: block !important; overflow: visible !important; height: auto !important; }
  }`;
  document.head.appendChild(style);
  setTimeout(() => { window.print(); setTimeout(() => { const s = document.getElementById('print-hide-style'); if (s) s.remove(); }, 500); }, 100);
}
function exportCsv() {
  if (!readings.value.length) return;
  const headers = columns.value.map(c => `${c.label}${c.unit ? ` (${c.unit})` : ''}`).join(',');
  const rows = readings.value.map((r, i) => [i + 1, ...columns.value.map(c => r[c.key] ?? '')].join(','));
  const meta = [`Experiment: ${sourceName.value}`, `Date: ${reportDate.value}`, `Student: ${studentInfo.value.name}`, '',];
  const csv = [...meta, headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${sourceName.value}_report.csv`; a.click(); URL.revokeObjectURL(url);
}
async function exportPng() {
  const canvas = document.querySelector('.chart-panel canvas') as HTMLCanvasElement;
  if (!canvas) { alert('لا يوجد رسم بياني'); return; }
  const link = document.createElement('a');
  link.download = `${sourceName.value}_chart.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
const chartSnapshot = ref('');

function captureChart() {
  const canvas = document.querySelector('.chart-panel canvas') as HTMLCanvasElement;
  if (canvas) chartSnapshot.value = canvas.toDataURL('image/png');
}

function sendToTeacher() {
  if (!hasData.value) return;
  captureChart();
  reportOpen.value = true;
}
</script>

<template>
  <div class="analysis-calc-page">
    <AnalysisMenuBar :source-name="sourceName" @back="goBack" @clear="clearData" />

    <div v-if="!hasData" class="no-data">
      <div class="no-data-box">
        <h2>📊 التحليل والحساب</h2>
        <p>لم تُرسل بيانات من أي تجربة بعد.</p>
        <p class="hint">اذهب إلى أي تجربة فيزيائية، سجل القراءات، ثم اضغط "تحليل النتائج".</p>
        <button class="btn-action" @click="goBack">العودة للتجارب</button>
      </div>
    </div>

    <div v-else class="main-body">
      <!-- العمود الأيسر: البيانات (35%) -->
      <div class="left-col">
        <StudentInfoPanel />
        <AnalysisDataTable :readings="readings" :columns="columns" @update-cell="updateCell" />
        <AnalysisConclusionPanel @update="onConclusionUpdate" />
        <AnalysisReportExport :has-data="hasData" @print="printReport" @export-csv="exportCsv" @export-png="exportPng" @send-to-teacher="sendToTeacher" />
      </div>
      <!-- العمود الأيمن: التحليل (65%) -->
      <div class="right-col">
        <!-- الرسم يأخذ 55% -->
        <div class="chart-area">
          <AnalysisChartWorkspace :readings="readings" :columns="columns" :suggested-plots="plots" />
        </div>
        <!-- المعادلات + الإحصائيات بجانب بعض (45%) -->
        <div class="analysis-row">
          <div class="eq-area">
            <AnalysisEquationsPanel :equations="equations" :readings="readings" />
          </div>
          <div class="stats-area">
            <AnalysisStatsPanel :readings="readings" :columns="columns" />
          </div>
        </div>
        <!-- معاينة التقرير -->
        <button class="btn-preview" @click="showPreview = !showPreview">
          {{ showPreview ? '✕ إخفاء' : '👁️ معاينة التقرير' }}
        </button>
        <div v-if="showPreview" class="preview-box">
          <AnalysisReportPreview
            :source-name="sourceName"
            :report-date="reportDate"
            :student-info="studentInfo"
            :readings="readings"
            :columns="columns"
            :equations="equations"
            :plots="plots"
            :conclusion="conclusionData"
          />
        </div>
      </div>
    </div>

    <SubmitReportModal
      v-model:show="reportOpen"
      experiment-type="analysis"
      :experiment-name="sourceName || 'تجربة فيزيائية'"
      :readings="JSON.stringify(readings)"
      :params="JSON.stringify(columns.map((c: any) => ({ key: c.key, label: c.label, unit: c.unit })))"
      :student-info="JSON.stringify(studentInfo)"
      :conclusion="JSON.stringify(conclusionData)"
      :columns="JSON.stringify(columns)"
      :equations="JSON.stringify(equations)"
      :plots="JSON.stringify(plots)"
      :chart-snapshot="chartSnapshot"
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
.main-body { flex: 1; overflow: hidden; display: flex; gap: 0.5rem; padding: 0.5rem; }
.left-col {
  width: 30%; min-width: 260px;
  display: flex; flex-direction: column; gap: 0.5rem;
  overflow-y: auto; overflow-x: hidden;
}
.right-col {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.chart-area { flex: 1.4; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.analysis-row {
  flex: 0.9; min-height: 0;
  display: flex; flex-wrap: wrap;
  gap: 0.5rem;
  overflow-y: auto; overflow-x: hidden;
}
.eq-area { flex: 1; min-width: 280px; overflow: hidden; display: flex; flex-direction: column; }
.stats-area { flex: 1; min-width: 280px; overflow: hidden; display: flex; flex-direction: column; }
.btn-preview {
  flex-shrink: 0; padding: 0.4rem 0.75rem; border: none; border-radius: 0.35rem;
  background: linear-gradient(135deg, #475569, #334155); color: #fff; cursor: pointer;
  font-size: 0.85rem; font-weight: 700; text-align: center;
}
.preview-box {
  flex: 1; overflow-y: auto; background: #0f172a; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.06);
  padding: 0.5rem;
}
</style>
