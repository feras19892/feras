<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ running: boolean; paused: boolean }>()
</script>

<template>
  <div class="status-bar" :class="{ready:!running&&!paused, paused:running&&paused, running:running&&!paused}">
    <span class="status-dot" />
    <span v-if="!running&&!paused">{{ t('experiments.ready') }}</span>
    <span v-else-if="running&&paused">{{ t('experiments.paused') }}</span>
    <span v-else>{{ t('experiments.running') }}</span>
  </div>
</template>

<style scoped>
.status-bar { display:flex; align-items:center; justify-content:center; gap:.4rem; padding:.4rem .6rem; border-radius:8px; font-size:.75rem; font-weight:800; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,.1); }
.status-bar.ready { background:rgba(96,165,250,.12); color:#60a5fa; border:1px solid rgba(96,165,250,.2); }
.status-bar.paused { background:rgba(234,179,8,.12); color:#eab308; border:1px solid rgba(234,179,8,.2); }
.status-bar.running { background:rgba(52,211,153,.12); color:#34d399; border:1px solid rgba(52,211,153,.2); }
.status-dot { width:8px; height:8px; border-radius:50%; background:currentColor; animation:dotPulse 2s ease-in-out infinite; }
@keyframes dotPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
</style>
