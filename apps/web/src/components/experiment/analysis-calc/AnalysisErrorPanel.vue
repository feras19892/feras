<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed, ref, watch } from 'vue';

const theoretical = ref<number | null>(null);
const experimental = ref<number | null>(null);

const emit = defineEmits<{
  (e: 'error-calc', val: { theoretical: number | null; experimental: number | null; errorPercent: number | null }): void;
}>();

const errorPercent = computed(() => {
  if (theoretical.value === null || experimental.value === null) return null;
  const theo = theoretical.value;
  const exp = experimental.value;
  if (theo === 0) return null;
  return Math.abs((theo - exp) / theo) * 100;
});

watch([theoretical, experimental, errorPercent], () => {
  emit('error-calc', {
    theoretical: theoretical.value,
    experimental: experimental.value,
    errorPercent: errorPercent.value,
  });
}, { immediate: true });
</script>

<template>
  <div class="error-panel">
    <div class="panel-header">
      <span>{{ t('analysis.errorPercent') }}</span>
    </div>
    <div class="body">
      <div class="row">
        <div class="field">
          <label>{{ t('analysis.theoreticalValue') }}</label>
          <input v-model.number="theoretical" type="number" step="any" :placeholder="t('analysis.theoreticalPlaceholder')" />
        </div>
        <div class="field">
          <label>{{ t('analysis.experimentalValue') }}</label>
          <input v-model.number="experimental" type="number" step="any" :placeholder="t('analysis.experimentalPlaceholder')" />
        </div>
      </div>
      <div v-if="errorPercent !== null" class="result">
        <span class="label">{{ t('analysis.errorRate') }}</span>
        <span class="value" :class="{ good: errorPercent < 5, warn: errorPercent >= 5 && errorPercent < 15, bad: errorPercent >= 15 }">
          {{ errorPercent.toFixed(2) }}%
        </span>
      </div>
      <div v-else class="hint">{{ t('analysis.enterValuesHint') }}</div>
    </div>
  </div>
</template>

<style scoped>
.error-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.panel-header {
  padding: 0.5rem 0.8rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.88rem;
  color: #67e8f9;
  font-weight: 700;
}
.body { padding: 0.6rem 0.8rem; display: flex; flex-direction: column; gap: 0.5rem; }
.row { display: flex; gap: 0.6rem; }
.field { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
input {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.3rem;
  padding: 0.45rem 0.55rem;
  font-size: 0.9rem;
  font-family: inherit;
  width: 100%;
  min-width: 0;
}
.result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,0.04);
  border-radius: 0.4rem;
  padding: 0.55rem 0.7rem;
  margin-top: 0.2rem;
}
.label { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
.value { font-size: 1.15rem; font-weight: 800; font-family: 'Courier New', monospace; }
.value.good { color: #4ade80; }
.value.warn { color: #fbbf24; }
.value.bad { color: #f87171; }
.hint { color: #64748b; font-size: 0.75rem; text-align: center; padding: 0.3rem 0; }
</style>
