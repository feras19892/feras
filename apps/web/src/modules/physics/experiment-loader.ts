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
  'interference': () => import('./experiments/interference/InterferenceExperiment.vue'),
  'diffraction': () => import('./experiments/diffraction/DiffractionExperiment.vue'),
  'polarization': () => import('./experiments/polarization/PolarizationExperiment.vue'),
  'straight-wire': () => import('./experiments/straight-wire/StraightWireExperiment.vue'),
  'circular-coil': () => import('./experiments/circular-coil/CircularCoilExperiment.vue'),
  'solenoid': () => import('./experiments/solenoid/SolenoidExperiment.vue'),
  'lorentz-force': () => import('./experiments/lorentz-force/LorentzForceExperiment.vue'),
  'torque-coil': () => import('./experiments/torque-coil/TorqueCoilExperiment.vue'),
  'faraday-law': () => import('./experiments/faraday-law/FaradayLawExperiment.vue'),
  'generator': () => import('./experiments/generator/GeneratorExperiment.vue'),
  'magnetic-flux': () => import('./experiments/magnetic-flux/MagneticFluxExperiment.vue'),
  'calorimetry': () => import('./experiments/calorimetry/CalorimetryExperiment.vue'),
  'ideal-gas': () => import('./experiments/ideal-gas/IdealGasExperiment.vue'),
  'resonance': () => import('./experiments/resonance/ResonanceExperiment.vue'),
  'speed-of-sound': () => import('./experiments/speed-of-sound/SpeedOfSoundExperiment.vue'),
  'wave-interference': () => import('./experiments/wave-interference/WaveInterferenceExperiment.vue'),
  'specific-heat': () => import('./experiments/specific-heat/SpecificHeatExperiment.vue'),
  'boyles-law': () => import('./experiments/boyles-law/BoylesLawExperiment.vue'),
  'thermal-expansion': () => import('./experiments/thermal-expansion/ThermalExpansionExperiment.vue'),
  'latent-heat': () => import('./experiments/latent-heat/LatentHeatExperiment.vue'),
  'analysis-calc': () => import('./experiments/analysis-calc/AnalysisCalcExperiment.vue'),
  'electric-workshop': () => import('./experiments/electric-workshop/ElectricWorkshop.vue'),
};

export function loadExperiment(id: string) {
  const loader = experimentMap[id];
  if (!loader) return null;
  return defineAsyncComponent({
    loader,
    loadingComponent: () => import('./experiment-template/ExperimentShell.vue'),
    errorComponent: () => import('./experiment-template/ExperimentShell.vue'),
    onError(error) {
      console.error(`Failed to load experiment "${id}":`, error);
    },
  });
}

export function isExperimentAvailable(id: string): boolean {
  return id in experimentMap;
}
