<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AnalysisColumnMeta, AnalysisEquation, AnalysisPlotConfig } from '../../../types/physics';
import type { StudentInfo } from '../../../stores/analysis.store';
import AnalysisConclusionPanel from './AnalysisConclusionPanel.vue';
import AnalysisReportPreview from './AnalysisReportPreview.vue';
import AnalysisReportExport from './AnalysisReportExport.vue';

const props = defineProps<{
  sourceName: string;
  reportDate: string;
  studentInfo: StudentInfo;
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  equations: AnalysisEquation[];
  plots: AnalysisPlotConfig[];
  hasData: boolean;
  solvedEquations?: { equationName: string; formula: string; targetVar: string; varValues: Record<string, number>; result: string; timestamp: number }[];
  regressionData?: { slope: number; intercept: number; r2: number } | null;
  slopeCalcData?: { label: string; formula: string; value: number; unit: string; expr: string } | null;
  axesData?: { x: string; y: string; xLabel: string; yLabel: string } | null;
  errorCalcData?: { theoretical: number | null; experimental: number | null; errorPercent: number | null } | null;
  chartSnapshot?: string;
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

const readyChecks = computed(() => {
  const c: { ok: boolean; text: string }[] = [];
  c.push({ ok: !!props.studentInfo.name, text: 'اسم الطالب' });
  c.push({ ok: props.readings.length >= 2, text: 'قراءتان على الأقل' });
  c.push({ ok: conclusionData.value.conclusion.length > 10, text: 'الخاتمة مكتوبة' });
  return c;
});

const allReady = computed(() => readyChecks.value.every(c => c.ok));

function onConclusionUpdate(data: { conclusion: string; errors: string; improvements: string }) {
  conclusionData.value = data;
  emit('conclusionUpdate', data);
}
</script>

<template>
  <div class="report-tab">
    <div class="grid">
      <div class="left">
        <AnalysisConclusionPanel @update="onConclusionUpdate" />
        <div class="readiness">
          <div class="readiness-title">📋 جاهزية التقرير</div>
          <div v-for="(c, i) in readyChecks" :key="i" :class="['r-item', c.ok ? 'ok' : 'no']">
            {{ c.ok ? '✅' : '⬜' }} {{ c.text }}
          </div>
          <div v-if="allReady" class="all-ready">🎉 التقرير جاهز للإرسال!</div>
        </div>
      </div>
      <div class="right">
        <button class="btn-preview" @click="showPreview = !showPreview">
          {{ showPreview ? '✕ إخفاء' : '👁️ معاينة التقرير' }}
        </button>
        <div v-show="showPreview" class="preview-box">
          <AnalysisReportPreview
            :source-name="sourceName"
            :report-date="reportDate"
            :student-info="studentInfo"
            :readings="readings"
            :columns="columns"
            :equations="equations"
            :plots="plots"
            :conclusion="conclusionData"
            :solved-equations="solvedEquations"
            :regression-data="regressionData"
            :slope-calc-data="slopeCalcData"
            :axes-data="axesData"
            :error-calc-data="errorCalcData"
            :chart-snapshot="chartSnapshot"
          />
        </div>
        <AnalysisReportExport
          :has-data="hasData"
          @print="emit('print')"
          @export-csv="emit('exportCsv')"
          @export-png="emit('exportPng')"
          @send-to-teacher="emit('sendToTeacher')"
        />
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
.readiness { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.5rem; }
.readiness-title { font-size: 0.8rem; color: #67e8f9; font-weight: 600; margin-bottom: 0.3rem; }
.r-item { font-size: 0.75rem; padding: 0.2rem 0; }
.r-item.ok { color: #4ade80; }
.r-item.no { color: #64748b; }
.all-ready { margin-top: 0.4rem; padding: 0.4rem; background: rgba(34,197,94,0.1); border-radius: 0.3rem; color: #4ade80; font-size: 0.8rem; text-align: center; font-weight: 600; }
</style>
