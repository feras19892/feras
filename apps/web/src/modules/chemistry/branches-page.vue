<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { getAllChemistryExperiments } from './catalog';

const { t } = useI18n();
const router = useRouter();

const experiments = getAllChemistryExperiments();

function goToExperiment(id: string) {
  router.push(`/chemistry/${id}`);
}
</script>

<template>
  <div class="chemistry-page">
    <header class="page-header">
      <h1>&#x2697; {{ t('experiments.branchChemistry') }}</h1>
      <p class="subtitle">{{ t('experiments.branchChemistryDesc') }}</p>
    </header>

    <div class="experiments-grid">
      <div
        v-for="exp in experiments"
        :key="exp.id"
        class="exp-card"
        @click="goToExperiment(exp.id)"
      >
        <span class="exp-icon">{{ exp.icon }}</span>
        <h3>{{ t(exp.nameAr) }}</h3>
        <p class="exp-name">{{ exp.name }}</p>
        <span class="difficulty" :class="exp.difficulty">{{ exp.difficulty }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chemistry-page { min-height: 100vh; background: #0b1220; color: #e2e8f0; padding: 2rem 1rem; }
.page-header { max-width: 1200px; margin: 0 auto 2rem; }
.page-header h1 { margin: 0 0 0.25rem; color: #ec4899; }
.subtitle { color: #64748b; margin: 0; }

.experiments-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
.exp-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1.25rem; cursor: pointer; transition: all .2s; display: flex; flex-direction: column; gap: 0.5rem; }
.exp-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(236,72,153,0.3); transform: translateY(-2px); }
.exp-icon { font-size: 2rem; }
.exp-card h3 { margin: 0; font-size: 1rem; color: #e2e8f0; }
.exp-name { color: #64748b; font-size: 0.8rem; margin: 0; }
.difficulty { font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; text-transform: uppercase; font-weight: 600; align-self: flex-start; }
.difficulty.easy { background: rgba(34,197,94,0.15); color: #22c55e; }
.difficulty.medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
.difficulty.hard { background: rgba(239,68,68,0.15); color: #ef4444; }
</style>
