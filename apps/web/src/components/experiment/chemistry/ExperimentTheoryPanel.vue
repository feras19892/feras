<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { computed } from 'vue';
import type { ResolvedExperimentTheory } from '../../../composables/chemistry/experiments';

const props = defineProps<{
  theory: ResolvedExperimentTheory | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const bodyDir = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr');
const bodyAlign = computed(() => locale.value === 'ar' ? 'right' : 'left');
</script>

<template>
  <div v-if="theory" class="theory-overlay" @click.self="emit('close')">
    <div class="theory-panel">
      <div class="theory-header">
        <h2>{{ t(theory.title) }}</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>
      <div class="theory-body">
        <div
          v-for="(section, index) in theory.sections"
          :key="index"
          class="theory-section"
        >
          <h3 class="section-heading">{{ t(section.heading) }}</h3>
          <div class="section-content" style="white-space: pre-line">{{ t(section.content) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theory-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.theory-panel {
  background: #ffffff;
  border-radius: 1rem;
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.theory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}
.theory-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}
.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.close-btn:hover {
  background: rgba(255,255,255,0.35);
}
.theory-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  direction: v-bind(bodyDir);
  text-align: v-bind(bodyAlign);
}
.theory-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}
.section-heading {
  margin: 0 0 0.6rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}
.section-content {
  font-size: 0.85rem;
  line-height: 1.8;
  color: #475569;
  white-space: pre-line;
}
.theory-body::-webkit-scrollbar {
  width: 6px;
}
.theory-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.theory-body::-webkit-scrollbar-track {
  background: transparent;
}
</style>
