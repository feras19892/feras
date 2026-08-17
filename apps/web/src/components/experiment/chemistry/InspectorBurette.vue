<script setup lang="ts">
import {
  selectedChemical, hasSelectedChemicalMap,
} from '../../../composables/chemistry/useChemistryLab';
import { dripRateMode } from '../../../composables/chemistry/useLabSimulation';
import type { DripRateMode } from '../../../composables/chemistry/useLabSimulation';
import { useI18n } from '../../../composables/useI18n';
import { useChemicalLocale } from '../../../composables/chemistry/useChemicalLocale';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../../composables/chemistry/chemLabTypes';

const { t } = useI18n();
const { getName, resolveLabel } = useChemicalLocale();

const props = defineProps<{
  item: LabItem;
  state: ToolState;
}>();

const emit = defineEmits<{
  action: [type: 'fill5' | 'fill10' | 'fill50' | 'fill100' | 'remove5' | 'remove10' | 'remove50' | 'remove100' | 'empty' | 'refill' | 'toggleValve', uid: string];
  remove: [uid: string];
  buretteDrop: [];
  labelChange: [label: string];
}>();
</script>

<template>
  <div class="fi-row"><span>{{ t('chemistry.volume') }}</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} {{ t('chemistry.mL') }}</b></div>
  <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
  <div class="fi-row"><span>{{ t('chemistry.color') }}</span><span class="fi-dot" :style="{ background: state.color }" /></div>
  <div class="fi-row">
    <span>{{ t('chemistry.solution') }}</span>
    <input
      v-if="item"
      class="fi-input"
      :value="resolveLabel(state.label || '')"
      :placeholder="t('chemistry.solutionPlaceholder')"
      @input="(e: Event) => emit('labelChange', (e.target as HTMLInputElement).value)"
      @click.stop
    />
  </div>
  <div v-if="item && hasSelectedChemicalMap[item.uid]" class="fi-row fi-chem-row">
    <span>{{ t('chemistry.selectedSolution') }}</span>
    <span class="fi-chem-name">
      <span class="fi-dot" :style="{ background: selectedChemical.color }" />
      {{ getName(selectedChemical.id) }}
    </span>
  </div>
  <div class="fi-actions">
    <button @click="emit('action', 'fill5', item.uid)">💧 +5</button>
    <button @click="emit('action', 'fill10', item.uid)">💧 +10</button>
    <button @click="emit('action', 'fill50', item.uid)">💧 +50</button>
    <button @click="emit('action', 'fill100', item.uid)">💧 +100</button>
  </div>
  <div class="fi-actions">
    <button class="remove" @click="emit('action', 'remove5', item.uid)">💨 −5</button>
    <button class="remove" @click="emit('action', 'remove10', item.uid)">💨 −10</button>
    <button class="remove" @click="emit('action', 'remove50', item.uid)">💨 −50</button>
    <button class="remove" @click="emit('action', 'remove100', item.uid)">💨 −100</button>
  </div>
  <div class="fi-actions">
    <button class="empty" @click="emit('action', 'empty', item.uid)">🗑️ {{ t('chemistry.drain') }}</button>
    <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
  </div>
  <div class="fi-row"><span>{{ t('chemistry.valve') }}</span><b :class="state.valveOpen ? 'open' : ''">{{ state.valveOpen ? '🔓 ' + t('chemistry.open') : '🔒 ' + t('chemistry.closed') }}</b></div>
  <div class="fi-actions">
    <button :class="state.valveOpen ? 'danger' : 'success'" @click="emit('action', 'toggleValve', item.uid)">{{ state.valveOpen ? '🔒 ' + t('chemistry.closeAction') : '🚰 ' + t('chemistry.openAction') }}</button>
    <button class="refill" @click="emit('action', 'refill', item.uid)">♻️ {{ t('chemistry.refill') }}</button>
  </div>
  <div class="fi-actions">
    <button class="drop-one" @click="emit('buretteDrop')">💧 {{ t('chemistry.dropByDrop') }}</button>
  </div>
  <div class="fi-row"><span>{{ t('chemistry.dripRate') }}</span></div>
  <div class="fi-actions drip-modes">
    <button :class="['drip-btn', { active: dripRateMode === 'drop' }]" @click="dripRateMode = 'drop' as DripRateMode">💧 {{ t('chemistry.dripDrop') }}</button>
    <button :class="['drip-btn', { active: dripRateMode === 'slow' }]" @click="dripRateMode = 'slow' as DripRateMode">🚿 {{ t('chemistry.dripSlow') }}</button>
    <button :class="['drip-btn', { active: dripRateMode === 'fast' }]" @click="dripRateMode = 'fast' as DripRateMode">⚡ {{ t('chemistry.dripFast') }}</button>
  </div>
</template>
