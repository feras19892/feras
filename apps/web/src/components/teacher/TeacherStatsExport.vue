<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'

const emit = defineEmits<{
  (e: 'exportCsv'): void
  (e: 'exportFull'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="export-bar">
    <button class="btn-export" @click="emit('exportCsv')">{{ t('teacher.exportSummary') }}</button>
    <button class="btn-export" @click="emit('exportFull')">{{ t('teacher.exportAll') }}</button>
  </div>
</template>

<style scoped>
.export-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
.btn-export { padding: 0.55rem 1rem; border: none; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; }
.btn-export:hover { opacity: 0.9; }
</style>
