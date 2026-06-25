<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';

const props = defineProps<{ active: number }>();
const emit = defineEmits<(e: 'change', idx: number) => void>();
const { t } = useI18n();
const tabs = [t('analysis.dataTab'), t('analysis.analysisTab'), t('analysis.reportTab')];
</script>

<template>
  <div class="tabs-bar">
    <button
      v-for="(tabLabel, i) in tabs"
      :key="i"
      class="tab-btn"
      :class="{ active: i === props.active }"
      @click="emit('change', i)"
    >
      {{ tabLabel }}
    </button>
  </div>
</template>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 0.3rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.45rem 0.7rem;
  border-radius: 0.4rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all .15s;
  font-weight: 700;
  position: relative;
}
.tab-btn.active {
  background: rgba(6,182,212,0.12);
  color: #67e8f9;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #67e8f9;
  border-radius: 1px;
}
.tab-btn:hover:not(.active) { color: #e2e8f0; background: rgba(255,255,255,0.03); }
</style>
