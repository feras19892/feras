<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const props = defineProps<{ running: boolean; paused: boolean }>()

</script>

<template>
  <div class="status-bar">
    <span v-if="!running" class="dot idle"></span>
    <span v-else-if="paused" class="dot paused"></span>
    <span v-else class="dot active"></span>
    <span class="status-text">{{ !running ? t('experiments.ready') : paused ? t('experiments.paused') : t('experiments.running') }}</span>
  </div>
</template>

<style scoped>
.status-bar { display: flex; align-items: center; gap: .4rem; font-size: .72rem; color: #94a3b8; padding: .15rem .4rem; background: #0f172a; border-radius: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.idle { background: #64748b; }
.dot.paused { background: #fbbf24; }
.dot.active { background: #34d399; box-shadow: 0 0 4px #34d399; }
</style>