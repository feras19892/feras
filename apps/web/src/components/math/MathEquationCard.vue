<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import type { MathEquation } from '../../types/math.types';

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();

const props = defineProps<{
  equation: MathEquation;
}>();

function selectEquation(id: string) {
  emit('select', id);
}

const difficultyClass = computed(() => `difficulty-${props.equation.difficulty}`);
const difficultyLabel = computed(() => t(`math.equations.${props.equation.difficulty}`));
</script>

<template>
  <div class="math-equation-card" @click="selectEquation(equation.id)">
    <h3 class="title">{{ equation.title }}</h3>
    <div class="latex">{{ equation.latex }}</div>
    <span class="difficulty" :class="difficultyClass">{{ difficultyLabel }}</span>
  </div>
</template>

<style scoped>
.math-equation-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background-color: white;
}

.math-equation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.latex {
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  color: #374151;
}

.difficulty {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.difficulty-easy {
  background-color: #d1fae5;
  color: #065f46;
}

.difficulty-medium {
  background-color: #fef3c7;
  color: #92400e;
}

.difficulty-hard {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>
