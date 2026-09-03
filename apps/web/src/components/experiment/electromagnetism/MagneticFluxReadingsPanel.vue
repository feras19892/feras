<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
defineProps<{

  B: number
  A: number
  theta: number
  flux: number
  cosTheta: number
  angleDeg: number
  fluxMax: number
  running: boolean
  hasProbe?: boolean
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
      <div class="reading-box area">
        <span class="r-label">A</span>
        <span class="r-value">{{ (A * 10000).toFixed(0) }}</span>
        <span class="r-unit">cm²</span>
      </div>
      <div class="reading-box angle">
        <span class="r-label">θ</span>
        <span class="r-value">{{ angleDeg.toFixed(0) }}</span>
        <span class="r-unit">°</span>
      </div>
    </div>

    <div class="force-grid">
      <div class="force-box flux">
        <span class="f-label">{{ t('experiments.fluxReadingsFlux') }}</span>
        <span class="f-value">{{ flux.toExponential(3) }}</span>
        <span class="f-unit">Wb</span>
      </div>
      <div class="force-box cos">
        <span class="f-label">cos θ</span>
        <span class="f-value">{{ cosTheta.toFixed(3) }}</span>
        <span class="f-unit"></span>
      </div>
      <div class="force-box maxflux">
        <span class="f-label">{{ t('experiments.fluxReadingsFluxMax') }}</span>
        <span class="f-value">{{ fluxMax.toExponential(3) }}</span>
        <span class="f-unit">Wb</span>
      </div>
      <div class="force-box ratio">
        <span class="f-label">{{ t('experiments.fluxReadingsRatio') }}</span>
        <span class="f-value">{{ (flux / Math.max(fluxMax, 1e-12)).toFixed(3) }}</span>
        <span class="f-unit"></span>
      </div>
    </div>

    <div v-if="hasProbe" class="probe-indicator">📐 {{ t('experiments.fluxProbeMeasure') }}</div>
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
.reading-box.area { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.reading-box.angle { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.15); }
.force-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .4rem; margin-top: .3rem; }
.force-box { border-radius: 6px; padding: .35rem; text-align: center; display: flex; flex-direction: column; }
.force-box.flux { background: rgba(59,130,246,.08); border: 1px solid rgba(59,130,246,.15); }
.force-box.cos { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.15); }
.force-box.maxflux { background: rgba(34,197,94,.08); border: 1px solid rgba(34,197,94,.15); }
.force-box.ratio { background: rgba(168,85,247,.08); border: 1px solid rgba(168,85,247,.15); }
.f-label { font-size: .6rem; color: #94a3b8; }
.f-value { font-size: .8rem; font-weight: 700; font-family: 'Courier New', monospace; }
.force-box.flux .f-value { color: #3b82f6; }
.force-box.cos .f-value { color: #f59e0b; }
.force-box.maxflux .f-value { color: #22c55e; }
.force-box.ratio .f-value { color: #a855f7; }
.f-unit { font-size: .6rem; color: #64748b; }
.probe-indicator { font-size: .7rem; color: #a855f7; text-align: center; padding: .3rem; background: rgba(168,85,247,.08); border-radius: 6px; }
.probe-indicator.idle { color: #64748b; background: rgba(100,116,139,.08); }
</style>