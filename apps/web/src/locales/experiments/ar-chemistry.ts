export const arChemistry = {
  // Branch & Experiment names
  branchChemistry: 'الكيمياء',
  branchChemistryGeneral: 'الكيمياء العامة',
  branchChemistryGeneralDesc: 'تجارب كيميائية افتراضية',
  branchChemistryDesc: 'مختبر الكيمياء الافتراضي',
  expAcidBase: 'معايرة الحمض والقاعدة',

  // Chemistry Lab UI
  chemTitle: 'مختبر الكيمياء',
  chemInventory: 'المواد الكيميائية',
  chemTools: 'الأدوات',
  chemReadings: 'القراءات',
  chemInstructions: 'التعليمات',
  chemReport: 'التقرير',
  chemShowAll: 'عرض الكل',

  // Substances
  substanceHCl: 'حمض كلور الماء',
  substanceNaOH: 'هيدروكسيد الصوديوم',
  substanceWater: 'ماء مقطر',
  substancePhenolphthalein: 'فينول فثالين',
  substanceHClFormula: 'HCl',
  substanceNaOHFormula: 'NaOH',
  substanceWaterFormula: 'H₂O',

  // Tools
  toolBeaker: 'دورق',
  toolErlenmeyer: 'مخبار مخروطي',
  toolBurette: 'سحاحة',
  toolBurner: 'موقد بنزن',
  toolPhMeter: 'مقياس pH',
  toolThermometer: 'ميزان حرارة',
  toolStirrer: 'مقلب',

  // Readings
  readingPh: 'الحموضة',
  readingTemp: 'درجة الحرارة',
  readingVolume: 'الحجم',
  readingColor: 'اللون',
  readingPhUnit: '',
  readingTempUnit: '°C',
  readingVolumeUnit: 'مل',

  // Instructions
  chemStep: 'خطوة',
  chemStepOf: 'من',
  chemNextStep: 'التالي',
  chemPrevStep: 'السابق',
  chemInstructionWelcome: 'مرحباً بك في مختبر الكيمياء. اختر سيناريو للبدء.',
  chemInstructionStep1: 'الخطوة 1: ضع 25 مل من الحمض في المخبار المخروطي.',
  chemInstructionStep2: 'الخطوة 2: أضف 3 قطرات من مؤشر الفينول فثالين.',
  chemInstructionStep3: 'الخطوة 3: املأ السحاحة بمحلول القاعدة.',
  chemInstructionStep4: 'الخطوة 4: أضف القاعدة قطرة بقطرة حتى يتغير اللون إلى الزهري.',
  chemInstructionSuccess: 'ممتاز! لقد أكملت المعايرة بنجاح.',

  // Success / Status
  chemStatusReady: 'جاهز — اختر مادة لبدء التجربة',
  chemStatusRunning: 'التجربة قيد التشغيل',
  chemStatusPaused: 'متوقفة مؤقتاً',
  chemStatusSuccess: 'نجاح! التجربة مكتملة',
  chemStatusFailed: 'لم تتحقق الشروط — حاول مرة أخرى',

  // Actions
  chemAdd: 'إضافة',
  chemPour: 'صب',
  chemHeat: 'تسخين',
  chemCool: 'تبريد',
  chemMix: 'مزج',
  chemMeasure: 'قياس',
  chemIgnite: 'إشعال',
  chemExtinguish: 'إطفاء',
  chemDrop: 'قطرة',
  chemHold: 'ثبات',
  chemRelease: 'تحرير',

  // Labels
  labelConcentration: 'التركيز',
  labelMolarity: 'المولارية',
  labelAmount: 'الكمية',
  labelDrop: 'قطرة',
  labelDrops: 'قطرات',

  // Units
  unitMl: 'مل',
  unitL: 'لتر',
  unitMol: 'مول',
  unitMolar: 'مول/لتر',
  unitPercent: '%',

  // Scenario
  scenarioTitle: 'السيناريو',
  scenarioTarget: 'الهدف',
  scenarioHints: 'تلميحات',

  // Report
  reportObservations: 'المشاهدات',
  reportConclusion: 'الاستنتاج',
  reportExport: 'تصدير التقرير',
  reportSubmit: 'إرسال التقرير',

  // Substance types
  chemTypeAcid: 'حمض',
  chemTypeBase: 'قاعدة',
  chemTypeIndicator: 'مؤشر',
  chemTypeSolvent: 'مذيب',

  // Camera / Controls
  chemFreeze: 'تجميد الحركة',
  chemUnlock: 'تحرير الحركة',

  // Difficulty
  difficultyEasy: 'سهل',
  difficultyMedium: 'متوسط',
  difficultyHard: 'صعب',

  // Errors / Validation
  chemErrorNoGlassware: 'اختر وعاء زجاجي أولاً',
  chemErrorNoSubstance: 'اختر مادة كيميائية',
  chemErrorEmptyBurette: 'السحاحة فارغة',
  chemErrorOverflow: 'الوعاء ممتلئ',
} as const
