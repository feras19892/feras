<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  cMetal: number
  tf: number
}>()

const showSteps = ref<Record<string, boolean>>({
  step1: false,
})

const qLost = computed(() => props.mMetal * props.cMetal * (props.tMetal - props.tf))
const qGained = computed(() => props.mWater * 4186 * (props.tf - props.tWater))

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات الكالوريمتري</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: توازن الحرارة
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">Q_مفقود = Q_مكتسب</div>
        <div class="calc">
          <div>mMetal·cMetal·(tMetal - tf) = mWater·cWater·(tf - tWater)</div>
          <div>Q_مفقود = {{ mMetal }} × {{ cMetal }} × ({{ tMetal }} - {{ tf.toFixed(1) }}) = {{ qLost.toFixed(1) }} J</div>
          <div>Q_مكتسب = {{ mWater }} × 4186 × ({{ tf.toFixed(1) }} - {{ tWater }}) = {{ qGained.toFixed(1) }} J</div>
          <div class="result">ΔQ = {{ Math.abs(qLost - qGained).toFixed(1) }} J</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; }
.ws-title { font-size: 1rem; font-weight: 700; color: #5B8DB8; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.formula { font-family: 'Courier New', monospace; font-size: 1rem; color: #5B8DB8; text-align: center; padding: .5rem; background: rgba(91,141,184,.08); border-radius: 4px; margin-bottom: .5rem; }
.calc { display: flex; flex-direction: column; gap: .25rem; color: #D1D7E0; }
.result { color: #22c55e; font-weight: 700; margin-top: .25rem; }
</style>
