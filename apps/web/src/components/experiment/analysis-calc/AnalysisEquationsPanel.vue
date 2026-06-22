<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import { useEquationSolver } from '../../../composables/experiment/analysis/useEquationSolver'
import EquationDetail from './EquationDetail.vue'
import type { AnalysisEquation } from '../../../types/physics'

const props = defineProps<{
  equations: AnalysisEquation[];
  readings: Record<string, number>[];
}>();

const emit = defineEmits<{
  (e: 'solved-equations', val: { equationName: string; formula: string; targetVar: string; varValues: Record<string, number>; result: string; timestamp: number }[]): void;
}>();

const { t } = useI18n()

const {
  selectedIndex,
  varValues,
  targetVar,
  result,
  activeEquation,
  solve,
  solvedEquations,
} = useEquationSolver(
  () => props.equations,
  () => props.readings
);

watch(solvedEquations, (val) => emit('solved-equations', val), { deep: true });
</script>

<template>
  <div class="equations-panel">
    <div class="panel-header">
      <span>{{ t('analysis.equations') }}</span>
    </div>
    <div v-if="equations.length" class="body">
      <div class="eq-tabs-list">
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
      <div class="eq-detail-area">
        <EquationDetail
          :equation="activeEquation"
          v-model:var-values="varValues"
          v-model:target-var="targetVar"
          :result="result"
          @solve="solve"
        />
      </div>
    </div>
    <p v-else class="empty">{{ t('analysis.noEquations') }}</p>
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
  height: 100%;
}
.panel-header {
  padding: 0.4rem 0.75rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.85rem;
  color: #67e8f9;
  font-weight: 700;
  flex-shrink: 0;
}
.body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.eq-tabs-list {
  width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.4rem;
  border-left: 1px solid rgba(255,255,255,0.06);
  overflow-y: auto;
}
.eq-tab {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  color: #94a3b8;
  border-radius: 0.3rem;
  padding: 0.3rem 0.45rem;
  font-size: 0.73rem;
  cursor: pointer;
  text-align: right;
  transition: all 0.15s;
  font-weight: 600;
  line-height: 1.3;
}
.eq-tab.active {
  background: rgba(6,182,212,0.2);
  color: #67e8f9;
  border-color: rgba(6,182,212,0.4);
}
.eq-tab:hover:not(.active) { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.eq-detail-area { flex: 1; min-width: 0; overflow: hidden; display: flex; flex-direction: column; }
.empty { color: #64748b; text-align: center; padding: 1rem; font-size: 0.85rem; }
</style>
