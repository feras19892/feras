<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()

defineProps<{
  V: number
  I: number
  N: number
  B: number
  vVal: number
  Fm: number
  r: number
  emComputed: number
  running: boolean
  hasProbe?: boolean
}>()
</script>

<template>
  <div class="readings-panel">
    <div class="readings-title">{{ t('experiments.emLiveReadings') }}</div>
    <div class="readings-grid">
      <div class="reading-box voltage">
        <span class="r-label">V</span>
        <span class="r-value">{{ V.toFixed(0) }}</span>
        <span class="r-unit">V</span>
      </div>
      <div class="reading-box current">
        <span class="r-label">I</span>
        <span class="r-value">{{ I.toFixed(2) }}</span>
        <span class="r-unit">A</span>
      </div>
      <div class="reading-box turns">
        <span class="r-label">N</span>
        <span class="r-value">{{ N }}</span>
        <span class="r-unit">{{ t('experiments.genTurns') }}</span>
      </div>
    </div>

    <div class="force-grid">
      <div class="force-box field">
        <span class="f-label">{{ t('experiments.lfReadingsB') }}</span>
        <span class="f-value">{{ B.toExponential(2) }}</span>
        <span class="f-unit">T</span>
      </div>
      <div class="force-box velocity">
        <span class="f-label">{{ t('experiments.lfReadingsV') }}</span>
        <span class="f-value">{{ vVal.toExponential(2) }}</span>
        <span class="f-unit">m/s</span>
      </div>
      <div class="force-box magnetic">
        <span class="f-label">{{ t('experiments.lfReadingsFm') }}</span>
        <span class="f-value">{{ Fm.toExponential(2) }}</span>
        <span class="f-unit">N</span>
      </div>
      <div class="force-box radius">
        <span class="f-label">{{ t('experiments.lfReadingsR') }}</span>
        <span class="f-value">{{ isFinite(r) ? r.toExponential(2) : '∞' }}</span>
        <span class="f-unit">m</span>
      </div>
    </div>

    <div class="em-box">
      <div class="em-label">{{ t('experiments.lfEmComputed') }}</div>
      <div class="em-value">{{ emComputed > 0 ? emComputed.toExponential(3) : '—' }} <span class="em-unit">C/kg</span></div>
      <div class="em-known">{{ t('experiments.lfEmKnown') }}</div>
    </div>

    <div v-if="hasProbe" class="probe-indicator">{{ t('experiments.emProbeRuler') }}</div>
    <div v-else class="probe-indicator idle">{{ t('experiments.emProbeIdleRuler') }}</div>
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
.force-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .4rem; margin-top: .3rem; }
.force-box { border-radius: 6px; padding: .35rem; text-align: center; display: flex; flex-direction: column; }
.reading-box.voltage { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.15); }
.reading-box.current { background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); }
.reading-box.turns { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.force-box.field { background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); }
.force-box.velocity { background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.15); }
.force-box.magnetic { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.15); }
.force-box.radius { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.force-box.field .f-value { color: #3b82f6; }
.force-box.velocity .f-value { color: #22c55e; }
.force-box.magnetic .f-value { color: #ef4444; }
.force-box.radius .f-value { color: #a855f7; }
.f-label { font-size: .6rem; color: #94a3b8; }
.f-value { font-size: .8rem; font-weight: 700; font-family: 'Courier New', monospace; }
.em-box { margin-top: .3rem; padding: .5rem; background: rgba(34,197,94,.06); border-radius: 6px; border: 1px solid rgba(34,197,94,.15); text-align: center; }
.em-label { font-size: .65rem; color: #94a3b8; }
.em-value { font-size: .9rem; font-weight: 700; color: #22c55e; font-family: 'Courier New', monospace; margin-top: .2rem; }
.em-unit { font-size: .65rem; color: #64748b; }
.em-known { font-size: .6rem; color: #64748b; margin-top: .2rem; }
.f-unit { font-size: .6rem; color: #64748b; }
.probe-indicator { font-size: .7rem; color: #a855f7; text-align: center; padding: .3rem; background: rgba(168,85,247,.08); border-radius: 6px; }
.probe-indicator.idle { color: #64748b; background: rgba(100,116,139,.08); }
</style>
