<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useMathStore } from '../../stores/math.store';
import MathEquationCard from '../../components/math/MathEquationCard.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useMathStore();

const branchSlug = route.params.branch as string;

onMounted(() => {
  store.loadEquations(branchSlug);
});

watch(() => route.params.branch, (slug) => {
  if (typeof slug === 'string') {
    store.loadEquations(slug);
  }
});

function goToEquation(id: string) {
  router.push(`/math/${branchSlug}/${id}`);
}

function goBack() {
  router.push('/math');
}
</script>

<template>
  <div class="math-branch">
    <button class="back-btn" @click="goBack">{{ t('math.common.back') }}</button>
    <h1 class="title">{{ t('math.equations.title') }}</h1>
    <div v-if="store.loading" class="status">{{ t('math.common.loading') }}</div>
    <div v-else-if="store.error" class="status error">{{ store.error }}</div>
    <div v-else class="grid">
      <MathEquationCard
        v-for="equation in store.equations"
        :key="equation.id"
        :equation="equation"
        @select="goToEquation"
      />
    </div>
  </div>
</template>

<style scoped>
.math-branch {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.title {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.status {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.error {
  color: #991b1b;
}
</style>
