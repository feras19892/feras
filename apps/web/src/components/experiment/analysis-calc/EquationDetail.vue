<script setup lang="ts">
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
    <div class="formula">{{ equation.formula }}</div>

    <div class="vars">
      <div v-for="v in equation.variables" :key="v.symbol" class="var-row">
        <label>{{ v.label }} ({{ v.symbol }})</label>
        <input
          type="number"
          step="any"
          :value="varValues[v.symbol] ?? 0"
          @input="updateVar(v.symbol, +($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="solve-row">
      <label>احسب:</label>
      <select :value="targetVar" @change="emit('update:targetVar', ($event.target as HTMLSelectElement).value)">
        <option v-for="s in equation.solveFor" :key="s" :value="s">{{ s }}</option>
      </select>
      <button class="btn-solve" @click="emit('solve')">= احسب</button>
    </div>

    <div v-if="result" class="result">
      <div class="result-label">✅ الناتج</div>
      <div class="result-value">{{ result }}</div>
    </div>
  </div>
</template>

<style scoped>
.eq-detail { display: flex; flex-direction: column; gap: 0.35rem; }
.formula {
  font-family: 'Courier New', monospace;
  background: rgba(0,0,0,0.2);
  padding: 0.35rem 0.5rem;
  border-radius: 0.25rem;
  color: #e2e8f0;
  font-size: 0.85rem;
  text-align: center;
  font-weight: 600;
}
.vars { display: flex; flex-direction: column; gap: 0.25rem; }
.var-row { display: flex; align-items: center; gap: 0.4rem; }
.var-row label { font-size: 0.78rem; color: #94a3b8; min-width: 80px; font-weight: 600; }
.var-row input {
  flex: 1;
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.2rem;
  padding: 0.25rem 0.35rem;
  font-size: 0.85rem;
  width: 0;
  min-width: 0;
}
.solve-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; }
.solve-row label { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }
select {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.2rem;
  padding: 0.2rem 0.35rem;
  font-size: 0.78rem;
}
.btn-solve {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  border: none;
  color: #fff;
  border-radius: 0.25rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.78rem;
  cursor: pointer;
  font-weight: 700;
}
.result {
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 0.25rem;
  padding: 0.35rem 0.5rem;
  margin-top: 0.2rem;
  text-align: center;
}
.result-label { font-size: 0.75rem; color: #4ade80; margin-bottom: 0.15rem; font-weight: 700; }
.result-value { color: #e2e8f0; font-size: 0.85rem; font-family: 'Courier New', monospace; font-weight: 700; }
</style>
