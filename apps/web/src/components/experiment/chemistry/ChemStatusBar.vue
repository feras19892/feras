<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

defineProps<{
  running: boolean
  paused: boolean
  step: number
  instruction: string
}>()
</script>

<template>
  <div class="chem-status" :class="{ active: running && !paused, paused: paused }">
    <span v-if="!running">&#x1F4A1; {{ t('experiments.chemStatusReady') }} — {{ instruction }}</span>
    <span v-else-if="paused">&#x23F8; {{ t('experiments.chemStatusPaused') }} — {{ t('experiments.chemStep') }} {{ step }}</span>
    <span v-else>&#x2705; {{ t('experiments.chemStatusRunning') }} — {{ t('experiments.chemStep') }} {{ step }}: {{ instruction }}</span>
  </div>
</template>

<style scoped>
.chem-status { background: #252D3A; border: 1px solid #2D3645; border-radius: 6px; padding: .35rem .7rem; font-size: .75rem; color: #8B95A5; text-align: center; flex-shrink: 0; }
.chem-status.active { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,.08); }
.chem-status.paused { border-color: #5B8DB8; color: #5B8DB8; background: rgba(91,141,184,.08); }
</style>
