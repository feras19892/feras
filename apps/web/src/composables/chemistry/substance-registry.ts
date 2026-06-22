export interface ChemicalSubstance {
  id: string
  nameAr: string
  formula: string
  type: 'acid' | 'base' | 'indicator' | 'solvent'
  color: string        // hex color for liquid rendering
  ph: number
  molarity: number    // mol/L default concentration
  density: number      // g/ml
}

export const SUBSTANCES: ChemicalSubstance[] = [
  {
    id: 'hcl',
    nameAr: 'حمض كلور الماء',
    formula: 'HCl',
    type: 'acid',
    color: '#e0f2fe', // very pale blue (clear acid)
    ph: 1.0,
    molarity: 0.1,
    density: 1.0,
  },
  {
    id: 'naoh',
    nameAr: 'هيدروكسيد الصوديوم',
    formula: 'NaOH',
    type: 'base',
    color: '#fef3c7', // pale yellow (clear base)
    ph: 13.0,
    molarity: 0.1,
    density: 1.0,
  },
  {
    id: 'water',
    nameAr: 'ماء مقطر',
    formula: 'H₂O',
    type: 'solvent',
    color: '#f0f9ff', // nearly transparent
    ph: 7.0,
    molarity: 0,
    density: 1.0,
  },
  {
    id: 'phenolphthalein',
    nameAr: 'فينول فثالين',
    formula: 'C₂₀H₁₄O₄',
    type: 'indicator',
    color: '#ffffff', // clear in acid/neutral
    ph: 7.0,         // shows pink at ph > 8.2
    molarity: 0.001,
    density: 1.0,
  },
]

export function getSubstance(id: string): ChemicalSubstance | undefined {
  return SUBSTANCES.find(s => s.id === id)
}

export function getSubstancesByType(type: ChemicalSubstance['type']): ChemicalSubstance[] {
  return SUBSTANCES.filter(s => s.type === type)
}

// Color change for phenolphthalein based on pH
export function phenolphthaleinColor(ph: number): string {
  if (ph < 8.2) return '#ffffff' // clear/colorless
  if (ph < 10.0) return '#fbcfe8' // pale pink
  return '#ec4899' // strong pink/magenta
}
