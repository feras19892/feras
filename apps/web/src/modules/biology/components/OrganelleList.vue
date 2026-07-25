<script setup lang="ts">
import type { HotspotState } from '../../../types/biology.types';

const props = defineProps<{
  organelles: HotspotState[];
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();
</script>

<template>
  <nav class="organelle-list">
    <h3 class="list-title">
      <slot name="title" />
    </h3>
    <ul>
      <li
        v-for="organelle in props.organelles"
        :key="organelle.partId"
        class="organelle-item"
        :class="{ active: organelle.partId === props.selectedId }"
        @click="emit('select', organelle.partId)"
      >
        <span class="organelle-dot" />
        <span class="organelle-name">{{ organelle.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.organelle-list {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1rem;
  color: #e2e8f0;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

.list-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #94a3b8;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.organelle-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  border: 1px solid transparent;
}

.organelle-item:hover {
  background: rgba(74, 222, 128, 0.1);
}

.organelle-item.active {
  background: rgba(74, 222, 128, 0.18);
  border-color: rgba(74, 222, 128, 0.3);
  transform: translateX(-4px);
}

.organelle-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}

.organelle-name {
  font-size: 0.95rem;
}
</style>
