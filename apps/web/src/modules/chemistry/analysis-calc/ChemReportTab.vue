<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed, ref } from 'vue';

import { analyzeReport } from '../../../services/ai.service';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import type { ChemAnalysisColumnMeta, ChemAnalysisEquation, ChemAnalysisPlotConfig } from '../../../types/chemistry';
import type { ChemStudentInfo } from '../../../types/chemistry';
import ChemAnalysisConclusionPanel from './ChemAnalysisConclusionPanel.vue';
import ChemAnalysisReportExport from './ChemAnalysisReportExport.vue';





const props = defineProps<{
  sourceName: string;
  reportDate: string;
  studentInfo: ChemStudentInfo;
  readings: Record<string, number>[];
  columns: ChemAnalysisColumnMeta[];
  equations: ChemAnalysisEquation[];
  plots: ChemAnalysisPlotConfig[];
  hasData: boolean;
  solvedEquations?: { equationName: string; formula: string; targetVar: string; varValues: Record<string, number>; result: string; timestamp: number }[];
  regressionData?: { slope: number; intercept: number; r2: number } | null;
  slopeCalcData?: { label: string; formula: string; value: number; unit: string; expr: string } | null;
  axesData?: { x: string; y: string; xLabel: string; yLabel: string } | null;
  errorCalcData?: { theoretical: number | null; experimental: number | null; errorPercent: number | null } | null;
  chartSnapshot?: string;
  calculatedN2?: number | null;
  expectedN2?: number | null;
}>();

const emit = defineEmits<{
  (e: 'print'): void;
  (e: 'exportCsv'): void;
  (e: 'exportPng'): void;
  (e: 'sendToTeacher'): void;
  (e: 'conclusionUpdate', data: { conclusion: string; errors: string; improvements: string }): void;
}>();

const conclusionData = ref({ conclusion: '', errors: '', improvements: '' });
const showPreview = ref(false);
const aiAnalysis = ref('');
const aiLoading = ref(false);
const aiError = ref('');

async function runAiAnalysis() {
  aiLoading.value = true;
  aiError.value = '';
  aiAnalysis.value = '';
  try {
    const res = await analyzeReport({
      experiment_name: props.sourceName,
      student_name: props.studentInfo.name || undefined,
      readings: JSON.stringify(props.readings),
      columns: JSON.stringify(props.columns),
      equations: JSON.stringify(props.equations),
      plots: JSON.stringify(props.plots),
      conclusion: conclusionData.value.conclusion || undefined,
      chart_snapshot: props.chartSnapshot || undefined,
    });
    if (res.success && res.analysis) {
      aiAnalysis.value = sanitizeHtml(res.analysis);
    } else {
      aiError.value = res.message || t('chemistryAnalysis.aiAnalysisFailed');
    }
  } catch (err) {
    aiError.value = err instanceof Error ? err.message : t('chemistryAnalysis.serverConnectionError');
  } finally {
    aiLoading.value = false;
  }
}

const readyChecks = computed(() => {
  const c: { ok: boolean; text: string }[] = [];
  c.push({ ok: !!props.studentInfo.name, text: t('analysis.studentName') });
  c.push({ ok: props.readings.length >= 2, text: t('analysis.minTwoReadings') });
  c.push({ ok: conclusionData.value.conclusion.length > 10, text: t('analysis.conclusionWritten') });
  return c;
});

const allReady = computed(() => readyChecks.value.every(c => c.ok));

const concTable = computed(() => {
  if (!props.readings.length) return [];
  const vKey = props.columns.find(c => c.key === 'vAdded')?.key;
  const pHKey = props.columns.find(c => c.key === 'ph')?.key;
  if (!vKey || !pHKey) return [];
  return props.readings
    .map(r => {
      const v = Number(r[vKey]) || 0;
      const ph = Number(r[pHKey]) || 0;
      const h = Math.pow(10, -ph);
      const oh = Math.pow(10, -(14 - ph));
      return { v, ph, h, oh };
    })
    .filter(r => !isNaN(r.v) && !isNaN(r.ph))
    .sort((a, b) => a.v - b.v);
});

function onConclusionUpdate(data: { conclusion: string; errors: string; improvements: string }) {
  conclusionData.value = data;
  emit('conclusionUpdate', data);
}
</script>

<template>
  <div class="report-tab">
    <div class="grid">
      <div class="left">
        <ChemAnalysisConclusionPanel @update="onConclusionUpdate" />
        <div class="readiness">
          <div class="readiness-title">{{ t('analysis.reportReadiness') }}</div>
          <div v-for="(c, i) in readyChecks" :key="i" :class="['r-item', c.ok ? 'ok' : 'no']">
            {{ c.ok ? '✅' : '✗' }} {{ c.text }}
          </div>
          <div v-if="allReady" class="all-ready">{{ t('analysis.reportReady') }}</div>
        </div>
      </div>
      <div class="right">
        <button class="btn-preview" @click="showPreview = !showPreview">
          {{ showPreview ? t('analysis.hide') : t('analysis.previewReport') }}
        </button>
        <div v-show="showPreview" class="preview-box">
          <div class="preview-report">
            <h3>{{ sourceName }}</h3>
            <p class="meta">{{ t('analysis.dateLabel') }}: {{ reportDate }} | {{ t('analysis.studentName') }}: {{ studentInfo.name }}</p>
            <table v-if="readings.length" class="preview-table">
              <thead><tr><th>#</th><th v-for="col in columns" :key="col.key">{{ col.label }}</th></tr></thead>
              <tbody><tr v-for="(r, i) in readings" :key="i"><td>{{ i + 1 }}</td><td v-for="col in columns" :key="col.key">{{ r[col.key] }}</td></tr></tbody>
            </table>
            <div v-if="solvedEquations?.length" class="preview-equations">
              <h4>{{ t('analysis.solvedEquations') }}</h4>
              <div v-for="(sol, i) in solvedEquations" :key="i">{{ sol.equationName }}: {{ sol.targetVar }} = {{ sol.result }}</div>
            </div>
            <div v-if="chartSnapshot" class="preview-chart"><img :src="chartSnapshot" alt="chart" /></div>
            <div v-if="conclusionData.conclusion" class="preview-conclusion"><h4>{{ t('analysis.mainConclusion') }}</h4><p>{{ conclusionData.conclusion }}</p></div>
          <div v-if="conclusionData.errors" class="preview-conclusion"><h4>{{ t('analysis.errorSources') }}</h4><p>{{ conclusionData.errors }}</p></div>
          <div v-if="conclusionData.improvements" class="preview-conclusion"><h4>{{ t('analysis.improvements') }}</h4><p>{{ conclusionData.improvements }}</p></div>
          </div>
        </div>
        <ChemAnalysisReportExport
          :has-data="hasData"
          @print="emit('print')"
          @export-csv="emit('exportCsv')"
          @export-png="emit('exportPng')"
          @send-to-teacher="emit('sendToTeacher')"
        />

        <!-- AI Analysis -->
        <div class="ai-section">
          <button class="btn-ai" :disabled="!hasData || aiLoading" @click="runAiAnalysis">
            {{ aiLoading ? t('chemistryAnalysis.analyzing') : t('chemistryAnalysis.aiAnalysisTitle') }}
          </button>
          <div v-if="aiError" class="ai-error">{{ aiError }}</div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="aiAnalysis" class="ai-result" v-html="aiAnalysis"></div>
        </div>

        <!-- Concentration Table -->
        <div v-if="concTable.length" class="conc-table-section">
          <div class="conc-title">{{ t('chemistryAnalysis.concentrationTable') }}</div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>V (mL)</th><th>pH</th><th>[H⁺] (M)</th><th>[OH⁻] (M)</th><th>pOH</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in concTable" :key="i">
                  <td>{{ row.v.toFixed(1) }}</td>
                  <td>{{ row.ph.toFixed(2) }}</td>
                  <td>{{ row.h.toExponential(2) }}</td>
                  <td>{{ row.oh.toExponential(2) }}</td>
                  <td>{{ (14 - row.ph).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-tab { flex: 1; overflow: hidden; display: flex; flex-direction: column; padding: 0.5rem; }
.grid { display: flex; gap: 0.5rem; height: 100%; }
.left { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; }
.right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.5rem; overflow: hidden; }
.btn-preview { flex-shrink: 0; padding: 0.4rem; border: none; border-radius: 0.35rem; background: linear-gradient(135deg, #475569, #334155); color: #fff; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.preview-box { flex: 1; overflow-y: auto; background: #0f172a; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.06); padding: 0.5rem; }
.preview-report h3 { color: #67e8f9; margin: 0 0 0.3rem; font-size: 1.1rem; }
.preview-report .meta { color: #64748b; font-size: 0.75rem; margin-bottom: 0.5rem; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 0.72rem; margin-bottom: 0.5rem; }
.preview-table th { background: rgba(255,255,255,0.05); color: #94a3b8; padding: 0.3rem; text-align: center; }
.preview-table td { padding: 0.25rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.preview-equations { font-size: 0.75rem; color: #e2e8f0; margin-bottom: 0.5rem; }
.preview-equations h4 { color: #67e8f9; margin: 0.3rem 0; font-size: 0.85rem; }
.preview-chart img { max-width: 100%; border-radius: 0.3rem; margin-bottom: 0.5rem; }
.preview-conclusion h4 { color: #67e8f9; margin: 0.3rem 0; font-size: 0.85rem; }
.preview-conclusion p { color: #e2e8f0; font-size: 0.78rem; line-height: 1.5; }
.readiness { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.5rem; }
.readiness-title { font-size: 0.8rem; color: #67e8f9; font-weight: 600; margin-bottom: 0.3rem; }
.r-item { font-size: 0.75rem; padding: 0.2rem 0; }
.r-item.ok { color: #4ade80; }
.r-item.no { color: #64748b; }
.all-ready { margin-top: 0.4rem; padding: 0.4rem; background: rgba(34,197,94,0.1); border-radius: 0.3rem; color: #4ade80; font-size: 0.8rem; text-align: center; font-weight: 600; }

.conc-table-section { flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.5rem; overflow: hidden; display: flex; flex-direction: column; max-height: 220px; }
.conc-title { font-size: 0.85rem; color: #67e8f9; font-weight: 700; margin-bottom: 0.3rem; }
.table-wrap { overflow: auto; flex: 1; }
.conc-table-section table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.conc-table-section th, .conc-table-section td { padding: 0.4rem 0.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
.conc-table-section th { background: rgba(255,255,255,0.05); color: #94a3b8; font-weight: 700; position: sticky; top: 0; }
.conc-table-section tbody tr:nth-child(even) { background: rgba(255,255,255,0.02); }
.conc-table-section tbody tr:hover { background: rgba(91,141,184,0.05); }

.ai-section { flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem; }
.btn-ai { padding: 0.5rem 1rem; border: none; border-radius: 0.4rem; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; }
.btn-ai:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(139,92,246,0.4); }
.btn-ai:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-error { color: #f87171; font-size: 0.8rem; padding: 0.3rem; background: rgba(239,68,68,0.1); border-radius: 0.3rem; }
.ai-result { color: #e2e8f0; font-size: 0.82rem; line-height: 1.6; max-height: 300px; overflow-y: auto; padding: 0.5rem; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2); border-radius: 0.4rem; }
.ai-result :deep(h1), .ai-result :deep(h2), .ai-result :deep(h3) { color: #67e8f9; font-size: 0.9rem; margin: 0.3rem 0; }
.ai-result :deep(ul), .ai-result :deep(ol) { padding-inline-start: 1.2rem; margin: 0.3rem 0; }
.ai-result :deep(li) { margin: 0.15rem 0; }
.ai-result :deep(strong) { color: #a5b4fc; }
</style>
