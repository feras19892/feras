<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
defineProps<{

  equations: Record<string, unknown>[]
  solvedEquations: Record<string, unknown>[]
  regressionData: { slope: number; intercept: number; r2: number } | null
  slopeCalcData: { label: string; formula: string; value: number; unit: string; expr: string } | null
  axesData: { x: string; y: string; xLabel: string; yLabel: string } | null
  errorCalcData: { theoretical: number | null; experimental: number | null; errorPercent: number | null } | null
}>()

function r2Quality(r2: number): string {
  if (r2 >= 0.95) return 'excellent'
  if (r2 >= 0.85) return 'good'
  if (r2 >= 0.7) return 'fair'
  return 'poor'
}
</script>

<template>
  <div class="section">
    <!-- Equations -->
    <h3 v-if="equations.length" class="sec-title">🔢 {{ t('report.equationsUsed') }}</h3>
    <div v-if="equations.length" class="eq-list">
      <div v-for="(eq, i) in equations" :key="i" class="eq-card">
        <div class="eq-name">{{ eq.name }}</div>
        <div class="eq-formula">{{ eq.formula }}</div>
      </div>
    </div>

    <!-- Solved Equations -->
    <h3 v-if="solvedEquations.length" class="sec-title">✅ {{ t('report.solvedEquations') }}</h3>
    <div v-if="solvedEquations.length" class="solved-list">
      <div v-for="(s, i) in solvedEquations" :key="i" class="solved-card">
        <div class="solved-header">
          <span class="solved-name">{{ s.equationName }}</span>
          <span class="solved-target">→ {{ t('report.solvingFor') }}: {{ s.targetVar }}</span>
        </div>
        <div class="solved-formula">{{ s.formula }}</div>
        <div class="solved-values">
          <span v-for="(val, sym) in s.varValues" :key="sym" class="val-tag">{{ sym }} = {{ val }}</span>
        </div>
        <div class="solved-result">
          <span class="sr-label">{{ t('report.result') }}:</span>
          <span class="sr-value">{{ s.result }}</span>
        </div>
      </div>
    </div>

    <!-- Regression -->
    <h3 v-if="regressionData || slopeCalcData" class="sec-title">📉 {{ t('report.regressionAnalysis') }}</h3>
    <div v-if="axesData" class="axes-info">
      <b>{{ t('report.axes') }}:</b> Y = {{ axesData.yLabel }} · X = {{ axesData.xLabel }}
    </div>
    <div v-if="regressionData" class="reg-card">
      <div class="reg-row">
        <span>{{ t('report.lineEquation') }}</span>
        <b class="reg-eq">y = {{ regressionData.slope.toFixed(4) }}x {{ regressionData.intercept >= 0 ? '+' : '' }} {{ regressionData.intercept.toFixed(4) }}</b>
      </div>
      <div class="reg-row">
        <span>{{ t('report.slope') }}</span>
        <b>{{ regressionData.slope.toFixed(6) }}</b>
      </div>
      <div class="reg-row">
        <span>{{ t('report.intercept') }}</span>
        <b>{{ regressionData.intercept.toFixed(6) }}</b>
      </div>
      <div class="reg-row">
        <span>R²</span>
        <b :class="['r2-val', r2Quality(regressionData.r2)]">{{ regressionData.r2.toFixed(6) }}</b>
      </div>
      <div class="r2-bar">
        <div class="r2-track">
          <div class="r2-fill" :style="{ width: (regressionData.r2 * 100) + '%' }" :class="r2Quality(regressionData.r2)"></div>
        </div>
        <span :class="['r2-label', r2Quality(regressionData.r2)]">{{ t(`report.${r2Quality(regressionData.r2)}`) }}</span>
      </div>
    </div>

    <!-- Slope Calculation -->
    <div v-if="slopeCalcData" class="slope-card">
      <div class="slope-label">{{ slopeCalcData.label }}</div>
      <div class="slope-formula">{{ slopeCalcData.formula }}</div>
      <div class="slope-result">{{ slopeCalcData.expr }} = <b>{{ slopeCalcData.value.toFixed(6) }} {{ slopeCalcData.unit }}</b></div>
    </div>

    <!-- Error Analysis -->
    <h3 v-if="errorCalcData && errorCalcData.errorPercent !== null" class="sec-title">🎯 {{ t('report.errorAnalysis') }}</h3>
    <div v-if="errorCalcData && errorCalcData.errorPercent !== null" class="error-card">
      <div class="err-row">
        <span>{{ t('report.theoretical') }}</span>
        <b>{{ errorCalcData.theoretical }}</b>
      </div>
      <div class="err-row">
        <span>{{ t('report.experimental') }}</span>
        <b>{{ errorCalcData.experimental }}</b>
      </div>
      <div class="err-row err-result">
        <span>{{ t('report.errorPercent') }}</span>
        <b :class="{ good: errorCalcData.errorPercent < 5, warn: errorCalcData.errorPercent >= 5 && errorCalcData.errorPercent < 15, bad: errorCalcData.errorPercent >= 15 }">
          {{ errorCalcData.errorPercent.toFixed(2) }}%
        </b>
      </div>
      <div class="err-interpret">
        <span v-if="errorCalcData.errorPercent < 5" class="interp good">✅ {{ t('report.excellentAccuracy') }}</span>
        <span v-else-if="errorCalcData.errorPercent < 15" class="interp warn">⚠️ {{ t('report.acceptableAccuracy') }}</span>
        <span v-else class="interp bad">❌ {{ t('report.poorAccuracy') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section { margin-bottom: 1.2rem; }
.sec-title { font-size: 0.95rem; font-weight: 700; color: #a5b4fc; margin: 0 0 0.6rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(165, 180, 252, 0.15); }

.eq-list { display: flex; flex-direction: column; gap: 0.4rem; }
.eq-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.4rem; padding: 0.5rem 0.7rem; }
.eq-name { font-weight: 700; color: #e5e7eb; font-size: 0.82rem; }
.eq-formula { font-family: 'Courier New', monospace; color: #94a3b8; font-size: 0.82rem; margin-top: 0.2rem; }

.solved-list { display: flex; flex-direction: column; gap: 0.5rem; }
.solved-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(34, 197, 94, 0.15); border-radius: 0.5rem; padding: 0.6rem 0.8rem; }
.solved-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; }
.solved-name { font-weight: 700; color: #4ade80; font-size: 0.85rem; }
.solved-target { font-size: 0.75rem; color: #64748b; }
.solved-formula { font-family: 'Courier New', monospace; color: #94a3b8; font-size: 0.82rem; margin-bottom: 0.3rem; }
.solved-values { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.3rem; }
.val-tag { background: rgba(103, 232, 249, 0.08); color: #67e8f9; font-size: 0.72rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-family: 'Courier New', monospace; }
.solved-result { padding: 0.35rem 0.5rem; background: rgba(34, 197, 94, 0.08); border-radius: 0.3rem; }
.sr-label { font-size: 0.75rem; color: #64748b; }
.sr-value { font-family: 'Courier New', monospace; font-weight: 700; color: #4ade80; font-size: 0.85rem; margin-inline-start: 0.3rem; }

.axes-info { font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.4rem; }
.reg-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(165, 180, 252, 0.15); border-radius: 0.5rem; padding: 0.6rem 0.8rem; }
.reg-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.2rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
.reg-row:last-of-type { border-bottom: none; }
.reg-row span { color: #64748b; }
.reg-row b { font-family: 'Courier New', monospace; color: #e2e8f0; }
.reg-eq { color: #a5b4fc; font-weight: 700; }
.r2-val.excellent { color: #4ade80; }
.r2-val.good { color: #67e8f9; }
.r2-val.fair { color: #fbbf24; }
.r2-val.poor { color: #f87171; }
.r2-bar { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.4rem; }
.r2-track { flex: 1; height: 6px; background: rgba(255, 255, 255, 0.06); border-radius: 3px; overflow: hidden; }
.r2-fill { height: 100%; border-radius: 3px; }
.r2-fill.excellent { background: #22c55e; }
.r2-fill.good { background: #67e8f9; }
.r2-fill.fair { background: #fbbf24; }
.r2-fill.poor { background: #ef4444; }
.r2-label { font-size: 0.72rem; font-weight: 700; }
.r2-label.excellent { color: #4ade80; }
.r2-label.good { color: #67e8f9; }
.r2-label.fair { color: #fbbf24; }
.r2-label.poor { color: #f87171; }

.slope-card { background: rgba(251, 191, 36, 0.06); border: 1px solid rgba(251, 191, 36, 0.15); border-radius: 0.5rem; padding: 0.6rem 0.8rem; margin-top: 0.5rem; }
.slope-label { font-weight: 700; color: #fbbf24; font-size: 0.85rem; }
.slope-formula { font-family: 'Courier New', monospace; color: #92400e; font-size: 0.82rem; margin-top: 0.15rem; }
.slope-result { margin-top: 0.3rem; font-family: 'Courier New', monospace; color: #fbbf24; font-size: 0.85rem; }
.slope-result b { color: #fde68a; font-weight: 800; }

.error-card { background: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.12); border-radius: 0.5rem; padding: 0.6rem 0.8rem; }
.err-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.2rem 0; }
.err-row span { color: #64748b; }
.err-row b { font-family: 'Courier New', monospace; color: #e2e8f0; }
.err-result b { font-size: 1.1rem; font-weight: 800; }
.err-result b.good { color: #4ade80; }
.err-result b.warn { color: #fbbf24; }
.err-result b.bad { color: #f87171; }
.err-interpret { margin-top: 0.4rem; }
.interp { font-size: 0.8rem; font-weight: 600; }
.interp.good { color: #4ade80; }
.interp.warn { color: #fbbf24; }
.interp.bad { color: #f87171; }
</style>