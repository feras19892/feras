<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ChemAnalysisColumnMeta, ChemAnalysisEquation, ChemAnalysisPlotConfig } from '../../../types/chemistry';
import { useChemCalculations } from '../../../composables/chemistry/useChemCalculations';
import ChemChartCanvas from './ChemChartCanvas.vue';

const props = defineProps<{
  readings: Record<string, number>[];
  columns: ChemAnalysisColumnMeta[];
  equations: ChemAnalysisEquation[];
  plots: ChemAnalysisPlotConfig[];
}>();

const chartRef = ref<InstanceType<typeof ChemChartCanvas> | null>(null);
const selectedPlotIndex = ref(0);
const solvedEquations = ref<{ equationName: string; formula: string; targetVar: string; varValues: Record<string, number>; result: string; timestamp: number }[]>([]);
const errorCalcData = ref<{ theoretical: number | null; experimental: number | null; errorPercent: number | null } | null>(null);

const {
  mBase, vAcid, eqPoint, mAcidResult,
  phFromConc, hConc, ohConc, pOH,
  equivalencePointData,
  calcEquivalencePoint, calcPH, calcPOH,
} = useChemCalculations(props.readings, props.columns);

const currentPlot = computed(() => props.plots[selectedPlotIndex.value] || null);
const chartData = computed(() => {
  if (!currentPlot.value) return [];
  const xk = currentPlot.value.xKey;
  const yk = currentPlot.value.yKey;
  return props.readings
    .map(r => ({ x: Number(r[xk]) || 0, y: Number(r[yk]) || 0 }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y))
    .sort((a, b) => a.x - b.x);
});

watch(() => props.readings, () => {
  if (chartRef.value) setTimeout(() => chartRef.value?.draw?.(), 50);
}, { deep: true });

function solveEquation(eq: ChemAnalysisEquation) {
  for (const target of eq.solveFor) {
    const values: Record<string, number> = {};
    for (const v of eq.variables) {
      if (v.value !== undefined) values[v.symbol] = v.value;
      else {
        const firstReading = props.readings[0];
        if (firstReading) {
          const col = props.columns.find(c => c.key === v.symbol);
          if (col) values[v.symbol] = Number(firstReading[col.key]) || 0;
        }
      }
    }
    try {
      let formula = eq.formula;
      for (const [sym, val] of Object.entries(values)) {
        formula = formula.replace(new RegExp(`\\b${sym}\\b`, 'g'), String(val));
      }
      const result = eval(formula.replace(/=/g, '-(') + ')');
      if (!isNaN(result)) {
        solvedEquations.value.push({
          equationName: eq.name,
          formula: eq.formula,
          targetVar: target,
          varValues: values,
          result: String(Number(result).toFixed(4)),
          timestamp: Date.now(),
        });
      }
    } catch { /* ignore */ }
  }
}

function calculateError() {
  if (!props.readings.length || !currentPlot.value) return;
  const yk = currentPlot.value.yKey;
  const vals = props.readings.map(r => Number(r[yk])).filter(v => !isNaN(v));
  if (!vals.length) return;
  const experimental = vals.reduce((a, b) => a + b, 0) / vals.length;
  errorCalcData.value = { theoretical: null, experimental, errorPercent: null };
}

function getAxes() {
  if (!currentPlot.value) return null;
  return { x: currentPlot.value.xKey, y: currentPlot.value.yKey, xLabel: currentPlot.value.xLabel, yLabel: currentPlot.value.yLabel };
}

function getRegression() {
  if (!chartData.value.length) return null;
  const n = chartData.value.length;
  const sumX = chartData.value.reduce((s, p) => s + p.x, 0);
  const sumY = chartData.value.reduce((s, p) => s + p.y, 0);
  const sumXY = chartData.value.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = chartData.value.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-9) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const yPred = chartData.value.map(p => slope * p.x + intercept);
  const ssRes = chartData.value.reduce((s, p, i) => s + Math.pow(p.y - yPred[i], 2), 0);
  const ssTot = chartData.value.reduce((s, p) => s + Math.pow(p.y - sumY / n, 2), 0);
  const r2 = ssTot > 1e-9 ? 1 - ssRes / ssTot : 1;
  return { slope, intercept, r2 };
}

function getSlopeCalc() {
  const reg = getRegression();
  if (!reg) return null;
  return { label: 'الميل', formula: 'y = mx + b', value: reg.slope, unit: '', expr: `m = ${reg.slope.toFixed(4)}` };
}

defineExpose({
  getCanvas: () => chartRef.value?.getCanvas() ?? null,
  getAxes,
  getRegression,
  getSlopeCalc,
  drawChart: () => chartRef.value?.draw?.(),
  solvedEquations,
  errorCalcData,
});
</script>

<template>
  <div class="analysis-tab">
    <!-- Chart: smaller -->
    <div class="chart-section">
      <div v-if="plots.length > 1" class="plot-selector">
        <button v-for="(plot, i) in plots" :key="i" :class="['plot-btn', { active: selectedPlotIndex === i }]" @click="selectedPlotIndex = i">
          {{ plot.xLabel }} vs {{ plot.yLabel }}
        </button>
      </div>
      <ChemChartCanvas v-if="currentPlot" ref="chartRef" :data="chartData" :x-label="currentPlot.xLabel" :y-label="currentPlot.yLabel" :type="currentPlot.type" />
    </div>

    <!-- Calculations: larger -->
    <div class="calc-section">
      <!-- Equivalence Point -->
      <div class="calc-col">
        <div class="panel-title">🧪 نقطة التعادل</div>
        <div class="calc-inputs">
          <div class="input-row"><label>M<sub>base</sub></label><input type="number" step="0.001" v-model.number="mBase" /></div>
          <div class="input-row"><label>V<sub>acid</sub> (mL)</label><input type="number" step="0.1" v-model.number="vAcid" /></div>
        </div>
        <button class="calc-btn" @click="calcEquivalencePoint">حساب V<sub>eq</sub> & M<sub>acid</sub></button>
        <div v-if="eqPoint !== null" class="calc-results">
          <div class="res-row"><span class="res-label">V<sub>eq</sub>:</span><span class="res-value">{{ eqPoint.toFixed(2) }} mL</span></div>
          <div class="res-row"><span class="res-label">M<sub>acid</sub>:</span><span class="res-value">{{ mAcidResult?.toFixed(4) }} M</span></div>
        </div>
        <div v-else-if="equivalencePointData" class="calc-hint">قفزة: pH {{ equivalencePointData.phEq.toFixed(1) }} عند V={{ equivalencePointData.vEq.toFixed(1) }}mL</div>
      </div>

      <!-- pH Calculator -->
      <div class="calc-col">
        <div class="panel-title">🧮 حاسبة pH / pOH</div>
        <div class="calc-inputs">
          <div class="input-row"><label>[H⁺]</label><input type="number" step="any" v-model.number="hConc" /><button class="mini-btn" @click="calcPH">pH</button></div>
          <div class="input-row"><label>[OH⁻]</label><input type="number" step="any" v-model.number="ohConc" /><button class="mini-btn" @click="calcPOH">pOH</button></div>
        </div>
        <div v-if="phFromConc !== null" class="calc-results">
          <div class="res-row"><span class="res-label">pH:</span><span class="res-value">{{ phFromConc.toFixed(2) }}</span></div>
          <div v-if="pOH !== null" class="res-row"><span class="res-label">pOH:</span><span class="res-value">{{ pOH.toFixed(2) }}</span></div>
        </div>
        <div class="calc-hint">pH = -log[H⁺] &nbsp; pOH = -log[OH⁻] &nbsp; pH + pOH = 14</div>
      </div>

      <!-- Equations -->
      <div class="calc-col">
        <div class="panel-title">📐 المعادلات</div>
        <div v-for="eq in equations" :key="eq.name" class="eq-row">
          <div class="eq-name">{{ eq.name }}</div>
          <div class="eq-formula">{{ eq.formula }}</div>
          <button class="solve-btn" @click="solveEquation(eq)">حل</button>
        </div>
        <div v-if="solvedEquations.length" class="solved-list">
          <div v-for="(sol, i) in solvedEquations.slice(-3)" :key="i" class="sol-item">{{ sol.equationName }} → {{ sol.targetVar }} = {{ sol.result }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.analysis-tab { flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; }
.chart-section { flex: 0.6; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.plot-selector { display: flex; gap: 0.3rem; flex-shrink: 0; margin-bottom: 0.3rem; }
.plot-btn { padding: 0.25rem 0.6rem; border: none; border-radius: 0.3rem; background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-size: 0.72rem; }
.plot-btn.active { background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; }
.calc-section { flex: 0.4; min-height: 0; display: flex; gap: 0.5rem; overflow: hidden; }
.calc-col { flex: 1; min-width: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.5rem; overflow-y: auto; }
.panel-title { font-size: 0.85rem; color: #67e8f9; font-weight: 700; margin-bottom: 0.4rem; }
.calc-inputs { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.4rem; }
.input-row { display: flex; align-items: center; gap: 0.3rem; }
.input-row label { font-size: 0.75rem; color: #94a3b8; min-width: 80px; }
.input-row input { flex: 1; padding: 0.3rem 0.4rem; border: 1px solid #334155; border-radius: 0.25rem; background: #0f172a; color: #e2e8f0; font-size: 0.82rem; text-align: center; }
.mini-btn { padding: 0.2rem 0.5rem; border: none; border-radius: 0.25rem; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; cursor: pointer; font-size: 0.72rem; }
.calc-btn { width: 100%; padding: 0.4rem; border: none; border-radius: 0.35rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #fff; cursor: pointer; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.3rem; }
.calc-results { background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2); border-radius: 0.35rem; padding: 0.4rem; }
.res-row { display: flex; justify-content: space-between; padding: 0.15rem 0; font-size: 0.82rem; }
.res-label { color: #94a3b8; }
.res-value { color: #67e8f9; font-weight: 700; font-family: 'Courier New', monospace; }
.calc-hint { font-size: 0.72rem; color: #64748b; margin-top: 0.3rem; line-height: 1.5; }
.eq-row { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0; font-size: 0.78rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.eq-name { color: #e2e8f0; font-weight: 600; min-width: 90px; }
.eq-formula { color: #94a3b8; flex: 1; font-family: monospace; font-size: 0.75rem; }
.solve-btn { padding: 0.15rem 0.5rem; border: none; border-radius: 0.25rem; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; cursor: pointer; font-size: 0.72rem; }
.solved-list { margin-top: 0.3rem; }
.sol-item { font-size: 0.78rem; color: #4ade80; padding: 0.1rem 0; }
.table-wrap { overflow: auto; flex: 1; }
table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
th, td { padding: 0.4rem 0.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
th { background: rgba(255,255,255,0.05); color: #94a3b8; font-weight: 700; position: sticky; top: 0; }
tbody tr:nth-child(even) { background: rgba(255,255,255,0.02); }
tbody tr:hover { background: rgba(91,141,184,0.05); }
</style>
