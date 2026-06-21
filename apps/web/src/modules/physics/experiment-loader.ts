import { defineAsyncComponent } from 'vue';

// Maps experiment IDs to their Vue components
// This is the ONLY place that links catalog entries to actual implementations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const experimentMap: Record<string, () => Promise<any>> = {
  'spring': () => import('./experiments/spring/SpringExperiment.vue'),
  'pendulum': () => import('./experiments/pendulum/PendulumExperiment.vue'),
  'projectile': () => import('./experiments/projectile/ProjectileExperiment.vue'),
  'freefall': () => import('./experiments/freefall/FreeFallExperiment.vue'),
  'inclined': () => import('./experiments/inclined/InclinedExperiment.vue'),
  'collision': () => import('./experiments/collision/CollisionExperiment.vue'),
  'lever': () => import('./experiments/lever/LeverExperiment.vue'),
  'light-ray': () => import('./experiments/lightray/LightRayExperiment.vue'),
  'thin-lens': () => import('./experiments/thinlens/ThinLensExperiment.vue'),
  'mirrors': () => import('./experiments/mirror/MirrorExperiment.vue'),
  'prism-dispersion': () => import('./experiments/prism/PrismExperiment.vue'),
  'analysis-calc': () => import('./experiments/analysis-calc/AnalysisCalcExperiment.vue'),
};

export function loadExperiment(id: string) {
  const loader = experimentMap[id];
  if (!loader) return null;
  return defineAsyncComponent({
    loader,
    loadingComponent: () => import('./experiment-template/ExperimentShell.vue'),
  });
}

export function isExperimentAvailable(id: string): boolean {
  return id in experimentMap;
}
