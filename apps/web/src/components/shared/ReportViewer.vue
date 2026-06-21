<script setup lang="ts">
import { computed } from 'vue';
import type { Report } from '../../services/report.service';
import AnalysisReportPreview from '../experiment/analysis-calc/AnalysisReportPreview.vue';

const props = defineProps<{ report: Report }>();

function safeJsonParse<T>(str: string | undefined, fallback: T): T {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}

const parsedParams = computed(() => safeJsonParse<Record<string, any>>(props.report.params, {}));
const parsed = computed(() => ({
  sourceName: props.report.experiment_name,
  reportDate: props.report.submitted_at?.slice(0, 10) || '',
  studentInfo: safeJsonParse(props.report.student_info, { name: props.report.student_name || '', email: '', grade: '', notes: '' }),
  readings: safeJsonParse(props.report.readings, []),
  columns: safeJsonParse(props.report.columns, []),
  equations: safeJsonParse(props.report.equations, []),
  plots: safeJsonParse(props.report.plots, []),
  conclusion: {
    conclusion: props.report.conclusion || '',
    errors: props.report.conclusion_errors || '',
    improvements: props.report.conclusion_improvements || '',
  },
  solvedEquations: parsedParams.value.solved_equations ?? undefined,
  regressionData: parsedParams.value.regression_data ?? undefined,
  slopeCalcData: parsedParams.value.slope_calc_data ?? undefined,
  axesData: parsedParams.value.axes_data ?? undefined,
  errorCalcData: parsedParams.value.error_calc_data ?? undefined,
}));
</script>

<template>
  <div class="report-viewer-wrapper">
    <AnalysisReportPreview
      :source-name="parsed.sourceName"
      :report-date="parsed.reportDate"
      :student-info="parsed.studentInfo"
      :readings="parsed.readings"
      :columns="parsed.columns"
      :equations="parsed.equations"
      :plots="parsed.plots"
      :conclusion="parsed.conclusion"
      :solved-equations="parsed.solvedEquations"
      :regression-data="parsed.regressionData"
      :slope-calc-data="parsed.slopeCalcData"
      :axes-data="parsed.axesData"
      :error-calc-data="parsed.errorCalcData"
    />
    <div v-if="report.chart_snapshot" class="chart-section">
      <h4>📈 الرسم البياني</h4>
      <img :src="report.chart_snapshot" alt="Chart" class="chart-img" />
    </div>
  </div>
</template>

<style scoped>
.report-viewer-wrapper {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.chart-section {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.chart-section h4 {
  margin: 0 0 0.5rem;
  color: #67e8f9;
  font-size: 0.9rem;
}
.chart-img {
  max-width: 100%;
  border-radius: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
