<script setup lang="ts">
import { usePrismMinDeviation } from '../../../../composables/prism/usePrismMinDeviation'
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  prismAngle: number
  angleIncidence: number
  angleRefraction1: number | null
  deviation: number | null
  nValue: number
  wavelength: number
  material: string
}

const props = defineProps<Props>()

const minDev = usePrismMinDeviation(props.prismAngle, props.wavelength, props.material)
</script>

<template>
  <div class="panel-body">
    <div class="law-box">
      <div class="law-title">{{ t('prism.lawSnell') }}</div>
      <div class="law-formula">n₁ sin θ₁ = n₂ sin θ₂</div>
      <div class="law-calc">
        1.0 × sin({{ angleIncidence.toFixed(1) }}°) = n × sin({{ angleRefraction1 !== null ? angleRefraction1.toFixed(1) : '—' }}°)
      </div>
    </div>
    <div class="law-box">
      <div class="law-title">{{ t('prism.lawPrism') }}</div>
      <div class="law-formula">n = sin((A+D)/2) / sin(A/2)</div>
      <div class="law-calc" v-if="deviation !== null">
        n = sin(({{ prismAngle }}+{{ deviation.toFixed(1) }})/2) / sin({{ prismAngle }}/2) = {{ nValue.toFixed(3) }}
      </div>
    </div>
    <div class="law-box">
      <div class="law-title">{{ t('prism.lawMinDeviation') }}</div>
      <div class="law-formula">n = sin((A+δ_min)/2) / sin(A/2)</div>
      <div v-if="minDev.minDelta.value !== null" class="law-calc">
        δ_min = {{ minDev.minDelta.value.toFixed(1) }}° @ θᵢ = {{ minDev.minTheta.value }}°<br>
        n(δ_min) = {{ minDev.nFromMinDeviation.value?.toFixed(3) }}
      </div>
      <div v-else class="law-calc">—</div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.law-box { background: rgba(255,255,255,0.02); border-radius: 6px; padding: .5rem; }
.law-title { font-size: .75rem; color: #8B95A5; margin-bottom: .2rem; }
.law-formula { font-family: monospace; font-size: .9rem; color: #fbbf24; }
.law-calc { font-family: monospace; font-size: .75rem; color: #67e8f9; margin-top: .2rem; }
</style>
