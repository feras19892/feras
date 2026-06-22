export interface ChemistryExperimentMeta {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  route: string;
}

export interface ChemistryBranch {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  description: string;
  experiments: ChemistryExperimentMeta[];
}

function buildRoute(expId: string): string {
  return `/chemistry/${expId}`;
}

export const chemistryBranches: ChemistryBranch[] = [
  {
    id: 'general',
    name: 'General Chemistry',
    nameAr: 'experiments.branchChemistryGeneral',
    icon: '⚗️',
    color: '#ec4899',
    description: 'experiments.branchChemistryGeneralDesc',
    experiments: [
      { id: 'acid-base-titration', name: 'Acid-Base Titration', nameAr: 'experiments.expAcidBase', icon: '⚗️', difficulty: 'medium', tags: ['titration', 'acid', 'base'], route: '' },
    ],
  },
];

// Fill routes
for (const branch of chemistryBranches) {
  for (const exp of branch.experiments) {
    exp.route = buildRoute(exp.id);
  }
}

export function getChemistryExperiment(id: string): ChemistryExperimentMeta | undefined {
  return chemistryBranches.flatMap(b => b.experiments).find(e => e.id === id);
}

export function getAllChemistryExperiments(): ChemistryExperimentMeta[] {
  return chemistryBranches.flatMap(b => b.experiments);
}
