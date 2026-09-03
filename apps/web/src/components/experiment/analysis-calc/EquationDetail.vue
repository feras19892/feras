<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { AnalysisEquation } from '../../../types/physics'

const props = defineProps<{
  equation: AnalysisEquation | undefined
  varValues: Record<string, number>
  targetVar: string
  result: string | null
}>()

const emit = defineEmits<{
  (e: 'update:varValues', val: Record<string, number>): void
  (e: 'update:targetVar', val: string): void
  (e: 'solve'): void
}>()

function updateVar(symbol: string, value: number) {
  emit('update:varValues', { ...props.varValues, [symbol]: value })
}
</script>

<template>
  <div v-if="equation" class="eq-detail">

    <div class="formula-box">
      <div class="section-label">{{ t('analysis.formula') }}</div>
      <div class="formula">{{ equation.formula }}</div>
    </div>

    <div class="divider" />

    <div class="vars-area">
      <div class="section-label">{{ t('analysis.variables') }}</div>
      <div class="vars-grid">
        <div v-for="v in equation.variables" :key="v.symbol" class="var-item">
          <label>{{ v.label }}<span class="sym"> ({{ v.symbol }})</span></label>
          <input
            type="number"
            step="any"
            :value="varValues[v.symbol] ?? 0"
            @input="updateVar(v.symbol, +($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <div class="divider" />

    <div class="solve-area">
      <div class="section-label">{{ t('analysis.solveUnknown') }}</div>
      <div class="solve-row">
        <select :value="targetVar" @change="emit('update:targetVar', ($event.target as HTMLSelectElement).value)">
          <option v-for="s in equation.solveFor" :key="s" :value="s">{{ s }}</option>
        </select>
        <button class="btn-solve" @click="emit('solve')">{{ t('analysis.calc') }}</button>
      </div>
      <div v-if="result" class="result">
        <div class="result-label">{{ t('analysis.resultLabel') }}</div>
        <div class="result-value">{{ result }}</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.eq-detail {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  height: 100%;
  overflow: hidden;
}
.divider {
  width: 1px;
  background: rgba(255,255,255,0.07);
  flex-shrink: 0;
  margin: 0.5rem 0;
}
.section-label {
  font-size: 0.62rem;
  color: #475569;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.35rem;
}
.formula-box {
  flex-shrink: 0;
  width: 170px;
  padding: 0.45rem 0.55rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.formula {
  font-family: 'Courier New', monospace;
  background: rgba(6,182,212,0.08);
  border: 1px solid rgba(6,182,212,0.2);
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  color: #67e8f9;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.4;
  word-break: break-all;
}
.vars-area {
  flex: 1;
  min-width: 0;
  padding: 0.45rem 0.55rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}
.vars-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.5rem;
  align-items: center;
}
.var-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.var-item label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  white-space: nowrap;
}
.sym { color: #64748b; font-size: 0.68rem; }
.var-item input {
  width: 72px;
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.25rem 0.35rem;
  font-size: 0.82rem;
  text-align: center;
  font-weight: 600;
  transition: border-color 0.15s;
}
.var-item input:focus { border-color: #06b6d4; outline: none; box-shadow: 0 0 0 2px rgba(6,182,212,0.15); }
.solve-area {
  flex-shrink: 0;
  width: 160px;
  padding: 0.45rem 0.55rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
}
.solve-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
select {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.25rem 0.35rem;
  font-size: 0.78rem;
  flex: 1;
}
.btn-solve {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border: none;
  color: #fff;
  border-radius: 0.3rem;
  padding: 0.28rem 0.55rem;
  font-size: 0.78rem;
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.15s;
}
.btn-solve:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(6,182,212,0.3); }
.result {
  background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.06));
  border: 1px solid rgba(34,197,94,0.3);
  border-radius: 0.3rem;
  padding: 0.3rem 0.4rem;
}
.result-label { font-size: 0.6rem; color: #4ade80; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.1rem; }
.result-value { color: #f0fdf4; font-size: 0.75rem; font-family: 'Courier New', monospace; font-weight: 700; word-break: break-all; line-height: 1.3; }
</style>
