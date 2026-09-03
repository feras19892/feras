<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  voltage: number
  current: number
  resistance: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
  step2: false,
  step3: false,
})

const rFromSlope = computed(() => {
  if (props.current === 0) return 0
  return props.voltage / props.current
})

const vCheck = computed(() => props.current * props.resistance)
const iCheck = computed(() => {
  if (props.resistance === 0) return 0
  return props.voltage / props.resistance
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات قانون أوم</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: حساب المقاومة من القياس
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">R = V / I</div>
        <div class="calc">
          <div>R = {{ voltage.toFixed(1) }} / {{ current.toFixed(3) }}</div>
          <div class="result">R = {{ rFromSlope.toFixed(1) }} Ω</div>
          <div>المقاومة المضبوطة: {{ resistance.toFixed(0) }} Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: التحقق من الجهد
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">V = I × R</div>
        <div class="calc">
          <div>V = {{ current.toFixed(3) }} × {{ resistance.toFixed(0) }}</div>
          <div class="result">V = {{ vCheck.toFixed(1) }} V</div>
          <div>الجهد المقاس: {{ voltage.toFixed(1) }} V</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: التحقق من التيار
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="formula">I = V / R</div>
        <div class="calc">
          <div>I = {{ voltage.toFixed(1) }} / {{ resistance.toFixed(0) }}</div>
          <div class="result">I = {{ iCheck.toFixed(3) }} A</div>
          <div>التيار المقاس: {{ current.toFixed(3) }} A</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; }
.ws-title { font-size: 1rem; font-weight: 700; color: #f59e0b; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.formula { font-family: 'Courier New', monospace; font-size: 1rem; color: #f59e0b; text-align: center; padding: .5rem; background: rgba(245,158,11,.08); border-radius: 4px; margin-bottom: .5rem; }
.calc { display: flex; flex-direction: column; gap: .25rem; color: #D1D7E0; }
.result { color: #22c55e; font-weight: 700; margin-top: .25rem; }
</style>
