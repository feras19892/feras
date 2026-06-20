<script setup lang="ts">
import { useChartWorkspace } from '../../../composables/experiment/analysis/useChartWorkspace'
import type { AnalysisColumnMeta, AnalysisPlotConfig } from '../../../types/physics'

const props = defineProps<{
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  suggestedPlots: AnalysisPlotConfig[];
}>();

const {
  xKey,
  yKey,
  containerRef,
  canvasRef,
  numericKeys,
  regression,
  slopeWarning,
  slopeCalc,
  showSlopeResult,
  showAxisControls,
} = useChartWorkspace(
  () => props.readings,
  () => props.columns,
  () => props.suggestedPlots
);
</script>

<template>
  <div class="chart-panel" ref="containerRef">
    <div class="panel-header">
      <span>📈 رسم بياني</span>
      <button class="btn-toggle" @click="showAxisControls = !showAxisControls">
        {{ showAxisControls ? '✕' : '⚙️' }} محاور
      </button>
    </div>
    <div v-if="showAxisControls" class="axis-controls">
      <div class="ctrl-row">
        <label>محور X</label>
        <select v-model="xKey">
          <option v-for="k in numericKeys" :key="k" :value="k">{{ k }}</option>
        </select>
      </div>
      <div class="ctrl-row">
        <label>محور Y</label>
        <select v-model="yKey">
          <option v-for="k in numericKeys" :key="k" :value="k">{{ k }}</option>
        </select>
      </div>
    </div>
    <canvas ref="canvasRef" style="flex:1;min-height:0;display:block;height:100%;"></canvas>
    <div v-if="regression" class="reg-stats">
      <span>y = {{ regression.slope.toFixed(4) }}x {{ regression.intercept >= 0 ? '+' : '' }} {{ regression.intercept.toFixed(4) }}</span>
      <span class="r2">R² = {{ regression.r2.toFixed(4) }}</span>
    </div>
    <div v-if="slopeWarning" class="slope-warning">{{ slopeWarning }}</div>
    <div v-if="slopeCalc" class="slope-action">
      <button class="btn-calc" @click="showSlopeResult = !showSlopeResult">
        🔬 {{ slopeCalc.label }}
      </button>
      <div v-if="showSlopeResult" class="slope-result">
        <div class="sr-formula">{{ slopeCalc.formula }}</div>
        <div class="sr-expr">{{ slopeCalc.expr }} = <span class="sr-val">{{ slopeCalc.value.toFixed(3) }} {{ slopeCalc.unit }}</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 1rem;
  color: #67e8f9;
  font-weight: 700;
  flex-shrink: 0;
}
.btn-toggle { background: rgba(91,141,184,.15); border: 1px solid #334155; color: #67e8f9; border-radius: 0.3rem; padding: 0.25rem 0.6rem; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-toggle:hover { background: rgba(91,141,184,.25); }
.axis-controls { display: flex; gap: 1rem; padding: 0.5rem 0.9rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.ctrl-row { display: flex; align-items: center; gap: 0.4rem; }
.ctrl-row label { color: #94a3b8; font-size: 0.8rem; font-weight: 600; }
select {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.3rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.9rem;
}
.vs { color: #64748b; font-size: 0.85rem; }
.reg-stats {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  font-size: 1.1rem;
  color: #fbbf24;
  background: rgba(245,158,11,0.08);
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}
.reg-stats .r2 { color: #4ade80; font-weight: 700; font-size: 1.1rem; }
.slope-warning {
  background: rgba(239,68,68,0.1);
  border-top: 1px solid rgba(239,68,68,0.2);
  color: #f87171;
  padding: 0.5rem 0.9rem;
  font-size: 0.9rem;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
}
.slope-calc {
  background: rgba(6,182,212,0.08);
  border-top: 1px solid rgba(6,182,212,0.2);
  padding: 0.5rem 0.9rem;
  flex-shrink: 0;
}
.calc-title { font-size: 0.9rem; color: #67e8f9; font-weight: 700; margin-bottom: 0.3rem; }
.calc-steps { display: flex; flex-direction: column; gap: 0.2rem; }
.step { font-size: 0.85rem; color: #94a3b8; font-family: 'Courier New', monospace; }
.step.final { color: #fbbf24; font-weight: 700; font-size: 0.95rem; }
.slope-action {
  background: rgba(34,197,94,0.08);
  border-top: 1px solid rgba(34,197,94,0.2);
  padding: 0.4rem 0.9rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.btn-calc {
  background: linear-gradient(135deg, #059669, #047857);
  border: none;
  color: #fff;
  border-radius: 0.35rem;
  padding: 0.4rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: all .15s;
}
.btn-calc:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.3); }
.slope-result {
  background: rgba(0,0,0,0.2);
  border-radius: 0.3rem;
  padding: 0.4rem 0.6rem;
}
.sr-formula { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.2rem; }
.sr-expr { font-size: 0.9rem; color: #e2e8f0; font-family: 'Courier New', monospace; }
.sr-val { color: #fbbf24; font-weight: 700; font-size: 1rem; }
</style>
