import type { AnalysisPayload } from '../../types/physics';

const PENDING_KEY = 'analysis-pending';

export function loadPendingPayload(): AnalysisPayload | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    const parsed = JSON.parse(raw);
    return parsed && parsed.payload ? (parsed.payload as AnalysisPayload) : null;
  } catch { return null; }
}

export function buildSpringDemo(): AnalysisPayload {
  const k = 20;
  const slope = (4 * Math.PI * Math.PI) / k;
  const masses = [0.05, 0.10, 0.15, 0.20, 0.25];
  const readings = masses.map((m) => {
    const T2 = slope * m;
    const T = Math.sqrt(T2);
    const kCalc = k;
    return { mass: m, T, T2, kCalc };
  });
  return {
    sourceExperiment: 'spring',
    sourceNameAr: 'تجربة الزنبرك',
    hasCalcTab: true,
    readings,
    columns: [
      { key: 'mass', label: 'm', unit: 'kg' },
      { key: 'T', label: 'T', unit: 's' },
      { key: 'T2', label: 'T²', unit: 's²' },
      { key: 'kCalc', label: 'k', unit: 'N/m' },
    ],
    equations: [
      { name: 'قانون الزنبرك', formula: 'T = 2π√(m/k)', variables: [{ symbol: 'T', label: 'الدورة' }, { symbol: 'm', label: 'الكتلة' }, { symbol: 'k', label: 'الثابت' }], solveFor: ['k'] },
      { name: 'الانحدار', formula: 'T² = (4π²/k) · m', variables: [{ symbol: 'T', label: 'الدورة' }, { symbol: 'm', label: 'الكتلة' }, { symbol: 'k', label: 'الثابت' }], solveFor: ['k'] },
    ],
    suggestedPlots: [
      { xKey: 'mass', yKey: 'T2', xLabel: 'm (kg)', yLabel: 'T² (s²)', type: 'scatter' as const },
    ],
    theoretical: { value: 20, label: 'k النظري', unit: 'N/m' },
    equipment: ['زنبرك', 'كتل معلقة', 'ساعة توقيت', 'مسطرة'],
  };
}

const defaultEquipment: Record<string, string[]> = {
  spring: ['زنبرك', 'كتل معلقة', 'ساعة توقيت', 'مسطرة'],
  pendulum: ['بندول', 'خيط', 'كرة', 'ساعة توقيت', 'مسطرة'],
  freefall: ['كرة', 'مسطرة', 'ساعة توقيت'],
  projectile: ['قاذفة', 'كرة', 'مسطرة', 'ساعة توقيت'],
  inclined: ['سطح مائل', 'كتلة', 'خيط', 'ساعة توقيت', 'مسطرة'],
  netforce: ['كتل', 'بكرة', 'خيط', 'مسطرة'],
  calorimetry: ['موقد', 'كوب حراري', 'ميزان', 'ثرمومتر'],
  'speed-of-sound': ['أنبوب', 'مطرقة هوائية', 'عداد تردد'],
  'thermal-expansion': ['محرارة', 'قضيب معدني', 'مسطرة', 'ثرمومتر'],
  'specific-heat': ['محرارة', 'سائل', 'ميزان', 'ثرمومتر'],
  'latent-heat': ['ثلج', 'ماء', 'ميزان', 'محرارة'],
  'ideal-gas': ['أسطوانة', 'مكبس', 'ميزان', 'ضغط'],
  prism: ['منشور', 'مصدر ضوء', 'شاشة', 'مسطرة'],
  thinlens: ['عدسة', 'شمعة', 'شاشة', 'مسطرة'],
  lightray: ['مصدر ضوء', 'مرآة', 'شاشة', 'مسطرة'],
  mirror: ['مصدر ضوء', 'مرآة', 'شاشة', 'مسطرة'],
  polarization: ['مصدر ضوء', 'polarizer', 'شاشة'],
  interference: ['مصدر ضوء', 'شقوق', 'شاشة', 'مسطرة'],
  'wave-interference': ['حوض ماء', 'مصدر موجات', 'مسطرة'],
  faraday: ['ملف', 'مغناطيس', 'جالفانومتر'],
  'magnetic-flux': ['ملف', 'مغناطيس', 'جالفانومتر'],
  'lorentz-force': ['موصل', 'مغناطيس', 'مصدر تيار'],
  'circular-coil': ['ملف دائري', 'مغناطيس', 'بوصلة'],
  solenoid: ['ملف', 'بطارية', 'بوصلة'],
  'straight-wire': ['سلك', 'بطارية', 'بوصلة'],
  'torque-coil': ['ملف', 'مغناطيس', 'بطارية'],
  resonance: ['سلك', 'موجات صوتية', 'مكبر صوت'],
};

export default defaultEquipment;
