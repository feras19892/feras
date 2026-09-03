<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  N: number
  speed: number
  emf: number
  IuA: number
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
})

const Rgalv = 50
const emfCalc = computed(() => props.N * props.speed * 0.001)
const Icalc = computed(() => (emfCalc.value / Rgalv) * 1e6)
const sensitivity = computed(() => Math.min(100, Math.abs(Icalc.value) * 2))

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 الجلفانوميتر والحث الكهرومغناطيسي — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هو الحث الكهرومغناطيسي؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>الحث الكهرومغناطيسي</b> هو توليد قوة دافعة كهربائية (EMF) في موصل عند تغير التدفق المغناطيسي خلاله.</p>
        <p class="explain">اكتشفها <b>مايكل فاراداي</b> عام 1831 — أساس المولدات الكهربائية!</p>
        <p class="explain"><b>الجلفانوميتر</b> جهاز حساس يكشف تيارات صغيرة جداً (µA) ويظهرها كانحراف مؤشر.</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#67e8f9">عدد اللفات:</span> N = {{ N }}</div>
          <div class="branch"><span class="branch-label" style="color:#fbbf24">سرعة المغناطيس:</span> v = {{ speed }} m/s</div>
          <div class="branch"><span class="branch-label" style="color:#c084fc">مقاومة الجلفانوميتر:</span> R = {{ Rgalv }} Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: قانون فاراداي
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain">القوة الدافعة المستحثة تتناسب طردياً مع عدد اللفات ومعدل تغير التدفق:</p>
        <div class="formula">ε = -N × ΔΦ/Δt</div>
        <p class="explain">في تجربتنا: ΔΦ/Δt ∝ سرعة المغناطيس</p>
        <div class="formula">ε = N × v × k</div>
        <p class="explain">حيث k = 0.001 (ثابت التجربة)</p>
        <div class="calc">
          <div class="calc-line">ε = {{ N }} × {{ speed }} × 0.001</div>
          <div class="calc-line result">ε = {{ emfCalc.toFixed(4) }} V</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: التيار المستحث
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain">باستخدام قانون أوم للجلفانوميتر:</p>
        <div class="formula">I = ε / R</div>
        <div class="calc">
          <div class="calc-line">I = {{ emfCalc.toFixed(4) }} / {{ Rgalv }}</div>
          <div class="calc-line">I = {{ (emfCalc / Rgalv).toExponential(4) }} A</div>
          <div class="calc-line result">I = {{ Icalc.toFixed(2) }} µA</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: العلاقات
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain"><b>ε ∝ N</b> — مضاعفة اللفات = مضاعفة الـ EMF</p>
        <p class="explain"><b>ε ∝ v</b> — مضاعفة السرعة = مضاعفة الـ EMF</p>
        <p class="explain"><b>I ∝ ε</b> — التيار يتناسب طردياً مع الـ EMF</p>
        <div class="key-values">
          <div class="kv-row"><span>مضاعفة N</span><span>→ 2× ε, 2× I</span></div>
          <div class="kv-row"><span>مضاعفة v</span><span>→ 2× ε, 2× I</span></div>
          <div class="kv-row"><span>مضاعفة N و v</span><span>→ 4× ε, 4× I</span></div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: القراءة الحالية
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <div class="calc">
          <div class="calc-line">عدد اللفات: N = {{ N }}</div>
          <div class="calc-line">السرعة: v = {{ speed }} m/s</div>
          <div class="calc-line">الـ EMF: ε = {{ emf.toFixed(4) }} V</div>
          <div class="calc-line">التيار: I = {{ IuA.toFixed(2) }} µA</div>
          <div class="calc-line">الحساسية: <span class="result">{{ sensitivity.toFixed(0) }}%</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #c084fc; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.circuit-desc { display: flex; flex-direction: column; gap: .3rem; margin: .5rem 0; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.branch { font-size: .78rem; color: #cbd5e1; display: flex; gap: .4rem; align-items: baseline; }
.branch-label { font-weight: 700; white-space: nowrap; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #c084fc; text-align: center; padding: .4rem; background: rgba(192,132,252,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
.key-values { display: flex; flex-direction: column; gap: .2rem; margin-top: .3rem; }
.kv-row { display: flex; justify-content: space-between; padding: .25rem .5rem; background: rgba(255,255,255,.02); border-radius: 4px; font-size: .78rem; color: #cbd5e1; }
</style>
