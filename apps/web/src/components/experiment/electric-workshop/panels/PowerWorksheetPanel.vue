<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  V: number
  I: number
  R: number
  P: number
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  verify1: false,
  verify2: false,
  verify3: false,
})

const pVI = computed(() => props.V * props.I)
const pIR = computed(() => props.I * props.I * props.R)
const pVR = computed(() => props.R === 0 ? 0 : (props.V * props.V) / props.R)
const energyPerSec = computed(() => props.P)
const _energyPerHour = computed(() => props.P * 3600 / 3600000)

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">⚡ القدرة الكهربائية — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هي القدرة الكهربائية؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>القدرة الكهربائية P</b> هي معدل تحويل الطاقة الكهربائية إلى طاقة أخرى (حرارة، ضوء...) في كل ثانية.</p>
        <p class="explain">وحدتها: الواط (Watt) = جول/ثانية</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#fbbf24">الجهد:</span> V = {{ V.toFixed(1) }}V</div>
          <div class="branch"><span class="branch-label" style="color:#4ade80">التيار:</span> I = {{ I.toFixed(4) }}A</div>
          <div class="branch"><span class="branch-label" style="color:#67e8f9">المقاومة:</span> R = {{ R.toFixed(0) }}Ω</div>
        </div>
        <p class="explain">المجهول: P (القدرة بالواط)</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الصيغة 1: P = V × I
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain">الصيغة الأساسية: القدرة = الجهد × التيار</p>
        <div class="formula">P = V × I</div>
        <div class="calc">
          <div class="calc-line">P = {{ V.toFixed(1) }} × {{ I.toFixed(4) }}</div>
          <div class="calc-line result">P = {{ pVI.toFixed(4) }} W</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الصيغة 2: P = I² × R
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain">باستخدام V = I×R (قانون أوم)، نعوّض في P = V×I:</p>
        <div class="formula">P = I² × R</div>
        <div class="calc">
          <div class="calc-line">P = ({{ I.toFixed(4) }})² × {{ R.toFixed(0) }}</div>
          <div class="calc-line">P = {{ (I*I).toFixed(6) }} × {{ R.toFixed(0) }}</div>
          <div class="calc-line result">P = {{ pIR.toFixed(4) }} W</div>
        </div>
        <p class="explain">هذه الصيغة مفيدة عندما نعرف التيار والمقاومة فقط.</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الصيغة 3: P = V² / R
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain">باستخدام I = V/R (قانون أوم)، نعوّض في P = V×I:</p>
        <div class="formula">P = V² / R</div>
        <div class="calc">
          <div class="calc-line">P = ({{ V.toFixed(1) }})² / {{ R.toFixed(0) }}</div>
          <div class="calc-line">P = {{ (V*V).toFixed(2) }} / {{ R.toFixed(0) }}</div>
          <div class="calc-line result">P = {{ pVR.toFixed(4) }} W</div>
        </div>
        <p class="explain">هذه الصيغة مفيدة عندما نعرف الجهد والمقاومة فقط.</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الطاقة والزمن
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <p class="explain">الطاقة = القدرة × الزمن: E = P × t</p>
        <div class="formula">E = P × t</div>
        <div class="calc">
          <div class="calc-line">في ثانية واحدة: E = {{ P.toFixed(4) }} × 1 = <span class="result">{{ energyPerSec.toFixed(4) }} J</span></div>
          <div class="calc-line">في ساعة: E = {{ P.toFixed(4) }} × 3600 = <span class="result">{{ (P * 3600).toFixed(2) }} J</span></div>
          <div class="calc-line">بالكيلوواط·ساعة: E = <span class="result">{{ (P / 1000).toFixed(6) }} kWh</span></div>
        </div>
      </div>
    </div>

    <div class="verify-section">
      <div class="verify-title">✓ التحقق من تساوي الصيغ الثلاث</div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify1')">
          {{ showSteps.verify1 ? '▼' : '▶' }} P = V×I ≟ I²×R
        </button>
        <div v-if="showSteps.verify1" class="step-content">
          <div class="calc">
            <div class="calc-line">V×I = {{ pVI.toFixed(4) }} W</div>
            <div class="calc-line">I²×R = {{ pIR.toFixed(4) }} W</div>
            <div class="calc-line">الفرق = {{ Math.abs(pVI - pIR).toFixed(6) }} W</div>
            <div :class="Math.abs(pVI - pIR) < 0.001 ? 'result' : 'warn'">
              {{ Math.abs(pVI - pIR) < 0.001 ? '✓ الصيغتان متساويتان' : '✗ هناك فرق' }}
            </div>
          </div>
        </div>
      </div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify2')">
          {{ showSteps.verify2 ? '▼' : '▶' }} P = V×I ≟ V²/R
        </button>
        <div v-if="showSteps.verify2" class="step-content">
          <div class="calc">
            <div class="calc-line">V×I = {{ pVI.toFixed(4) }} W</div>
            <div class="calc-line">V²/R = {{ pVR.toFixed(4) }} W</div>
            <div class="calc-line">الفرق = {{ Math.abs(pVI - pVR).toFixed(6) }} W</div>
            <div :class="Math.abs(pVI - pVR) < 0.001 ? 'result' : 'warn'">
              {{ Math.abs(pVI - pVR) < 0.001 ? '✓ الصيغتان متساويتان' : '✗ هناك فرق' }}
            </div>
          </div>
        </div>
      </div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify3')">
          {{ showSteps.verify3 ? '▼' : '▶' }} تحقق قانون أوم: V = I × R
        </button>
        <div v-if="showSteps.verify3" class="step-content">
          <div class="calc">
            <div class="calc-line">I × R = {{ I.toFixed(4) }} × {{ R.toFixed(0) }} = {{ (I*R).toFixed(2) }} V</div>
            <div class="calc-line">V = {{ V.toFixed(1) }} V</div>
            <div :class="Math.abs(I*R - V) < 0.01 ? 'result' : 'warn'">
              {{ Math.abs(I*R - V) < 0.01 ? '✓ قانون أوم متحقق' : '✗ هناك فرق' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #f87171; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
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
.formula { font-family: 'Courier New', monospace; font-size: .95rem; color: #f87171; text-align: center; padding: .5rem; background: rgba(248,113,113,.08); border-radius: 4px; margin: .4rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
.warn { color: #ef4444; font-weight: 700; }
.verify-section { margin-top: .5rem; padding-top: .5rem; border-top: 2px solid rgba(34,197,94,.15); }
.verify-title { font-size: .9rem; font-weight: 700; color: #4ade80; text-align: center; margin-bottom: .5rem; }
</style>
