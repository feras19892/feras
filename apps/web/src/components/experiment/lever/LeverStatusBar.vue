<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()
const props = defineProps<{
  mode: 'vector' | 'beam'
  forceCount: number
  sumFx: number
  sumFy: number
  resultantMag: number
  isBalanced: boolean
  massCount?: number
  netTorque?: number
  tiltDeg?: number
}>()
</script>
<template>
  <div class="status-bar">
    <template v-if="mode === 'vector'">
      <span class="status-item">{{ t('experiments.forces') }}: <b>{{ forceCount }}</b></span>
      <span class="status-item">∑Fx: <b>{{ sumFx.toFixed(2) }}</b> N</span>
      <span class="status-item">∑Fy: <b>{{ sumFy.toFixed(2) }}</b> N</span>
      <span class="status-item">|R|: <b>{{ resultantMag.toFixed(2) }}</b> N</span>
    </template>
    <template v-else>
      <span class="status-item">{{ t('experiments.masses') }}: <b>{{ massCount }}</b></span>
      <span class="status-item">τ: <b>{{ (netTorque ?? 0).toFixed(2) }}</b> N·m</span>
      <span class="status-item">θ: <b>{{ (tiltDeg ?? 0).toFixed(1) }}</b>°</span>
    </template>
    <span class="status-item" :class="{ balanced: isBalanced || Math.abs(netTorque ?? 1) < 0.01 }">{{ (isBalanced || Math.abs(netTorque ?? 1) < 0.01) ? '✅ ' + t('experiments.balanced') : '❌ ' + t('experiments.unbalanced') }}</span>
  </div>
</template>
<style scoped>
.status-bar { display:flex; justify-content:center; gap:1.5rem; padding:.3rem .6rem; background:#161B22; border-top:1px solid #2D3645; font-size:.72rem; color:#8B95A5; flex-shrink:0; }
.status-item b { color:#5B8DB8; }
.status-item.balanced { color:#22c55e; }
</style>
