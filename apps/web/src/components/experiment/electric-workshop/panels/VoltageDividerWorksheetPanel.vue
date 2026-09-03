<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  V: number
  R1: number
  R2: number
  V1: number
  V2: number
  I: number
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
})

const Rtotal = computed(() => props.R1 + props.R2)
const Icalc = computed(() => props.V / Rtotal.value)
const V1calc = computed(() => Icalc.value * props.R1)
const V2calc = computed(() => Icalc.value * props.R2)
const ratio = computed(() => props.R2 / Rtotal.value)

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📊 مقسم الجهد — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هو مقسم الجهد؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>مقسم الجهد</b> دائرة بسيطة من مقاومتين على التوالي تقسمان جهد المصدر.</p>
        <p class="explain">الجهد عبر كل مقاومة يتناسب طردياً مع قيمتها.</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#3b82f6">المصدر:</span> V = {{ V }}V</div>
          <div class="branch"><span class="branch-label" style="color:#f59e0b">R1:</span> {{ R1 }}Ω</div>
          <div class="branch"><span class="branch-label" style="color:#4ade80">R2:</span> {{ R2 }}Ω</div>
          <div class="branch"><span class="branch-label" style="color:#c084fc">R_total:</span> {{ Rtotal }}Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: المقاومة الكلية
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">R_total = R1 + R2</div>
        <div class="calc">
          <div class="calc-line">R_total = {{ R1 }} + {{ R2 }}</div>
          <div class="calc-line result">R_total = {{ Rtotal }} Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: التيار
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">I = V / R_total</div>
        <div class="calc">
          <div class="calc-line">I = {{ V }} / {{ Rtotal }}</div>
          <div class="calc-line result">I = {{ Icalc.toFixed(4) }} A</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: الجهد عبر R2
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="formula">V2 = V × R2/(R1+R2)</div>
        <div class="calc">
          <div class="calc-line">V2 = {{ V }} × {{ R2 }}/{{ Rtotal }}</div>
          <div class="calc-line">V2 = {{ V }} × {{ ratio.toFixed(4) }}</div>
          <div class="calc-line result">V2 = {{ V2calc.toFixed(2) }} V</div>
        </div>
        <p class="explain">وبالمثل: V1 = {{ V1calc.toFixed(2) }} V</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: التحقق
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <div class="formula">V1 + V2 = V</div>
        <div class="calc">
          <div class="calc-line">{{ V1calc.toFixed(2) }} + {{ V2calc.toFixed(2) }} = {{ (V1calc + V2calc).toFixed(2) }} V</div>
          <div class="calc-line">V = {{ V }} V</div>
          <div :class="Math.abs(V1calc + V2calc - V) < 0.01 ? 'result' : 'warn'">
            {{ Math.abs(V1calc + V2calc - V) < 0.01 ? '✓ متطابق' : '✗ هناك فرق' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #fbbf24; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.circuit-desc { display: flex; flex-direction: column; gap: .3rem; margin: .5rem 0; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.branch { font-size: .78rem; color: #cbd5e1; display: flex; gap: .4rem; align-items: baseline; }
.branch-label { font-weight: 700; white-space: nowrap; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #fbbf24; text-align: center; padding: .4rem; background: rgba(251,191,36,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
.warn { color: #ef4444; font-weight: 700; }
</style>
