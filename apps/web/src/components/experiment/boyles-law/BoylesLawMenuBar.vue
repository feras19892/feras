<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{

  title: string
  icon?: string
}>()

const emit = defineEmits<{
  (e: 'showAllPanels'): void
  (e: 'toggleHelp'): void
  (e: 'analyzeResults'): void
}>()
</script>

<template>
  <nav class="menu-bar">
    <div class="menu-left">
      <button class="menu-btn restore-btn" @click="emit('showAllPanels')">&#x1F504; {{ t('experiments.menuRestoreUi') }}</button>
    </div>
    <div class="menu-center">{{ icon || '💨' }} {{ title }}</div>
    <div class="menu-right">
      <button class="menu-btn analyze-btn" @click="emit('analyzeResults')">{{ t('experiments.menuAnalyzeSection') }}</button>
      <button class="menu-btn" @click="emit('toggleHelp')">&#x2753; {{ t('experiments.menuHelp') }}</button>
    </div>
  </nav>
</template>

<style scoped>
.menu-bar { display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem; background:linear-gradient(180deg,#1E2530,#161B22); border-bottom:1px solid #2D3645; flex-shrink:0; user-select:none; height:48px; }
.menu-left,.menu-right { display:flex; align-items:center; gap:.5rem; height:100%; }
.menu-center { font-size:1.05rem; font-weight:800; color:#5B8DB8; white-space:nowrap; pointer-events:none; padding:0 2rem; letter-spacing:.5px; }
.menu-btn { padding:0 .8rem; height:100%; border:none; background:transparent; color:#8B95A5; cursor:pointer; font-size:.78rem; font-weight:600; transition:all .15s; border-bottom:2px solid transparent; }
.menu-btn:hover { color:#D1D7E0; background:rgba(139,148,158,.06); }
.restore-btn { color:#5B8DB8 !important; font-weight:700; }
.restore-btn:hover { background:rgba(91,141,184,.12) !important; }
.analyze-btn { color:#4ade80 !important; font-weight:700; }
.analyze-btn:hover { background:rgba(34,197,94,.12) !important; }
</style>