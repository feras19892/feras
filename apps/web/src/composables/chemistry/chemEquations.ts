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

const equations: ChemicalEquation[] = [
  // ===== NEUTRALIZATION =====
  {
    reactants: ['hcl', 'naoh'],
    products: ['nacl', 'water'],
    equation: 'HCl + NaOH → NaCl + H₂O',
    type: 'neutralization',
    resultPh: 7.0,
    color: '#e0f2fe',
    opacity: 0.3,
    temperatureRise: 5,
  },
  {
    reactants: ['h2so4', 'naoh'],
    products: ['na2so4', 'water'],
    equation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
    type: 'neutralization',
    resultPh: 7.0,
    color: '#e0f2fe',
    opacity: 0.3,
    temperatureRise: 8,
  },
  {
    reactants: ['hcl', 'koh'],
    products: ['kcl', 'water'],
    equation: 'HCl + KOH → KCl + H₂O',
    type: 'neutralization',
    resultPh: 7.0,
    color: '#e0f2fe',
    opacity: 0.3,
    temperatureRise: 5,
  },
  {
    reactants: ['ch3cooh', 'naoh'],
    products: ['ch3coona', 'water'],
    equation: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    type: 'neutralization',
    resultPh: 8.2,
    color: '#fce7f3',
    opacity: 0.35,
    temperatureRise: 3,
  },

  // ===== PRECIPITATION =====
  {
    reactants: ['agno3', 'nacl'],
    products: ['agcl', 'nano3'],
    equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
    type: 'precipitation',
    resultPh: 6.0,
    color: '#e0e7ff',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#f1f5f9',
    temperatureRise: 1,
  },
  {
    reactants: ['agno3', 'hcl'],
    products: ['agcl', 'hno3'],
    equation: 'AgNO₃ + HCl → AgCl↓ + HNO₃',
    type: 'precipitation',
    resultPh: 1.0,
    color: '#e0e7ff',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#f1f5f9',
    temperatureRise: 1,
  },
  {
    reactants: ['bacl2', 'h2so4'],
    products: ['baso4', 'hcl'],
    equation: 'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl',
    type: 'precipitation',
    resultPh: 1.0,
    color: '#fef9c3',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#f1f5f9',
    temperatureRise: 2,
  },

  // ===== REDOX / GAS =====
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
    reactants: ['caco3', 'hcl'],
    products: ['cacl2', 'co2', 'water'],
    equation: 'CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O',
    type: 'gas',
    resultPh: 1.0,
    color: '#e0f2fe',
    opacity: 0.4,
    gasEvolution: true,
    temperatureRise: 2,
  },

  // ===== COMPLEX / SPECIAL =====
  {
    reactants: ['cuso4', 'naoh'],
    products: ['cuoh2', 'na2so4'],
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
    type: 'precipitation',
    color: '#86efac',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#15803d',
    temperatureRise: 2,
  },
  {
    reactants: ['fecl3', 'naoh'],
    products: ['feoh3', 'nacl'],
    equation: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',
    type: 'precipitation',
    color: '#fca5a5',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#7f1d1d',
    temperatureRise: 2,
  },
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
