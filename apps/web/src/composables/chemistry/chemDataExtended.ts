import type { Chemical } from './chemDatabase';

export const chemDataExtended: Chemical[] = [
  // ========== INDICATORS ==========
  {
    id: 'phenolphthalein', nameAr: 'فينوفتالين', formula: 'C₂₀H₁₄O₄',
    category: 'indicator', physicalState: 'liquid', concentration: 0.001, ph: undefined,
    color: '#fdf4ff', opacity: 0.3, density: 1.28, molarMass: 318.33,
    hazardLevel: 'safe', description: 'يتحول إلى وردي عند pH > 8.2'
  },
  {
    id: 'methyl-orange', nameAr: 'ميثيل برتقالي', formula: 'C₁₄H₁₄N₃NaO₃S',
    category: 'indicator', physicalState: 'liquid', concentration: 0.001, ph: undefined,
    color: '#fb923c', opacity: 0.4, density: 1.15, molarMass: 327.33,
    hazardLevel: 'safe', description: 'يتحول إلى أحمر عند pH < 3.1'
  },
  {
    id: 'bromothymol-blue', nameAr: 'بروموثيمول أزرق', formula: 'C₂₇H₂₈Br₂O₅S',
    category: 'indicator', physicalState: 'liquid', concentration: 0.001, ph: undefined,
    color: '#3b82f6', opacity: 0.4, density: 1.2, molarMass: 624.38,
    hazardLevel: 'safe', description: 'أزرق عند pH > 7.6، أصفر عند pH < 6.0'
  },

  // ========== SOLIDS ==========
  {
    id: 'caco3', nameAr: 'كربونات الكالسيوم', formula: 'CaCO₃',
    category: 'solid', physicalState: 'solid', concentration: undefined, ph: undefined,
    color: '#f1f5f9', opacity: 0.3, density: 2.71, molarMass: 100.09,
    hazardLevel: 'safe', description: 'مسحوق أبيض'
  },
  {
    id: 'mg', nameAr: 'مغنيسيوم', formula: 'Mg',
    category: 'solid', physicalState: 'solid', concentration: undefined, ph: undefined,
    color: '#94a3b8', opacity: 0.5, density: 1.74, molarMass: 24.31,
    hazardLevel: 'caution', description: 'معدن فضي خفيف'
  },
  {
    id: 'zn', nameAr: 'زنك', formula: 'Zn',
    category: 'solid', physicalState: 'solid', concentration: undefined, ph: undefined,
    color: '#cbd5e1', opacity: 0.5, density: 7.14, molarMass: 65.38,
    hazardLevel: 'safe', description: 'معدن رمادي فضي'
  },

  // ========== ADVANCED SALTS / REAGENTS ==========
  {
    id: 'agno3', nameAr: 'نترات الفضة', formula: 'AgNO₃',
    category: 'salt', physicalState: 'liquid', concentration: 0.05, ph: 6.0,
    color: '#e0e7ff', opacity: 0.4, density: 1.03, molarMass: 169.87,
    boilingPoint: 444, hazardLevel: 'warning', description: 'محلول شفاف، يُستخدم في ترسيب الكلوريدات'
  },
  {
    id: 'fecl3', nameAr: 'كلوريد الحديد الثلاثي', formula: 'FeCl₃',
    category: 'salt', physicalState: 'liquid', concentration: 0.1, ph: 2.0,
    color: '#fde047', opacity: 0.45, density: 1.15, molarMass: 162.20,
    boilingPoint: 315, hazardLevel: 'warning', description: 'محلول أصفر-بني'
  },
  {
    id: 'bacl2', nameAr: 'كلوريد الباريوم', formula: 'BaCl₂',
    category: 'salt', physicalState: 'liquid', concentration: 0.1, ph: 7.0,
    color: '#f1f5f9', opacity: 0.35, density: 1.05, molarMass: 208.23,
    boilingPoint: 1560, hazardLevel: 'warning', description: 'محلول شفاف، يُستخدم في ترسيب الكبريتات'
  },
  {
    id: 'k2cro4', nameAr: 'كرومات البوتاسيوم', formula: 'K₂CrO₄',
    category: 'salt', physicalState: 'liquid', concentration: 0.1, ph: 9.0,
    color: '#facc15', opacity: 0.5, density: 1.07, molarMass: 194.19,
    boilingPoint: 1119, hazardLevel: 'danger', description: 'محلول أصفر، كاشف لترسيب الفضة'
  },
  {
    id: 'ki', nameAr: 'يوديد البوتاسيوم', formula: 'KI',
    category: 'salt', physicalState: 'liquid', concentration: 0.1, ph: 7.0,
    color: '#fef9c3', opacity: 0.35, density: 1.04, molarMass: 166.00,
    boilingPoint: 1330, hazardLevel: 'caution', description: 'محلول شفاف عديم اللون'
  },
  {
    id: 'edta', nameAr: 'محلول EDTA', formula: 'C₁₀H₁₆N₂O₈',
    category: 'salt', physicalState: 'liquid', concentration: 0.01, ph: 10.0,
    color: '#e0e7ff', opacity: 0.35, density: 1.02, molarMass: 292.24,
    boilingPoint: 240, hazardLevel: 'safe', description: 'محلول تعيير للكالسيوم والمغنيسيوم'
  },
  {
    id: 'nahco3', nameAr: 'بيكربونات الصوديوم', formula: 'NaHCO₃',
    category: 'salt', physicalState: 'solid', concentration: 0.1, ph: 8.3,
    color: '#f8fafc', opacity: 0.3, density: 2.20, molarMass: 84.01,
    boilingPoint: 851, hazardLevel: 'safe', description: 'مسحوق أبيض، قاعدي ضعيف'
  },
  {
    id: 'nh4cl', nameAr: 'كلوريد الأمونيوم', formula: 'NH₄Cl',
    category: 'salt', physicalState: 'solid', concentration: 0.1, ph: 5.5,
    color: '#f1f5f9', opacity: 0.3, density: 1.53, molarMass: 53.49,
    boilingPoint: 520, hazardLevel: 'caution', description: 'مسحوق أبيض، حامضي ضعيف'
  },
  {
    id: 'h2o2', nameAr: 'بيروكسيد الهيدروجين', formula: 'H₂O₂',
    category: 'acid', physicalState: 'liquid', concentration: 0.3, ph: 4.5,
    color: '#e0e7ff', opacity: 0.3, density: 1.01, molarMass: 34.01,
    boilingPoint: 150, hazardLevel: 'warning', description: 'مؤكسد قوي، 6%'
  },
  {
    id: 'starch', nameAr: 'محلول النشا', formula: '(C₆H₁₀O₅)ₙ',
    category: 'indicator', physicalState: 'liquid', concentration: 0.001, ph: undefined,
    color: '#fefce8', opacity: 0.3, density: 1.02, molarMass: 162.14,
    hazardLevel: 'safe', description: 'كاشف ليود → أزرق داكن'
  },

  // ========== GASES ==========
  {
    id: 'o2', nameAr: 'أكسجين', formula: 'O₂',
    category: 'gas', physicalState: 'gas', concentration: undefined, ph: undefined,
    color: '#e0f2fe', opacity: 0.2, density: 0.0013, molarMass: 32.00,
    boilingPoint: -183, hazardLevel: 'safe', description: 'غاز عديم اللون يدعم الاحتراق'
  },
  {
    id: 'h2', nameAr: 'هيدروجين', formula: 'H₂',
    category: 'gas', physicalState: 'gas', concentration: undefined, ph: undefined,
    color: '#f0fdf4', opacity: 0.2, density: 0.00009, molarMass: 2.02,
    boilingPoint: -253, hazardLevel: 'warning', description: 'غاز قابل للاشتعال'
  },
  {
    id: 'co2', nameAr: 'ثاني أكسيد الكربون', formula: 'CO₂',
    category: 'gas', physicalState: 'gas', concentration: undefined, ph: undefined,
    color: '#f1f5f9', opacity: 0.2, density: 0.002, molarMass: 44.01,
    boilingPoint: -78, hazardLevel: 'caution', description: 'غاز عديم اللون'
  },
];
