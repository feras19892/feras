<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { MathEquation } from '../../types/math.types';

defineProps<{
  equation: MathEquation;
}>();
</script>

<template>
  <section class="math-explanation">
    <h2 class="section-title">{{ t('math.explanation.title') }}</h2>
    <div class="law-box">
      <h3 class="law-title">{{ t('math.explanation.laws') }}</h3>
      <div class="latex-law">{{ equation.latex }}</div>
    </div>
    <p v-if="equation.explanation" class="explanation-text">{{ equation.explanation }}</p>
  </section>
</template>

<style scoped>
.math-explanation {
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

.law-box {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.law-title {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
}

.latex-law {
  font-size: 1.25rem;
  color: #111827;
}

.explanation-text {
  margin: 0;
  line-height: 1.6;
  color: #374151;
}
</style>
