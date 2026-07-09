import { makeComp, type PresetDef } from './electricLabPresetHelpers'

export const newPresets: PresetDef[] = [
  {
    id: 'internal-resistance',
    name: "Internal Resistance",
    nameAr: 'المقاومة الداخلية للبطارية',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية (بمقاومة داخلية) ← أميتر ← مقاومة خارجية ← عودة',
      '٢. الفولتميتر يقيس الجهد الطرفي Vt (عبر المقاومة الخارجية)',
      '٣. اضغط ▶ تشغيل لبدء المحاكاة',
      '٤. الجهد الطرفي: Vt = ε - I×r (حيث r المقاومة الداخلية)',
      '٥. غيّر المقاومة الخارجية وراقب كيف يتغير Vt',
      '٦. عندما R كبيرة جداً: Vt ≈ ε (دائرة مفتوحة)',
      '٧. عندما R صغيرة: Vt ينخفض (التيار العالي يزيد الهبوط)',
      '٨. سجّل قراءات بـ R مختلفة ثم اضغط 📈 تحليل النتائج',
      '٩. ارسم Vt مقابل I — الميل = -r (المقاومة الداخلية)',
    ],
    build: (components, reset) => {
      reset()
      const batt = makeComp('battery', 80, 220, 'بطارية', 12, 'V')
      batt._internalR = 2
      components.push(batt)
      components.push(makeComp('ammeter', 250, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 430, 220, 'R خارجية', 100, 'Ω'))
      components.push(makeComp('voltmeter', 430, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'series-circuit',
    name: "Series Circuits",
    nameAr: 'دوائر التوالي',
    level: 'beginner',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← R1 ← R2 ← R3 ← عودة للبطارية',
      '٢. في دائرة التوالي: التيار واحد في جميع المقاومات',
      '٣. الجهد الكلي: V = V1 + V2 + V3 (يقسم بين المقاومات)',
      '٤. المقاومة المكافئة: Req = R1 + R2 + R3',
      '٥. اضغط ▶ تشغيل وغيّر قيم المقاومات',
      '٦. الفولتميتر يقيس الجهد عبر R2',
      '٧. تحقق: V2 = I × R2، وأن I ثابت في الدائرة',
      '٨. سجّل قراءات بقيم مختلفة ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 9, 'V'))
      components.push(makeComp('ammeter', 200, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 340, 220, 'R1', 100, 'Ω'))
      components.push(makeComp('resistor', 480, 220, 'R2', 200, 'Ω'))
      components.push(makeComp('resistor', 620, 220, 'R3', 150, 'Ω'))
      components.push(makeComp('voltmeter', 480, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'capacitors-combination',
    name: "Capacitors Series & Parallel",
    nameAr: 'توالي وتوازي المكثفات',
    level: 'college',
    instructions: [
      '١. الدائرة: بطارية ← مفتاح ← مكثفان C1 و C2 ← عودة',
      '٢. الفولتميتر يقيس جهد C1، والأميتر يقيس تيار الشحن',
      '٣. على التوالي: 1/Ceq = 1/C1 + 1/C2 (السعة الكلية أقل)',
      '٤. على التوازي: Ceq = C1 + C2 (السعة الكلية أكبر)',
      '٥. اضغط ▶ تشغيل وراقب شحن المكثفات',
      '٦. ثابت الزمن: τ = R × Ceq',
      '٧. غيّر قيم C1 و C2 وراقب كيف يتغير τ',
      '٨. اضغط 🔘 مفتاح للتبديل بين الشحن والتفريغ',
      '٩. سجّل نقاط من المنحنى ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 6, 'V'))
      const sw = makeComp('switch', 200, 220, 'مفتاح', 0, '')
      sw._closed = true
      components.push(sw)
      components.push(makeComp('resistor', 340, 220, 'R', 5000, 'Ω'))
      components.push(makeComp('ammeter', 470, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('capacitor', 600, 120, 'C1', 100, 'µF'))
      components.push(makeComp('capacitor', 600, 320, 'C2', 100, 'µF'))
      components.push(makeComp('voltmeter', 720, 220, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'potentiometer',
    name: "Potentiometer",
    nameAr: 'البوتانشيوميتر لقياس الجهد',
    level: 'advanced',
    instructions: [
      '١. البوتانشيوميتر: سلك مقاوم طويل موصول على بطارية مرجعية',
      '٢. الجهد على طول السلك يتناسب مع الطول (V ∝ L)',
      '٣. بطارية مجهولة تُقارن مع الجهد عند نقطة التوازن',
      '٤. عند التوازن: εx = (Lx / Ltotal) × εref',
      '٥. اضغط ▶ تشغيل وحرّك نقطة التلامس (غيّر قيمة المقاومة)',
      '٦. الأميتر يقرأ صفراً عند نقطة التوازن',
      '٧. غيّر R1 (تمثل نسبة الطول) حتى يقرأ الأميتر صفراً',
      '٨. سجّل نقاط توازن مختلفة ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 320, 'بطارية مرجعية', 6, 'V'))
      components.push(makeComp('resistor', 300, 320, 'سلك (R1)', 100, 'Ω'))
      components.push(makeComp('ammeter', 500, 220, 'G', 0, 'µA'))
      components.push(makeComp('battery', 500, 100, 'بطارية مجهولة', 3, 'V'))
      components.push(makeComp('resistor', 300, 120, 'R2', 200, 'Ω'))
    },
  },
  {
    id: 'non-ohmic',
    name: "Non-Ohmic Materials",
    nameAr: 'المواد اللاأومية',
    level: 'college',
    instructions: [
      '١. مقارنة بين مادة أومية (مقاومة ثابتة) ومادة لا أومية (مصباح)',
      '٢. المقاومة الأومية: V = I×R (علاقة خطية)',
      '٣. المصباح: R يزيد مع الحرارة — V ≠ I×R (علاقة غير خطية)',
      '٤. اضغط ▶ تشغيل وغيّر الجهد تدريجياً',
      '٥. سجّل V و I لكل جهد من 1V إلى 12V',
      '٦. ارسم V مقابل I: المقاومة خط مستقيم، المصباح منحنى',
      '٧. المقاومة الديناميكية: R_dyn = dV/dI (تتغير للمصباح)',
      '٨. سجّل ٨ قراءات على الأقل ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 6, 'V'))
      components.push(makeComp('ammeter', 250, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 430, 220, 'مقاومة', 100, 'Ω'))
      components.push(makeComp('voltmeter', 430, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'max-power-transfer',
    name: "Maximum Power Transfer",
    nameAr: 'نقل القدرة العظمى',
    level: 'advanced',
    instructions: [
      '١. الدائرة: بطارية (بمقاومة داخلية r) ← أميتر ← مقاومة حمل R ← عودة',
      '٢. الفولتميتر يقيس الجهد على الحمل، والأميتر يقيس التيار',
      '٣. القدرة على الحمل: P = I² × R = V² × R / (R + r)²',
      '٤. اضغط ▶ تشغيل وغيّر قيمة R تدريجياً من 0.5Ω إلى 10Ω',
      '٥. سجّل R و P لكل قيمة — لاحظ أن P تزداد ثم تنقص',
      '٦. القدرة العظمى تحدث عندما R = r (المقاومة الداخلية)',
      '٧. عند R = r: Pmax = V² / (4r)',
      '٨. سجّل ٨ قراءات على الأقل ثم اضغط 📈 تحليل النتائج',
      '٩. ارسم P مقابل R — القمة عند R = r',
    ],
    build: (components, reset) => {
      reset()
      const batt = makeComp('battery', 80, 220, 'بطارية', 12, 'V')
      batt._internalR = 2
      components.push(batt)
      components.push(makeComp('ammeter', 250, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 430, 220, 'R حمل', 2, 'Ω'))
      components.push(makeComp('voltmeter', 430, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'joules-law',
    name: "Joule's Law",
    nameAr: 'قانون جول للتسخين',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← مقاومة (سخان) ← فولتميتر',
      '٢. قانون جول: H = I²Rt، القدرة: P = I²R = V²/R',
      '٣. اضغط ▶ تشغيل وغيّر الجهد والمقاومة، الزمن = ٦٠ث',
      '٤. سجّل قراءات بـ V و R مختلفة ثم اضغط 📈 تحليل النتائج',
      '٥. ارسم P مقابل I² — العلاقة خطية (P = I²R)',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 12, 'V'))
      components.push(makeComp('ammeter', 250, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 430, 220, 'سخان R', 100, 'Ω'))
      components.push(makeComp('voltmeter', 430, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'ammeter-voltmeter',
    name: 'Ammeter-Voltmeter Method',
    nameAr: 'قياس المقاومة بطريقة الأميتر والفولتميتر',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← مقاومة Rx ← فولتميتر',
      '٢. R_measured = V/I، R_true = V/(I - V/Rv)',
      '٣. الخطأ المنهجي: الفولتميتر يسحب تياراً صغيراً',
      '٤. اضغط ▶ تشغيل وغيّر Rx، لاحظ الفرق بين R_measured و R_true',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 6, 'V'))
      components.push(makeComp('ammeter', 250, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 430, 220, 'Rx', 100, 'Ω'))
      components.push(makeComp('voltmeter', 430, 100, 'فولتميتر', 0, 'V'))
    },
  },
]
