// Chemical equation database: describes what happens when chemicals mix
export interface ChemicalEquation {
  reactants: string[];
  products: string[];
  equation: string;
  type: 'neutralization' | 'precipitation' | 'redox' | 'complex' | 'gas' | 'other';
  resultPh?: number;
  color: string;
  opacity: number;
  precipitate?: boolean;
  precipitateColor?: string;
  gasEvolution?: boolean;
  temperatureRise: number;
  indicatorEffect?: boolean;
}

import { neutralizationEquations } from './chemEquationsNeutralization';
import { precipitationEquations } from './chemEquationsPrecipitation';
import { gasEquations } from './chemEquationsGas';
import { redoxEquations } from './chemEquationsRedox';
import { complexEquations } from './chemEquationsComplex';

const equations: ChemicalEquation[] = [
  ...neutralizationEquations,
  ...precipitationEquations,
  ...gasEquations,
  ...redoxEquations,
  ...complexEquations,
];

export function findEquation(reactantIds: string[]): ChemicalEquation | null {
  return equations.find((eq) =>
    eq.reactants.every((r) => reactantIds.includes(r))
  ) || null;
}

export function canReact(c1: string, c2: string): boolean {
  return equations.some((eq) =>
    eq.reactants.includes(c1) && eq.reactants.includes(c2)
  );
}
