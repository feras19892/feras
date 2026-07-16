import type { ChemicalEquation } from './chemEquations';

export const redoxEquations: ChemicalEquation[] = [
  {
    reactants: ['kmno4', 'h2o2'],
    products: ['mn2+', 'o2', 'water'],
    equation: '2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂↑ + 2KOH + 2H₂O',
    type: 'redox',
    resultPh: 7.0,
    color: '#c084fc',
    opacity: 0.45,
    gasEvolution: true,
    temperatureRise: 10,
  },
  {
    reactants: ['feso4', 'kmno4'],
    products: ['fe3+', 'mn2+', 'water'],
    equation: '10FeSO₄ + 2KMnO₄ + 8H₂SO₄ → 5Fe₂(SO₄)₃ + 2MnSO₄ + K₂SO₄ + 8H₂O',
    type: 'redox',
    color: '#fde047',
    opacity: 0.45,
    temperatureRise: 5,
  },
  {
    reactants: ['ki', 'h2o2'],
    products: ['i2', 'water'],
    equation: '2KI + H₂O₂ → I₂ + 2KOH',
    type: 'redox',
    color: '#fde047',
    opacity: 0.5,
    temperatureRise: 4,
  },
];
