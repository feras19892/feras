<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{ running: boolean; paused: boolean; settled: boolean }>()

</script>

<template>
  <div class="status-bar">
    <span class="dot" :class="{ active: running && !paused, paused: paused }" />
    <span v-if="running && !paused">▶️ {{ t('experiments.running') }}</span>
    <span v-else-if="paused">⏸️ {{ t('experiments.paused') }}</span>
    <span v-else>⏹️ {{ t('experiments.stopped') }}</span>
    <span v-if="settled" class="settled">✅ استقر</span>
  </div>
</template>

<style scoped>
.status-bar { display: flex; align-items: center; gap: .5rem; padding: .3rem .8rem; background: #161B22; border-radius: 6px; font-size: .75rem; color: #8b9bb5; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #4a4a4a; }
.dot.active { background: #2ecc71; box-shadow: 0 0 6px #2ecc71; }
.dot.paused { background: #f39c12; }
.settled { color: #2ecc71; }
</style>