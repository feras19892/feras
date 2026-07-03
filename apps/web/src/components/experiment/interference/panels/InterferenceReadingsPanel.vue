<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import { wavelengthToColor } from '../../../../composables/interference/useInterferenceCalculations'

const { t } = useI18n()

interface Props {
  slitDistance: number
  screenDistance: number
  wavelength: number
  slitWidth: number
  fringeSpacing: number
  angularSeparation: number
}
defineProps<Props>()
</script>

<template>
  <div class="panel-body">
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">d — {{ t('experiments.slitDistance') }}</span>
        <span class="reading-val cyan">{{ slitDistance.toFixed(2) }} mm</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">D — {{ t('experiments.screenDistance') }}</span>
        <span class="reading-val cyan">{{ screenDistance.toFixed(2) }} m</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">a — {{ t('experiments.slitWidth') }}</span>
        <span class="reading-val muted">{{ slitWidth.toFixed(3) }} μm</span>
      </div>
    </div>
    <div class="reading-row highlight-row">
      <span class="reading-label bold">Δy — {{ t('experiments.fringeSpacing') }}</span>
      <span class="reading-val green bold">{{ fringeSpacing.toFixed(3) }} mm</span>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">Central fringe (m=0)</span>
        <span class="reading-val green">Max intensity</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">Dark fringes</span>
        <span class="reading-val">Between bright fringes</span>
      </div>
    </div>
    <div class="reading-group">
      <div class="reading-row">
        <span class="reading-label">λ — {{ t('experiments.wavelength') }}</span>
        <span class="reading-val bold" :style="{ color: wavelengthToColor(wavelength) }">{{ wavelength }} nm</span>
      </div>
      <div class="reading-row">
        <span class="reading-label">θ — {{ t('experiments.angularSeparation') }}</span>
        <span class="reading-val amber">{{ angularSeparation.toFixed(4) }}°</span>
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
.muted { color: #94a3b8; }
</style>
