<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  polarizerAngle: number
  analyzerAngle: number
  I0: number
  outputIntensity: number
  relativeAngle: number
  transmissionPercent: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">θ₁ — Polarizer</span>
        <span class="reading-val cyan">{{ polarizerAngle }}°</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">θ₂ — Analyzer</span>
        <span class="reading-val amber">{{ analyzerAngle }}°</span>
      </div>
    </div>
    <div class="reading-row highlight-row">
      <span class="reading-label bold">Δθ = θ₂ − θ₁</span>
      <span class="reading-val green bold">{{ relativeAngle }}°</span>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">I₀ — Input intensity</span>
        <span class="reading-val">{{ I0 }}</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">I — Output intensity</span>
        <span class="reading-val green">{{ outputIntensity.toFixed(2) }}</span>
      </div>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">Transmission T</span>
        <span class="reading-val bold">{{ transmissionPercent.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .35rem; font-size: .8rem; }
.reading-group { display: flex; flex-direction: column; gap: .28rem; padding: .3rem .35rem; background: rgba(255,255,255,0.025); border-radius: 5px; border: 1px solid rgba(45,54,69,0.5); }
.reading-row { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
.highlight-row { padding: .3rem .4rem; background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.2); border-radius: 5px; }
.reading-label { color: #64748b; font-size: .76rem; flex: 1; }
.reading-label.bold { color: #94a3b8; font-weight: 600; }
.reading-val { font-family: monospace; font-size: .8rem; font-weight: 600; flex-shrink: 0; }
.reading-val.bold { font-weight: 800; }
.cyan  { color: #67e8f9; }
.green { color: #4ade80; }
.amber { color: #fbbf24; }
</style>
