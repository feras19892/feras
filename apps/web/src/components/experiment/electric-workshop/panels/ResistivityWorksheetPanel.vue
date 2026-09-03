<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'


const props = defineProps<{
  V: number
  I: number
  R: number
  rho: number
  L: number
  A: number
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  verify1: false,
})

const rCalc = computed(() => props.I === 0 ? 0 : props.V / props.I)
const rhoCalc = computed(() => props.R * props.A / props.L)
const rFromRho = computed(() => props.rho * props.L / props.A)

const MATERIALS = [
  { name: 'نحاس',   rho: 1.68e-8,  color: '#b87333' },
  { name: 'ألمنيوم', rho: 2.82e-8,  color: '#a0a0a0' },
  { name: 'تنجستن', rho: 5.6e-8,   color: '#4a4a4a' },
  { name: 'حديد',   rho: 9.71e-8,  color: '#8b4513' },
  { name: 'نيكل',   rho: 6.99e-8,  color: '#c0c0c0' },
]

const matchedMaterial = computed(() => {
  const r = props.rho
  if (r === 0) return null
  let best = MATERIALS[0]
  let bestDiff = Math.abs(Math.log(r / best.rho))
  for (const m of MATERIALS) {
    const diff = Math.abs(Math.log(r / m.rho))
    if (diff < bestDiff) { best = m; bestDiff = diff }
  }
  return bestDiff < 1 ? best : null
})

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}

function formatRho(r: number) {
  if (r === 0) return '0'
  return r.toExponential(2)
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">🔬 مقاومية الموصل — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هي المقاومية؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>المقاومية ρ</b> هي خاصية فيزيائية للمادة تحدد مدى مقاومتها لمرور التيار.</p>
        <p class="explain">كل مادة لها مقاومية ثابتة لا تعتمد على شكل السلك أو طوله.</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#fbbf24">الجهد:</span> V = {{ V.toFixed(1) }}V</div>
          <div class="branch"><span class="branch-label" style="color:#4ade80">التيار:</span> I = {{ I.toFixed(4) }}A</div>
          <div class="branch"><span class="branch-label" style="color:#67e8f9">المقاومة:</span> R = {{ R.toFixed(1) }}Ω</div>
          <div class="branch"><span class="branch-label" style="color:#c084fc">الطول:</span> L = {{ L.toFixed(2) }}m</div>
          <div class="branch"><span class="branch-label" style="color:#c084fc">المساحة:</span> A = {{ A.toExponential(1) }}m²</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: حساب المقاومة R
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain">من قانون أوم: R = V / I</p>
        <div class="formula">R = V / I</div>
        <div class="calc">
          <div class="calc-line">R = {{ V.toFixed(1) }} / {{ I.toFixed(4) }}</div>
          <div class="calc-line result">R = {{ rCalc.toFixed(2) }} Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: قانون المقاومية
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain">المقاومة تعتمد على المادة والأبعاد:</p>
        <div class="formula">R = ρ × L / A</div>
        <p class="explain">حيث:</p>
        <div class="calc">
          <div class="calc-line">ρ = المقاومية (Ω·m) — خاصية المادة</div>
          <div class="calc-line">L = طول السلك (m)</div>
          <div class="calc-line">A = مساحة المقطع (m²)</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: حساب المقاومية ρ
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain">بإعادة ترتيب القانون: ρ = R × A / L</p>
        <div class="formula">ρ = R × A / L</div>
        <div class="calc">
          <div class="calc-line">ρ = {{ R.toFixed(2) }} × {{ A.toExponential(1) }} / {{ L.toFixed(2) }}</div>
          <div class="calc-line">ρ = {{ (R * A).toExponential(2) }} / {{ L.toFixed(2) }}</div>
          <div class="calc-line result">ρ = {{ formatRho(rhoCalc) }} Ω·m</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: تحديد نوع المادة
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <p class="explain">بمقارنة ρ المحسوبة مع القيم المعروفة:</p>
        <div class="materials-table">
          <div class="mat-header"><span>المادة</span><span>ρ (Ω·m)</span></div>
          <div v-for="m in MATERIALS" :key="m.name" class="mat-row" :class="{ matched: matchedMaterial?.name === m.name }">
            <span :style="{ color: m.color }">{{ m.name }}</span>
            <span>{{ m.rho.toExponential(2) }}</span>
          </div>
        </div>
        <div v-if="matchedMaterial" class="calc" style="margin-top:.5rem">
          <div class="calc-line result">✓ المادة الأقرب: {{ matchedMaterial.name }} (ρ = {{ matchedMaterial.rho.toExponential(2) }} Ω·m)</div>
        </div>
        <div v-else class="calc" style="margin-top:.5rem">
          <div class="calc-line warn">⚠ لا توجد مادة مطابقة بشكل وثيق</div>
        </div>
      </div>
    </div>

    <div class="verify-section">
      <div class="verify-title">✓ التحقق</div>

      <div class="step-row">
        <button class="step-toggle verify" @click="toggleStep('verify1')">
          {{ showSteps.verify1 ? '▼' : '▶' }} تحقق: R = ρ × L / A
        </button>
        <div v-if="showSteps.verify1" class="step-content">
          <div class="formula">R ≟ ρ × L / A</div>
          <div class="calc">
            <div class="calc-line">R المقاس = {{ R.toFixed(2) }} Ω</div>
            <div class="calc-line">ρ × L / A = {{ formatRho(rho) }} × {{ L.toFixed(2) }} / {{ A.toExponential(1) }}</div>
            <div class="calc-line">= {{ rFromRho.toFixed(2) }} Ω</div>
            <div :class="Math.abs(rFromRho - R) / R < 0.01 ? 'result' : 'warn'">
              {{ Math.abs(rFromRho - R) / R < 0.01 ? '✓ متطابق' : '✗ هناك فرق' }}
            </div>
          </div>
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
.step-toggle.verify { background: rgba(34,197,94,.08); border-color: rgba(34,197,94,.2); color: #4ade80; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.circuit-desc { display: flex; flex-direction: column; gap: .3rem; margin: .5rem 0; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.branch { font-size: .78rem; color: #cbd5e1; display: flex; gap: .4rem; align-items: baseline; }
.branch-label { font-weight: 700; white-space: nowrap; }
.formula { font-family: 'Courier New', monospace; font-size: .95rem; color: #c084fc; text-align: center; padding: .5rem; background: rgba(192,132,252,.08); border-radius: 4px; margin: .4rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
.warn { color: #ef4444; font-weight: 700; }
.verify-section { margin-top: .5rem; padding-top: .5rem; border-top: 2px solid rgba(34,197,94,.15); }
.verify-title { font-size: .9rem; font-weight: 700; color: #4ade80; text-align: center; margin-bottom: .5rem; }
.materials-table { display: flex; flex-direction: column; gap: .1rem; margin-top: .3rem; }
.mat-header { display: flex; justify-content: space-between; padding: .3rem .5rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .75rem; color: #94a3b8; }
.mat-row { display: flex; justify-content: space-between; padding: .25rem .5rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; }
.mat-row.matched { background: rgba(34,197,94,.08); border-radius: 4px; }
</style>
