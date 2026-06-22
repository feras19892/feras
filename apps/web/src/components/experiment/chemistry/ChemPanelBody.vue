<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import type { ChemistryExperimentApi } from '../../../composables/chemistry/useChemistryExperiment'
import ChemInventoryPanel from './panels/ChemInventoryPanel.vue'

const { t } = useI18n()
const props = defineProps<{
  id: string
  ex: ChemistryExperimentApi
}>()

const emit = defineEmits<{
  (e: 'substanceDragStart', id: string): void
  (e: 'substanceDragEnd'): void
}>()
</script>

<template>
  <div class="panel-body">
    <template v-if="id === 'inventory'">
      <ChemInventoryPanel
        :selected="ex.selectedSubstance.value"
        @select="(id) => ex.selectSubstance(id || null)"
      />
    </template>

    <template v-else-if="id === 'tools'">
      <div class="placeholder">
        <span>&#x2699;</span>
        <p>{{ t('experiments.chemTools') }}</p>
        <p class="sub">{{ t('experiments.toolBurette') }}, {{ t('experiments.toolBurner') }}, {{ t('experiments.toolPhMeter') }}...</p>
      </div>
    </template>

    <template v-else-if="id === 'readings'">
      <div class="readings-grid">
        <div class="reading-item">
          <label>{{ t('experiments.readingPh') }}</label>
          <span class="value">7.0</span>
        </div>
        <div class="reading-item">
          <label>{{ t('experiments.readingTemp') }}</label>
          <span class="value">25 {{ t('experiments.readingTempUnit') }}</span>
        </div>
        <div class="reading-item">
          <label>{{ t('experiments.readingVolume') }}</label>
          <span class="value">0 {{ t('experiments.unitMl') }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="id === 'instructions'">
      <div class="instruction-box">
        <div class="step-badge">{{ t('experiments.chemStep') }} {{ ex.state.step + 1 }}</div>
        <p>{{ ex.currentInstruction }}</p>
      </div>
    </template>

    <template v-else-if="id === 'report'">
      <div class="placeholder">
        <span>&#x1F4CB;</span>
        <p>{{ t('experiments.chemReport') }}</p>
        <p class="sub">{{ t('experiments.reportObservations') }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .5rem; }
.placeholder { text-align: center; color: #64748b; font-size: .8rem; padding: 1rem .5rem; }
.placeholder span { font-size: 1.5rem; display: block; margin-bottom: .25rem; }
.placeholder .sub { font-size: .7rem; color: #475569; margin-top: .25rem; }

.readings-grid { display: flex; flex-direction: column; gap: .5rem; }
.reading-item { display: flex; justify-content: space-between; align-items: center; padding: .35rem .5rem; background: rgba(255,255,255,0.03); border-radius: 4px; }
.reading-item label { font-size: .72rem; color: #94a3b8; }
.reading-item .value { font-size: .85rem; font-weight: 600; color: #67e8f9; font-family: monospace; }

.instruction-box { padding: .75rem; background: rgba(103,232,249,0.05); border: 1px solid rgba(103,232,249,0.15); border-radius: 6px; }
.step-badge { display: inline-block; background: rgba(103,232,249,0.15); color: #67e8f9; font-size: .65rem; font-weight: 700; padding: .15rem .4rem; border-radius: 4px; margin-bottom: .4rem; }
.instruction-box p { margin: 0; font-size: .8rem; color: #e2e8f0; line-height: 1.4; }
</style>
