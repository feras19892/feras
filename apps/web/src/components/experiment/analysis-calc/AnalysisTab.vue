<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AnalysisColumnMeta, AnalysisEquation, AnalysisPlotConfig } from '../../../types/physics';
import AnalysisChartWorkspace from './AnalysisChartWorkspace.vue';
import AnalysisEquationsPanel from './AnalysisEquationsPanel.vue';
import AnalysisErrorPanel from './AnalysisErrorPanel.vue';

const props = defineProps<{
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  equations: AnalysisEquation[];
  plots: AnalysisPlotConfig[];
}>();

const chartRef = ref<InstanceType<typeof AnalysisChartWorkspace> | null>(null);
const getCanvas = computed(() => chartRef.value?.getCanvas() ?? null);
const getRegression = computed(() => chartRef.value?.getRegression() ?? null);
const getSlopeCalc = computed(() => chartRef.value?.getSlopeCalc() ?? null);
const getAxes = computed(() => chartRef.value?.getAxes() ?? null);
const eqCollapsed = ref(false);
const solvedEquations = ref<{ equationName: string; formula: string; targetVar: string; varValues: Record<string, number>; result: string; timestamp: number }[]>([]);
const errorCalcData = ref<{ theoretical: number | null; experimental: number | null; errorPercent: number | null } | null>(null);

defineExpose({ getCanvas, getRegression, getSlopeCalc, getAxes, solvedEquations, errorCalcData });
</script>

<template>
  <div class="analysis-tab">
    <div class="chart-section">
      <AnalysisChartWorkspace
        ref="chartRef"
        :readings="readings"
        :columns="columns"
        :suggested-plots="plots"
      />
    </div>
    <div v-if="equations.length" class="bottom-section">
      <div class="bottom-col">
        <AnalysisEquationsPanel :equations="equations" :readings="readings" @solved-equations="solvedEquations = $event" />
      </div>
      <div class="bottom-col">
        <AnalysisErrorPanel @error-calc="errorCalcData = $event" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-tab {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}
.chart-section {
  flex: 0.70;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.bottom-section {
  flex: 0.28;
  min-height: 0;
  display: flex;
  gap: 0.5rem;
  overflow: hidden;
}
.bottom-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
