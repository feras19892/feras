<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed } from 'vue';
import {

  items, isContainer, getLiquid,
  selectedChemical, hasSelectedChemicalMap,
} from '../../../composables/chemistry/useChemistryLab';

import { useChemicalLocale } from '../../../composables/chemistry/useChemicalLocale';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../../composables/chemistry/chemLabTypes';




const { getName } = useChemicalLocale();

const props = defineProps<{
  item: LabItem;
  state: ToolState;
}>();

const emit = defineEmits<{
  pipetteFill: [amount: number];
  pipetteDrawFrom: [targetUid: string, amount: number];
  pipetteDispenseTo: [targetUid: string, amount: number];
  pipetteEmpty: [];
  remove: [uid: string];
}>();

const pipetteTargetUid = ref<string>('');

const containerList = computed(() => {
  if (!props.item) return [];
  return items.value.filter((i: LabItem) => i.uid !== props.item!.uid && isContainer(i.id));
});

function containerLabel(c: LabItem): string {
  const liq = getLiquid(c.uid);
  const vol = liq.volume > 0 ? ` (${liq.volume.toFixed(1)} ${t('chemistry.mL')})` : ` (${t('chemistry.emptyF')})`;
  return t(c.name) + vol;
}

</script>

<template>
  <div class="fi-row"><span>{{ t('chemistry.solution') }}</span><b>{{ state.volume.toFixed(1) }} / {{ state.maxVolume }} {{ t('chemistry.mL') }}</b></div>
  <div class="fi-bar"><div class="fi-fill" :style="{ width: (state.volume/state.maxVolume*100).toFixed(0) + '%', background: state.color }" /></div>
  <div class="fi-row"><span>{{ t('chemistry.color') }}</span><span class="fi-dot" :style="{ background: state.color }" /></div>
  <div v-if="item && hasSelectedChemicalMap[item.uid]" class="fi-row fi-chem-row">
    <span>{{ t('chemistry.selectedSolution') }}</span>
    <span class="fi-chem-name">
      <span class="fi-dot" :style="{ background: selectedChemical.color }" />
      {{ getName(selectedChemical.id) }}
    </span>
  </div>
  <div class="fi-row"><span>🧪 {{ t('chemistry.fillFromShelf') }}</span></div>
  <div class="fi-actions">
    <button @click="emit('pipetteFill', 5)">💧 +5</button>
    <button @click="emit('pipetteFill', 10)">💧 +10</button>
    <button @click="emit('pipetteFill', 50)">💧 +50</button>
    <button @click="emit('pipetteFill', 100)">💧 +100</button>
  </div>
  <div class="fi-row"><span>🎯 {{ t('chemistry.selectContainer') }}</span></div>
  <div class="fi-actions">
    <select v-model="pipetteTargetUid" class="fi-select" @click.stop>
      <option value="">{{ t('chemistry.chooseContainer') }}</option>
      <option v-for="c in containerList" :key="c.uid" :value="c.uid">{{ containerLabel(c) }}</option>
    </select>
  </div>
  <div class="fi-row"><span>💉 {{ t('chemistry.drawFrom') }}</span></div>
  <div class="fi-actions">
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 1)">💉 1</button>
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 3)">💉 3</button>
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 5)">💉 5</button>
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDrawFrom', pipetteTargetUid, 10)">💉 10</button>
  </div>
  <div class="fi-row"><span>💧 {{ t('chemistry.dispenseTo') }}</span></div>
  <div class="fi-actions">
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 1)">💧 1</button>
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 3)">💧 3</button>
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 5)">💧 5</button>
    <button class="success" :disabled="!pipetteTargetUid" @click="emit('pipetteDispenseTo', pipetteTargetUid, 10)">💧 10</button>
  </div>
  <div class="fi-actions">
    <button class="empty" @click="emit('pipetteEmpty')">🗑️ {{ t('chemistry.drain') }}</button>
    <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
  </div>
  <div class="fi-row hint">
    <span>📖</span><small>{{ t('chemistry.pipetteHintNew') }}</small>
  </div>
</template>
