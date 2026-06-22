<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  running: boolean
  paused: boolean
  arrived: boolean
}>()
</script>

<template>
  <div class="status-bar">
    <span v-if="running && !arrived">▶️ {{ t('experiments.sliding') }}</span>
    <span v-else-if="arrived">✅ {{ t('experiments.reachedBase') }}</span>
    <span v-else>⏸️ {{ t('experiments.readySetParams') }}</span>
  </div>
</template>

<style scoped>
.status-bar { font-size: .72rem; color: #8B95A5; text-align: center; padding: .25rem; }
</style>
