<script setup lang="ts">
import type { AnalysisColumnMeta, AnalysisEquation, AnalysisPlotConfig } from '../../../types/physics';
import AnalysisChartWorkspace from './AnalysisChartWorkspace.vue';
import AnalysisEquationsPanel from './AnalysisEquationsPanel.vue';

const props = defineProps<{
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  equations: AnalysisEquation[];
  plots: AnalysisPlotConfig[];
}>();
</script>

<template>
  <div class="analysis-tab">
    <div class="grid">
      <div class="chart-col">
        <AnalysisChartWorkspace
          :readings="readings"
          :columns="columns"
          :suggested-plots="plots"
        />
      </div>
      <div class="eq-col">
        <AnalysisEquationsPanel :equations="equations" :readings="readings" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-tab { flex: 1; overflow: hidden; display: flex; flex-direction: column; padding: 0.5rem; }
.grid { display: flex; gap: 0.5rem; height: 100%; }
.chart-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.eq-col { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; }
</style>
