<script setup lang="ts">
import { onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../../../composables/useI18n';
import { useMathStore } from '../../../stores/math.store';
import { useMathGraph } from '../../../composables/math/useMathGraph';
import MathExplanation from '../../../components/math/MathExplanation.vue';
import MathSolver from '../../../components/math/MathSolver.vue';
import MathGraph from '../../../components/math/MathGraph.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useMathStore();
const graph = useMathGraph();

const equationId = computed(() => route.params.equation as string);
const branchSlug = computed(() => route.params.branch as string);
const graphPoints = computed(() => graph.graphData.value?.points ?? []);

async function loadEquation() {
  await store.loadEquation(equationId.value);
  if (store.currentEquation) {
    await graph.load({ expression: store.currentEquation.latex, xMin: -10, xMax: 10 });
  }
}

onMounted(loadEquation);

watch(equationId, loadEquation);

function goBack() {
  router.push(`/math/${branchSlug.value}`);
}
</script>

<template>
  <div class="math-equation">
    <button class="back-btn" @click="goBack">{{ t('math.common.back') }}</button>
    <div v-if="store.loading" class="status">{{ t('math.common.loading') }}</div>
    <div v-else-if="store.error" class="status error">{{ store.error }}</div>
    <template v-else-if="store.currentEquation">
      <h1 class="title">{{ store.currentEquation.title }}</h1>
      <div class="layout">
        <div class="main">
          <MathExplanation :equation="store.currentEquation" />
          <MathSolver :equation="store.currentEquation" />
        </div>
        <aside class="side">
          <MathGraph v-if="graphPoints.length" :points="graphPoints" />
          <div v-else class="no-graph">{{ t('math.graph.noGraph') }}</div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.math-equation {
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

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}

.main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-graph {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  color: #6b7280;
  text-align: center;
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
