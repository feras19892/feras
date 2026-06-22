<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  title: string
  icon: string
  experimentRoute: string
  experimentName: string
}>()

const emit = defineEmits<{
  (e: 'togglePanel', id: string): void
  (e: 'showAllPanels'): void
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'toggleHelp'): void
}>()

const panelIds = ['inventory', 'tools', 'readings', 'instructions', 'report']
const panelLabels: Record<string, string> = {
  inventory: t('experiments.chemInventory'),
  tools: t('experiments.chemTools'),
  readings: t('experiments.chemReadings'),
  instructions: t('experiments.chemInstructions'),
  report: t('experiments.chemReport'),
}
</script>

<template>
  <nav class="chem-toolbar">
    <div class="left">
      <span class="icon">{{ icon }}</span>
      <span class="title">{{ title }}</span>
      <span class="route">{{ experimentName }}</span>
    </div>
    <div class="center">
      <button v-for="id in panelIds" :key="id" class="tb-btn" @click="emit('togglePanel', id)">
        {{ panelLabels[id] }}
      </button>
      <button class="tb-btn" @click="emit('showAllPanels')">&#x25A0; {{ t('experiments.showAll') ?? 'Show All' }}</button>
    </div>
    <div class="right">
      <button class="tb-btn" @click="emit('togglePause')">&#x23F8;</button>
      <button class="tb-btn" @click="emit('reset')">&#x1F504;</button>
      <button class="tb-btn" @click="emit('toggleHelp')">&#x3F;</button>
    </div>
  </nav>
</template>

<style scoped>
.chem-toolbar { display: flex; align-items: center; justify-content: space-between; padding: .5rem 1rem; background: #1e293b; border-bottom: 1px solid #334155; gap: .5rem; }
.left { display: flex; align-items: center; gap: .5rem; }
.icon { font-size: 1.2rem; }
.title { font-weight: 700; color: #67e8f9; font-size: .9rem; }
.route { color: #64748b; font-size: .75rem; }
.center { display: flex; gap: .25rem; flex: 1; justify-content: center; }
.right { display: flex; gap: .25rem; }
.tb-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: .4rem; padding: .3rem .6rem; cursor: pointer; font-size: .75rem; transition: all .13s; }
.tb-btn:hover { background: rgba(255,255,255,0.1); color: #67e8f9; border-color: rgba(103,232,249,0.3); }
</style>
