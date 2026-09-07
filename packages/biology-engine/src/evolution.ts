/** أدوات محاكاة الانتخاب الطبيعي. */

export type Trait = 'fast' | 'camouflaged' | 'slow';
export type Environment = 'predators' | 'drought' | 'normal';

export interface Organism {
  id: number;
  trait: Trait;
  alive: boolean;
}

/** يولد احتمال بقاء كائن بناءً على بيئته وصفته. */
export function survivalChance(trait: Trait, env: Environment): number {
  if (env === 'predators') {
    if (trait === 'fast') return 0.9;
    if (trait === 'camouflaged') return 0.75;
    return 0.3;
  }
  if (env === 'drought') {
    if (trait === 'camouflaged') return 0.85;
    if (trait === 'slow') return 0.6;
    return 0.4;
  }
  return 0.8;
}

/** يطبق الانتخاب على مجموعة كائنات. */
export function applySelection(population: Organism[], env: Environment): Organism[] {
  return population.map((o) => ({
    ...o,
    alive: o.alive && Math.random() < survivalChance(o.trait, env),
  }));
}

/** ينتج جيلاً جديداً من الناجين مع احتمال طفرة. */
export function reproduce(
  survivors: Organism[],
  mutationRate = 0.1,
  maxPopulation = 30,
): Organism[] {
  const traits: Trait[] = ['fast', 'camouflaged', 'slow'];
  const offspring: Organism[] = [];
  for (const s of survivors) {
    const trait: Trait = Math.random() < mutationRate
      ? traits[Math.floor(Math.random() * 3)]
      : s.trait;
    offspring.push({
      id: Math.floor(Math.random() * 1e9),
      trait,
      alive: true,
    });
  }
  return offspring.slice(0, maxPopulation);
}

/** يحسب تكرارية كل صفة في المجموعة الحية. */
export function traitFrequencies(population: Organism[]): Record<Trait, number> {
  const alive = population.filter((o) => o.alive);
  const counts: Record<Trait, number> = { fast: 0, camouflaged: 0, slow: 0 };
  for (const o of alive) counts[o.trait] += 1;
  const total = alive.length || 1;
  return {
    fast: counts.fast / total,
    camouflaged: counts.camouflaged / total,
    slow: counts.slow / total,
  };
}
