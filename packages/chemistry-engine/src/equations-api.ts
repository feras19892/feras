import { equations } from './equations-data.js';
import type { ChemicalEquation } from './equations-data.js';

export function findEquation(reactantIds: string[]): ChemicalEquation | null {
  // Prefer ordered match (respects stoichiometry)
  const ordered = equations.find((eq) =>
    eq.reactants.length === reactantIds.length &&
    eq.reactants.every((r, i) => r === reactantIds[i])
  );
  if (ordered) return ordered;

  // Fallback: unordered match (backward compatibility)
  return equations.find((eq) =>
    eq.reactants.length === reactantIds.length &&
    eq.reactants.every((r) => reactantIds.includes(r))
  ) || null;
}

export function canReact(c1: string, c2: string): boolean {
  return equations.some((eq) =>
    eq.reactants.includes(c1) && eq.reactants.includes(c2)
  );
}
