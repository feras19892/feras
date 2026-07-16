<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getExperiment } from './catalog';
import { loadExperiment } from './experiment-loader';
import { useI18n } from '../../composables/useI18n';
import FeedbackModal from '../../components/shared/FeedbackModal.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const branchId = computed(() => route.params.branchId as string);
const expId = computed(() => route.params.experimentId as string);
const experiment = computed(() => getExperiment(branchId.value, expId.value));
const showFeedback = ref(false);

const ExperimentComponent = computed(() => {
  if (!expId.value) return null;
  return loadExperiment(expId.value);
});

function goBack() {
  router.push(`/physics/${branchId.value}`);
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
    'rc-circuit': 'experiments.expRcCircuit',
    'biot-savart': 'experiments.expBiotSavart',
    faraday: 'experiments.expFaraday',
    'electric-lab': 'experiments.expElectricLab',
    'electric-workshop': 'experiments.expElectricWorkshop',
    'wave-interference': 'experiments.expWaveInterference',
    'specific-heat': 'experiments.expSpecificHeat',
    'boyles-law': 'experiments.expBoylesLaw',
    'thermal-expansion': 'experiments.expThermalExpansion',
    'latent-heat': 'experiments.expLatentHeat',
  };
  return map[id] || id;
}
</script>

<template>
  <div class="experiment-page">
    <header class="page-header" v-if="experiment && !ExperimentComponent">
      <button class="back-btn" @click="goBack">← {{ t('experiments.back') }}</button>
      <h1><span class="icon">{{ experiment.icon }}</span> {{ experiment ? t(expNameKey(experiment.id)) : '' }}</h1>
      <p class="en">{{ experiment?.name }}</p>
      <button class="feedback-btn" @click="showFeedback = true">🚩 {{ t('experiments.reportProblem') }}</button>
    </header>

    <FeedbackModal
      v-model:show="showFeedback"
      :experiment-id="expId"
      :experiment-name="experiment ? t(expNameKey(experiment.id)) : ''"
    />

    <!-- If experiment component exists, render it full-screen -->
    <component v-if="ExperimentComponent" :is="ExperimentComponent" />

    <!-- Otherwise show stub -->
    <div v-else-if="experiment" class="shell-placeholder">
      <p>{{ t('experiments.experiment') }} <strong>{{ experiment ? t(expNameKey(experiment.id)) : '' }}</strong> {{ t('experiments.experimentInDevelopment') }}</p>
      <button class="btn-action" @click="goBack">{{ t('experiments.goBack') }}</button>
    </div>

    <div v-else class="not-found">
      <p>{{ t('experiments.experimentNotFound') }}</p>
      <button class="btn-action" @click="goBack">{{ t('experiments.goBack') }}</button>
    </div>
  </div>
</template>

<style scoped>
.experiment-page { min-height: 100vh; background: #0b1220; color: #e2e8f0; }
.page-header { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem 1rem; }
.back-btn { background: none; border: none; color: #67e8f9; cursor: pointer; font-size: 0.9rem; margin-bottom: 0.5rem; padding: 0; }
.page-header h1 { margin: 0 0 0.25rem; display: flex; align-items: center; gap: 0.5rem; }
.icon { font-size: 1.5rem; }
.en { color: #64748b; font-size: 0.85rem; margin: 0; }

.shell-placeholder { max-width: 1200px; margin: 0 auto; padding: 2rem; text-align: center; color: #94a3b8; }
.not-found { text-align: center; padding: 4rem; }
.not-found p { color: #94a3b8; margin-bottom: 1rem; }
.btn-action { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; cursor: pointer; }
.feedback-btn { margin-top: 0.5rem; padding: 0.35rem 0.7rem; border-radius: 0.4rem; border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); color: #fca5a5; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.feedback-btn:hover { background: rgba(239,68,68,0.2); }
</style>
