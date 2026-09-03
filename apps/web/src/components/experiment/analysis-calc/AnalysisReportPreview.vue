<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue';

import type { AnalysisColumnMeta, AnalysisEquation, AnalysisPlotConfig } from '../../../types/physics';
import type { StudentInfo } from '../../../stores/analysis.store';





const props = defineProps<{
  sourceName: string;
  reportDate: string;
  studentInfo: StudentInfo;
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  equations: AnalysisEquation[];
  plots: AnalysisPlotConfig[];
  conclusion?: { conclusion: string; errors: string; improvements: string };
  solvedEquations?: { equationName: string; formula: string; targetVar: string; varValues: Record<string, number>; result: string; timestamp: number }[];
  regressionData?: { slope: number; intercept: number; r2: number } | null;
  slopeCalcData?: { label: string; formula: string; value: number; unit: string; expr: string } | null;
  axesData?: { x: string; y: string; xLabel: string; yLabel: string } | null;
  errorCalcData?: { theoretical: number | null; experimental: number | null; errorPercent: number | null } | null;
  chartSnapshot?: string;
  calculatedN2?: number | null;
  expectedN2?: number | null;
}>();

const stats = computed(() => {
  const s: Record<string, { mean: number; std: number; min: number; max: number }> = {};
  for (const col of props.columns) {
    const vals = props.readings.map(r => r[col.key]).filter(v => typeof v === 'number' && !isNaN(v));
    if (!vals.length) { s[col.key] = { mean: 0, std: 0, min: 0, max: 0 }; continue; }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length);
    s[col.key] = { mean, std, min: Math.min(...vals), max: Math.max(...vals) };
  }
  return s;
});
</script>

<template>
  <div class="report-preview" id="analysis-report">
    <div class="report-header">
      <h1>{{ t('analysis.reportTitle') }}</h1>
      <div class="meta">
        <span><b>{{ t('analysis.experimentLabel') }}:</b> {{ sourceName }}</span>
        <span><b>{{ t('analysis.dateLabel') }}:</b> {{ reportDate }}</span>
      </div>
    </div>

    <div class="section" v-if="studentInfo.name || studentInfo.email || studentInfo.grade">
      <h2>{{ t('analysis.studentInfo') }}</h2>
      <div class="info-grid">
        <div v-if="studentInfo.name"><b>{{ t('analysis.name') }}:</b> {{ studentInfo.name }}</div>
        <div v-if="studentInfo.email"><b>{{ t('analysis.email') }}:</b> {{ studentInfo.email }}</div>
        <div v-if="studentInfo.grade"><b>{{ t('analysis.grade') }}:</b> {{ studentInfo.grade }}</div>
      </div>
      <div v-if="studentInfo.notes" class="notes"><b>{{ t('analysis.notes') }}:</b> {{ studentInfo.notes }}</div>
    </div>

    <div class="section">
      <h2>{{ t('analysis.readingsTable') }}</h2>
      <table class="data-table">
        <thead><tr><th>#</th><th v-for="c in columns" :key="c.key">{{ c.label }} <span v-if="c.unit">({{ c.unit }})</span></th></tr></thead>
        <tbody>
          <tr v-for="(row, i) in readings" :key="i"><td>{{ i + 1 }}</td><td v-for="c in columns" :key="c.key">{{ row[c.key]?.toFixed?.(4) ?? row[c.key] ?? '-' }}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>{{ t('analysis.statistics') }}</h2>
      <div class="stats-grid">
        <div class="stat-card" v-for="c in columns" :key="c.key">
          <div class="stat-title">{{ c.label }}</div>
          <div class="stat-row"><span>μ</span><b>{{ stats[c.key]?.mean.toFixed(3) }}</b></div>
          <div class="stat-row"><span>σ</span><b>{{ stats[c.key]?.std.toFixed(3) }}</b></div>
          <div class="stat-row"><span>min</span><b>{{ stats[c.key]?.min.toFixed(3) }}</b></div>
          <div class="stat-row"><span>max</span><b>{{ stats[c.key]?.max.toFixed(3) }}</b></div>
        </div>
      </div>
    </div>

    <div class="section" v-if="regressionData || slopeCalcData">
      <h2>{{ t('analysis.regressionResults') }}</h2>
      <div v-if="axesData" class="axes-info">
        <b>{{ t('analysis.axes') }}:</b> {{ axesData.yLabel }} (Y) {{ t('analysis.against') }} {{ axesData.xLabel }} (X)
      </div>
      <div v-if="regressionData" class="reg-card">
        <div class="reg-row"><span>{{ t('analysis.slope') }}:</span> <b>y = {{ regressionData.slope.toFixed(4) }}x {{ regressionData.intercept >= 0 ? '+' : '' }} {{ regressionData.intercept.toFixed(4) }}</b></div>
        <div class="reg-row"><span>R²:</span> <b>{{ regressionData.r2.toFixed(4) }}</b></div>
      </div>
      <div v-if="slopeCalcData" class="slope-calc-card">
        <div class="sc-label">{{ slopeCalcData.label }}</div>
        <div class="sc-formula">{{ slopeCalcData.formula }}</div>
        <div class="sc-result">{{ slopeCalcData.expr }} = <b>{{ slopeCalcData.value.toFixed(4) }} {{ slopeCalcData.unit }}</b></div>
      </div>
    </div>

    <div class="section" v-if="calculatedN2 !== null || expectedN2 !== null">
      <h2>{{ t('analysis.lightRayResults') }}</h2>
      <div class="reg-card">
        <div class="reg-row"><span>{{ t('analysis.calculatedN2') }}:</span> <b class="highlight">{{ calculatedN2?.toFixed(3) ?? '—' }}</b></div>
        <div class="reg-row"><span>{{ t('analysis.expectedN2') }}:</span> <b>{{ expectedN2?.toFixed(3) ?? '—' }}</b></div>
        <div class="reg-row" v-if="calculatedN2 != null && expectedN2 != null">
          <span>{{ t('analysis.errorRate') }}:</span>
          <b :class="{ok: Math.abs((calculatedN2!-expectedN2!)/expectedN2!*100) <= 5, bad: Math.abs((calculatedN2!-expectedN2!)/expectedN2!*100) > 5}">
            {{ Math.abs((calculatedN2!-expectedN2!)/expectedN2!*100).toFixed(2) }}%
          </b>
        </div>
        <div class="reg-row" v-if="calculatedN2 != null">
          <span>{{ t('analysis.lightSpeedMedium') }}:</span>
          <b>{{ (3e8 / calculatedN2! / 1e8).toFixed(2) }} × 10⁸ m/s</b>
        </div>
      </div>
    </div>

    <div class="section" v-if="equations.length">
      <h2>{{ t('analysis.equations') }}</h2>
      <div class="eq-list">
        <div class="eq-item" v-for="(eq, i) in equations" :key="i">
          <div class="eq-name">{{ eq.name }}</div>
          <div class="eq-formula">{{ eq.formula }}</div>
        </div>
      </div>
    </div>

    <div class="section" v-if="solvedEquations?.length">
      <h2>{{ t('analysis.solvedEquations') }}</h2>
      <div class="eq-list">
        <div class="eq-item" v-for="(s, i) in solvedEquations" :key="i">
          <div class="eq-name">{{ s.equationName }} — {{ t('analysis.unknownSolve', { var: s.targetVar }) }}</div>
          <div class="eq-formula">{{ s.formula }}</div>
          <div class="solve-values">
            <span v-for="(val, sym) in s.varValues" :key="sym" class="solve-tag">{{ sym }} = {{ val }}</span>
          </div>
          <div class="solve-result">{{ s.result }}</div>
        </div>
      </div>
    </div>

    <div class="section" v-if="errorCalcData && errorCalcData.errorPercent !== null">
      <h2>{{ t('analysis.errorPercent') }}</h2>
      <div class="error-calc-card">
        <div class="ec-row"><span>{{ t('analysis.theoreticalValue') }}:</span> <b>{{ errorCalcData.theoretical }}</b></div>
        <div class="ec-row"><span>{{ t('analysis.experimentalValue') }}:</span> <b>{{ errorCalcData.experimental }}</b></div>
        <div class="ec-row ec-result">
          <span>{{ t('analysis.errorRate') }}:</span>
          <b :class="{ good: errorCalcData.errorPercent < 5, warn: errorCalcData.errorPercent >= 5 && errorCalcData.errorPercent < 15, bad: errorCalcData.errorPercent >= 15 }">
            {{ errorCalcData.errorPercent.toFixed(2) }}%
          </b>
        </div>
      </div>
    </div>

    <div class="section" v-if="plots.length">
      <h2>{{ t('analysis.suggestedPlots') }}</h2>
      <div class="plot-list">
        <div class="plot-item" v-for="(p, i) in plots" :key="i">
          <span class="plot-type">{{ p.type === 'scatter' ? '●' : '━' }}</span>
          <span>{{ p.yLabel }} {{ t('analysis.against') }} {{ p.xLabel }}</span>
        </div>
      </div>
    </div>

    <div class="section" v-if="chartSnapshot">
      <h2>{{ t('analysis.chartTitle') }}</h2>
      <img :src="chartSnapshot" :alt="t('analysis.chartTitle')" class="chart-img" />
    </div>

    <div class="section" v-if="conclusion?.conclusion || conclusion?.errors || conclusion?.improvements">
      <h2>{{ t('analysis.conclusionSection') }}</h2>
      <div v-if="conclusion.conclusion" class="block"><b>{{ t('analysis.mainConclusion') }}:</b> {{ conclusion.conclusion }}</div>
      <div v-if="conclusion.errors" class="block"><b>{{ t('analysis.errorSources') }}:</b> {{ conclusion.errors }}</div>
      <div v-if="conclusion.improvements" class="block"><b>{{ t('analysis.improvements') }}:</b> {{ conclusion.improvements }}</div>
    </div>

    <div class="footer">
      <span>{{ t('analysis.autoGenerated') }}</span>
    </div>
  </div>
</template>

<style scoped>
.report-preview {
  background: #fff;
  color: #1a1a1a;
  padding: 2rem;
  border-radius: 0.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}
.report-header {
  text-align: center;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}
.report-header h1 { color: #0f172a; margin: 0 0 0.5rem; font-size: 1.5rem; }
.meta { display: flex; justify-content: center; gap: 1.5rem; font-size: 0.9rem; color: #444; }
.section { margin-bottom: 1.5rem; }
.section h2 { color: #0f172a; font-size: 1.1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; margin-bottom: 0.75rem; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.9rem; }
.notes { margin-top: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 0.3rem; font-size: 0.9rem; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th, .data-table td { border: 1px solid #ddd; padding: 0.4rem 0.6rem; text-align: center; }
.data-table th { background: #0f172a; color: #fff; }
.data-table tr:nth-child(even) { background: #f8f9fa; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; }
.stat-card { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 0.35rem; padding: 0.5rem; text-align: center; }
.stat-title { font-weight: 700; color: #0f172a; margin-bottom: 0.3rem; font-size: 0.8rem; }
.stat-row { display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.1rem 0; }
.stat-row span { color: #64748b; }
.eq-list { display: flex; flex-direction: column; gap: 0.5rem; }
.eq-item { background: #f8f9fa; padding: 0.5rem 0.75rem; border-radius: 0.3rem; }
.eq-name { font-weight: 700; color: #0f172a; font-size: 0.85rem; }
.eq-formula { font-family: 'Courier New', monospace; color: #374151; font-size: 0.85rem; margin-top: 0.2rem; }
.solve-values { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.3rem; }
.solve-tag { background: #e0f2fe; color: #0369a1; font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-family: 'Courier New', monospace; }
.solve-result { margin-top: 0.3rem; padding: 0.35rem 0.5rem; background: #dcfce7; color: #15803d; border-radius: 0.25rem; font-size: 0.85rem; font-family: 'Courier New', monospace; font-weight: 700; }
.axes-info { margin-bottom: 0.5rem; font-size: 0.9rem; color: #374151; }
.reg-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.35rem; padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; }
.reg-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.15rem 0; }
.reg-row span { color: #475569; }
.reg-row b { font-family: 'Courier New', monospace; color: #0369a1; }
.slope-calc-card { background: #fef3c7; border: 1px solid #fde68a; border-radius: 0.35rem; padding: 0.5rem 0.75rem; }
.sc-label { font-weight: 700; color: #92400e; font-size: 0.85rem; }
.sc-formula { font-family: 'Courier New', monospace; color: #78350f; font-size: 0.82rem; margin-top: 0.15rem; }
.sc-result { margin-top: 0.3rem; font-size: 0.9rem; font-family: 'Courier New', monospace; color: #92400e; }
.sc-result b { color: #b45309; }
.error-calc-card { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 0.35rem; padding: 0.5rem 0.75rem; }
.ec-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.15rem 0; }
.ec-row span { color: #475569; }
.ec-row b { font-family: 'Courier New', monospace; color: #c2410c; }
.ec-result b { font-size: 1.1rem; font-weight: 800; }
.ec-result b.good { color: #15803d; }
.ec-result b.warn { color: #a16207; }
.ec-result b.bad { color: #dc2626; }
.chart-img { max-width: 100%; border-radius: 0.35rem; border: 1px solid #e5e7eb; }
.plot-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.plot-item { background: #f8f9fa; padding: 0.35rem 0.6rem; border-radius: 0.3rem; font-size: 0.85rem; }
.plot-type { color: #22c55e; margin-inline-start: 0.3rem; }
.block { margin-bottom: 0.4rem; font-size: 0.9rem; }
.footer { text-align: center; font-size: 0.75rem; color: #888; border-top: 1px solid #ddd; padding-top: 1rem; margin-top: 1rem; }

@media print {
  .report-preview {
    padding: 0;
    background: #fff;
    color: #000;
    font-size: 12pt;
    line-height: 1.5;
  }
  .report-header h1 { font-size: 18pt; }
  .section h2 { font-size: 14pt; page-break-after: avoid; }
  .data-table { page-break-inside: auto; }
  .data-table tr { page-break-inside: avoid; }
  .stats-grid { page-break-inside: avoid; }
  .eq-list { page-break-inside: avoid; }
  .chart-img { max-width: 100%; page-break-inside: avoid; }
  .footer { page-break-before: avoid; }
}
</style>
