<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  sourceExperiment: string
  reading: Record<string, number>
}>()

const showSteps = ref<Record<string, boolean>>({})

function toggleStep(key: string) {
  showSteps.value[key] = !showSteps.value[key]
}

const r = computed(() => props.reading)

const configs: Record<string, { title: string; steps: { key: string; label: string; formula: string; lines: () => string[]; result: () => string }[] }> = {
  'electric-lab-compound': {
    title: '📐 حسابات الدائرة المختلطة',
    steps: [
      { key: 's1', label: 'الخطوة 1: المقاومة المكافئة', formula: 'Req = V / I', lines: () => [`Req = ${r.value.V?.toFixed(1)} / ${r.value.I?.toFixed(4)}`], result: () => `Req = ${(r.value.V / r.value.I || 0).toFixed(1)} Ω` },
      { key: 's2', label: 'الخطوة 2: التحقق من الجهد', formula: 'V = I × Req', lines: () => [`V = ${r.value.I?.toFixed(4)} × ${(r.value.V / r.value.I || 0).toFixed(1)}`], result: () => `V = ${(r.value.I * (r.value.V / r.value.I || 0) || 0).toFixed(1)} V` },
    ],
  },
  'electric-lab-emf': {
    title: '📐 حسابات القوة الدافعة',
    steps: [
      { key: 's1', label: 'الخطوة 1: المقاومة الداخلية', formula: 'r = (EMF − Vt) / I', lines: () => [`r = (${r.value.EMF?.toFixed(1)} − ${r.value.Vt?.toFixed(2)}) / ${r.value.I?.toFixed(4)}`], result: () => `r = ${(((r.value.EMF || 0) - (r.value.Vt || 0)) / (r.value.I || 1)).toFixed(2)} Ω` },
      { key: 's2', label: 'الخطوة 2: هبوط الجهد الداخلي', formula: 'Vdrop = I × r', lines: () => [`Vdrop = ${r.value.I?.toFixed(4)} × ${r.value.r?.toFixed(2)}`], result: () => `Vdrop = ${(r.value.I * r.value.r || 0).toFixed(4)} V` },
    ],
  },
  'electric-lab-temp-r': {
    title: '📐 حسابات تأثير الحرارة على المقاومة',
    steps: [
      { key: 's1', label: 'الخطوة 1: المقاومة عند T', formula: 'R = R₀(1 + αΔT)', lines: () => [`R = ${r.value.R?.toFixed(1)} Ω عند T = ${r.value.T?.toFixed(0)} °C`], result: () => `α = ${((r.value.R - 100) / (100 * (r.value.T - 20)) || 0).toFixed(4)} /°C` },
    ],
  },
  'electric-lab-cells-series': {
    title: '📐 حسابات الخلايا على التوالي',
    steps: [
      { key: 's1', label: 'الخطوة 1: التيار', formula: 'I = (EMF₁+EMF₂) / (R+r₁+r₂)', lines: () => [`I = ${r.value.EMF?.toFixed(1)} / (${r.value.R?.toFixed(0)} + ${r.value.r?.toFixed(1)})`], result: () => `I = ${r.value.I?.toFixed(4)} A` },
      { key: 's2', label: 'الخطوة 2: جهد الأطراف', formula: 'Vt = I × R', lines: () => [`Vt = ${r.value.I?.toFixed(4)} × ${r.value.R?.toFixed(0)}`], result: () => `Vt = ${r.value.Vt?.toFixed(2)} V` },
    ],
  },
  'electric-lab-cells-parallel': {
    title: '📐 حسابات الخلايا على التوازي',
    steps: [
      { key: 's1', label: 'الخطوة 1: المقاومة الداخلية المكافئة', formula: 'r_eq = r₁×r₂/(r₁+r₂)', lines: () => [`r_eq = ${(r.value.r || 0).toFixed(2)} Ω`], result: () => `I = ${r.value.I?.toFixed(4)} A` },
    ],
  },
  'electric-lab-rheostat': {
    title: '📐 حسابات الريوستات',
    steps: [
      { key: 's1', label: 'الخطوة 1: المقاومة المتغيرة', formula: 'R = V / I', lines: () => [`R = ${r.value.V?.toFixed(1)} / ${r.value.I?.toFixed(4)}`], result: () => `R = ${(r.value.V / r.value.I || 0).toFixed(1)} Ω` },
    ],
  },
  'electric-lab-current-divider': {
    title: '📐 حسابات مقسم التيار',
    steps: [
      { key: 's1', label: 'الخطوة 1: المقاومة المكافئة', formula: 'Req = R₁×R₂/(R₁+R₂)', lines: () => [`Req = ${r.value.R?.toFixed(1)} Ω`], result: () => `It = ${r.value.It?.toFixed(4)} A` },
      { key: 's2', label: 'الخطوة 2: جهد الأطراف', formula: 'V = It × Req', lines: () => [`V = ${r.value.It?.toFixed(4)} × ${r.value.R?.toFixed(1)}`], result: () => `V = ${r.value.V?.toFixed(2)} V` },
    ],
  },
  'electric-lab-source-eff': {
    title: '📐 حسابات كفاءة المصدر',
    steps: [
      { key: 's1', label: 'الخطوة 1: القدرة المستهلكة', formula: 'P_load = I² × R', lines: () => [`P = ${r.value.I?.toFixed(4)}² × ${r.value.R?.toFixed(0)}`], result: () => `P = ${(r.value.I * r.value.I * r.value.R || 0).toFixed(3)} W` },
      { key: 's2', label: 'الخطوة 2: الكفاءة', formula: 'η = R/(R+r)', lines: () => [`η = ${r.value.R?.toFixed(0)} / (${r.value.R?.toFixed(0)} + r)`], result: () => `η = ${(r.value.eta ? (r.value.eta * 100).toFixed(1) : '0.0')} %` },
    ],
  },
  'electric-lab-two-sources': {
    title: '📐 حسابات مصدرين متضادين',
    steps: [
      { key: 's1', label: 'الخطوة 1: صافي القوة الدافعة', formula: 'ΔEMF = EMF₁ − EMF₂', lines: () => [`ΔEMF = ${r.value.V?.toFixed(1)} V`], result: () => `I = ${r.value.I?.toFixed(4)} A` },
      { key: 's2', label: 'الخطوة 2: جهد الأطراف', formula: 'Vt = I × R', lines: () => [`Vt = ${r.value.I?.toFixed(4)} × ${r.value.R?.toFixed(0)}`], result: () => `Vt = ${r.value.Vt?.toFixed(2)} V` },
    ],
  },
  'electric-lab-diode-iv': {
    title: '📐 حسابات خصائص الدايود',
    steps: [
      { key: 's1', label: 'الخطوة 1: معادلة شوكلي', formula: 'I = Is×(e^(V/ηVt) − 1)', lines: () => [`Vd = ${r.value.V?.toFixed(3)} V`, `I = ${r.value.I?.toExponential(2)} A`], result: () => `V_barrier = 0.700 V` },
    ],
  },
  'electric-lab-transformer': {
    title: '📐 حسابات نسبة المحوّل',
    steps: [
      { key: 's1', label: 'الخطوة 1: نسبة الجهد', formula: 'Vs/Vp = Ns/Np', lines: () => [`Vs = ${r.value.V?.toFixed(0)} V`, `Is = ${r.value.I?.toFixed(3)} A`], result: () => `نسبة التحويل = Ns/Np` },
    ],
  },
  'electric-lab-self-inductance': {
    title: '📐 حسابات التحريض الذاتي',
    steps: [
      { key: 's1', label: 'الخطوة 1: الطاقة المخزنة', formula: 'E = ½LI²', lines: () => [`E = ½ × L × ${r.value.I?.toFixed(4)}²`], result: () => `τ = L/R ثابت الزمن` },
    ],
  },
  'electric-lab-thermistor': {
    title: '📐 حسابات الثيرميستور',
    steps: [
      { key: 's1', label: 'الخطوة 1: المقاومة الحرارية', formula: 'R = R₀×e^(β(1/T−1/T₀))', lines: () => [`R = ${r.value.R?.toFixed(0)} Ω عند T = ${r.value.T?.toFixed(0)} °C`], result: () => `I = ${(r.value.I || 0).toFixed(6)} A` },
    ],
  },
  'electric-lab-magnetic-force': {
    title: '📐 حسابات القوة المغناطيسية',
    steps: [
      { key: 's1', label: 'الخطوة 1: القوة', formula: 'F = BIL sin(θ)', lines: () => [`F = B × ${r.value.I?.toFixed(3)} × L × sin(90°)`], result: () => `F = ${(r.value.F || 0).toFixed(4)} N` },
    ],
  },
  'electric-lab-lc-oscillation': {
    title: '📐 حسابات دائرة LC',
    steps: [
      { key: 's1', label: 'الخطوة 1: التردد', formula: 'f = 1/(2π√(LC))', lines: () => [`f = ${r.value.f?.toFixed(0)} Hz`], result: () => `E = ${(r.value.E || 0).toFixed(4)} J` },
    ],
  },
  'electromagnetism-straight-wire': {
    title: '📐 حسابات المجال المغناطيسي لسلك مستقيم',
    steps: [
      {
        key: 's1',
        label: 'الخطوة 1: حساب المجال المغناطيسي B',
        formula: 'B = μ₀I / (2πr)',
        lines: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const I = r.value.I ?? 0
          const dist = r.value.r ?? 0
          return [
            `μ₀ = ${mu0.toExponential(4)} T·m/A`,
            `I = ${I.toFixed(2)} A`,
            `r = ${dist.toFixed(4)} m`,
            `B = ${mu0.toExponential(4)} × ${I.toFixed(2)} / (2π × ${dist.toFixed(4)})`,
          ]
        },
        result: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const I = r.value.I ?? 0
          const dist = Math.max(r.value.r ?? 0, 1e-6)
          const B = (mu0 * I) / (2 * Math.PI * dist)
          return `B = ${B.toExponential(4)} T`
        },
      },
      {
        key: 's2',
        label: 'الخطوة 2: حساب التيار I',
        formula: 'I = B·2πr / μ₀',
        lines: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const B = r.value.B ?? 0
          const dist = r.value.r ?? 0
          return [
            `B = ${B.toExponential(4)} T`,
            `r = ${dist.toFixed(4)} m`,
            `I = ${B.toExponential(4)} × 2π × ${dist.toFixed(4)} / ${mu0.toExponential(4)}`,
          ]
        },
        result: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const B = r.value.B ?? 0
          const dist = r.value.r ?? 0
          const I = (B * 2 * Math.PI * dist) / mu0
          return `I = ${I.toFixed(4)} A`
        },
      },
      {
        key: 's3',
        label: 'الخطوة 3: حساب النفاذية μ₀',
        formula: 'μ₀ = B·2πr / I',
        lines: () => {
          const B = r.value.B ?? 0
          const I = r.value.I ?? 0
          const dist = r.value.r ?? 0
          return [
            `B = ${B.toExponential(4)} T`,
            `I = ${I.toFixed(2)} A`,
            `r = ${dist.toFixed(4)} m`,
            `μ₀ = ${B.toExponential(4)} × 2π × ${dist.toFixed(4)} / ${I.toFixed(2)}`,
          ]
        },
        result: () => {
          const B = r.value.B ?? 0
          const I = r.value.I ?? 0
          const dist = r.value.r ?? 0
          const mu0 = (B * 2 * Math.PI * dist) / I
          return `μ₀ = ${mu0.toExponential(4)} T·m/A`
        },
      },
    ],
  },
  'electromagnetism-circular-coil': {
    title: '📐 حسابات المجال المغناطيسي لملف دائري',
    steps: [
      {
        key: 's1',
        label: 'الخطوة 1: حساب المجال B',
        formula: 'B = μ₀NI / (2R)',
        lines: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const I = r.value.I ?? 0
          const N = r.value.N ?? 0
          const R = r.value.R ?? 0
          return [
            `μ₀ = ${mu0.toExponential(4)} T·m/A`,
            `N = ${N} لفة`,
            `I = ${I.toFixed(2)} A`,
            `R = ${R.toFixed(4)} m`,
            `B = ${mu0.toExponential(4)} × ${N} × ${I.toFixed(2)} / (2 × ${R.toFixed(4)})`,
          ]
        },
        result: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const I = r.value.I ?? 0
          const N = r.value.N ?? 0
          const R = Math.max(r.value.R ?? 0, 1e-6)
          const B = (mu0 * N * I) / (2 * R)
          return `B = ${B.toExponential(4)} T`
        },
      },
      {
        key: 's2',
        label: 'الخطوة 2: حساب التيار I',
        formula: 'I = B·2R / (μ₀N)',
        lines: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const B = r.value.B ?? 0
          const N = r.value.N ?? 0
          const R = r.value.R ?? 0
          return [
            `B = ${B.toExponential(4)} T`,
            `N = ${N} لفة`,
            `R = ${R.toFixed(4)} m`,
            `I = ${B.toExponential(4)} × 2 × ${R.toFixed(4)} / (${mu0.toExponential(4)} × ${N})`,
          ]
        },
        result: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const B = r.value.B ?? 0
          const N = r.value.N ?? 0
          const R = r.value.R ?? 0
          const I = (B * 2 * R) / (mu0 * N)
          return `I = ${I.toFixed(4)} A`
        },
      },
      {
        key: 's3',
        label: 'الخطوة 3: حساب نصف القطر R',
        formula: 'R = μ₀NI / (2B)',
        lines: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const B = r.value.B ?? 0
          const I = r.value.I ?? 0
          const N = r.value.N ?? 0
          return [
            `B = ${B.toExponential(4)} T`,
            `N = ${N} لفة`,
            `I = ${I.toFixed(2)} A`,
            `R = ${mu0.toExponential(4)} × ${N} × ${I.toFixed(2)} / (2 × ${B.toExponential(4)})`,
          ]
        },
        result: () => {
          const mu0 = 4 * Math.PI * 1e-7
          const B = r.value.B ?? 0
          const I = r.value.I ?? 0
          const N = r.value.N ?? 0
          const R = (mu0 * N * I) / (2 * B)
          return `R = ${R.toFixed(4)} m`
        },
      },
    ],
  },
}

const config = computed(() => configs[props.sourceExperiment] ?? null)
</script>

<template>
  <div class="panel-body" v-if="config">
    <div class="ws-title">{{ config.title }}</div>
    <div v-for="step in config.steps" :key="step.key" class="step-row">
      <button class="step-toggle" @click="toggleStep(step.key)">
        {{ showSteps[step.key] ? '▼' : '▶' }} {{ step.label }}
      </button>
      <div v-if="showSteps[step.key]" class="step-content">
        <div class="formula">{{ step.formula }}</div>
        <div class="calc">
          <div v-for="(line, i) in step.lines()" :key="i">{{ line }}</div>
          <div class="result">{{ step.result() }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="panel-body">
    <div class="ws-title">📐 ورشة الحسابات</div>
    <div class="step-content">لا توجد حسابات متاحة لهذه التجربة.</div>
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
