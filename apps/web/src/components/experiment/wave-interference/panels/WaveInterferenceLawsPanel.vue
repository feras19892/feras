<script setup lang="ts">
interface Props { sourceDistance: number; wavelength: number; frequency: number; screenDistance: number; vWave: number }
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="eq-block">
      <div class="eq-title">Wave Speed</div>
      <div class="eq">v = f * lambda</div>
      <div class="eq-values">v = {{ vWave.toFixed(1) }} m/s, f = {{ frequency }} Hz, lambda = {{ (wavelength * 1000).toFixed(1) }} mm</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">Constructive Interference</div>
      <div class="eq">delta_r = m * lambda</div>
      <div class="eq-values">Path difference equals integer wavelength</div>
    </div>
    <div class="eq-block">
      <div class="eq-title">Destructive Interference</div>
      <div class="eq">delta_r = (m + 1/2) * lambda</div>
      <div class="eq-values">Path difference equals half-integer wavelength</div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .5rem; font-size: .82rem; }
.eq-block { margin-bottom: .3rem; }
.eq-title { color: #5B8DB8; font-size: .75rem; margin-bottom: .2rem; }
.eq { font-family: 'Courier New', monospace; background: #0d1117; padding: .3rem .5rem; border-radius: 4px; font-size: .9rem; color: #7ee787; }
.eq-values { font-size: .8rem; color: #8B95A5; margin-top: .2rem; }
</style>
