<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { wavelengthToColor } from '../../../../composables/diffraction/useDiffractionCalculations'

interface Props {
  mode: 'single' | 'grating'
  slitWidth: number
  linesPerMm: number
  screenDistance: number
  wavelength: number
  centralWidth: number
  darkFringes: { m: number; yMm: number }[]
  firstOrderAngle: number
  firstOrderY: number
  maxOrder: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="reading-group">
      <div v-if="mode === 'single'" class="reading-row">
        <span class="reading-label">{{ t('experiments.dfSlitWidth') }}</span>
        <span class="reading-val cyan">{{ slitWidth.toFixed(2) }} mm</span>
      </div>
      <div v-else class="reading-row">
        <span class="reading-label">{{ t('experiments.dfLinesPerMm') }}</span>
        <span class="reading-val cyan">{{ linesPerMm }}</span>
      </div>
      <div v-if="mode === 'single'" class="reading-row">
        <span class="reading-label">1/a</span>
        <span class="reading-val amber">{{ (1 / slitWidth).toFixed(1) }} 1/mm</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">{{ t('experiments.dfScreenDistance') }}</span>
        <span class="reading-val cyan">{{ screenDistance.toFixed(2) }} m</span>
      </div>
    </div>
    <div v-if="mode === 'single'" class="reading-row highlight-row">
      <span class="reading-label bold">{{ t('experiments.dfCentralWidth') }}</span>
      <span class="reading-val green bold">{{ centralWidth.toFixed(3) }} mm</span>
    </div>
    <div v-else class="reading-row highlight-row">
      <span class="reading-label bold">{{ t('experiments.dfFirstOrderAngle') }}</span>
      <span class="reading-val green bold">{{ firstOrderAngle.toFixed(3) }}°</span>
    </div>
    <div class="reading-group">
      <div v-if="mode === 'single'" class="reading-row">
        <span class="reading-label">{{ t('experiments.dfCentralMax') }}</span>
        <span class="reading-val green">{{ t('experiments.dfMaxIntensity') }}</span>
      </div>
      <div v-else class="reading-row">
        <span class="reading-label">{{ t('experiments.dfFirstOrderPos') }}</span>
        <span class="reading-val green">{{ firstOrderY.toFixed(2) }} mm</span>
      </div>
      <div v-if="mode === 'single'" class="reading-row">
        <span class="reading-label">{{ t('experiments.dfFirstDarkFringe') }}</span>
        <span class="reading-val">{{ darkFringes.find(f => f.m === 1)?.yMm.toFixed(3) ?? '—' }} mm</span>
      </div>
      <div v-else class="reading-row">
        <span class="reading-label">{{ t('experiments.dfMaxOrder') }}</span>
        <span class="reading-val">m = {{ maxOrder }}</span>
      </div>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">{{ t('experiments.wavelength') }} λ</span>
        <span class="reading-val bold" :style="{ color: wavelengthToColor(wavelength) }">{{ wavelength }} nm</span>
      </div>
      <div v-if="mode === 'grating'" class="reading-row">
        <span class="reading-label">d = 1/N</span>
        <span class="reading-val amber">{{ (1/linesPerMm).toFixed(4) }} mm</span>
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
</style>
