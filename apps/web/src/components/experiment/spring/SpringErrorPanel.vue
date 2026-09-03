<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed, ref } from 'vue'

const props = defineProps<{
  kStatic: number | null
  kDynamic: number | null
  kDynamicEff: number | null
  theoreticalK: number
  measuredT: number | null
  mass: number
  springMass: number
}>()

const deltaY = ref(0.0005) // m (±0.5 mm)
const deltaM = ref(0.0001) // kg (±0.1 g)
const deltaT = ref(0.01)   // s (±0.01 s)

const mEff = computed(() => props.springMass / 3)
const mTotal = computed(() => props.mass + mEff.value)

// Error in static k: σ_k/k = sqrt((σ_F/F)^2 + (σ_x/x)^2)
const staticError = computed(() => {
  if (!props.kStatic || !props.kStatic) return null
  const sigmaF_over_F = deltaM.value / props.mass
  const sigmaX_over_X = deltaY.value / 0.05 // assume typical 5cm extension
  const relError = Math.sqrt(sigmaF_over_F ** 2 + sigmaX_over_X ** 2)
  const absError = relError * props.kStatic
  return { rel: relError * 100, abs: absError }
})

// Error in dynamic k: from T measurement
const dynamicError = computed(() => {
  if (!props.kDynamic || !props.measuredT) return null
  // k ∝ 1/T² => σ_k/k = 2 * σ_T/T
  const relError = 2 * (deltaT.value / props.measuredT)
  const absError = relError * props.kDynamic
  return { rel: relError * 100, abs: absError }
})

// Compare static vs dynamic
const comparison = computed(() => {
  if (!props.kStatic || !props.kDynamic) return null
  const diff = Math.abs(props.kStatic - props.kDynamic)
  const avg = (props.kStatic + props.kDynamic) / 2
  const percentDiff = (diff / avg) * 100
  return { diff, percentDiff }
})
</script>

<template>
  <div class="error-panel">
    <h5>🔬 {{ t('experiments.errorAnalysis') }}</h5>

    <div class="input-row">
      <label>Δy ({{ t('experiments.rulerPrecision') }})</label>
      <input type="number" step="0.0001" v-model.number="deltaY" /> m
    </div>
    <div class="input-row">
      <label>Δm ({{ t('experiments.massPrecision') }})</label>
      <input type="number" step="0.0001" v-model.number="deltaM" /> kg
    </div>
    <div class="input-row">
      <label>ΔT ({{ t('experiments.timePrecision') }})</label>
      <input type="number" step="0.001" v-model.number="deltaT" /> s
    </div>

    <div class="section" v-if="staticError">
      <div class="sec-title">📐 {{ t('experiments.staticError') }}</div>
      <div>σₖ / k = {{ staticError.rel.toFixed(2) }}%</div>
      <div>σₖ = ±{{ staticError.abs.toFixed(2) }} N/m</div>
    </div>

    <div class="section" v-if="dynamicError">
      <div class="sec-title">📐 {{ t('experiments.dynamicError') }}</div>
      <div>σₖ / k = 2·(ΔT/T) = {{ dynamicError.rel.toFixed(2) }}%</div>
      <div>σₖ = ±{{ dynamicError.abs.toFixed(2) }} N/m</div>
    </div>

    <div class="section" v-if="comparison">
      <div class="sec-title">⚖️ {{ t('experiments.comparisonStaticDynamic') }}</div>
      <div>k_static = {{ props.kStatic?.toFixed(2) }} N/m</div>
      <div>k_dynamic = {{ props.kDynamic?.toFixed(2) }} N/m</div>
      <div>k_dynamic(eff) = {{ props.kDynamicEff?.toFixed(2) }} N/m</div>
      <div>k_theoretical = {{ props.theoreticalK.toFixed(2) }} N/m</div>
      <div>{{ t('experiments.relativeDifference') }} = {{ comparison.percentDiff.toFixed(2) }}%</div>
    </div>

    <div class="section">
      <div class="sec-title">📊 {{ t('experiments.effectiveSpringMass') }}</div>
      <div>m_spring = {{ props.springMass.toFixed(3) }} kg</div>
      <div>m_eff = m_spring / 3 = {{ mEff.toFixed(4) }} kg</div>
      <div>m_total = m + m_eff = {{ mTotal.toFixed(4) }} kg</div>
    </div>
  </div>
</template>

<style scoped>
.error-panel { display: flex; flex-direction: column; gap: .4rem; font-size: .78rem; }
h5 { margin: 0 0 .2rem; color: #D1D7E0; font-size: .82rem; }
.input-row { display: flex; align-items: center; gap: .4rem; color: #8B95A5; }
.input-row input { width: 70px; background: #161B22; border: 1px solid #2D3645; color: #D1D7E0; border-radius: 4px; padding: .2rem .3rem; font-size: .75rem; }
.section { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .4rem; }
.sec-title { font-weight: 700; color: #5B8DB8; margin-bottom: .15rem; }
</style>
