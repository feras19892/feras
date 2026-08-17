<script setup lang="ts">
import {
  isGradCylinder, tiltAngleMap,
  selectedChemical, hasSelectedChemicalMap,
} from '../../../composables/chemistry/useChemistryLab';
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
  action: [type: 'fill5' | 'fill10' | 'fill50' | 'fill100' | 'remove5' | 'remove10' | 'remove50' | 'remove100' | 'empty', uid: string];
  remove: [uid: string];
  labelChange: [label: string];
}>();

function tiltLeft() {
  const current = tiltAngleMap[props.item.uid] || 0;
  tiltAngleMap[props.item.uid] = Math.max(-180, current - 15);
}
function tiltRight() {
  const current = tiltAngleMap[props.item.uid] || 0;
  tiltAngleMap[props.item.uid] = Math.min(180, current + 15);
}
function resetTilt() {
  delete tiltAngleMap[props.item.uid];
}
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
  <div v-if="item && isGradCylinder(item.id)" class="fi-row hint">
    <span>⚠️</span><small>{{ t('chemistry.gradCylinderHint') }}</small>
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
  <div class="fi-row">
    <span>🔄 {{ t('chemistry.tilt') }}</span>
    <b v-if="item && tiltAngleMap[item.uid]" class="tilt-value">{{ tiltAngleMap[item.uid] > 0 ? '↻ ' : '↺ ' }}{{ Math.abs(tiltAngleMap[item.uid]).toFixed(0) }}°</b>
    <b v-else>⬆ {{ t('chemistry.straightUp') }}</b>
  </div>
  <div class="fi-actions tilt-actions">
    <button class="tilt-left" @click="tiltLeft">↺ {{ t('chemistry.left') }}</button>
    <button class="tilt-reset" @click="resetTilt">⬆ {{ t('chemistry.tiltReset') }}</button>
    <button class="tilt-right" @click="tiltRight">↻ {{ t('chemistry.right') }}</button>
  </div>
</template>
