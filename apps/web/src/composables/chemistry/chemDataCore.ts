import type { Chemical } from './chemDatabase';

export const chemDataCore: Chemical[] = [
  // ========== ACIDS ==========
  {
    id: 'hcl', nameAr: 'حمض كلور الماء', formula: 'HCl',
    category: 'acid', physicalState: 'liquid', concentration: 0.1, ph: 1.0,
    color: '#e0f2fe', opacity: 0.35, density: 1.02, molarMass: 36.46,
    boilingPoint: 110, hazardLevel: 'warning', description: 'حمض قوي، شفاف عديم اللون'
  },
  {
    id: 'h2so4', nameAr: 'حمض الكبريتيك', formula: 'H₂SO₄',
    category: 'acid', physicalState: 'liquid', concentration: 0.5, ph: 0.3,
    color: '#fef9c3', opacity: 0.4, density: 1.84, molarMass: 98.08,
    boilingPoint: 337, hazardLevel: 'danger', description: 'حمض قوي جداً، قابل للتآكل'
  },
  {
    id: 'hno3', nameAr: 'حمض النتريك', formula: 'HNO₃',
    category: 'acid', physicalState: 'liquid', concentration: 0.1, ph: 1.0,
    color: '#ffedd5', opacity: 0.35, density: 1.41, molarMass: 63.01,
    boilingPoint: 83, hazardLevel: 'danger', description: 'حمض أكسدة قوي'
  },
  {
    id: 'ch3cooh', nameAr: 'حمض الخليك', formula: 'CH₃COOH',
    category: 'acid', physicalState: 'liquid', concentration: 0.1, ph: 2.9,
    color: '#ecfccb', opacity: 0.3, density: 1.05, molarMass: 60.05,
    boilingPoint: 118, hazardLevel: 'caution', description: 'حمض ضعيف (الخل)'
  },

  // ========== BASES ==========
  {
    id: 'naoh', nameAr: 'هيدروكسيد الصوديوم', formula: 'NaOH',
    category: 'base', physicalState: 'liquid', concentration: 0.1, ph: 13.0,
    color: '#fef08a', opacity: 0.35, density: 1.04, molarMass: 40.00,
    boilingPoint: 1390, hazardLevel: 'warning', description: 'قاعدة قوية، شفافة عديمة اللون'
  },
  {
    id: 'koh', nameAr: 'هيدروكسيد البوتاسيوم', formula: 'KOH',
    category: 'base', physicalState: 'liquid', concentration: 0.1, ph: 13.0,
    color: '#fef9c3', opacity: 0.35, density: 1.05, molarMass: 56.11,
    boilingPoint: 1327, hazardLevel: 'warning', description: 'قاعدة قوية'
  },
  {
    id: 'nh4oh', nameAr: 'محلول الأمونيا', formula: 'NH₄OH',
    category: 'base', physicalState: 'liquid', concentration: 0.1, ph: 11.1,
    color: '#ecfccb', opacity: 0.3, density: 0.98, molarMass: 35.05,
    boilingPoint: 37, hazardLevel: 'caution', description: 'قاعدة ضعيفة'
  },

  // ========== SOLVENTS ==========
  {
    id: 'water', nameAr: 'ماء مقطر', formula: 'H₂O',
    category: 'solvent', physicalState: 'liquid', concentration: undefined, ph: 7.0,
    color: '#e0f2fe', opacity: 0.35, density: 1.0, molarMass: 18.02,
    boilingPoint: 100, hazardLevel: 'safe', description: 'مذيب عالمي محايد'
  },
  {
    id: 'ethanol', nameAr: 'إيثانول', formula: 'C₂H₅OH',
    category: 'solvent', physicalState: 'liquid', concentration: undefined, ph: 7.0,
    color: '#f0fdf4', opacity: 0.3, density: 0.79, molarMass: 46.07,
    boilingPoint: 78, hazardLevel: 'caution', description: 'مذيب عضوي، قابل للاشتعال'
  },

  // ========== SALTS ==========
  {
    id: 'nacl', nameAr: 'كلوريد الصوديوم', formula: 'NaCl',
    category: 'salt', physicalState: 'solid', concentration: 0.1, ph: 7.0,
    color: '#f1f5f9', opacity: 0.3, density: 2.16, molarMass: 58.44,
    boilingPoint: 1413, hazardLevel: 'safe', description: 'ملح الطعام، محايد'
  },
  {
    id: 'cuso4', nameAr: 'كبريتات النحاس', formula: 'CuSO₄',
    category: 'salt', physicalState: 'liquid', concentration: 0.1, ph: 4.5,
    color: '#3b82f6', opacity: 0.5, density: 1.12, molarMass: 159.61,
    boilingPoint: 650, hazardLevel: 'caution', description: 'محلول أزرق فاتح'
  },
  {
    id: 'kmno4', nameAr: 'برمنغنات البوتاسيوم', formula: 'KMnO₄',
    category: 'salt', physicalState: 'liquid', concentration: 0.02, ph: 7.0,
    color: '#7c1d1d', opacity: 0.55, density: 1.03, molarMass: 158.04,
    boilingPoint: 240, hazardLevel: 'warning', description: 'محلول بنفسجي غامق، مؤكسد قوي'
  },
  {
    id: 'na2co3', nameAr: 'كربونات الصوديوم', formula: 'Na₂CO₃',
    category: 'salt', physicalState: 'solid', concentration: 0.1, ph: 11.6,
    color: '#f8fafc', opacity: 0.3, density: 2.53, molarMass: 105.99,
    boilingPoint: 1600, hazardLevel: 'caution', description: 'قاعدي، أبيض'
  },
];
