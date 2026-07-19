<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  R1: number
  R2: number
  R3: number
  Rx: number
  Vg: number
  Ig: number
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
})

const balanced = computed(() => Math.abs(props.Vg) < 0.01)
const calculatedRx = computed(() => balanced.value ? (props.R2 * props.R3 / props.R1) : 0)
const ratioA = computed(() => props.R2 / (props.R1 + props.R2))
const ratioB = computed(() => props.Rx / (props.R3 + props.Rx))

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">⚖️ جسر ويستون — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هو جسر ويستون؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>جسر ويستون</b> دائرة لقياس المقاومة المجهولة (Rx) بدقة عالية جداً.</p>
        <p class="explain">يتكون من 4 مقاومات + جلفانوميتر + بطارية.</p>
        <p class="explain">عند <b>التوازن</b>: الجلفانوميتر يقرأ صفراً → Rx = R2 × R3 / R1</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#3b82f6">R1:</span> {{ R1 }}Ω</div>
          <div class="branch"><span class="branch-label" style="color:#f59e0b">R2:</span> {{ R2 }}Ω</div>
          <div class="branch"><span class="branch-label" style="color:#4ade80">R3 (ضبط):</span> {{ R3 }}Ω</div>
          <div class="branch"><span class="branch-label" style="color:#c084fc">Rx (مجهولة):</span> {{ Rx }}Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: نسبة الجهد في الفرعين
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain">الفرع العلوي (R1, R2):</p>
        <div class="formula">V_B = V × R2/(R1+R2)</div>
        <div class="calc">
          <div class="calc-line">V_B = V × {{ R2 }}/({{ R1 }}+{{ R2 }})</div>
          <div class="calc-line">V_B = V × {{ ratioA.toFixed(4) }}</div>
        </div>
        <p class="explain">الفرع السفلي (R3, Rx):</p>
        <div class="formula">V_D = V × Rx/(R3+Rx)</div>
        <div class="calc">
          <div class="calc-line">V_D = V × {{ Rx }}/({{ R3 }}+{{ Rx }})</div>
          <div class="calc-line">V_D = V × {{ ratioB.toFixed(4) }}</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: جهد الجلفانوميتر
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">Vg = V_B - V_D</div>
        <div class="calc">
          <div class="calc-line">Vg = V × ({{ ratioA.toFixed(4) }} - {{ ratioB.toFixed(4) }})</div>
          <div class="calc-line result">Vg = {{ Vg.toFixed(4) }} V</div>
        </div>
        <p class="explain">إذا Vg ≈ 0 → الجسر متوازن!</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: شرط التوازن
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain">عند التوازن: R1/R2 = R3/Rx</p>
        <div class="formula">Rx = R2 × R3 / R1</div>
        <div class="calc">
          <div class="calc-line">Rx = {{ R2 }} × {{ R3 }} / {{ R1 }}</div>
          <div class="calc-line result">Rx = {{ (R2 * R3 / R1).toFixed(1) }} Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: الحالة الحالية
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <div class="calc">
          <div class="calc-line">Vg = {{ Vg.toFixed(4) }} V</div>
          <div class="calc-line">Ig = {{ Ig.toFixed(3) }} mA</div>
          <div :class="balanced ? 'result' : 'warn'">
            {{ balanced ? '✅ الجسر متوازن! Rx = ' + calculatedRx.toFixed(1) + 'Ω' : '⚖️ غير متوازن — عدّل R3' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #4ade80; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.circuit-desc { display: flex; flex-direction: column; gap: .3rem; margin: .5rem 0; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.branch { font-size: .78rem; color: #cbd5e1; display: flex; gap: .4rem; align-items: baseline; }
.branch-label { font-weight: 700; white-space: nowrap; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #4ade80; text-align: center; padding: .4rem; background: rgba(74,222,128,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
.warn { color: #fbbf24; font-weight: 700; }
</style>
