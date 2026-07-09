<script setup lang="ts">

interface Props {
  tubeLength: number
  frequency: number
  temperature: number
  harmonic: 1 | 3
  wavelength: number
  vMeasured: number
  vTheory: number
  percentError: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">L — Tube length</span>
        <span class="reading-val cyan">{{ tubeLength.toFixed(3) }} m</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">f — Frequency</span>
        <span class="reading-val amber">{{ frequency }} Hz</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">T — Temperature</span>
        <span class="reading-val green">{{ temperature }}°C</span>
      </div>
    </div>
    <div class="reading-row highlight-row">
      <span class="reading-label bold">λ — Wavelength</span>
      <span class="reading-val green bold">{{ wavelength.toFixed(3) }} m</span>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">v — Measured</span>
        <span class="reading-val green">{{ vMeasured.toFixed(1) }} m/s</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">v — Theory</span>
        <span class="reading-val">{{ vTheory.toFixed(1) }} m/s</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">Error</span>
        <span class="reading-val amber">{{ percentError.toFixed(1) }}%</span>
      </div>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">Harmonic</span>
        <span class="reading-val">{{ harmonic === 1 ? '1st (λ/4)' : '3rd (3λ/4)' }}</span>
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
.cyan  { color: #67e8f9; }
.green { color: #4ade80; }
.amber { color: #fbbf24; }
</style>
