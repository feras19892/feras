<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed, ref, onErrorCaptured } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getExperiment } from './catalog';
import { loadExperiment } from './experiment-loader';

import FeedbackModal from '../../components/shared/FeedbackModal.vue';





const route = useRoute();
const router = useRouter();

const branchId = computed(() => route.params.branchId as string);
const expId = computed(() => route.params.experimentId as string);
const experiment = computed(() => getExperiment(branchId.value, expId.value));
const showFeedback = ref(false);
const loadError = ref<string | null>(null);

onErrorCaptured((err) => {
  console.error('[ExperimentPage] Error caught:', err);
  loadError.value = err instanceof Error ? err.message : String(err);
  return false;
});

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
    netforce: 'experiments.expNetForce',
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
    'biot-savart': 'experiments.expBiotSavart',
    faraday: 'experiments.expFaraday',
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
    </header>

    <FeedbackModal
      v-model:show="showFeedback"
      :experiment-id="expId"
      :experiment-name="experiment ? t(expNameKey(experiment.id)) : ''"
    />

    <!-- Floating feedback button (always visible) -->
    <button class="feedback-fab" @click="showFeedback = true" :title="t('experiments.reportProblem')">🚩</button>

    <!-- Error display -->
    <div v-if="loadError" class="exp-error-display">
      <div class="error-icon">⚠️</div>
      <h2>خطأ في تحميل التجربة</h2>
      <pre class="error-msg">{{ loadError }}</pre>
      <button class="btn-action" @click="goBack">← العودة</button>
    </div>

    <!-- If experiment component exists, render it full-screen -->
    <Suspense v-else-if="ExperimentComponent">
      <component :is="ExperimentComponent" />
      <template #fallback>
        <div class="exp-loading">
          <div class="exp-spinner"></div>
          <p>{{ t('experiments.loadingExperiment', 'جاري تحميل التجربة...') }}</p>
        </div>
      </template>
    </Suspense>

    <!-- Disabled experiment -->
    <div v-if="!ExperimentComponent && experiment && experiment.enabled === false" class="shell-placeholder">
      <p>{{ t('experiments.experimentDisabled', 'هذه التجربة معطّلة حالياً') }}</p>
      <button class="btn-action" @click="goBack">{{ t('experiments.goBack') }}</button>
    </div>

    <!-- Stub for unimplemented experiment -->
    <div v-if="!ExperimentComponent && experiment && experiment.enabled !== false" class="shell-placeholder">
      <p>{{ t('experiments.experiment') }} <strong>{{ experiment ? t(expNameKey(experiment.id)) : '' }}</strong> {{ t('experiments.experimentInDevelopment') }}</p>
      <button class="btn-action" @click="goBack">{{ t('experiments.goBack') }}</button>
    </div>

    <!-- Not found -->
    <div v-if="!ExperimentComponent && !experiment" class="not-found">
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
.feedback-fab {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid rgba(239,68,68,0.4);
  background: rgba(239,68,68,0.15);
  backdrop-filter: blur(8px);
  color: #fca5a5;
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.feedback-fab:hover {
  background: rgba(239,68,68,0.3);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(239,68,68,0.3);
}
.exp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 1rem; color: #94a3b8; }
.exp-spinner { width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: exp-spin 0.8s linear infinite; }
@keyframes exp-spin { to { transform: rotate(360deg); } }
.exp-error-display { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 1rem; text-align: center; padding: 2rem; }
.exp-error-display .error-icon { font-size: 3rem; }
.exp-error-display h2 { color: #f87171; margin: 0; }
.exp-error-display .error-msg { background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 0.5rem; color: #fca5a5; font-size: 0.85rem; max-width: 600px; overflow-x: auto; text-align: left; direction: ltr; white-space: pre-wrap; }
</style>
