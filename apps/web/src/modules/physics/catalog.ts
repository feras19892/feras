export interface ExperimentMeta {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  route: string;
}

export interface Branch {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  description: string;
  experiments: ExperimentMeta[];
}

function buildRoute(branchId: string, expId: string): string {
  return `/physics/${branchId}/${expId}`;
}

export const branches: Branch[] = [
  {
    id: 'mechanics',
    name: 'Mechanics',
    nameAr: 'experiments.branchMechanics',
    icon: '⚙️',
    color: '#06b6d4',
    description: 'experiments.branchMechanicsDesc',
    experiments: [
      { id: 'spring', name: 'Spring Oscillation', nameAr: 'experiments.expSpring', icon: '📐', difficulty: 'easy', tags: ['shm', 'harmonic'], route: '' },
      { id: 'pendulum', name: 'Pendulum', nameAr: 'experiments.expPendulum', icon: '🕰️', difficulty: 'easy', tags: ['shm', 'gravity'], route: '' },
      { id: 'projectile', name: 'Projectile Motion', nameAr: 'experiments.expProjectile', icon: '🚀', difficulty: 'medium', tags: ['kinematics', '2d'], route: '' },
      { id: 'freefall', name: 'Free Fall', nameAr: 'experiments.expFreeFall', icon: '🍎', difficulty: 'easy', tags: ['gravity', 'kinematics'], route: '' },
      { id: 'inclined', name: 'Inclined Plane', nameAr: 'experiments.expInclined', icon: '📐', difficulty: 'easy', tags: ['kinematics', 'forces', 'friction'], route: '' },
      { id: 'collision', name: '1D Collision', nameAr: 'experiments.expCollision', icon: '💥', difficulty: 'medium', tags: ['momentum', 'energy', 'collision'], route: '' },
      { id: 'lever', name: 'Lever Balance', nameAr: 'experiments.expLever', icon: '⚖️', difficulty: 'easy', tags: ['equilibrium', 'torque', 'lever'], route: '' },
    ],
  },
  {
    id: 'waves',
    name: 'Waves & Optics',
    nameAr: 'experiments.branchWaves',
    icon: '🌊',
    color: '#8b5cf6',
    description: 'experiments.branchWavesDesc',
    experiments: [
      { id: 'light-ray', name: 'Light Ray Lab', nameAr: 'experiments.expLightRay', icon: '💡', difficulty: 'easy', tags: ['optics', 'reflection', 'refraction'], route: '' },
      { id: 'thin-lens', name: 'Thin Lens', nameAr: 'experiments.expThinLens', icon: '🔍', difficulty: 'medium', tags: ['optics', 'lens'], route: '' },
      { id: 'mirrors', name: 'Spherical Mirrors', nameAr: 'experiments.expMirrors', icon: '🪞', difficulty: 'medium', tags: ['optics', 'mirror'], route: '' },
      { id: 'prism-dispersion', name: 'Prism Dispersion', nameAr: 'experiments.expPrism', icon: '🌈', difficulty: 'easy', tags: ['optics', 'dispersion'], route: '' },
      { id: 'interference', name: 'Young\'s Interference', nameAr: 'experiments.expInterference', icon: '〰️', difficulty: 'medium', tags: ['waves', 'interference'], route: '' },
      { id: 'diffraction', name: 'Diffraction', nameAr: 'experiments.expDiffraction', icon: '🔦', difficulty: 'hard', tags: ['waves', 'diffraction'], route: '' },
      { id: 'polarization', name: 'Light Polarization', nameAr: 'experiments.expPolarization', icon: '🕶️', difficulty: 'hard', tags: ['waves', 'polarization'], route: '' },
      { id: 'speed-of-sound', name: 'Speed of Sound', nameAr: 'experiments.expSpeedOfSound', icon: '🔔', difficulty: 'easy', tags: ['sound', 'waves'], route: '' },
      { id: 'resonance', name: 'Standing Waves', nameAr: 'experiments.expResonance', icon: '🎵', difficulty: 'medium', tags: ['sound', 'resonance'], route: '' },
    ],
  },
  {
    id: 'heat',
    name: 'Heat & Thermodynamics',
    nameAr: 'experiments.branchHeat',
    icon: '🔥',
    color: '#ef4444',
    description: 'experiments.branchHeatDesc',
    experiments: [
      { id: 'ideal-gas', name: 'Ideal Gas', nameAr: 'experiments.expIdealGas', icon: '💨', difficulty: 'medium', tags: ['thermo'], route: '' },
      { id: 'calorimetry', name: 'Calorimetry', nameAr: 'experiments.expCalorimetry', icon: '🌡️', difficulty: 'easy', tags: ['heat'], route: '' },
    ],
  },
  {
    id: 'electricity',
    name: 'Electricity & Circuits',
    nameAr: 'experiments.branchElectricity',
    icon: '⚡',
    color: '#f59e0b',
    description: 'experiments.branchElectricityDesc',
    experiments: [
      { id: 'rc-circuit', name: 'RC Circuit', nameAr: 'experiments.expRcCircuit', icon: '🔋', difficulty: 'medium', tags: ['circuits'], route: '' },
    ],
  },
  {
    id: 'electromagnetism',
    name: 'Electromagnetism',
    nameAr: 'experiments.branchElectromagnetism',
    icon: '🧲',
    color: '#22c55e',
    description: 'experiments.branchElectromagnetismDesc',
    experiments: [
      { id: 'biot-savart', name: 'Biot-Savart', nameAr: 'experiments.expBiotSavart', icon: '🧭', difficulty: 'hard', tags: ['magnetism'], route: '' },
      { id: 'faraday', name: 'Faraday Induction', nameAr: 'experiments.expFaraday', icon: '⚡', difficulty: 'medium', tags: ['induction'], route: '' },
    ],
  },
];

// Fill routes after branches array is built
for (const branch of branches) {
  for (const exp of branch.experiments) {
    exp.route = buildRoute(branch.id, exp.id);
  }
}

export function getBranch(id: string): Branch | undefined {
  return branches.find((b) => b.id === id);
}

export function getExperiment(branchId: string, expId: string): ExperimentMeta | undefined {
  const branch = getBranch(branchId);
  return branch?.experiments.find((e) => e.id === expId);
}

export function getAllExperiments(): ExperimentMeta[] {
  return branches.flatMap((b) => b.experiments);
}
