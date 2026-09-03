<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed } from 'vue';
import {

  items, isContainer, getLiquid,
  spatulaSelectedSolid, solidMap,
} from '../../../composables/chemistry/useChemistryLab';

import type { LabItem } from '../../../composables/chemistry/useChemistryTools';




const props = defineProps<{
  item: LabItem;
}>();

const emit = defineEmits<{
  spatulaSelectSolid: [];
  spatulaAddTo: [targetUid: string, grams: number];
  remove: [uid: string];
}>();

const spatulaTargetUid = ref<string>('');

const spatulaContainerList = computed(() => {
  if (!props.item) return [];
  return items.value.filter((i: LabItem) => i.uid !== props.item!.uid && isContainer(i.id));
});

function spatulaContainerLabel(c: LabItem): string {
  const liq = getLiquid(c.uid);
  const vol = liq.volume > 0 ? ` (${liq.volume.toFixed(1)} ${t('chemistry.mL')})` : ` (${t('chemistry.emptyF')})`;
  const solid = solidMap[c.uid];
  const solidInfo = solid && solid.amount > 0 ? ` + ${solid.amount.toFixed(1)}${t('chemistry.g')}` : '';
  return t(c.name) + vol + solidInfo;
}
</script>

<template>
  <div class="fi-row"><span>{{ t('chemistry.tool') }}</span><b>{{ t('chemistry.spatula') }}</b></div>
  <div class="fi-row"><span>{{ t('chemistry.usage') }}</span><b>{{ t('chemistry.transferSolids') }}</b></div>

  <div v-if="spatulaSelectedSolid" class="fi-row fi-chem-row">
    <span>{{ t('chemistry.selectedSolid') }}</span>
    <span class="fi-chem-name">
      <span class="fi-dot" :style="{ background: spatulaSelectedSolid.color }" />
      {{ spatulaSelectedSolid.name }}
    </span>
  </div>

  <div class="fi-actions">
    <button class="success" @click="emit('spatulaSelectSolid')">
      🧪 {{ spatulaSelectedSolid ? t('chemistry.changeSolid') : t('chemistry.selectSolid') }}
    </button>
  </div>

  <div class="fi-row"><span>🎯 {{ t('chemistry.selectContainer') }}</span></div>
  <div class="fi-actions">
    <select v-model="spatulaTargetUid" class="fi-select" @click.stop>
      <option value="">{{ t('chemistry.chooseContainer') }}</option>
      <option v-for="c in spatulaContainerList" :key="c.uid" :value="c.uid">{{ spatulaContainerLabel(c) }}</option>
    </select>
  </div>

  <div class="fi-row"><span>⚖️ {{ t('chemistry.addGrams') }}</span></div>
  <div class="fi-actions">
    <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 0.5)">🥄 +0.5g</button>
    <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 1)">🥄 +1g</button>
    <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 2)">🥄 +2g</button>
    <button class="success" :disabled="!spatulaSelectedSolid || !spatulaTargetUid" @click="emit('spatulaAddTo', spatulaTargetUid, 5)">🥄 +5g</button>
  </div>

  <div v-if="spatulaTargetUid && solidMap[spatulaTargetUid] && solidMap[spatulaTargetUid].amount > 0" class="fi-row">
    <span>{{ t('chemistry.totalSolid') }}</span>
    <b>{{ solidMap[spatulaTargetUid].amount.toFixed(2) }} {{ t('chemistry.g') }}</b>
  </div>

  <div class="fi-row hint"><span>📖</span><small>{{ t('chemistry.spatulaHintNew') }}</small></div>
  <div class="fi-actions">
    <button class="delete" @click="emit('remove', item.uid)">❌ {{ t('chemistry.remove') }}</button>
  </div>
</template>
