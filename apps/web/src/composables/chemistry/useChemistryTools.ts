export interface LabItem {
  uid: string;
  id: string;
  name: string;
  icon: string;
  type: string;
  x: number;
  y: number;
}

export interface ToolDef {
  id: string;
  name: string;
  icon: string;
  type: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  items: ToolDef[];
}

export const glasswareSections: Section[] = [
  {
    id: 'containers',
    title: 'أدوات احتواء السوائل',
    icon: '🧪',
    items: [
      { id: 'test-tube-sm', name: 'أنبوب صغير', icon: '🧪', type: 'container' },
      { id: 'test-tube-md', name: 'أنبوب متوسط', icon: '🧪', type: 'container' },
      { id: 'test-tube-lg', name: 'أنبوب كبير', icon: '🧪', type: 'container' },
      { id: 'beaker-100', name: 'بيكر 100مل', icon: '🥣', type: 'container' },
      { id: 'beaker-250', name: 'بيكر 250مل', icon: '🥣', type: 'container' },
      { id: 'beaker-500', name: 'بيكر 500مل', icon: '🥣', type: 'container' },
      { id: 'erlenmeyer', name: 'دورق مخروطي', icon: '⚗️', type: 'container' },
      { id: 'volumetric-flask', name: 'دورق حجمي', icon: '🏺', type: 'container' },
      { id: 'round-bottom-flask', name: 'دورق مستدير', icon: '⚗️', type: 'container' },
      { id: 'sep-funnel', name: 'قمع استخلاص', icon: '🫗', type: 'container' },
    ],
  },
  {
    id: 'measuring',
    title: 'أدوات القياس الدقيق',
    icon: '📏',
    items: [
      { id: 'burette', name: 'سحاحة', icon: '🧴', type: 'measuring' },
      { id: 'pipette', name: 'ماصّة', icon: '💉', type: 'measuring' },
      { id: 'volumetric-pipette', name: 'ماصة حجمية', icon: '📐', type: 'measuring' },
      { id: 'grad-cylinder', name: 'مخبار مدرج', icon: '📏', type: 'measuring' },
    ],
  },
  {
    id: 'devices',
    title: 'أجهزة القياس والتحكم',
    icon: '📟',
    items: [
      { id: 'bunsen-burner', name: 'موقد بنسن', icon: '🔥', type: 'device' },
      { id: 'heating-mantle', name: 'غطاء تسخين', icon: '🧣', type: 'device' },
      { id: 'hot-plate', name: 'لوحة تسخين كهربائية', icon: '🔘', type: 'device' },
      { id: 'digital-balance', name: 'ميزان رقمي', icon: '⚖️', type: 'device' },
      { id: 'ph-meter', name: 'جهاز pH', icon: '📟', type: 'device' },
    ],
  },
  {
    id: 'stands',
    title: 'حوامل ومشابك',
    icon: '🏗️',
    items: [
      { id: 'retort-stand-assembly', name: 'حامل المختبر', icon: '🏗️', type: 'helper' },
    ],
  },
  {
    id: 'helpers',
    title: 'أدوات مساعدة',
    icon: '🛠️',
    items: [
      { id: 'test-tube-rack', name: 'حامل أنابيب', icon: '🧮', type: 'helper' },
      { id: 'spatula', name: 'ملعقة مخبرية', icon: '🥄', type: 'helper' },
      { id: 'watch-glass', name: 'زجاجة ساعة', icon: '🔍', type: 'helper' },
      { id: 'filter-funnel', name: 'قمع ترشيح', icon: '🔽', type: 'helper' },
      { id: 'rubber-stopper', name: 'سدادة مطاطية', icon: '⬛', type: 'helper' },
    ],
  },
  {
    id: 'thermometers',
    title: 'أدوات قياس الحرارة',
    icon: '🌡️',
    items: [
      { id: 'thermometer-mercury', name: 'ميزان حرارة زئبقي', icon: '🌡️', type: 'device' },
      { id: 'thermometer-digital', name: 'ميزان حرارة رقمي', icon: '📟', type: 'device' },
    ],
  },
];

export const chemicalSections: Section[] = [
  {
    id: 'acids',
    title: 'الأحماض',
    icon: '�',
    items: [
      { id: 'hcl', name: 'HCl', icon: '💧', type: 'acid' },
      { id: 'h2so4', name: 'H₂SO₄', icon: '💧', type: 'acid' },
      { id: 'hno3', name: 'HNO₃', icon: '💧', type: 'acid' },
      { id: 'ch3cooh', name: 'CH₃COOH', icon: '💧', type: 'acid' },
    ],
  },
  {
    id: 'bases',
    title: 'القواعد',
    icon: '🔵',
    items: [
      { id: 'naoh', name: 'NaOH', icon: '💧', type: 'base' },
      { id: 'koh', name: 'KOH', icon: '💧', type: 'base' },
      { id: 'nh4oh', name: 'NH₄OH', icon: '💧', type: 'base' },
    ],
  },
  {
    id: 'reagents',
    title: 'الكواشف والمحاليل',
    icon: '�',
    items: [
      { id: 'agno3', name: 'AgNO₃', icon: '💧', type: 'reagent' },
      { id: 'bacl2', name: 'BaCl₂', icon: '💧', type: 'reagent' },
      { id: 'k2cro4', name: 'K₂CrO₄', icon: '💧', type: 'reagent' },
      { id: 'ki', name: 'KI', icon: '💧', type: 'reagent' },
      { id: 'fecl3', name: 'FeCl₃', icon: '💧', type: 'reagent' },
      { id: 'edta', name: 'EDTA', icon: '💧', type: 'reagent' },
      { id: 'cuso4', name: 'CuSO₄', icon: '💧', type: 'reagent' },
      { id: 'kmno4', name: 'KMnO₄', icon: '💧', type: 'reagent' },
    ],
  },
  {
    id: 'indicators',
    title: 'الكواشف اللونية',
    icon: '🎨',
    items: [
      { id: 'phenolphthalein', name: 'فينوفتالين', icon: '🟣', type: 'indicator' },
      { id: 'methyl-orange', name: 'ميثيل برتقالي', icon: '🟠', type: 'indicator' },
      { id: 'bromothymol-blue', name: 'بروموثيمول أزرق', icon: '🔵', type: 'indicator' },
      { id: 'universal-indicator', name: 'دليل عالمي', icon: '🌈', type: 'indicator' },
      { id: 'starch', name: 'النشا', icon: '⭐', type: 'indicator' },
    ],
  },
  {
    id: 'solvents',
    title: 'المذيبات والسوائل',
    icon: '💧',
    items: [
      { id: 'water', name: 'H₂O', icon: '💧', type: 'solvent' },
      { id: 'ethanol', name: 'C₂H₅OH', icon: '💧', type: 'solvent' },
      { id: 'h2o2', name: 'H₂O₂', icon: '💧', type: 'solvent' },
    ],
  },
  {
    id: 'solids',
    title: 'المواد الصلبة',
    icon: '🧂',
    items: [
      { id: 'caco3', name: 'CaCO₃', icon: '⬜', type: 'solid' },
      { id: 'mg', name: 'Mg', icon: '⬛', type: 'solid' },
      { id: 'zn', name: 'Zn', icon: '🪨', type: 'solid' },
      { id: 'nahco3', name: 'NaHCO₃', icon: '⬜', type: 'solid' },
      { id: 'nh4cl', name: 'NH₄Cl', icon: '⬜', type: 'solid' },
      { id: 'nacl', name: 'NaCl', icon: '⬜', type: 'solid' },
    ],
  },
];

