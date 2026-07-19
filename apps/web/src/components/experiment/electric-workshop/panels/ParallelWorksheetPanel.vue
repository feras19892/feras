<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  V: number
  R1: number
  R2: number
  I1: number
  I2: number
  Itotal: number
  Req: number
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  verify1: false,
  verify2: false,
})

const reqCalc = computed(() => {
  if (props.R1 === 0 || props.R2 === 0) return 0
  return (props.R1 * props.R2) / (props.R1 + props.R2)
})
const i1Calc = computed(() => props.R1 === 0 ? 0 : props.V / props.R1)
const i2Calc = computed(() => props.R2 === 0 ? 0 : props.V / props.R2)
const _itCalc = computed(() => i1Calc.value + i2Calc.value)
const kclDiff = computed(() => Math.abs(props.I1 + props.I2 - props.Itotal))

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 قانون أوم — توازي: حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: فهم الدائرة
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain">لدينا بطارية واحدة (V = {{ V.toFixed(1) }}V) ومقاومتان على التوازي:</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#fbbf24">الفرع 1:</span> R₁ = {{ R1.toFixed(0) }}Ω ← A₁</div>
          <div class="branch"><span class="branch-label" style="color:#67e8f9">الفرع 2:</span> R₂ = {{ R2.toFixed(0) }}Ω ← A₂</div>
        </div>
        <p class="explain">في التوازي: الجهد V واحد على المقاومتين، والتيار يتوزع.</p>
        <p class="explain">المجاهيل: I₁, I₂, I<sub>total</sub>, R<sub>eq</sub></p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: قانون أوم لكل فرع
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain">في التوازي، نفس الجهد V على المقاومتين:</p>
        <div class="formula">I = V / R</div>
        <div class="calc">
          <div class="calc-line">I₁ = V / R₁ = {{ V.toFixed(1) }} / {{ R1.toFixed(0) }} = <span class="result">{{ I1.toFixed(4) }} A</span></div>
          <div class="calc-line">I₂ = V / R₂ = {{ V.toFixed(1) }} / {{ R2.toFixed(0) }} = <span class="result">{{ I2.toFixed(4) }} A</span></div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: التيار الكلي (KCL)
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain">قانون كيرشوف للتيارات: التيار الكلي = مجموع تيارات الفروع</p>
        <div class="formula">I<sub>total</sub> = I₁ + I₂</div>
        <div class="calc">
          <div class="calc-line">I<sub>total</sub> = {{ I1.toFixed(4) }} + {{ I2.toFixed(4) }}</div>
          <div class="calc-line result">I<sub>total</sub> = {{ Itotal.toFixed(4) }} A</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: المقاومة المكافئة
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain">في التوازي، مقلوب المقاومة المكافئة = مجموع مقلوبات المقاومات:</p>
        <div class="formula">1/R<sub>eq</sub> = 1/R₁ + 1/R₂</div>
        <div class="calc">
          <div class="calc-line">1/R<sub>eq</sub> = 1/{{ R1.toFixed(0) }} + 1/{{ R2.toFixed(0) }}</div>
          <div class="calc-line">= {{ (1/R1).toFixed(6) }} + {{ (1/R2).toFixed(6) }}</div>
          <div class="calc-line">= {{ (1/R1 + 1/R2).toFixed(6) }}</div>
          <div class="calc-line">R<sub>eq</sub> = 1 / {{ (1/R1 + 1/R2).toFixed(6) }}</div>
          <div class="calc-line result">R<sub>eq</sub> = {{ Req.toFixed(2) }} Ω</div>
        </div>
        <p class="explain">أو بصيغة مباشرة: R<sub>eq</sub> = (R₁ × R₂) / (R₁ + R₂)</p>
        <div class="calc">
          <div class="calc-line">= ({{ R1.toFixed(0) }} × {{ R2.toFixed(0) }}) / ({{ R1.toFixed(0) }} + {{ R2.toFixed(0) }})</div>
          <div class="calc-line">= {{ (R1*R2).toFixed(0) }} / {{ (R1+R2).toFixed(0) }}</div>
          <div class="calc-line result">R<sub>eq</sub> = {{ reqCalc.toFixed(2) }} Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: التحقق بقانون أوم الكلي
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <p class="explain">نتحقق: I<sub>total</sub> = V / R<sub>eq</sub></p>
        <div class="formula">I<sub>total</sub> = V / R<sub>eq</sub></div>
        <div class="calc">
          <div class="calc-line">= {{ V.toFixed(1) }} / {{ Req.toFixed(2) }}</div>
          <div class="calc-line">= <span class="result">{{ (V/Req).toFixed(4) }} A</span></div>
          <div class="calc-line">I<sub>total</sub> المقاس = {{ Itotal.toFixed(4) }} A</div>
          <div :class="Math.abs(V/Req - Itotal) < 0.001 ? 'result' : 'warn'">
            {{ Math.abs(V/Req - Itotal) < 0.001 ? '✓ متطابق' : '✗ هناك فرق' }}
          </div>
        </div>
      </div>
    </div>

    <div class="verify-section">
      <div class="verify-title">✓ التحقق</div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify1')">
          {{ showSteps.verify1 ? '▼' : '▶' }} تحقق KCL
        </button>
        <div v-if="showSteps.verify1" class="step-content">
          <div class="formula">I₁ + I₂ ≟ I<sub>total</sub></div>
          <div class="calc">
            <div class="calc-line">{{ I1.toFixed(4) }} + {{ I2.toFixed(4) }} = {{ (I1+I2).toFixed(4) }} A</div>
            <div class="calc-line">I<sub>total</sub> = {{ Itotal.toFixed(4) }} A</div>
            <div class="calc-line">الفرق = {{ kclDiff.toFixed(6) }} A</div>
            <div :class="kclDiff < 0.001 ? 'result' : 'warn'">
              {{ kclDiff < 0.001 ? '✓ KCL متحقق' : '✗ هناك خطأ' }}
            </div>
          </div>
        </div>
      </div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify2')">
          {{ showSteps.verify2 ? '▼' : '▶' }} تحقق: الجهد متساوٍ على الفروع
        </button>
        <div v-if="showSteps.verify2" class="step-content">
          <div class="formula">V = I₁ × R₁ ≟ I₂ × R₂</div>
          <div class="calc">
            <div class="calc-line">I₁ × R₁ = {{ I1.toFixed(4) }} × {{ R1.toFixed(0) }} = {{ (I1*R1).toFixed(2) }} V</div>
            <div class="calc-line">I₂ × R₂ = {{ I2.toFixed(4) }} × {{ R2.toFixed(0) }} = {{ (I2*R2).toFixed(2) }} V</div>
            <div :class="Math.abs(I1*R1 - I2*R2) < 0.01 ? 'result' : 'warn'">
              {{ Math.abs(I1*R1 - I2*R2) < 0.01 ? '✓ الجهد متساوٍ على المقاومتين' : '✗ الجهد غير متساوٍ' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #f59e0b; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-toggle.verify { background: rgba(34,197,94,.08); border-color: rgba(34,197,94,.2); color: #4ade80; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.circuit-desc { display: flex; flex-direction: column; gap: .3rem; margin: .5rem 0; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.branch { font-size: .78rem; color: #cbd5e1; display: flex; gap: .4rem; align-items: baseline; }
.branch-label { font-weight: 700; white-space: nowrap; }
.formula { font-family: 'Courier New', monospace; font-size: .95rem; color: #f59e0b; text-align: center; padding: .5rem; background: rgba(245,158,11,.08); border-radius: 4px; margin: .4rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
.warn { color: #ef4444; font-weight: 700; }
.verify-section { margin-top: .5rem; padding-top: .5rem; border-top: 2px solid rgba(34,197,94,.15); }
.verify-title { font-size: .9rem; font-weight: 700; color: #4ade80; text-align: center; margin-bottom: .5rem; }
</style>
