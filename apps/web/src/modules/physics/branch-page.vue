<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBranch } from './catalog';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const branchId = computed(() => route.params.branchId as string);
const branch = computed(() => {
  const b = getBranch(branchId.value);
  if (!b) return undefined;
  return {
    ...b,
    experiments: b.experiments.filter((e) => e.enabled),
  };
});

function goBack() {
  router.push('/physics');
}

function goToExperiment(expRoute: string) {
  router.push(expRoute);
}

function difficultyLabel(d: string): string {
  const map: Record<string, string> = {
    easy: t('experiments.easy'),
    medium: t('experiments.medium'),
    hard: t('experiments.hard'),
  };
  return map[d] || d;
}

function branchNameKey(id: string): string {
  const map: Record<string, string> = {
    mechanics: 'experiments.branchMechanics',
    waves: 'experiments.branchWaves',
    heat: 'experiments.branchHeat',
    electricity: 'experiments.branchElectricity',
    electromagnetism: 'experiments.branchElectromagnetism',
  };
  return map[id] || id;
}

function branchDescKey(id: string): string {
  const map: Record<string, string> = {
    mechanics: 'experiments.branchMechanicsDesc',
    waves: 'experiments.branchWavesDesc',
    heat: 'experiments.branchHeatDesc',
    electricity: 'experiments.branchElectricityDesc',
    electromagnetism: 'experiments.branchElectromagnetismDesc',
  };
  return map[id] || id;
}

function expNameKey(id: string): string {
  const map: Record<string, string> = {
    spring: 'experiments.expSpring',
    pendulum: 'experiments.expPendulum',
    projectile: 'experiments.expProjectile',
    freefall: 'experiments.expFreeFall',
    inclined: 'experiments.expInclined',
    collision: 'experiments.expCollision',
    lever: 'experiments.expLever',
    'light-ray': 'experiments.expLightRay',
    'thin-lens': 'experiments.expThinLens',
    mirrors: 'experiments.expMirrors',
    'prism-dispersion': 'experiments.expPrism',
    interference: 'experiments.expInterference',
    diffraction: 'experiments.expDiffraction',
    polarization: 'experiments.expPolarization',
    'speed-of-sound': 'experiments.expSpeedOfSound',
    resonance: 'experiments.expResonance',
    'ideal-gas': 'experiments.expIdealGas',
    calorimetry: 'experiments.expCalorimetry',
    'specific-heat': 'experiments.expSpecificHeat',
    'joule-equivalent': 'experiments.expJouleEquivalent',
    'boyles-law': 'experiments.expBoylesLaw',
    'thermal-expansion': 'experiments.expThermalExpansion',
    'latent-heat': 'experiments.expLatentHeat',
    'rc-circuit': 'experiments.expRcCircuit',
    'biot-savart': 'experiments.expBiotSavart',
    faraday: 'experiments.expFaraday',
  };
  return map[id] || id;
}
</script>

<template>
  <div class="branch-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← {{ t('experiments.back') }}</button>
      <h1 v-if="branch">
        <span class="icon">{{ branch.icon }}</span>
        {{ t(branchNameKey(branch.id)) }}
      </h1>
      <h1 v-else>{{ t('experiments.branchNotFound') }}</h1>
      <p v-if="branch">{{ t(branchDescKey(branch.id)) }}</p>
    </header>

    <div v-if="branch" class="experiments">
      <div class="grid">
        <div
          v-for="exp in branch.experiments"
          :key="exp.id"
          class="card"
          @click="goToExperiment(exp.route)"
        >
          <div class="card-icon">{{ exp.icon }}</div>
          <h4>{{ t(expNameKey(exp.id)) }}</h4>
          <p class="en">{{ exp.name }}</p>
          <div class="tags">
            <span class="tag difficulty" :class="exp.difficulty">
              {{ difficultyLabel(exp.difficulty) }}
            </span>
            <span v-for="tag in exp.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>{{ t('experiments.branchNotFound') }}</p>
      <button class="btn-action" @click="goBack">{{ t('experiments.backToBranches') }}</button>
    </div>
  </div>
</template>

<style scoped>
.branch-page {
  min-height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
  padding: 2rem 1rem;
}
.page-header { max-width: 1200px; margin: 0 auto 2rem; }
.back-btn {
  background: none;
  border: none;
  color: #67e8f9;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  padding: 0;
}
.page-header h1 { margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
.icon { font-size: 1.5rem; }
.page-header p { color: #94a3b8; margin: 0; }

.experiments { max-width: 1200px; margin: 0 auto; }
.experiments h2 { color: #67e8f9; margin-bottom: 1rem; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.75rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.card:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); }
.card-icon { font-size: 2rem; margin-bottom: 0.5rem; }
.card h4 { margin: 0 0 0.25rem; font-size: 1rem; }
.en { color: #64748b; font-size: 0.8rem; margin: 0 0 0.75rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.tag {
  background: rgba(255,255,255,0.08);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  color: #cbd5e1;
}
.difficulty.easy { background: rgba(34,197,94,0.15); color: #4ade80; }
.difficulty.medium { background: rgba(245,158,11,0.15); color: #fbbf24; }
.difficulty.hard { background: rgba(239,68,68,0.15); color: #f87171; }

.not-found { text-align: center; padding: 4rem; }
.not-found p { color: #94a3b8; margin-bottom: 1rem; }
.btn-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  cursor: pointer;
}
</style>
