<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const props = defineProps<{ active: number }>();

const emit = defineEmits<{ (e: 'change', index: number): void }>();
const tabs = [
  { key: 0, label: t('analysis.dataTab') },
  { key: 1, label: t('analysis.analysisTab') },
  { key: 2, label: t('analysis.reportTab') },
];
</script>

<template>
  <div class="chem-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab-btn', { active: props.active === tab.key }]"
      @click="emit('change', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.chem-tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  padding: 0.35rem;
  border: none;
  border-radius: 0.3rem;
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.15s;
}
.tab-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
.tab-btn.active { background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; }
</style>