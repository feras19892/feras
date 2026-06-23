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
      { id: 'digital-balance', name: 'ميزان رقمي', icon: '⚖️', type: 'device' },
      { id: 'ph-meter', name: 'جهاز pH', icon: '📟', type: 'device' },
    ],
  },
  {
    id: 'helpers',
    title: 'أدوات مساعدة',
    icon: '🛠️',
    items: [
    ],
  },
];

export const chemicalSections: Section[] = [
  {
    id: 'liquids',
    title: 'السوائل والأحماض والقواعد',
    icon: '💧',
    items: [
      { id: 'hcl', name: 'HCl', icon: '💧', type: 'acid' },
      { id: 'naoh', name: 'NaOH', icon: '💧', type: 'base' },
      { id: 'h2o', name: 'H₂O', icon: '💧', type: 'solvent' },
    ],
  },
  {
    id: 'solids',
    title: 'المواد الصلبة والمساحيق',
    icon: '🧂',
    items: [
      { id: 'caco3', name: 'CaCO₃', icon: '⬜', type: 'solid' },
      { id: 'mg', name: 'Mg', icon: '⬛', type: 'solid' },
      { id: 'spatula', name: 'ملعقة', icon: '🥄', type: 'helper' },
    ],
  },
  {
    id: 'indicators',
    title: 'الكواشف والأدلة',
    icon: '🎨',
    items: [
      { id: 'phenolphthalein', name: 'فينوفتالين', icon: '🟣', type: 'indicator' },
      { id: 'methyl-orange', name: 'ميثيل برتقالي', icon: '🟠', type: 'indicator' },
      { id: 'dropper', name: 'قطّارة', icon: '💧', type: 'helper' },
    ],
  },
];

