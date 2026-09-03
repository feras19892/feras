<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  V1: number
  V2: number
  R1: number
  R2: number
  R3: number
  I1: number
  I2: number
  I3: number
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

const kclCheck = computed(() => props.I1 + props.I2)
const kclDiff = computed(() => Math.abs(kclCheck.value - props.I3))
const kvlLoop1 = computed(() => props.V1 - props.I1 * props.R1 - props.I3 * props.R3)
const kvlLoop2 = computed(() => props.V2 - props.I2 * props.R2 - props.I3 * props.R3)

const det = computed(() => (props.R1 + props.R3) * (props.R2 + props.R3) - props.R3 * props.R3)
const I1Calc = computed(() => (props.V1 * (props.R2 + props.R3) - props.V2 * props.R3) / det.value)
const I2Calc = computed(() => (props.V2 * (props.R1 + props.R3) - props.V1 * props.R3) / det.value)
const I3Calc = computed(() => I1Calc.value + I2Calc.value)

const VR1 = computed(() => props.I1 * props.R1)
const VR2 = computed(() => props.I2 * props.R2)
const VR3 = computed(() => props.I3 * props.R3)

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 قانون كيرشوف — حل مفصّل</div>

    <!-- مقدمة -->
    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: فهم الدائرة
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain">لدينا دائرة كهربائية بحلقتين تتشاركان المقاومة R₃:</p>
        <div class="circuit-desc">
          <div class="branch">
            <span class="branch-label" style="color:#fbbf24">الحلقة اليسرى:</span>
            <span>V₁ ({{ V1.toFixed(1) }}V) ← A₁ ← R₁ ({{ R1.toFixed(0) }}Ω) ← R₃ ({{ R3.toFixed(0) }}Ω)</span>
          </div>
          <div class="branch">
            <span class="branch-label" style="color:#67e8f9">الحلقة اليمنى:</span>
            <span>V₂ ({{ V2.toFixed(1) }}V) ← A₂ ← R₂ ({{ R2.toFixed(0) }}Ω) ← R₃ ({{ R3.toFixed(0) }}Ω)</span>
          </div>
        </div>
        <p class="explain">المجاهيل: I₁ (التيار في الحلقة اليسرى)، I₂ (التيار في الحلقة اليمنى)، I₃ (التيار في R₃)</p>
        <p class="explain">عدد المعادلات اللازمة = 3 (مجهولان للحلقات + معادلة العقدة)</p>
      </div>
    </div>

    <!-- الخطوة 1: KCL -->
    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: قانون كيرشوف للتيارات (KCL)
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain"><b>القانون:</b> مجموع التيارات الداخلة للعقدة = مجموع التيارات الخارجة منها</p>
        <p class="explain">عند العقدة (نقطة التقاء الحلقتين):</p>
        <div class="formula">I₁ + I₂ = I₃  ←  I₃ = I₁ + I₂</div>
        <p class="explain">هذا يعني أن التيار في R₃ يساوي مجموع التيارين القادمين من الحلقتين.</p>
        <div class="calc">
          <div class="calc-line">I₃ = I₁ + I₂ = {{ I1.toFixed(4) }} + {{ I2.toFixed(4) }} = <span class="result">{{ I3.toFixed(4) }} A</span></div>
        </div>
      </div>
    </div>

    <!-- الخطوة 2: KVL الحلقة اليسرى -->
    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: KVL للحلقة اليسرى
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain"><b>القانون:</b> مجموع فروق الجهد حول أي حلقة مغلقة = صفر</p>
        <p class="explain">نبدأ من V₁ وندور مع اتجاه التيار:</p>
        <div class="formula">V₁ − I₁·R₁ − I₃·R₃ = 0</div>
        <div class="calc">
          <div class="calc-line">المصدر يرفع الجهد: +{{ V1.toFixed(1) }}V</div>
          <div class="calc-line">هبوط الجهد على R₁: −I₁×R₁ = −{{ I1.toFixed(4) }}×{{ R1.toFixed(0) }} = −{{ VR1.toFixed(2) }}V</div>
          <div class="calc-line">هبوط الجهد على R₃: −I₃×R₃ = −{{ I3.toFixed(4) }}×{{ R3.toFixed(0) }} = −{{ VR3.toFixed(2) }}V</div>
          <div class="calc-line result">{{ V1.toFixed(1) }} − {{ VR1.toFixed(2) }} − {{ VR3.toFixed(2) }} = {{ kvlLoop1.toFixed(4) }}V</div>
        </div>
      </div>
    </div>

    <!-- الخطوة 3: KVL الحلقة اليمنى -->
    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: KVL للحلقة اليمنى
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain">نبدأ من V₂ وندور مع اتجاه التيار:</p>
        <div class="formula">V₂ − I₂·R₂ − I₃·R₃ = 0</div>
        <div class="calc">
          <div class="calc-line">المصدر يرفع الجهد: +{{ V2.toFixed(1) }}V</div>
          <div class="calc-line">هبوط الجهد على R₂: −I₂×R₂ = −{{ I2.toFixed(4) }}×{{ R2.toFixed(0) }} = −{{ VR2.toFixed(2) }}V</div>
          <div class="calc-line">هبوط الجهد على R₃: −I₃×R₃ = −{{ I3.toFixed(4) }}×{{ R3.toFixed(0) }} = −{{ VR3.toFixed(2) }}V</div>
          <div class="calc-line result">{{ V2.toFixed(1) }} − {{ VR2.toFixed(2) }} − {{ VR3.toFixed(2) }} = {{ kvlLoop2.toFixed(4) }}V</div>
        </div>
      </div>
    </div>

    <!-- الخطوة 4: حل المعادلات -->
    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: حل المعادلات بالتعويض
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <p class="explain">نعوّض I₃ = I₁ + I₂ في معادلات KVL:</p>
        <div class="formula">I₁·(R₁+R₃) + I₂·R₃ = V₁</div>
        <div class="formula">I₁·R₃ + I₂·(R₂+R₃) = V₂</div>
        <p class="explain">نحل بمحدّد المصفوفة (Cramer's Rule):</p>
        <div class="matrix">
          <div>det = (R₁+R₃)(R₂+R₃) − R₃²</div>
          <div>= ({{ R1.toFixed(0) }}+{{ R3.toFixed(0) }})({{ R2.toFixed(0) }}+{{ R3.toFixed(0) }}) − {{ R3.toFixed(0) }}²</div>
          <div>= {{ (R1+R3).toFixed(0) }} × {{ (R2+R3).toFixed(0) }} − {{ (R3*R3).toFixed(0) }}</div>
          <div class="result">det = {{ det.toFixed(0) }}</div>
        </div>
        <div class="calc">
          <div class="calc-line">I₁ = (V₁·(R₂+R₃) − V₂·R₃) / det</div>
          <div class="calc-line">= ({{ V1.toFixed(1) }}×{{ (R2+R3).toFixed(0) }} − {{ V2.toFixed(1) }}×{{ R3.toFixed(0) }}) / {{ det.toFixed(0) }}</div>
          <div class="calc-line">= ({{ (V1*(R2+R3)).toFixed(1) }} − {{ (V2*R3).toFixed(1) }}) / {{ det.toFixed(0) }}</div>
          <div class="calc-line result">I₁ = {{ I1Calc.toFixed(4) }} A</div>
          <div class="calc-line" style="margin-top:.4rem">I₂ = (V₂·(R₁+R₃) − V₁·R₃) / det</div>
          <div class="calc-line">= ({{ V2.toFixed(1) }}×{{ (R1+R3).toFixed(0) }} − {{ V1.toFixed(1) }}×{{ R3.toFixed(0) }}) / {{ det.toFixed(0) }}</div>
          <div class="calc-line">= ({{ (V2*(R1+R3)).toFixed(1) }} − {{ (V1*R3).toFixed(1) }}) / {{ det.toFixed(0) }}</div>
          <div class="calc-line result">I₂ = {{ I2Calc.toFixed(4) }} A</div>
          <div class="calc-line" style="margin-top:.4rem">I₃ = I₁ + I₂ = {{ I1Calc.toFixed(4) }} + {{ I2Calc.toFixed(4) }}</div>
          <div class="calc-line result">I₃ = {{ I3Calc.toFixed(4) }} A</div>
        </div>
      </div>
    </div>

    <!-- التحقق -->
    <div class="verify-section">
      <div class="verify-title">✓ التحقق من القوانين</div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify1')">
          {{ showSteps.verify1 ? '▼' : '▶' }} تحقق KCL
        </button>
        <div v-if="showSteps.verify1" class="step-content">
          <div class="formula">I₁ + I₂ ≟ I₃</div>
          <div class="calc">
            <div class="calc-line">{{ I1.toFixed(4) }} + {{ I2.toFixed(4) }} = {{ kclCheck.toFixed(4) }} A</div>
            <div class="calc-line">I₃ = {{ I3.toFixed(4) }} A</div>
            <div class="calc-line">الفرق = {{ kclDiff.toFixed(6) }} A</div>
            <div :class="kclDiff < 0.001 ? 'result' : 'warn'">
              {{ kclDiff < 0.001 ? '✓ قانون كيرشوف للتيارات متحقق' : '✗ هناك خطأ في الحساب' }}
            </div>
          </div>
        </div>
      </div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify2')">
          {{ showSteps.verify2 ? '▼' : '▶' }} تحقق KVL — الحلقة اليسرى
        </button>
        <div v-if="showSteps.verify2" class="step-content">
          <div class="formula">V₁ − I₁·R₁ − I₃·R₃ ≟ 0</div>
          <div class="calc">
            <div class="calc-line">{{ V1.toFixed(1) }} − {{ VR1.toFixed(2) }} − {{ VR3.toFixed(2) }} = {{ kvlLoop1.toFixed(4) }} V</div>
            <div :class="Math.abs(kvlLoop1) < 0.001 ? 'result' : 'warn'">
              {{ Math.abs(kvlLoop1) < 0.001 ? '✓ قانون كيرشوف للجهد متحقق في الحلقة اليسرى' : '✗ هناك خطأ في الحساب' }}
            </div>
          </div>
        </div>
      </div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify3')">
          {{ showSteps.verify3 ? '▼' : '▶' }} تحقق KVL — الحلقة اليمنى
        </button>
        <div v-if="showSteps.verify3" class="step-content">
          <div class="formula">V₂ − I₂·R₂ − I₃·R₃ ≟ 0</div>
          <div class="calc">
            <div class="calc-line">{{ V2.toFixed(1) }} − {{ VR2.toFixed(2) }} − {{ VR3.toFixed(2) }} = {{ kvlLoop2.toFixed(4) }} V</div>
            <div :class="Math.abs(kvlLoop2) < 0.001 ? 'result' : 'warn'">
              {{ Math.abs(kvlLoop2) < 0.001 ? '✓ قانون كيرشوف للجهد متحقق في الحلقة اليمنى' : '✗ هناك خطأ في الحساب' }}
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
.matrix { font-family: 'Courier New', monospace; font-size: .82rem; padding: .5rem; background: rgba(91,141,184,.06); border-radius: 4px; margin: .4rem 0; display: flex; flex-direction: column; gap: .15rem; color: #67e8f9; }
.result { color: #22c55e; font-weight: 700; }
.warn { color: #ef4444; font-weight: 700; }
.verify-section { margin-top: .5rem; padding-top: .5rem; border-top: 2px solid rgba(34,197,94,.15); }
.verify-title { font-size: .9rem; font-weight: 700; color: #4ade80; text-align: center; margin-bottom: .5rem; }
</style>
