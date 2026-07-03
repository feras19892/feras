<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  intensityPattern: { xMm: number; intensity: number }[]
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="mini-chart" v-if="intensityPattern.length">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="chart-svg">
        <polyline
          :points="intensityPattern.map((p, i) => `${(i / (intensityPattern.length - 1)) * 100},${40 - p.intensity * 35}`).join(' ')"
          fill="none"
          stroke="#5B8DB8"
          stroke-width="0.5"
        />
      </svg>
    </div>
    <p v-else class="empty">{{ t('experiments.noData') }}</p>
  </div>
</template>

<style scoped>
.panel-body { font-size: .8rem; }
.mini-chart { height: 100px; background: #0d1117; border-radius: 5px; border: 1px solid #2D3645; padding: .3rem; }
.chart-svg { width: 100%; height: 100%; }
.empty { color: #64748b; text-align: center; padding: 1rem; }
</style>
