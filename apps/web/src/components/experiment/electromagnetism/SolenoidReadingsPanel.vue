<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

defineProps<{
  I: number
  N: number
  L: number
  B: number
  running: boolean
  hasProbe?: boolean
}>()
</script>

<template>
  <div class="readings-panel">
    <div class="readings-title">{{ t('experiments.emLiveReadings') }}</div>
    <div class="readings-grid">
      <div class="reading-box current">
        <span class="r-label">I</span>
        <span class="r-value">{{ I.toFixed(1) }}</span>
        <span class="r-unit">A</span>
      </div>
      <div class="reading-box turns">
        <span class="r-label">N</span>
        <span class="r-value">{{ N }}</span>
        <span class="r-unit">{{ t('experiments.genTurns') }}</span>
      </div>
      <div class="reading-box distance">
        <span class="r-label">L</span>
        <span class="r-value">{{ (L * 100).toFixed(1) }}</span>
        <span class="r-unit">cm</span>
      </div>
      <div class="reading-box field">
        <span class="r-label">B</span>
        <span class="r-value">{{ (B * 1e6).toFixed(2) }}</span>
        <span class="r-unit">μT</span>
      </div>
      <div class="reading-box field-exp">
        <span class="r-label">{{ t('experiments.emReadingsBExp') }}</span>
        <span class="r-value">{{ B.toExponential(2) }}</span>
        <span class="r-unit">T</span>
      </div>
    </div>
    <div v-if="hasProbe" class="probe-indicator">{{ t('experiments.emProbeHall') }}</div>
    <div v-else class="probe-indicator idle">{{ t('experiments.emProbeIdleR') }}</div>
  </div>
</template>

<style scoped>
.readings-panel { padding: .75rem; display: flex; flex-direction: column; gap: .5rem; }
.readings-title { font-size: .85rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.readings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .5rem; }
.reading-box { display: flex; flex-direction: column; align-items: center; padding: .5rem; background: rgba(255,255,255,.03); border-radius: 6px; border: 1px solid rgba(255,255,255,.06); }
.reading-box.current { border-color: rgba(245,158,11,.2); }
.reading-box.turns { border-color: rgba(168,85,247,.2); }
.reading-box.distance { border-color: rgba(59,130,246,.2); }
.reading-box.field { border-color: rgba(34,197,94,.2); }
.reading-box.field-exp { border-color: rgba(34,197,94,.2); grid-column: span 2; }
.r-label { font-size: .7rem; color: #64748b; margin-bottom: .15rem; }
.r-value { font-size: 1.1rem; font-weight: 700; color: #D1D7E0; font-family: 'Courier New', monospace; }
.reading-box.current .r-value { color: #f59e0b; }
.reading-box.turns .r-value { color: #a855f7; }
.reading-box.distance .r-value { color: #3b82f6; }
.reading-box.field .r-value { color: #22c55e; }
.reading-box.field-exp .r-value { color: #22c55e; font-size: .9rem; }
.r-unit { font-size: .65rem; color: #475569; margin-top: .1rem; }
.probe-indicator { font-size: .7rem; color: #a855f7; text-align: center; padding: .3rem; background: rgba(168,85,247,.08); border-radius: 4px; border: 1px solid rgba(168,85,247,.15); }
.probe-indicator.idle { color: #64748b; background: rgba(100,116,139,.06); border-color: rgba(100,116,139,.1); }
</style>
