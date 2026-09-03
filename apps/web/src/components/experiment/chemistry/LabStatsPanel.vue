<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import { getLiquid, isContainer, items, phProbeTipMap } from '../../../composables/chemistry/useChemistryLab';
import { isPhMeter } from '../../../composables/chemistry/chemLabIds';
import { getPhReading, isHeated } from '../../../composables/chemistry/useLabSimulation';
const props = defineProps<{
  item: LabItem | null;
}>();

const liq = computed(() => props.item && isContainer(props.item.id) ? getLiquid(props.item.uid) : null);
const ph = computed(() => {
  if (!props.item) return null;
  // Find a pH meter whose probe tip is inside this item
  const phMeter = items.value.find(i =>
    isPhMeter(i.id) &&
    phProbeTipMap[i.uid] &&
    Math.abs((props.item!.x + 40) - phProbeTipMap[i.uid].x) < 60 &&
    Math.abs((props.item!.y + 10) - phProbeTipMap[i.uid].y) < 50
  );
  return phMeter ? getPhReading(phMeter) : null;
});
const heated = computed(() => props.item ? isHeated(props.item) : false);
</script>

<template>
  <div class="stats-panel">
    <h4>{{ t('chemistryLab.labStats') }}</h4>
    <div v-if="item && liq" class="stats-table">
      <div class="stat-row">
        <span class="stat-label">{{ t('chemistryLab.temperature') }}</span>
        <span class="stat-value" :class="liq.temperature > 30 ? 'hot' : ''">{{ liq.temperature.toFixed(1) }}°C</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">📟 pH</span>
        <span class="stat-value" :class="ph !== null ? (ph < 7 ? 'acid' : ph > 7 ? 'base' : 'neutral') : ''">
          {{ ph !== null ? ph.toFixed(2) : '--.--' }}
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ t('chemistryLab.heating') }}</span>
        <span class="stat-value" :class="heated ? 'heating' : ''">{{ heated ? t('chemistryLab.yes') : t('chemistryLab.no') }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ t('chemistry.volume') }}</span>
        <span class="stat-value">{{ liq.volume.toFixed(1) }} mL</span>
      </div>
    </div>
    <div v-else class="stats-empty">
      {{ t('chemistry.clickToolHint') }}
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
.stats-panel h4 {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  color: #334155;
  text-align: center;
}
.stats-table {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.5rem;
  background: #f8fafc;
  border-radius: 0.4rem;
  font-size: 0.72rem;
}
.stat-label {
  color: #64748b;
}
.stat-value {
  font-weight: 700;
  color: #334155;
  font-family: monospace;
}
.stat-value.hot { color: #ef4444; }
.stat-value.acid { color: #ef4444; }
.stat-value.base { color: #8b5cf6; }
.stat-value.neutral { color: #22c55e; }
.stat-value.heating { color: #f59e0b; }
.stats-empty {
  text-align: center;
  font-size: 0.7rem;
  color: #94a3b8;
  padding: 1rem 0;
}
</style>
