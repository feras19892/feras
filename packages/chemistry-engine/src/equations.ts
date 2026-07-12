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
  gasType?: string;
  temperatureRise: number;
  indicatorEffect?: boolean;
  coefficients?: Record<string, number>;
}

const equations: ChemicalEquation[] = [
  // ===== NEUTRALIZATION (7) =====
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
    coefficients: { h2so4: 1, naoh: 2 },
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
  {
    reactants: ['h2so4', 'koh'],
    products: ['k2so4', 'water'],
    equation: 'H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O',
    type: 'neutralization',
    resultPh: 7.0,
    color: '#e0f2fe',
    opacity: 0.3,
    temperatureRise: 7,
    coefficients: { h2so4: 1, koh: 2 },
  },
  {
    reactants: ['hno3', 'naoh'],
    products: ['nano3', 'water'],
    equation: 'HNO₃ + NaOH → NaNO₃ + H₂O',
    type: 'neutralization',
    resultPh: 7.0,
    color: '#e0f2fe',
    opacity: 0.3,
    temperatureRise: 6,
  },
  {
    reactants: ['hcl', 'nh3'],
    products: ['nh4cl'],
    equation: 'HCl + NH₃ → NH₄Cl',
    type: 'neutralization',
    resultPh: 5.5,
    color: '#fef3c7',
    opacity: 0.35,
    temperatureRise: 4,
  },

  // ===== PRECIPITATION (9) =====
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
  {
    reactants: ['cuso4', 'naoh'],
    products: ['cuoh2', 'na2so4'],
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
    type: 'precipitation',
    coefficients: { cuso4: 1, naoh: 2 },
    color: '#bae6fd',
    opacity: 0.4,
    precipitate: true,
    precipitateColor: '#1e90ff',
    temperatureRise: 2,
  },
  {
    reactants: ['fecl3', 'naoh'],
    products: ['feoh3', 'nacl'],
    equation: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',
    type: 'precipitation',
    coefficients: { fecl3: 1, naoh: 3 },
    color: '#f1f5f9',
    opacity: 0.3,
    precipitate: true,
    precipitateColor: '#b45309',
    temperatureRise: 2,
  },
  {
    reactants: ['pbno3', 'ki'],
    products: ['pbi2', 'kno3'],
    equation: 'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃',
    type: 'precipitation',
    coefficients: { pbno3: 1, ki: 2 },
    color: '#f1f5f9',
    opacity: 0.3,
    precipitate: true,
    precipitateColor: '#facc15',
    temperatureRise: 1,
  },
  {
    reactants: ['na2co3', 'cacl2'],
    products: ['caco3', 'nacl'],
    equation: 'Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl',
    type: 'precipitation',
    color: '#f1f5f9',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#e2e8f0',
    temperatureRise: 1,
  },
  {
    reactants: ['mgso4', 'naoh'],
    products: ['mgoh2', 'na2so4'],
    equation: 'MgSO₄ + 2NaOH → Mg(OH)₂↓ + Na₂SO₄',
    type: 'precipitation',
    coefficients: { mgso4: 1, naoh: 2 },
    color: '#ecfccb',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#f1f5f9',
    temperatureRise: 1,
  },
  {
    reactants: ['znso4', 'naoh'],
    products: ['znoh2', 'na2so4'],
    equation: 'ZnSO₄ + 2NaOH → Zn(OH)₂↓ + Na₂SO₄',
    type: 'precipitation',
    coefficients: { znso4: 1, naoh: 2 },
    color: '#ecfccb',
    opacity: 0.5,
    precipitate: true,
    precipitateColor: '#f1f5f9',
    temperatureRise: 1,
  },

  // ===== GAS EVOLUTION (6) =====
  {
    reactants: ['caco3', 'hcl'],
    products: ['cacl2', 'co2', 'water'],
    equation: 'CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O',
    type: 'gas',
    resultPh: 1.0,
    coefficients: { caco3: 1, hcl: 2 },
    color: '#e0f2fe',
    opacity: 0.4,
    gasEvolution: true,
    gasType: 'CO₂',
    temperatureRise: 2,
  },
  {
    reactants: ['na2co3', 'hcl'],
    products: ['nacl', 'co2', 'water'],
    equation: 'Na₂CO₃ + 2HCl → 2NaCl + CO₂↑ + H₂O',
    type: 'gas',
    resultPh: 1.0,
    coefficients: { na2co3: 1, hcl: 2 },
    color: '#e0f2fe',
    opacity: 0.4,
    gasEvolution: true,
    gasType: 'CO₂',
    temperatureRise: 2,
  },
  {
    reactants: ['nahco3', 'hcl'],
    products: ['nacl', 'co2', 'water'],
    equation: 'NaHCO₃ + HCl → NaCl + CO₂↑ + H₂O',
    type: 'gas',
    resultPh: 1.0,
    color: '#e0f2fe',
    opacity: 0.4,
    gasEvolution: true,
    gasType: 'CO₂',
    temperatureRise: 1,
  },
  {
    reactants: ['zn', 'hcl'],
    products: ['zncl2', 'h2'],
    equation: 'Zn + 2HCl → ZnCl₂ + H₂↑',
    type: 'gas',
    resultPh: 1.0,
    coefficients: { zn: 1, hcl: 2 },
    color: '#e0f2fe',
    opacity: 0.4,
    gasEvolution: true,
    gasType: 'H₂',
    temperatureRise: 8,
  },
  {
    reactants: ['fe', 'hcl'],
    products: ['fecl2', 'h2'],
    equation: 'Fe + 2HCl → FeCl₂ + H₂↑',
    type: 'gas',
    resultPh: 1.0,
    coefficients: { fe: 1, hcl: 2 },
    color: '#e0f2fe',
    opacity: 0.4,
    gasEvolution: true,
    gasType: 'H₂',
    temperatureRise: 6,
  },
  {
    reactants: ['h2so4', 'na2co3'],
    products: ['na2so4', 'co2', 'water'],
    equation: 'H₂SO₄ + Na₂CO₃ → Na₂SO₄ + CO₂↑ + H₂O',
    type: 'gas',
    resultPh: 1.0,
    color: '#e0f2fe',
    opacity: 0.4,
    gasEvolution: true,
    gasType: 'CO₂',
    temperatureRise: 3,
  },

  // ===== REDOX (3) =====
  {
    reactants: ['kmno4', 'h2o2'],
    products: ['mno2', 'o2', 'koh', 'water'],
    equation: '2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂↑ + 2KOH + 2H₂O',
    type: 'redox',
    resultPh: 7.0,
    coefficients: { kmno4: 2, h2o2: 3 },
    color: '#d4a574',
    opacity: 0.5,
    gasEvolution: true,
    gasType: 'O₂',
    precipitate: true,
    precipitateColor: '#5c4033',
    temperatureRise: 10,
  },
  {
    reactants: ['feso4', 'kmno4'],
    products: ['fe2(so4)3', 'mnso4', 'k2so4', 'water'],
    equation: '10FeSO₄ + 2KMnO₄ + 8H₂SO₄ → 5Fe₂(SO₄)₃ + 2MnSO₄ + K₂SO₄ + 8H₂O',
    type: 'redox',
    coefficients: { feso4: 10, kmno4: 2 },
    color: '#fde047',
    opacity: 0.45,
    temperatureRise: 5,
  },
  {
    reactants: ['ki', 'h2o2'],
    products: ['i2', 'koh'],
    equation: '2KI + H₂O₂ → I₂ + 2KOH',
    type: 'redox',
    coefficients: { ki: 2, h2o2: 1 },
    color: '#a16207',
    opacity: 0.5,
    temperatureRise: 4,
  },

  // ===== COMPLEX (1) =====
  {
    reactants: ['cuso4', 'nh3'],
    products: ['cutetrammine'],
    equation: 'CuSO₄ + 4NH₃ → [Cu(NH₃)₄]SO₄',
    type: 'complex',
    coefficients: { cuso4: 1, nh3: 4 },
    color: '#1d4ed8',
    opacity: 0.5,
    temperatureRise: 2,
  },
];

export function findEquation(reactantIds: string[]): ChemicalEquation | null {
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
