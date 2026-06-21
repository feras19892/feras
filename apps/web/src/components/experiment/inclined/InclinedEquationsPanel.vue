<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  calcResult: string
}>()

const emit = defineEmits<{
  (e: 'calcAcceleration'): void
  (e: 'calcTime'): void
  (e: 'calcVelocity'): void
  (e: 'calcNormal'): void
}>()

const resultLines = computed(() => {
  if (!props.calcResult) return []
  return props.calcResult.split(/<br\s*\/?>/i).map(l => l.replace(/<\/?b>/gi, '').trim()).filter(Boolean)
})
</script>

<template>
  <div class="equations-panel">
    <div class="calc-buttons">
      <button @click="emit('calcAcceleration')">حساب التسارع a</button>
      <button @click="emit('calcTime')">حساب زمن الوصول t</button>
      <button @click="emit('calcVelocity')">حساب السرعة النهائية v</button>
      <button @click="emit('calcNormal')">حساب قوة التفاعل N</button>
    </div>
    <div class="result">
      <div v-for="(line, i) in resultLines" :key="i">{{ line }}</div>
    </div>
    <div class="formulas">
      <h5>المعادلات الأساسية:</h5>
      <ul>
        <li>a = g·sin(θ) − μ·g·cos(θ)</li>
        <li>s = ½·a·t²</li>
        <li>v = a·t</li>
        <li>t = √(2L/a)</li>
        <li>v = √(2aL)</li>
        <li>N = m·g·cos(θ)</li>
        <li>F∥ = m·g·sin(θ)</li>
        <li>f = μ·N = μ·m·g·cos(θ)</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.equations-panel { padding: .5rem; }
.calc-buttons { display: flex; flex-wrap: wrap; gap: .35rem; margin-bottom: .6rem; }
.calc-buttons button { padding: .35rem .55rem; border: 1px solid #2D3645; border-radius: 4px; background: rgba(91,141,184,.08); color: #5B8DB8; cursor: pointer; font-size: .68rem; transition: all .15s; }
.calc-buttons button:hover { background: rgba(91,141,184,.15); }
.result { background: rgba(255,255,255,.02); border: 1px solid #2D3645; border-radius: 6px; padding: .5rem; font-size: .72rem; color: #D1D7E0; line-height: 1.5; margin-bottom: .6rem; min-height: 40px; }
.formulas h5 { color: #5B8DB8; font-size: .72rem; margin: 0 0 .3rem; }
.formulas ul { list-style: none; padding: 0; margin: 0; }
.formulas li { font-size: .7rem; color: #B8C0CC; padding: .15rem 0; border-bottom: 1px dashed #2D3645; }
</style>
