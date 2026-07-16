export interface ExperimentMeta {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  route: string;
  enabled?: boolean;
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
      { id: 'spring', name: 'Spring Oscillation', nameAr: 'experiments.expSpring', icon: '📐', difficulty: 'easy', tags: ['shm', 'harmonic'], route: '', enabled: true },
      { id: 'pendulum', name: 'Pendulum', nameAr: 'experiments.expPendulum', icon: '🕰️', difficulty: 'easy', tags: ['shm', 'gravity'], route: '', enabled: true },
      { id: 'projectile', name: 'Projectile Motion', nameAr: 'experiments.expProjectile', icon: '🚀', difficulty: 'medium', tags: ['kinematics', '2d'], route: '', enabled: true },
      { id: 'freefall', name: 'Free Fall', nameAr: 'experiments.expFreeFall', icon: '🍎', difficulty: 'easy', tags: ['gravity', 'kinematics'], route: '', enabled: true },
      { id: 'inclined', name: 'Inclined Plane', nameAr: 'experiments.expInclined', icon: '📐', difficulty: 'easy', tags: ['kinematics', 'forces', 'friction'], route: '', enabled: true },
      { id: 'collision', name: '1D Collision', nameAr: 'experiments.expCollision', icon: '💥', difficulty: 'medium', tags: ['momentum', 'energy', 'collision'], route: '', enabled: true },
      { id: 'lever', name: 'Force Resultant Balance', nameAr: 'experiments.expLever', icon: '⚖️', difficulty: 'easy', tags: ['equilibrium', 'torque', 'lever'], route: '', enabled: true },
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
      { id: 'light-ray', name: 'Light Ray Lab', nameAr: 'experiments.expLightRay', icon: '💡', difficulty: 'easy', tags: ['optics', 'reflection', 'refraction'], route: '', enabled: true },
      { id: 'thin-lens', name: 'Thin Lens', nameAr: 'experiments.expThinLens', icon: '🔍', difficulty: 'medium', tags: ['optics', 'lens'], route: '', enabled: true },
      { id: 'mirrors', name: 'Spherical Mirrors', nameAr: 'experiments.expMirrors', icon: '🪞', difficulty: 'medium', tags: ['optics', 'mirror'], route: '', enabled: true },
      { id: 'prism-dispersion', name: 'Prism Dispersion', nameAr: 'experiments.expPrism', icon: '🌈', difficulty: 'easy', tags: ['optics', 'dispersion'], route: '', enabled: true },
      { id: 'interference', name: 'Young\'s Interference', nameAr: 'experiments.expInterference', icon: '〰️', difficulty: 'medium', tags: ['waves', 'interference'], route: '', enabled: true },
      { id: 'diffraction', name: 'Diffraction', nameAr: 'experiments.expDiffraction', icon: '🔦', difficulty: 'hard', tags: ['waves', 'diffraction'], route: '', enabled: true },
      { id: 'polarization', name: 'Light Polarization', nameAr: 'experiments.expPolarization', icon: '🕶️', difficulty: 'hard', tags: ['waves', 'polarization'], route: '', enabled: true },
      { id: 'speed-of-sound', name: 'Speed of Sound', nameAr: 'experiments.expSpeedOfSound', icon: '🔔', difficulty: 'easy', tags: ['sound', 'waves'], route: '', enabled: true },
      { id: 'resonance', name: 'Standing Waves', nameAr: 'experiments.expResonance', icon: '🎵', difficulty: 'medium', tags: ['sound', 'resonance'], route: '', enabled: true },
      { id: 'wave-interference', name: 'Wave Interference', nameAr: 'experiments.expWaveInterference', icon: '〰️', difficulty: 'medium', tags: ['waves', 'interference'], route: '', enabled: true },
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
      { id: 'ideal-gas', name: 'Ideal Gas', nameAr: 'experiments.expIdealGas', icon: '💨', difficulty: 'medium', tags: ['thermo'], route: '', enabled: true },
      { id: 'calorimetry', name: 'Calorimetry', nameAr: 'experiments.expCalorimetry', icon: '🌡️', difficulty: 'easy', tags: ['heat'], route: '', enabled: true },
      { id: 'specific-heat', name: 'Specific Heat Capacity', nameAr: 'experiments.expSpecificHeat', icon: '🧪', difficulty: 'medium', tags: ['heat'], route: '', enabled: true },
      { id: 'boyles-law', name: "Boyle's Law", nameAr: 'experiments.expBoylesLaw', icon: '📉', difficulty: 'easy', tags: ['thermo'], route: '', enabled: true },
      { id: 'thermal-expansion', name: 'Thermal Expansion', nameAr: 'experiments.expThermalExpansion', icon: '📏', difficulty: 'easy', tags: ['heat'], route: '', enabled: true },
      { id: 'latent-heat', name: 'Latent Heat of Fusion', nameAr: 'experiments.expLatentHeat', icon: '🧊', difficulty: 'medium', tags: ['heat'], route: '', enabled: true },
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
      { id: 'electric-lab', name: 'Electric Lab', nameAr: 'experiments.expElectricLab', icon: '🔌', difficulty: 'medium', tags: ['circuits', 'DC'], route: '', enabled: true },
      { id: 'electric-workshop', name: 'Electric Workshop', nameAr: 'experiments.expElectricWorkshop', icon: '🛠️', difficulty: 'hard', tags: ['circuits', 'DC', 'AC', 'industrial', 'wiring'], route: '', enabled: true },
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
      { id: 'straight-wire', name: 'Straight Wire Field', nameAr: 'experiments.expStraightWire', icon: '📏', difficulty: 'medium', tags: ['magnetism', 'field'], route: '', enabled: true },
      { id: 'circular-coil', name: 'Circular Coil Field', nameAr: 'experiments.expCircularCoil', icon: '⭕', difficulty: 'medium', tags: ['magnetism', 'field'], route: '', enabled: true },
      { id: 'solenoid', name: 'Solenoid Field', nameAr: 'experiments.expSolenoid', icon: '🌀', difficulty: 'medium', tags: ['magnetism', 'field'], route: '', enabled: true },
      { id: 'lorentz-force', name: 'Lorentz Force', nameAr: 'experiments.expLorentzForce', icon: '⚡', difficulty: 'hard', tags: ['force', 'charge'], route: '', enabled: true },
      { id: 'torque-coil', name: 'Torque on Coil', nameAr: 'experiments.expTorqueCoil', icon: '🔄', difficulty: 'hard', tags: ['torque', 'motor'], route: '', enabled: true },
      { id: 'faraday-law', name: 'Faraday & Lenz Law', nameAr: 'experiments.expFaradayLaw', icon: '🔋', difficulty: 'medium', tags: ['induction', 'emf', 'lenz'], route: '', enabled: true },
      { id: 'generator', name: 'Electric Generator', nameAr: 'experiments.expGenerator', icon: '⚙️', difficulty: 'hard', tags: ['induction', 'generator'], route: '', enabled: true },
      { id: 'magnetic-flux', name: 'Magnetic Flux', nameAr: 'experiments.expMagneticFlux', icon: '🌐', difficulty: 'medium', tags: ['flux', 'field'], route: '', enabled: true },
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
