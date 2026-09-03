/**
 * Resolves a runtime source token to the canonical experiment_id stored in
 * the `experiments` table. This is the single source of truth for matching
 * the front-end "experiment" to the catalogued backend id.
 */

const PHYSICS_MAP: Record<string, string> = {
  'pendulum': 'physics-pendulum',
  'spring': 'physics-spring',
  'freefall': 'physics-freefall',
  'inclined': 'physics-inclined',
  'projectile': 'physics-projectile',
  'collision': 'physics-collision',
  'netforce': 'physics-netforce',
  'light-ray': 'physics-lightray',
  'mirrors': 'physics-mirror',
  'prism': 'physics-prism',
  'thin-lens': 'physics-thinlens',
  'interference': 'physics-interference',
  'diffraction': 'physics-diffraction',
  'polarization': 'physics-polarization',
  'resonance': 'physics-resonance',
  'wave-interference': 'physics-wave-interference',
  'grating': 'physics-grating',
  'boyles-law': 'physics-boyles-law',
  'ideal-gas': 'physics-ideal-gas',
  'calorimetry': 'physics-calorimetry',
  'specific-heat': 'physics-specific-heat',
  'latent-heat': 'physics-latent-heat',
  'thermal-expansion': 'physics-thermal-expansion',
  'speed-of-sound': 'physics-speed-of-sound',
  'rc-circuit': 'physics-rc-circuit',
  'biot-savart': 'physics-biot-savart',
  'faraday': 'physics-faraday',
};

const CHEMISTRY_MAP: Record<string, string> = {
  'titration': 'chemistry-titration',
  'reaction': 'chemistry-reaction',
  'ph': 'chemistry-ph',
};

const BLACKLIST = new Set(['titration-demo']);

export type ExperimentCategory = 'physics' | 'chemistry' | 'biology';

export function resolveExperimentId(
  category: ExperimentCategory,
  source: string | undefined | null,
): string | undefined {
  if (!source || BLACKLIST.has(source)) return undefined;

  if (category === 'biology') {
    return source.startsWith('biology-') ? source : `biology-${source}`;
  }

  if (category === 'chemistry') {
    return CHEMISTRY_MAP[source] ?? `chemistry-${source}`;
  }

  return PHYSICS_MAP[source] ?? `physics-${source}`;
}

export function isKnownExperiment(
  category: ExperimentCategory,
  source: string | undefined | null,
): boolean {
  if (!source) return false;
  if (BLACKLIST.has(source)) return false;
  return resolveExperimentId(category, source) !== undefined;
}
