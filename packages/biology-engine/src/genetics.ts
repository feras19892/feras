/** أدوات وراثة مندلية. */

export type Genotype = 'AA' | 'Aa' | 'aa';

/** ينتج النمط الجيني للأبناء من تزاوج أبوين. */
export function punnettSquare(parent1: Genotype, parent2: Genotype): Genotype[] {
  const p1Alleles = parent1.split('') as Array<'A' | 'a'>;
  const p2Alleles = parent2.split('') as Array<'A' | 'a'>;
  const offspring: Genotype[] = [];
  for (const a1 of p1Alleles) {
    for (const a2 of p2Alleles) {
      const pair = a1 === 'A' && a2 === 'A'
        ? 'AA'
        : a1 === 'a' && a2 === 'a'
        ? 'aa'
        : 'Aa';
      offspring.push(pair as Genotype);
    }
  }
  return offspring;
}

/** يحسب نسبة النمط الجيني في نتاج تزاوج. */
export function genotypeRatio(offspring: Genotype[]): Record<Genotype, number> {
  const counts: Record<Genotype, number> = { AA: 0, Aa: 0, aa: 0 };
  for (const g of offspring) counts[g] += 1;
  const total = offspring.length || 1;
  return {
    AA: counts.AA / total,
    Aa: counts.Aa / total,
    aa: counts.aa / total,
  };
}

/** يحسب النمط الظاهري (صفة سائدة A أو متنحية a). */
export function phenotype(g: Genotype): 'dominant' | 'recessive' {
  return g === 'aa' ? 'recessive' : 'dominant';
}
