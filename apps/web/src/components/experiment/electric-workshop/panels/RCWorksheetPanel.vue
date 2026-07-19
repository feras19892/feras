<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  V0: number
  R: number
  C: number
  tau: number
  Vc: number
  I: number
  t: number
  charging: boolean
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  step5: false,
})

const tauCalc = computed(() => props.R * props.C * 1e-6)
const vcAtTau = computed(() => props.V0 * (1 - Math.exp(-1)))
const vcAt2Tau = computed(() => props.V0 * (1 - Math.exp(-2)))
const vcAt3Tau = computed(() => props.V0 * (1 - Math.exp(-3)))
const vcAt5Tau = computed(() => props.V0 * (1 - Math.exp(-5)))
const i0 = computed(() => props.R === 0 ? 0 : props.V0 / props.R)

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">🔌 شحن وتفريغ المكثف — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هو المكثف؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>المكثف (Capacitor)</b> مكون يخزن الطاقة الكهربائية في شكل شحنة على لوحين موصلين.</p>
        <p class="explain">عند توصيله ببطارية عبر مقاومة، يشحن تدريجياً حتى Vc = V₀.</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#fbbf24">المصدر:</span> V₀ = {{ V0.toFixed(1) }}V</div>
          <div class="branch"><span class="branch-label" style="color:#67e8f9">المقاومة:</span> R = {{ R.toFixed(0) }}Ω</div>
          <div class="branch"><span class="branch-label" style="color:#f59e0b">المكثف:</span> C = {{ C.toFixed(0) }}µF</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: ثابت الزمن τ
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain">ثابت الزمن يحدد سرعة الشحن/التفريغ:</p>
        <div class="formula">τ = R × C</div>
        <div class="calc">
          <div class="calc-line">τ = {{ R.toFixed(0) }} × {{ C.toFixed(0) }}×10⁻⁶</div>
          <div class="calc-line result">τ = {{ tauCalc.toFixed(4) }} s</div>
        </div>
        <p class="explain">كلما زاد τ، أبطأ الشحن. كلما قلّ τ، أسرع الشحن.</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: معادلة الشحن
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain">عند الشحن (المفتاح مغلق والمكثف فارغ):</p>
        <div class="formula">Vc(t) = V₀ × (1 - e^(-t/τ))</div>
        <div class="formula">I(t) = (V₀/R) × e^(-t/τ)</div>
        <div class="calc">
          <div class="calc-line">I₀ = V₀/R = {{ V0.toFixed(1) }}/{{ R.toFixed(0) }} = <span class="result">{{ i0.toExponential(3) }} A</span></div>
        </div>
        <p class="explain">عند t=0: Vc=0, I=I₀ (تيار أقصى)</p>
        <p class="explain">عند t→∞: Vc=V₀, I=0 (شحن كامل)</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: معادلة التفريغ
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain">عند التفريغ (المفتاح مفتوح والمكثف مشحون):</p>
        <div class="formula">Vc(t) = V₀ × e^(-t/τ)</div>
        <div class="formula">I(t) = (V₀/R) × e^(-t/τ)</div>
        <p class="explain">عند t=0: Vc=V₀ (أقصى جهد)</p>
        <p class="explain">عند t→∞: Vc=0 (تفريغ كامل)</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: قيم مميزة عند مضاعفات τ
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <div class="key-values">
          <div class="kv-row"><span>عند t = τ</span><span>Vc = {{ vcAtTau.toFixed(2) }}V ({{ ((1-Math.exp(-1))*100).toFixed(1) }}%)</span></div>
          <div class="kv-row"><span>عند t = 2τ</span><span>Vc = {{ vcAt2Tau.toFixed(2) }}V ({{ ((1-Math.exp(-2))*100).toFixed(1) }}%)</span></div>
          <div class="kv-row"><span>عند t = 3τ</span><span>Vc = {{ vcAt3Tau.toFixed(2) }}V ({{ ((1-Math.exp(-3))*100).toFixed(1) }}%)</span></div>
          <div class="kv-row"><span>عند t = 5τ</span><span>Vc = {{ vcAt5Tau.toFixed(2) }}V ({{ ((1-Math.exp(-5))*100).toFixed(1) }}%)</span></div>
        </div>
        <p class="explain">بعد 5τ يعتبر المكثف مشحون تماماً (99.3%)</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step5')">
        {{ showSteps.step5 ? '▼' : '▶' }} الخطوة 5: القراءة الحالية
      </button>
      <div v-if="showSteps.step5" class="step-content">
        <div class="calc">
          <div class="calc-line">الزمن: t = {{ t.toFixed(4) }} s</div>
          <div class="calc-line">جهد المكثف: Vc = {{ Vc.toFixed(3) }} V</div>
          <div class="calc-line">التيار: I = {{ I.toExponential(3) }} A</div>
          <div class="calc-line">الحالة: <span :class="charging ? 'result' : 'warn'">{{ charging ? 'شحن ⬆' : 'تفريغ ⬇' }}</span></div>
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
.key-values { display: flex; flex-direction: column; gap: .2rem; }
.kv-row { display: flex; justify-content: space-between; padding: .25rem .5rem; background: rgba(255,255,255,.02); border-radius: 4px; font-size: .78rem; color: #cbd5e1; }
</style>
