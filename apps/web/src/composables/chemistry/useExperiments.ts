import { items, liquidMap, buretteMap, buretteTotalConsumedMap } from './useChemistryLab';
import { isContainer, isReactionVessel, isBurette } from './chemLabIds';

export interface ExperimentStep {
  id: number;
  text: string;
  completed?: boolean;
}

export interface ExperimentTheory {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface Experiment {
  id: string;
  nameAr: string;
  description: string;
  icon: string;
  steps: ExperimentStep[];
  theory?: ExperimentTheory;
}

export interface TitrationReading {
  n: number;
  volume: number;
  ph: number | null;
  color: string;
}

export interface ReportData {
  experimentName: string;
  consumedVolume: number;
  acidVolume: number;
  baseMolarity: number;
  calculatedAcidMolarity: number;
  phAtEquivalence: number | null;
  colorAtEquivalence: string;
  readingsCount: number;
}

// Helper: does any item of type checker have chemicalId?
function hasChemicalIn(checker: (id: string) => boolean, chemicalId: string) {
  return items.value.some((item) => {
    if (!checker(item.id)) return false;
    if (isBurette(item.id)) {
      const b = buretteMap[item.uid];
      return b && b.chemicalId === chemicalId && b.volume > 0;
    }
    const liq = liquidMap[item.uid];
    return liq && liq.chemicalId === chemicalId && liq.volume > 0;
  });
}

function hasValveOpenBurette(chemicalId: string) {
  return Object.values(buretteMap).some((b) => b.valveOpen && b.chemicalId === chemicalId && b.volume > 0);
}

// Helper: check if specific tool exists
function hasTool(id: string): boolean {
  return items.value.some((i) => i.id === id);
}

// Helper: check if ANY tool matching prefix exists
function hasAnyTool(idPrefix: string): boolean {
  return items.value.some((i) => i.id === idPrefix || i.id.startsWith(idPrefix + '-'));
}

// Per-experiment validation
const validators: Record<string, (experiment: Experiment) => boolean[]> = {
  'neutralization-hcl-naoh': (exp) => validateTitration(exp, 'hcl', 'naoh'),
  'neutralization-ch3cooh-naoh': (exp) => validateTitration(exp, 'ch3cooh', 'naoh'),
};

function validateTitration(exp: Experiment, acidId: string, baseId: string): boolean[] {
  const c = new Array(exp.steps.length).fill(false);
  // Step 1: Check required tools exist in workspace (flexible: any beaker, any test-tube, any pipette)
  c[0] = hasTool('burette') && hasAnyTool('beaker') && hasAnyTool('test-tube') && (hasTool('pipette') || hasTool('volumetric-pipette'));
  // Step 2: Base in burette
  c[1] = hasChemicalIn(isBurette, baseId);
  // Step 3: Acid in any beaker/container
  c[2] = hasChemicalIn(isContainer, acidId);
  // Step 4: Phenolphthalein in test tube
  c[3] = hasChemicalIn(isContainer, 'phenolphthalein');
  // Step 5: Indicator transferred to reaction vessel (indicator + acid present in same vessel)
  c[4] = items.value.some((item) => {
    if (!isReactionVessel(item.id)) return false;
    const liq = liquidMap[item.uid];
    if (!liq || liq.volume <= 0) return false;
    const hasAcidAsBase = liq.chemicalId === acidId;
    const hasIndicatorInArray = liq.indicators && liq.indicators.includes('phenolphthalein');
    const hasAcidInReactants = liq.reactants && liq.reactants[acidId] > 0;
    const hasPhenInReactants = liq.reactants && liq.reactants['phenolphthalein'] > 0;
    return (hasAcidAsBase && hasIndicatorInArray) || (hasAcidInReactants && hasPhenInReactants);
  });
  // Step 6: Burette valve is open with base
  c[5] = hasValveOpenBurette(baseId);
  // Step 7: Color changed to pink in reaction vessel (pH > 8.2 with phenolphthalein)
  // Must have consumed enough base to be realistic (~30+ mL for 50 mL acid at same conc)
  c[6] = items.value.some((item) => {
    if (!isReactionVessel(item.id)) return false;
    const liq = liquidMap[item.uid];
    if (!liq || liq.ph === null || liq.ph <= 8.2) return false;
    if (!liq.indicators || !liq.indicators.includes('phenolphthalein')) return false;
    // Require at least 30 mL total consumed to prevent false positive on first drops
    let totalConsumed = 0;
    for (const item of items.value) {
      if (isBurette(item.id)) {
        totalConsumed += buretteTotalConsumedMap[item.uid] || 0;
      }
    }
    return totalConsumed >= 30;
  });
  // Step 8: Auto-completes when step 7 is done
  c[7] = c[6];
  return c;
}

// Validator: checks workspace state and returns which step indices (0-based) are completed
export function validateExperimentSteps(experiment: Experiment): boolean[] {
  if (!experiment.steps.length) return [];
  const validator = validators[experiment.id];
  if (validator) return validator(experiment);
  // Default: all false
  return new Array(experiment.steps.length).fill(false);
}

export const experiments: Experiment[] = [
  {
    id: 'neutralization-hcl-naoh',
    nameAr: 'تعيير حمض HCl بقاعدة NaOH',
    description: 'تجربة تعيير حمض-قاعدة باستخدام الفينوفتالين ككاشف',
    icon: '🧪',
    steps: [
      { id: 1, text: 'أضف الأدوات اللازمة: سحاحة (50 مL)، بيكر (250 مL)، أنبوب اختبار (25 مL)، ماصة.', completed: false },
      { id: 2, text: 'املأ السحاحة بـ 50 مL من المحلول القلوي (NaOH 0.1 M).', completed: false },
      { id: 3, text: 'أضف 50 مL من حمض الهيدروكلوريك (HCl 0.1 M) إلى البيكر.', completed: false },
      { id: 4, text: 'أضف 5 مL من الفينوفتالين إلى أنبوب الاختبار.', completed: false },
      { id: 5, text: 'باستخدام الماصة، انقل 3–5 قطرات من الكاشف إلى البيكر.', completed: false },
      { id: 6, text: 'افتح صمام السحاحة تدريجياً وأسقط قطرة بقطرة.', completed: false },
      { id: 7, text: 'راقب تغير اللون إلى الوردي عند نقطة التكافؤ (pH ≈ 8.2).', completed: false },
      { id: 8, text: 'سجل حجم NaOH المستهلك لحساب التركيز (متوقع ~50 مL).', completed: false },
    ],
    theory: {
      title: 'التعيير الحمضي-القلوي: HCl مع NaOH',
      sections: [
        {
          heading: '🎯 الهدف من التجربة',
          content: 'تحديد تركيز حمض الهيدروكلوريك (HCl) بمعايرته بمحلول هيدروكسيد الصوديوم (NaOH) ذي تركيز معلوم (0.1 M) باستخدام الفينوفتالين ككاشف لوني. التعيير (Titration) هو تقنية تحليلية كمية لتحديد تركيز محلول مجهول بإضافة محلول معيار (معروف التركيز) تدريجياً حتى يتم الاستهلاك الكيميائي الكامل (نقطة التكافؤ).'
        },
        {
          heading: '🧪 المكونات والمحاليل',
          content: '• حمض الهيدروكلوريك (HCl): حمض قوي، يتأين تماماً في الماء ليعطي أيونات H⁺ و Cl⁻. تركيزه مجهول وهو ما نريد حسابه.\n• هيدروكسيد الصوديوم (NaOH): قاعدة قوية، تتأين تماماً لأيونات Na⁺ و OH⁻. تركيزها معلوم (0.1 M) وهي المعيار.\n• الفينوفتالين (C₂₀H₁₄O₄): كاشف لوني عضوي يتغير لونه حسب الـ pH. عديم اللون في الوسط الحمضي (pH < 8.2) ووردي في الوسط القلوي (pH > 8.2).\n• ماء مقطر: وسط التفاعل والمذيب.'
        },
        {
          heading: '⚗️ المعادلة الكيميائية',
          content: 'HCl + NaOH → NaCl + H₂O\n\nهذا تفاعل حيادية (Neutralization) حيث يتفاعل أيون الهيدروجين H⁺ من الحمض مع أيون الهيدروكسيد OH⁻ من القاعدة لتكوين الماء.\n\nالنسبة المولية: 1 مول HCl يتفاعل مع 1 مول NaOH (تفاعل 1:1).'
        },
        {
          heading: '📐 القانون والحسابات',
          content: 'في نقطة التكافؤ (Equivalence Point):\n\nمولات الحمض = مولات القاعدة\n\nMₐ × Vₐ = Mᵦ × Vᵦ\n\nحيث:\n• Mₐ = تركيز الحمض (مجهول)\n• Vₐ = حجم الحمض المستخدم (50 mL)\n• Mᵦ = تركيز القاعدة المعيار (0.1 M)\n• Vᵦ = حجم القاعدة المستهلكة (من السحاحة)\n\nمثال: إذا استهلكت 47.5 mL من NaOH 0.1 M:\nMₐ = (0.1 × 47.5) / 50 = 0.095 M'
        },
        {
          heading: '📏 نقطة النهاية ونقطة التكافؤ',
          content: '• نقطة التكافؤ (Equivalence Point): النقطة التي تتساوى فيها مولات الحمض تماماً مع مولات القاعدة (pH = 7.0 لتفاعل قوي/قوي).\n• نقطة النهاية (End Point): النقطة التي يتغير فيها لون الكاشف (للفينوفتالين عند pH ≈ 8.2–10.0).\n\nالفرق بينهما صغير جداً في تفاعل قوي/قوي، لذا الفينوفتالين كاشف مناسب.'
        },
        {
          heading: '🔬 لماذا نستفيد من هذه التجربة؟',
          content: '• تحديد تركيز المحاليل: أساسي في الصناعة والمختبرات التحليلية.\n• ضبط الجودة: التحقق من تركيز المواد الكيميائية قبل الاستخدام.\n• الأساس لمعايرة أخرى: بمجمع معرفة تركيز HCl، يمكن معايرة قواعد مجهولة.\n• تطبيقات عملية: تحليل الأحماض في المنتجات الغذائية، ضبط pH المستحضرات الصيدلانية، مراقبة النفايات الصناعية.'
        },
        {
          heading: '⚠️ احتياطات السلامة',
          content: '• HCl: حمض قوي، يسبب حروقاً جلدية وتهيجاً في العينين. استخدم قفازات ونظارات واقية.\n• NaOH: قاعدة قوية، تسبب تآكلاً في الجلد. تجنب ملامسة الجلد.\n• الفينوفتالين: كحولي، تجنب الابتلاع.\n• التهوية: اعمل تحت شفاط كيميائي أو في مكان جيد التهوية.'
        }
      ]
    }
  },
  {
    id: 'neutralization-ch3cooh-naoh',
    nameAr: 'تعيير حمض الخليك بقاعدة NaOH',
    description: 'تجربة تعيير حمض ضعيف (CH₃COOH) بقاعدة قوية باستخدام الفينوفتالين',
    icon: '🍶',
    steps: [
      { id: 1, text: 'أضف الأدوات اللازمة: سحاحة (50 مL)، بيكر (250 مL)، أنبوب اختبار (25 مL)، ماصة.', completed: false },
      { id: 2, text: 'املأ السحاحة بـ 50 مL من المحلول القلوي (NaOH 0.1 M).', completed: false },
      { id: 3, text: 'أضف 50 مL من حمض الخليك (CH₃COOH 0.1 M) إلى البيكر.', completed: false },
      { id: 4, text: 'أضف 5 مL من الفينوفتالين إلى أنبوب الاختبار.', completed: false },
      { id: 5, text: 'باستخدام الماصة، انقل 3–5 قطرات من الكاشف إلى البيكر.', completed: false },
      { id: 6, text: 'افتح صمام السحاحة تدريجياً وأسقط قطرة بقطرة.', completed: false },
      { id: 7, text: 'راقب تغير اللون إلى الوردي عند نقطة التكافؤ (pH ≈ 8.2).', completed: false },
      { id: 8, text: 'سجل حجم NaOH المستهلك لحساب التركيز (متوقع ~50 مL).', completed: false },
    ],
    theory: {
      title: 'التعيير الحمضي-القلوي: CH₃COOH مع NaOH',
      sections: [
        {
          heading: '🎯 الهدف من التجربة',
          content: 'تحديد تركيز حمض الخليك (CH₃COOH) بمعايرته بمحلول هيدروكسيد الصوديوم (NaOH) ذي تركيز معلوم (0.1 M) باستخدام الفينوفتالين ككاشف لوني. حمض الخليك حمض ضعيف (pKa ≈ 4.76)، لذا نقطة التكافؤ تكون في وسط قلوي (pH ≈ 8.2) — الفينوفتالين كاشف مناسب.'
        },
        {
          heading: '🧪 المكونات والمحاليل',
          content: '• حمض الخليك (CH₃COOH): حمض ضعيف، يتأين جزئياً في الماء. تركيزه مجهول.\n• هيدروكسيد الصوديوم (NaOH): قاعدة قوية، تركيزها معلوم (0.1 M).\n• الفينوفتالين: كاشف لوني، عديم اللون في الحمض (pH < 8.2) ووردي في القلوية (pH > 8.2).\n• ماء مقطر: وسط التفاعل.'
        },
        {
          heading: '⚗️ المعادلة الكيميائية',
          content: 'CH₃COOH + NaOH → CH₃COONa + H₂O\n\nتفاعل حيادية (Neutralization) لحمض ضعيف مع قاعدة قوية.\n\nالنسبة المولية: 1 مول CH₃COOH يتفاعل مع 1 مول NaOH (تفاعل 1:1).'
        },
        {
          heading: '📐 القانون والحسابات',
          content: 'في نقطة التكافؤ:\n\nمولات الحمض = مولات القاعدة\n\nMₐ × Vₐ = Mᵦ × Vᵦ\n\nحيث:\n• Mₐ = تركيز حمض الخليك (مجهول)\n• Vₐ = حجم الحمض (50 mL)\n• Mᵦ = تركيز NaOH المعيار (0.1 M)\n• Vᵦ = حجم القاعدة المستهلكة (من السحاحة)'
        },
        {
          heading: '📏 لماذا pH التكافؤ ≈ 8.2؟',
          content: '• في تفاعل حمض ضعيف + قاعدة قوية، يتكون ملح قاعدي (CH₃COONa).\n• أيون CH₃COO⁻ يتفاعل مع الماء (hydrolysis): CH₃COO⁻ + H₂O ⇌ CH₃COOH + OH⁻\n• هذا يرفع pH فوق 7.\n• عند نقطة التكافؤ: pH = 7 + ½(pKa + log C) ≈ 8.2–8.7'
        },
        {
          heading: '🔬 لماذا نستفيد من هذه التجربة؟',
          content: '• تحديد تركيز الأحماض الضعيفة في الصناعات الغذائية (خل، عصير).\n• ضبط الجودة في مصانع المخللات والصلصات.\n• فهم سلوك الأحماض الضعيفة مقابل القوية.'
        },
        {
          heading: '⚠️ احتياطات السلامة',
          content: '• CH₃COOH: حمض ضعيف لكنه يسبب تهيجاً. تجنب ملامسة العينين.\n• NaOH: قاعدة قوية، تسبب حروقاً. استخدم قفازات.\n• التهوية الجيدة ضرورية.'
        }
      ]
    }
  },
];
