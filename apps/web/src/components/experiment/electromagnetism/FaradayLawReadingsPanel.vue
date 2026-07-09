<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

defineProps<{
  B: number
  N: number
  A: number
  v: number
  R: number
  emfMax: number
  iMax: number
  fluxMax: number
  direction: string
  running: boolean
  hasProbe?: boolean
  mode: 'faraday' | 'lenz'
}>()
</script>

<template>
  <div class="readings-panel">
    <div class="readings-title">{{ t('experiments.emLiveReadings') }}</div>
    <div class="readings-grid">
      <div class="reading-box field">
        <span class="r-label">B</span>
        <span class="r-value">{{ B.toFixed(2) }}</span>
        <span class="r-unit">T</span>
      </div>
      <div class="reading-box turns">
        <span class="r-label">N</span>
        <span class="r-value">{{ N }}</span>
        <span class="r-unit">{{ t('experiments.genTurns') }}</span>
      </div>
      <div class="reading-box velocity">
        <span class="r-label">v</span>
        <span class="r-value">{{ v.toFixed(1) }}</span>
        <span class="r-unit">m/s</span>
      </div>
    </div>

    <div class="force-grid">
      <div class="force-box flux">
        <span class="f-label">{{ t('experiments.faradayReadingsFlux') }}</span>
        <span class="f-value">{{ fluxMax.toExponential(2) }}</span>
        <span class="f-unit">Wb</span>
      </div>
      <div class="force-box emf">
        <span class="f-label">{{ t('experiments.faradayReadingsEmf') }}</span>
        <span class="f-value">{{ emfMax.toExponential(2) }}</span>
        <span class="f-unit">V</span>
      </div>
      <div class="force-box current">
        <span class="f-label">{{ t('experiments.faradayReadingsI') }}</span>
        <span class="f-value">{{ iMax.toExponential(2) }}</span>
        <span class="f-unit">A</span>
      </div>
      <div class="force-box resistance">
        <span class="f-label">R (Ω)</span>
        <span class="f-value">{{ R.toFixed(0) }}</span>
        <span class="f-unit">Ω</span>
      </div>
    </div>

    <div v-if="mode === 'lenz'" class="direction-box" :class="direction">
      <span class="dir-icon">{{ direction === 'opposing' ? '⛔' : '✅' }}</span>
      <span class="dir-text">{{ direction === 'opposing' ? t('experiments.dirOpposing') : t('experiments.dirAssisting') }}</span>
    </div>

    <div v-if="hasProbe" class="probe-indicator">📐 {{ t('experiments.faradayProbeEmf') }}</div>
    <div v-else class="probe-indicator idle">{{ t('experiments.emProbeIdle') }}</div>
  </div>
</template>

<style scoped>
.readings-panel { padding: .75rem; display: flex; flex-direction: column; gap: .5rem; }
.readings-title { font-size: .85rem; font-weight: 700; color: #67e8f9; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.readings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .4rem; }
.reading-box { background: rgba(45,54,69,.4); border-radius: 6px; padding: .35rem; text-align: center; display: flex; flex-direction: column; }
.r-label { font-size: .65rem; color: #94a3b8; }
.r-value { font-size: .8rem; font-weight: 700; color: #D1D7E0; font-family: 'Courier New', monospace; }
.r-unit { font-size: .6rem; color: #64748b; }
.reading-box.field { background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); }
.reading-box.turns { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.reading-box.velocity { background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.15); }
.force-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .4rem; margin-top: .3rem; }
.force-box { border-radius: 6px; padding: .35rem; text-align: center; display: flex; flex-direction: column; }
.force-box.flux { background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); }
.force-box.emf { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.15); }
.force-box.current { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.15); }
.force-box.resistance { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.f-label { font-size: .6rem; color: #94a3b8; }
.f-value { font-size: .8rem; font-weight: 700; font-family: 'Courier New', monospace; }
.force-box.flux .f-value { color: #3b82f6; }
.force-box.emf .f-value { color: #ef4444; }
.force-box.current .f-value { color: #f59e0b; }
.force-box.resistance .f-value { color: #a855f7; }
.f-unit { font-size: .6rem; color: #64748b; }
.probe-indicator { font-size: .7rem; color: #a855f7; text-align: center; padding: .3rem; background: rgba(168,85,247,.08); border-radius: 6px; }
.probe-indicator.idle { color: #64748b; background: rgba(100,116,139,.08); }
.direction-box { display: flex; align-items: center; gap: .4rem; padding: .35rem; border-radius: 6px; font-size: .75rem; font-weight: 700; }
.direction-box.opposing { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.2); }
.direction-box.assisting { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
.dir-icon { font-size: 1rem; }
</style>
