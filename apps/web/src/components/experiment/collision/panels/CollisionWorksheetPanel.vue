<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  m1: number
  m2: number
  v1i: number
  v2i: number
  v1f: number
  v2f: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
  step2: false,
})

const pi = computed(() => props.m1 * props.v1i + props.m2 * props.v2i)
const pf = computed(() => props.m1 * props.v1f + props.m2 * props.v2f)
const diff = computed(() => Math.abs(pi.value - pf.value))
const eCalc = computed(() => {
  const denom = props.v1i - props.v2i
  if (Math.abs(denom) < 1e-9) return 0
  return (props.v2f - props.v1f) / denom
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات حساب الاصطدام</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: حفظ الزخم
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">m₁v₁i + m₂v₂i = m₁v₁f + m₂v₂f</div>
        <div class="calc">
          <div>P before = {{ m1 }}×{{ v1i.toFixed(2) }} + {{ m2 }}×{{ v2i.toFixed(2) }} = {{ pi.toFixed(2) }}</div>
          <div>P after = {{ m1 }}×{{ v1f.toFixed(2) }} + {{ m2 }}×{{ v2f.toFixed(2) }} = {{ pf.toFixed(2) }}</div>
          <div class="result">ΔP = {{ diff.toFixed(3) }} kg·m/s</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: معامل الاسترداد e
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">e = (v₂f − v₁f) / (v₁i − v₂i)</div>
        <div class="calc">
          <div>e = ({{ v2f.toFixed(2) }} − {{ v1f.toFixed(2) }}) / ({{ v1i.toFixed(2) }} − {{ v2i.toFixed(2) }})</div>
          <div class="result">e = {{ eCalc.toFixed(3) }}</div>
          <div v-if="eCalc >= 0.99">اصطدام مرن (e ≈ 1)</div>
          <div v-else-if="eCalc <= 0.01">اصطدام غير مرن (e ≈ 0)</div>
          <div v-else>اصطدام جزئي</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; }
.ws-title { font-size: 1rem; font-weight: 700; color: #5B8DB8; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: right; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.formula { font-family: 'Courier New', monospace; font-size: 1rem; color: #5B8DB8; text-align: center; padding: .5rem; background: rgba(91,141,184,.08); border-radius: 4px; margin-bottom: .5rem; }
.calc { display: flex; flex-direction: column; gap: .25rem; color: #D1D7E0; }
.result { color: #22c55e; font-weight: 700; margin-top: .25rem; }
</style>
