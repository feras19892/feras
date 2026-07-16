import type { ComponentType } from './types'

export interface ComponentSpec {
  properties: { label: string; value: string }[]
  mechanism: { step: string; description: string }[]
  formula?: string
  formulaDesc?: string
  applications: string[]
}

export const componentSpecs: Record<string, ComponentSpec> = {
  battery: {
    properties: [
      { label: 'النوع', value: 'مصدر جهد مستمر (DC)' },
      { label: 'الوحدة', value: 'فولت (V)' },
      { label: 'القطبية', value: '+ و −' },
      { label: 'المقاومة الداخلية', value: '≈ 0 (مثالي)' },
      { label: 'الأطراف', value: '2 (موجب وسالب)' },
    ],
    mechanism: [
      { step: '١', description: 'البطارية تولّد فرق جهد ثابت V بين طرفيها' },
      { step: '٢', description: 'يدفع التيار I عبر الدائرة الخارجية' },
      { step: '٣', description: 'التيار يخرج من الطرف الموجب ويعود للسالب' },
      { step: '٤', description: 'الجهد يبقى ثابتاً مهما تغير الحمل (مثالي)' },
    ],
    formula: 'V = ثابت، I = V / R_total',
    formulaDesc: 'الجهد ثابت، التيار يعتمد على مقاومة الحمل',
    applications: ['تغذية الدوائر', 'أجهزة محمولة', 'أنظمة الطاقة الاحتياطية'],
  },

  resistor: {
    properties: [
      { label: 'النوع', value: 'مقاومة ثابتة' },
      { label: 'الوحدة', value: 'أوم (Ω)' },
      { label: 'العلاقة', value: 'خطية (Ohmic)' },
      { label: 'الأطراف', value: '2' },
      { label: 'القدرة القصوى', value: 'تعتمد على الحجم' },
    ],
    mechanism: [
      { step: '١', description: 'المقاومة تعيق مرور التيار الكهربائي' },
      { step: '٢', description: 'ينخفض الجهد عبر المقاومة بمقدار V = I × R' },
      { step: '٣', description: 'تستهلك قدرة P = I² × R تتحول لحرارة' },
      { step: '٤', description: 'العلاقة خطية: التيار يتناسب مع الجهد' },
    ],
    formula: 'V = I × R، P = I² × R',
    formulaDesc: 'قانون أوم: الجهد = التيار × المقاومة',
    applications: ['تحديد التيار', 'تقسيم الجهد', 'حماية المكونات', 'توليد الحرارة'],
  },

  capacitor: {
    properties: [
      { label: 'النوع', value: 'مكثف (يخزن شحنة)' },
      { label: 'الوحدة', value: 'ميكروفاراد (µF)' },
      { label: 'السلوك DC', value: 'دائرة مفتوحة في الاستقرار' },
      { label: 'السلوك AC', value: 'مقاومة تعتمد على التردد' },
      { label: 'الأطراف', value: '2' },
    ],
    mechanism: [
      { step: '١', description: 'يخزن الشحنة الكهربائية بين لوحين موصلين' },
      { step: '٢', description: 'عند الشحن: التيار يدخل حتى يمتلئ' },
      { step: '٣', description: 'بعد الشحن الكامل: يمنع مرور التيار (open)' },
      { step: '٤', description: 'ثابت الزمن: τ = R × C' },
    ],
    formula: 'Q = C × V، τ = R × C',
    formulaDesc: 'الشحنة = السعة × الجهد، ثابت الزمن = المقاومة × السعة',
    applications: ['تنعيم الجهد', 'دوائر التأخير', 'فلترة الإشارات', 'بدء المحركات'],
  },

  inductor: {
    properties: [
      { label: 'النوع', value: 'ملف (يخزن طاقة مغناطيسية)' },
      { label: 'الوحدة', value: 'ميلي هنري (mH)' },
      { label: 'السلوك DC', value: 'دائرة مغلقة في الاستقرار' },
      { label: 'السلوك AC', value: 'يعيق التيار المتردد' },
      { label: 'الأطراف', value: '2' },
    ],
    mechanism: [
      { step: '١', description: 'يولّد مجالاً مغناطيسياً عند مرور التيار' },
      { step: '٢', description: 'يقاوم التغير المفاجئ في التيار' },
      { step: '٣', description: 'في DC المستقر: يعمل كسلك (short circuit)' },
      { step: '٤', description: 'في AC: المقاومة الحثية XL = 2πfL' },
    ],
    formula: 'V = L × (dI/dt)، XL = 2πfL',
    formulaDesc: 'الجهد = الحث × معدل تغير التيار',
    applications: ['فلترة الضوضاء', 'دوائر الرنين', 'المحولات', 'أنظمة الطاقة'],
  },

  diode: {
    properties: [
      { label: 'النوع', value: 'دايود شبه موصل' },
      { label: 'الوحدة', value: 'فولت (V) — جهد الانحياز' },
      { label: 'الاتجاه', value: 'يسمح بتيار واحد (Anode → Cathode)' },
      { label: 'جهد العتبة', value: '≈ 0.7V (Silicon)' },
      { label: 'الأطراف', value: '2 (Anode, Cathode)' },
    ],
    mechanism: [
      { step: '١', description: 'يسمح بمرور التيار في اتجاه واحد فقط' },
      { step: '٢', description: 'يجب تجاوز جهد العتبة (≈0.7V) للتوصيل' },
      { step: '٣', description: 'في الانحياز العكسي: يمنع التيار' },
      { step: '٤', description: 'الحل غير خطي: يستخدم Newton-Raphson' },
    ],
    formula: 'I = Is × (e^(V/ηVt) - 1)',
    formulaDesc: 'معادلة Shockley: تيار انحياز غير خطي',
    applications: ['تقويم التيار', 'حماية من الانعكاس', 'دوائر المنطق', 'LED'],
  },

  switch: {
    properties: [
      { label: 'النوع', value: 'مفتاح فتح/إغلاق يدوي' },
      { label: 'الوحدة', value: '—' },
      { label: 'الحالات', value: 'مفتوح (OFF) / مغلق (ON)' },
      { label: 'المقاومة ON', value: '≈ 0 (سلك)' },
      { label: 'المقاومة OFF', value: '∞ (مفتوح)' },
    ],
    mechanism: [
      { step: '١', description: 'مفتوح: يقطع الدائرة، لا يمر تيار' },
      { step: '٢', description: 'مغلق: يكمل الدائرة، يمر التيار بحرية' },
      { step: '٣', description: 'نقر مزدوج لتبديل الحالة' },
      { step: '٤', description: 'يستخدم للتحكم في تشغيل/إيقاف الدائرة' },
    ],
    formula: 'I = 0 (مفتوح)، V = 0 (مغلق)',
    formulaDesc: 'مفتوح = لا تيار، مغلق = لا جهد',
    applications: ['تحكم بالإضاءة', 'تشغيل/إيقاف', 'مفاتيح الأمان', 'اختيار المسار'],
  },

  lamp: {
    properties: [
      { label: 'النوع', value: 'مصباح حراري (Incandescent)' },
      { label: 'الوحدة', value: 'فولت (V) — الجهد المقنن' },
      { label: 'السلوك', value: 'يضيء بقدرة P = V × I' },
      { label: 'السطوع', value: 'يعتمد على القدرة المستهلكة' },
      { label: 'الأطراف', value: '2' },
    ],
    mechanism: [
      { step: '١', description: 'يمر التيار عبر فتيل تسخين' },
      { step: '٢', description: 'الفتيل يسخن ويضيء (حرارة → ضوء)' },
      { step: '٣', description: 'السطوع يتناسب مع القدرة P = V × I' },
      { step: '٤', description: 'جهد زائد → احتراق المصباح' },
    ],
    formula: 'P = V × I، Brightness ∝ P',
    formulaDesc: 'القدرة = الجهد × التيار، السطوع يتناسب مع القدرة',
    applications: ['الإضاءة', 'مؤشرات الحالة', 'التحذير', 'تسخين'],
  },

  ammeter: {
    properties: [
      { label: 'النوع', value: 'أميتر (يقيس التيار)' },
      { label: 'الوحدة', value: 'أمبير (A)' },
      { label: 'طريقة التوصيل', value: 'على التوالي (Series)' },
      { label: 'المقاومة', value: '≈ 0 (لا يؤثر على الدائرة)' },
      { label: 'الأطراف', value: '2' },
    ],
    mechanism: [
      { step: '١', description: 'يوصل على التوالي مع الحمل' },
      { step: '٢', description: 'يقيس التيار المار عبره' },
      { step: '٣', description: 'مقاومته صغيرة جداً لا تؤثر' },
      { step: '٤', description: 'يعرض القراءة مباشرة بالأمبير' },
    ],
    formula: 'I = V_ammeter / R_ammeter (R ≈ 0)',
    formulaDesc: 'يقيس التيار المار عبره بمقاومة شبه صفر',
    applications: ['قياس التيار', 'مراقبة الأحمال', 'فحص الدوائر'],
  },

  voltmeter: {
    properties: [
      { label: 'النوع', value: 'فولتميتر (يقيس الجهد)' },
      { label: 'الوحدة', value: 'فولت (V)' },
      { label: 'طريقة التوصيل', value: 'على التوازي (Parallel)' },
      { label: 'المقاومة', value: '∞ (لا يسحب تيار)' },
      { label: 'الأطراف', value: '2' },
    ],
    mechanism: [
      { step: '١', description: 'يوصل على التوازي مع الحمل' },
      { step: '٢', description: 'يقيس فرق الجهد بين نقطتين' },
      { step: '٣', description: 'مقاومته كبيرة جداً لا يسحب تيار' },
      { step: '٤', description: 'يعرض القراءة مباشرة بالفولت' },
    ],
    formula: 'V = I_voltmeter × R_voltmeter (R → ∞)',
    formulaDesc: 'يقيس فرق الجهد بمقاومة شبه لانهائية',
    applications: ['قياس الجهد', 'فحص البطاريات', 'تشخيص الأعطال'],
  },

  relay: {
    properties: [
      { label: 'النوع', value: 'ريليه كهرومغناطيسي (SPDT)' },
      { label: 'الوحدة', value: 'ميلي أمبير (mA) — عتبة التشغيل' },
      { label: 'الأطراف', value: '4 (ملف 2 + مفتاح 2)' },
      { label: 'الحالة', value: 'منشط / غير منشط' },
      { label: 'مقاومة الملف', value: '100 Ω' },
    ],
    mechanism: [
      { step: '١', description: 'الملف يولّد مجالاً مغناطيسياً عند مرور تيار' },
      { step: '٢', description: 'إذا تجاوز التيار العتبة: يُنشّط المفتاح' },
      { step: '٣', description: 'المفتاح يغلق/يفتح دائرة أخرى منفصلة' },
      { step: '٤', description: 'عزل كهربائي بين دائرة التحكم والحمل' },
    ],
    formula: 'I_coil > threshold → Relay ON',
    formulaDesc: 'تيار الملف يتجاوز العتبة → المفتاح يتنشط',
    applications: ['التحكم عن بعد', 'عزل الدوائر', 'المنطق', 'الحماية'],
  },

  breaker: {
    properties: [
      { label: 'النوع', value: 'قاطع حراري مغناطيسي (MCB)' },
      { label: 'الوحدة', value: 'أمبير (A) — التيار المقنن' },
      { label: 'الحالة', value: 'عادي / منفصل (Tripped)' },
      { label: 'الأطراف', value: '2' },
      { label: 'إعادة الضبط', value: 'يدوي (نقر مزدوج)' },
    ],
    mechanism: [
      { step: '١', description: 'يسمح بمرور التيار في الحالة العادية' },
      { step: '٢', description: 'إذا تجاوز التيار القيمة المقننة: ينفصل' },
      { step: '٣', description: 'يقطع الدائرة للحماية من الحمل الزائد' },
      { step: '٤', description: 'يتطلب إعادة ضبط يدوية بعد الإصلاح' },
    ],
    formula: 'I > I_rated → Breaker Trips',
    formulaDesc: 'تجاوز التيار المقنن → القاطع ينفصل',
    applications: ['حماية الدوائر', 'لوحات التوزيع', 'حماية المحركات'],
  },

  fuse: {
    properties: [
      { label: 'النوع', value: 'مصهر (Fuse) — حماية أحادية' },
      { label: 'الوحدة', value: 'أمبير (A) — تيار الانصهار' },
      { label: 'الحالة', value: 'سليم / محترق' },
      { label: 'الأطراف', value: '2' },
      { label: 'إعادة الضبط', value: 'لا يمكن — يستبدل' },
    ],
    mechanism: [
      { step: '١', description: 'سلك رفيع يمرر التيار في الحالة العادية' },
      { step: '٢', description: 'تيار زائد → السلك يسخن وينصهر' },
      { step: '٣', description: 'ينقطع الدائرة بشكل دائم' },
      { step: '٤', description: 'يتطلب استبدال المصهر بآخر جديد' },
    ],
    formula: 'I > I_fuse → Fuse Blows (permanent)',
    formulaDesc: 'تجاوز تيار الانصهار → المصهر يحترق نهائياً',
    applications: ['حماية الأجهزة', 'اللوحات الإلكترونية', 'السيارات'],
  },

  ground: {
    properties: [
      { label: 'النوع', value: 'أرضي (Ground/Earth)' },
      { label: 'الوحدة', value: '—' },
      { label: 'الجهد', value: '0V (مرجعي)' },
      { label: 'الأطراف', value: '1' },
      { label: 'الوظيفة', value: 'نقطة مرجع + حماية' },
    ],
    mechanism: [
      { step: '١', description: 'يحدد النقطة المرجعية للجهد = 0V' },
      { step: '٢', description: 'كل الجهود تُقاس بالنسبة له' },
      { step: '٣', description: 'يوفر مساراً آمناً لتيار التسريب' },
      { step: '٤', description: 'يحمي من الصعق الكهربائي' },
    ],
    formula: 'V_ground = 0V',
    formulaDesc: 'الأرضي = المرجع صفر فولت',
    applications: ['الحماية من الصعق', 'مرجع الجهد', 'تصريف الشحنات'],
  },

  multimeter: {
    properties: [
      { label: 'النوع', value: 'مولتيميتر رقمي (DMM)' },
      { label: 'الأوضاع', value: 'جهد V / تيار A / مقاومة Ω' },
      { label: 'المجس الأحمر', value: 'VΩ (المدخل الموجب)' },
      { label: 'المجس الأسود', value: 'COM (المدخل السالب)' },
      { label: 'الأطراف', value: '2 (أحمر وأسود)' },
    ],
    mechanism: [
      { step: '١', description: 'اختر الوضع: جهد (V) أو تيار (A) أو مقاومة (Ω)' },
      { step: '٢', description: 'ضع المجسين عبر المكون أو في الدائرة' },
      { step: '٣', description: 'وضع الجهد: توازي — مقاومة عالية (لا يسحب تيار)' },
      { step: '٤', description: 'وضع التيار: توالي — مقاومة منخفضة (يمرر التيار)' },
      { step: '٥', description: 'وضع المقاومة: يطبق تيار اختبار ويقيس الجهد' },
    ],
    formula: 'V = قراءة الجهد، A = قراءة التيار، Ω = V/I',
    formulaDesc: 'يقيس الجهد بالتوازي، التيار بالتوالي، المقاومة = جهد/تيار',
    applications: ['قياس شامل', 'فحص الدوائر', 'تشخيص الأعطال', 'صيانة الأجهزة'],
  },
}

export function getSpec(type: ComponentType): ComponentSpec | null {
  return componentSpecs[type] ?? null
}
