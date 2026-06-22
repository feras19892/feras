<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../../../composables/useI18n';

const props = defineProps<{
  sourceName: string;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'back'): void;
}>();

const { t } = useI18n();

const title = computed(() => {
  return props.sourceName ? t('analysis.analysisTitle', { name: props.sourceName }) : t('analysis.defaultTitle');
});
</script>

<template>
  <nav class="analysis-menubar">
    <div class="left">
      <button class="btn-back" @click="emit('back')">{{ t('analysis.back') }}</button>
      <span class="title">📊 {{ title }}</span>
    </div>
    <div class="right">
      <button class="btn-clear" @click="emit('clear')">{{ t('analysis.clearData') }}</button>
    </div>
  </nav>
</template>

<style scoped>
.analysis-menubar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1.2rem;
  background: linear-gradient(135deg, #0f172a, #161B22);
  border-bottom: 1px solid rgba(91,141,184,0.15);
  flex-shrink: 0;
}
.left, .right { display: flex; align-items: center; gap: 0.85rem; }
.title { font-weight: 800; color: #e2e8f0; font-size: 1.05rem; letter-spacing: 0.2px; }
.btn-back {
  background: rgba(91,141,184,0.1);
  border: 1px solid rgba(91,141,184,0.2);
  color: #67e8f9;
  cursor: pointer;
  font-size: 0.82rem;
  padding: 0.35rem 0.7rem;
  border-radius: 0.35rem;
  transition: all 0.15s;
}
.btn-back:hover { background: rgba(91,141,184,0.18); }
.btn-clear {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  color: #f87171;
  border-radius: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-clear:hover { background: rgba(239,68,68,0.18); }
</style>
