<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const props = defineProps<{

  running: boolean; paused: boolean
}>()
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
.status-bar { display:flex; align-items:center; justify-content:center; gap:.4rem; padding:.35rem; border-radius:6px; font-size:.72rem; font-weight:700; margin:.2rem 0; flex-shrink:0; }
.status-bar.ready { background:rgba(91,141,184,.12); color:#5B8DB8; border:1px solid rgba(91,141,184,.2); }
.status-bar.paused { background:rgba(196,162,101,.12); color:#c4a265; border:1px solid rgba(196,162,101,.2); }
.status-bar.running { background:rgba(122,158,126,.12); color:#7a9e7e; border:1px solid rgba(122,158,126,.2); }
.status-dot { width:8px; height:8px; border-radius:50%; background:currentColor; animation:dotPulse 2s ease-in-out infinite; }
@keyframes dotPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
</style>