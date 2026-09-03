<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const props = defineProps<{ running: boolean; paused: boolean; collided: boolean }>()

</script>

<template>
  <div class="status-bar">
    <span v-if="!running" class="badge idle">🛑 {{ t('experiments.ready') }}</span>
    <span v-else-if="paused" class="badge paused">⏸️ {{ t('experiments.pauseBtn') }}</span>
    <span v-else-if="collided" class="badge done">✅ {{ t('experiments.collisionCompleted') }}</span>
    <span v-else class="badge running">▶️ {{ t('experiments.statusRunning') }}</span>
  </div>
</template>

<style scoped>
.status-bar { display: flex; gap: .3rem; padding: .3rem .5rem; font-size: .65rem; flex-shrink: 0; }
.badge { padding: .15rem .4rem; border-radius: 4px; border: 1px solid; }
.idle { border-color: #64748b; color: #94a3b8; background: rgba(100,116,139,.08); }
.paused { border-color: #f59e0b; color: #fbbf24; background: rgba(245,158,11,.08); }
.running { border-color: #06b6d4; color: #67e8f9; background: rgba(6,182,212,.08); }
.done { border-color: #22c55e; color: #4ade80; background: rgba(34,197,94,.08); }
</style>