<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
defineProps<{

  I: number
  N: number
  a: number
  b: number
  bField: number
  theta: number
  areaVal: number
  mu: number
  tau: number
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
      <div class="reading-box field">
        <span class="r-label">B</span>
        <span class="r-value">{{ bField.toFixed(3) }}</span>
        <span class="r-unit">T</span>
      </div>
    </div>

    <div class="force-grid">
      <div class="force-box area">
        <span class="f-label">{{ t('experiments.tcReadingsA') }}</span>
        <span class="f-value">{{ areaVal.toExponential(2) }}</span>
        <span class="f-unit">m²</span>
      </div>
      <div class="force-box moment">
        <span class="f-label">{{ t('experiments.tcReadingsMu') }}</span>
        <span class="f-value">{{ mu.toExponential(2) }}</span>
        <span class="f-unit">A·m²</span>
      </div>
      <div class="force-box angle">
        <span class="f-label">{{ t('experiments.tcReadingsTheta') }}</span>
        <span class="f-value">{{ theta.toFixed(0) }}</span>
        <span class="f-unit">°</span>
      </div>
      <div class="force-box torque">
        <span class="f-label">{{ t('experiments.tcReadingsTau') }}</span>
        <span class="f-value">{{ tau.toExponential(2) }}</span>
        <span class="f-unit">N·m</span>
      </div>
    </div>

    <div v-if="hasProbe" class="probe-indicator">{{ t('experiments.tcProbeAngle') }}</div>
    <div v-else class="probe-indicator idle">{{ t('experiments.tcProbeIdle') }}</div>
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
.reading-box.current { background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); }
.reading-box.turns { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.reading-box.field { background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); }
.force-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .4rem; margin-top: .3rem; }
.force-box { border-radius: 6px; padding: .35rem; text-align: center; display: flex; flex-direction: column; }
.force-box.area { background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.15); }
.force-box.moment { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.15); }
.force-box.angle { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.force-box.torque { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.15); }
.f-label { font-size: .6rem; color: #94a3b8; }
.f-value { font-size: .8rem; font-weight: 700; font-family: 'Courier New', monospace; }
.force-box.area .f-value { color: #22c55e; }
.force-box.moment .f-value { color: #f59e0b; }
.force-box.angle .f-value { color: #a855f7; }
.force-box.torque .f-value { color: #ef4444; }
.f-unit { font-size: .6rem; color: #64748b; }
.probe-indicator { font-size: .7rem; color: #a855f7; text-align: center; padding: .3rem; background: rgba(168,85,247,.08); border-radius: 6px; }
.probe-indicator.idle { color: #64748b; background: rgba(100,116,139,.08); }
</style>