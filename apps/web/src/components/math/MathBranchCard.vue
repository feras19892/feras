<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { MathBranch } from '../../types/math.types';


const emit = defineEmits<{
  (e: 'select', slug: string): void;
}>();

defineProps<{
  branch: MathBranch;
}>();

function selectBranch(slug: string) {
  emit('select', slug);
}
</script>

<template>
  <div
    class="math-branch-card"
    :style="{ borderColor: branch.color || '#e5e7eb' }"
    @click="selectBranch(branch.slug)"
  >
    <div class="icon" :style="{ backgroundColor: branch.color || '#f3f4f6' }">
      {{ branch.icon }}
    </div>
    <h3 class="title">{{ branch.name }}</h3>
    <p v-if="branch.description" class="description">{{ branch.description }}</p>
  </div>
</template>

<style scoped>
.math-branch-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: white;
}

.math-branch-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
}

.title {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}
</style>
