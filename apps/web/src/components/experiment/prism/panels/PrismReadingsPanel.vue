<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  prismAngle: number
  angleIncidence: number
  angleRefraction1: number | null
  angleIncidence2: number | null
  angleEmergence: number | null
  deviation: number | null
  nValue: number
  wavelength: number
  speedInMedium: number | null
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="reading-row"><span class="reading-label">{{ t('prism.prismAngle') }}</span><span class="reading-val">{{ prismAngle.toFixed(0) }}°</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.incidentAngle') }}</span><span class="reading-val">{{ angleIncidence.toFixed(1) }}°</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.refractionAngle') }}</span><span class="reading-val">{{ angleRefraction1 !== null ? angleRefraction1.toFixed(1) + '°' : '—' }}</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.incidentFace2') }}</span><span class="reading-val">{{ angleIncidence2 !== null ? angleIncidence2.toFixed(1) + '°' : '—' }}</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.emergenceAngle') }}</span><span class="reading-val">{{ angleEmergence !== null ? angleEmergence.toFixed(1) + '°' : 'TIR' }}</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.deviationAngle') }}</span><span class="reading-val">{{ deviation !== null ? deviation.toFixed(1) + '°' : '—' }}</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.refractiveIndex') }}</span><span class="reading-val">{{ nValue.toFixed(3) }}</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.wavelength') }}</span><span class="reading-val">{{ wavelength }} nm</span></div>
    <div class="reading-row"><span class="reading-label">{{ t('prism.speedInMedium') }}</span><span class="reading-val">{{ speedInMedium !== null ? (speedInMedium / 1e6).toFixed(2) + '×10⁶ m/s' : '—' }}</span></div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.reading-row { display: flex; justify-content: space-between; align-items: center; }
.reading-label { color: #8B95A5; }
.reading-val { font-family: monospace; color: #fbbf24; font-weight: 700; }
</style>
