<script setup lang="ts">
import { useEquationSolver } from '../../../composables/experiment/analysis/useEquationSolver'
import EquationDetail from './EquationDetail.vue'
import type { AnalysisEquation } from '../../../types/physics'

const props = defineProps<{
  equations: AnalysisEquation[];
  readings: Record<string, number>[];
}>();

const {
  selectedIndex,
  varValues,
  targetVar,
  result,
  activeEquation,
  solve,
} = useEquationSolver(
  () => props.equations,
  () => props.readings
);
</script>

<template>
  <div class="equations-panel">
    <div class="panel-header">⚗️ المعادلات</div>

    <div v-if="equations.length" class="body">
      <div class="eq-list">
        <button
          v-for="(eq, i) in equations"
          :key="i"
          class="eq-tab"
          :class="{ active: i === selectedIndex }"
          @click="selectedIndex = i"
        >
          {{ eq.name }}
        </button>
      </div>

      <EquationDetail
        :equation="activeEquation"
        v-model:var-values="varValues"
        v-model:target-var="targetVar"
        :result="result"
        @solve="solve"
      />
    </div>
    <p v-else class="empty">لا توجد معادلات</p>
  </div>
</template>

<style scoped>
.equations-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-header {
  padding: 0.4rem 0.6rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.85rem;
  color: #67e8f9;
  font-weight: 700;
}
.body { padding: 0.4rem; display: flex; flex-direction: column; gap: 0.35rem; }
.eq-list { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.eq-tab {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8;
  border-radius: 0.3rem;
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
  cursor: pointer;
}
.eq-tab.active { background: rgba(6,182,212,0.15); color: #67e8f9; border-color: rgba(6,182,212,0.3); }
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
.empty { color: #64748b; text-align: center; padding: 0.8rem; font-size: 0.85rem; }
</style>
