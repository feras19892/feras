import type { ChemicalEquation } from './chemEquations';

export const complexEquations: ChemicalEquation[] = [
  {
    reactants: ['cuso4', 'nh3'],
    products: ['cutetrammine', 'water'],
    equation: 'CuSO₄ + 4NH₃ → [Cu(NH₃)₄]SO₄',
    type: 'complex',
    color: '#3b82f6',
    opacity: 0.5,
    temperatureRise: 2,
  },
];
