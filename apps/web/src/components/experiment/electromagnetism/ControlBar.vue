<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{

  launchLabel: string
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-pause'): void
  (e: 'reset'): void
  (e: 'record-trial'): void
  (e: 'clear-trials'): void
  (e: 'export-csv'): void
  (e: 'analyze'): void
}>()
</script>

<template>
  <div class="control-bar">
    <button class="ctrl-btn launch" @click="emit('toggle-pause')">{{ launchLabel }}</button>
    <button class="ctrl-btn" @click="emit('reset')">🔄 {{ t('experiments.emReset') }}</button>
    <button class="ctrl-btn record" @click="emit('record-trial')">📌 {{ t('experiments.emRecordTrial') }}</button>
    <button class="ctrl-btn" @click="emit('clear-trials')">{{ t('experiments.emClear') }}</button>
    <button class="ctrl-btn" @click="emit('export-csv')">{{ t('experiments.emCsv') }}</button>
    <button class="ctrl-btn analyze" @click="emit('analyze')">{{ t('experiments.emAnalyze') }}</button>
  </div>
</template>

<style scoped>
.control-bar { display: flex; gap: .4rem; padding: .5rem .75rem; background: rgba(30,37,48,.6); border-radius: 8px; flex-shrink: 0; flex-wrap: wrap; }
.ctrl-btn { padding: .4rem .8rem; border: 1px solid #2D3645; background: rgba(45,54,69,.4); color: #B8C0CC; border-radius: 6px; cursor: pointer; font-size: .75rem; font-weight: 600; transition: all .15s; }
.ctrl-btn:hover { background: rgba(91,141,184,.15); color: #D1D7E0; border-color: rgba(91,141,184,.25); }
.ctrl-btn.launch { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: none; }
.ctrl-btn.launch:hover { opacity: .9; }
.ctrl-btn.record { background: rgba(245,158,11,.12); border-color: rgba(245,158,11,.2); color: #f59e0b; }
.ctrl-btn.analyze { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.2); color: #22c55e; font-weight: 700; }
</style>