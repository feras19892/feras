<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import { wavelengthToColor } from '../../../../composables/prism/prism-drawing'

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
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">A</span>
        <span class="reading-val muted">{{ prismAngle.toFixed(0) }}°</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">θ₁ — {{ t('prism.incidentAngle') }}</span>
        <span class="reading-val cyan">{{ angleIncidence.toFixed(1) }}°</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">r₁ — {{ t('prism.refractionAngle') }}</span>
        <span class="reading-val green">{{ angleRefraction1 !== null ? angleRefraction1.toFixed(1) + '°' : '—' }}</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">r₂ — {{ t('prism.incidentFace2') }}</span>
        <span class="reading-val amber">{{ angleIncidence2 !== null ? angleIncidence2.toFixed(1) + '°' : '—' }}</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">θ₂ — {{ t('prism.emergenceAngle') }}</span>
        <span class="reading-val" :class="angleEmergence === null ? 'red' : 'orange'">
          {{ angleEmergence !== null ? angleEmergence.toFixed(1) + '°' : '⚠ TIR' }}
        </span>
      </div>
    </div>
    <div class="reading-row highlight-row">
      <span class="reading-label bold">δ — {{ t('prism.deviationAngle') }}</span>
      <span class="reading-val" :class="deviation !== null ? 'green bold' : 'red bold'">
        {{ deviation !== null ? deviation.toFixed(2) + '°' : 'TIR' }}
      </span>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">n — {{ t('prism.refractiveIndex') }}</span>
        <span class="reading-val amber">{{ nValue.toFixed(4) }}</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">λ — {{ t('prism.wavelength') }}</span>
        <span class="reading-val bold" :style="{ color: wavelengthToColor(wavelength) }">{{ wavelength }} nm</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">v — {{ t('prism.speedInMedium') }}</span>
        <span class="reading-val muted">{{ speedInMedium !== null ? (speedInMedium / 1e6).toFixed(3) + ' ×10⁶ m/s' : '—' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .35rem; font-size: .8rem; }
.reading-group { display: flex; flex-direction: column; gap: .28rem; padding: .3rem .35rem; background: rgba(255,255,255,0.025); border-radius: 5px; border: 1px solid rgba(45,54,69,0.5); }
.reading-row { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
.highlight-row { padding: .3rem .4rem; background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.2); border-radius: 5px; }
.reading-label { color: #64748b; font-size: .76rem; flex: 1; }
.reading-label.bold { color: #94a3b8; font-weight: 600; }
.reading-val { font-family: monospace; font-size: .8rem; font-weight: 600; flex-shrink: 0; }
.reading-val.bold { font-weight: 800; }
.cyan  { color: #67e8f9; }
.green { color: #4ade80; }
.amber { color: #fbbf24; }
.orange{ color: #fb923c; }
.red   { color: #f87171; }
.muted { color: #94a3b8; }
</style>
