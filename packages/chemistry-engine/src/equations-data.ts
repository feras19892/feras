// Chemical equation database: describes what happens when chemicals mix
import { neutralizationEquations, precipitationEquations } from './equations-neutralization-precipitation.js';
import { gasEquations, redoxEquations, complexEquations } from './equations-gas-redox-complex.js';

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
  gasType?: string;
  temperatureRise: number;
  indicatorEffect?: boolean;
  coefficients?: Record<string, number>;
}

export const equations: ChemicalEquation[] = [
  ...neutralizationEquations,
  ...precipitationEquations,
  ...gasEquations,
  ...redoxEquations,
  ...complexEquations,
];
