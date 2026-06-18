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
    nameAr: 'الميكانيك',
    icon: '⚙️',
    color: '#06b6d4',
    description: 'تجارب الحركة والقوى والطاقة',
    experiments: [
      { id: 'spring', name: 'Spring Oscillation', nameAr: 'تجربة النابض', icon: '📐', difficulty: 'easy', tags: ['shm', 'harmonic'], route: '' },
      { id: 'pendulum', name: 'Pendulum', nameAr: 'البندول', icon: '🕰️', difficulty: 'easy', tags: ['shm', 'gravity'], route: '' },
      { id: 'projectile', name: 'Projectile Motion', nameAr: 'القذائف', icon: '🚀', difficulty: 'medium', tags: ['kinematics'], route: '' },
    ],
  },
  {
    id: 'waves',
    name: 'Waves & Optics',
    nameAr: 'الموجات والبصريات',
    icon: '🌊',
    color: '#8b5cf6',
    description: 'تجارب الموجات والانعكاس والانكسار',
    experiments: [
      { id: 'thin-lens', name: 'Thin Lens', nameAr: 'العدسة الرقيقة', icon: '🔍', difficulty: 'medium', tags: ['optics'], route: '' },
      { id: 'diffraction', name: 'Diffraction', nameAr: 'الحيود', icon: '🔦', difficulty: 'hard', tags: ['waves'], route: '' },
    ],
  },
  {
    id: 'heat',
    name: 'Heat & Thermodynamics',
    nameAr: 'الحرارة والديناميكا الحرارية',
    icon: '🔥',
    color: '#ef4444',
    description: 'تجارب الحرارة والغازات',
    experiments: [
      { id: 'ideal-gas', name: 'Ideal Gas', nameAr: 'الغاز المثالي', icon: '💨', difficulty: 'medium', tags: ['thermo'], route: '' },
      { id: 'calorimetry', name: 'Calorimetry', nameAr: 'قياس الحرارة', icon: '🌡️', difficulty: 'easy', tags: ['heat'], route: '' },
    ],
  },
  {
    id: 'electricity',
    name: 'Electricity & Circuits',
    nameAr: 'الكهرباء والدوائر',
    icon: '⚡',
    color: '#f59e0b',
    description: 'تجارب الدوائر الكهربائية',
    experiments: [
      { id: 'rc-circuit', name: 'RC Circuit', nameAr: 'دائرة RC', icon: '🔋', difficulty: 'medium', tags: ['circuits'], route: '' },
    ],
  },
  {
    id: 'electromagnetism',
    name: 'Electromagnetism',
    nameAr: 'الكهرومغناطيسية',
    icon: '🧲',
    color: '#22c55e',
    description: 'تجارب المجالات المغناطيسية',
    experiments: [
      { id: 'biot-savart', name: 'Biot-Savart', nameAr: 'بيوسافار', icon: '🧭', difficulty: 'hard', tags: ['magnetism'], route: '' },
      { id: 'faraday', name: 'Faraday Induction', nameAr: 'حث فارادي', icon: '⚡', difficulty: 'medium', tags: ['induction'], route: '' },
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
