<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const props = defineProps<{
  parts: ModelPart[];
  activePartId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();

const { t } = useI18n();
</script>

<template>
  <div v-if="parts.length" class="parts-card">
    <h2 class="panel-title">{{ t('biology.partsListTitle') }}</h2>
    <ul class="parts-list">
      <li
        v-for="part in parts"
        :key="part.id"
        class="part-item"
        :class="{ active: part.id === activePartId }"
        @click="emit('select', part.id)"
      >
        {{ t(part.nameKey) }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.parts-card {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.panel-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  color: #e2e8f0;
}

.parts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.part-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(30, 41, 59, 0.5);
  color: #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.part-item:hover {
  background: rgba(51, 65, 85, 0.8);
}

.part-item.active {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid #4ade80;
  color: #4ade80;
}
</style>
