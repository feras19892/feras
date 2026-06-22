<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

defineProps<{ launchLabel: string }>()

const emit = defineEmits<{
  (e: 'togglePause'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="chem-control-bar">
    <button class="btn-primary" @click="emit('togglePause')">{{ launchLabel }}</button>
    <button class="btn-secondary" @click="emit('reset')">&#x1F504; {{ t('experiments.resetBtn') }}</button>
  </div>
</template>

<style scoped>
.chem-control-bar { display: flex; gap: .5rem; padding: .5rem 1rem; background: #1e293b; border-top: 1px solid #334155; }
.btn-primary { padding: .4rem .8rem; border: none; border-radius: .4rem; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; font-weight: 600; cursor: pointer; font-size: .85rem; }
.btn-secondary { padding: .4rem .8rem; border: 1px solid rgba(255,255,255,0.15); border-radius: .4rem; background: rgba(255,255,255,0.06); color: #e2e8f0; cursor: pointer; font-size: .85rem; }
</style>
