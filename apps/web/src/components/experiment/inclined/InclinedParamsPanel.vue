<script setup lang="ts">
const props = defineProps<{
  params: {
    thetaDeg: number
    length: number
    mass: number
    g: number
    mu: number
  }
}>()
</script>

<template>
  <div class="params-panel">
    <div class="param-row">
      <label>زاوية المنحدر θ</label>
      <input type="range" min="1" max="89" step="1" v-model.number="params.thetaDeg" />
      <span>{{ params.thetaDeg }}°</span>
    </div>
    <div class="param-row">
      <label>طول المنحدر L</label>
      <input type="range" min="0.5" max="10" step="0.1" v-model.number="params.length" />
      <span>{{ params.length.toFixed(1) }} m</span>
    </div>
    <div class="param-row">
      <label>الكتلة m</label>
      <input type="range" min="0.1" max="10" step="0.1" v-model.number="params.mass" />
      <span>{{ params.mass.toFixed(1) }} kg</span>
    </div>
    <div class="param-row">
      <label>g</label>
      <input type="range" min="1" max="20" step="0.01" v-model.number="params.g" />
      <span>{{ params.g.toFixed(2) }} m/s²</span>
    </div>
    <div class="param-row">
      <label>معامل الاحتكاك μ</label>
      <input type="range" min="0" max="1" step="0.01" v-model.number="params.mu" />
      <span>{{ params.mu.toFixed(2) }}</span>
    </div>
  </div>
</template>

<style scoped>
.params-panel { display: flex; flex-direction: column; gap: .6rem; padding: .4rem; }
.param-row { display: flex; align-items: center; gap: .5rem; }
.param-row label { flex: 1; font-size: .72rem; color: #B8C0CC; }
.param-row input[type=range] { flex: 2; }
.param-row span { min-width: 48px; text-align: right; font-size: .72rem; color: #D1D7E0; font-weight: 700; }
</style>
