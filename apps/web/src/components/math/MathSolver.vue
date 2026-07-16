<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useMathSolver } from '../../composables/math/useMathSolver';
import type { MathEquation } from '../../types/math.types';

const { t } = useI18n();

const props = defineProps<{
  equation: MathEquation;
}>();

const input = ref(props.equation.latex);
const { solution, loading, error, solve } = useMathSolver();

async function handleSolve() {
  await solve({ expression: input.value, operation: 'solve' });
}
</script>

<template>
  <section class="math-solver">
    <h2 class="section-title">{{ t('math.solver.title') }}</h2>
    <textarea
      v-model="input"
      class="input"
      rows="3"
      :placeholder="t('math.solver.inputPlaceholder')"
    />
    <button class="solve-btn" :disabled="loading" @click="handleSolve">
      {{ loading ? t('math.common.loading') : t('math.solver.solve') }}
    </button>
    <div v-if="error" class="error">{{ t('math.solver.error') }}: {{ error }}</div>
    <div v-else-if="solution" class="result">
      <h3>{{ t('math.solver.result') }}</h3>
      <div class="latex">{{ solution.result }}</div>
      <h3 v-if="solution.steps.length">{{ t('math.solver.steps') }}</h3>
      <ol v-if="solution.steps.length">
        <li v-for="(step, index) in solution.steps" :key="index">
          <strong>{{ step.title }}</strong>
          <div class="latex">{{ step.expression }}</div>
          <p>{{ step.explanation }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.math-solver {
  padding: 1rem;
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;
}

.solve-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1.25rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.solve-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 0.5rem;
}

.result {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f0fdf4;
  border-radius: 0.5rem;
}

.result h3 {
  margin: 0.75rem 0 0.5rem;
  font-size: 1rem;
}

.latex {
  font-size: 1.125rem;
  color: #111827;
}
</style>
