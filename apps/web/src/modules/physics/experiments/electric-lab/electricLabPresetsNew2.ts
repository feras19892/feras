import { makeComp, type PresetDef } from './electricLabPresetHelpers'

export const newPresets2: PresetDef[] = [
  {
    id: 'compound-circuit',
    name: 'Compound Circuit',
    nameAr: 'الدائرة المختلطة (توالي وتوازي)',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← R1 (توالي) ← R2∥R3 (توازي) ← فولتميتر',
      '٢. المقاومة المكافئة: Req = R1 + (R2×R3)/(R2+R3)',
      '٣. التيار الكلي: I = V / Req',
      '٤. اضغط ▶ تشغيل وغيّر قيم R1, R2, R3',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 12, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 350, 220, 'R1', 100, 'Ω'))
      components.push(makeComp('resistor', 480, 160, 'R2', 200, 'Ω'))
      components.push(makeComp('resistor', 480, 280, 'R3', 300, 'Ω'))
      components.push(makeComp('voltmeter', 480, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'emf-measurement',
    name: 'EMF Measurement',
    nameAr: 'قياس القوة الدافعة الكهربائية',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← مفتاح ← أميتر ← مقاومة ← فولتميتر',
      '٢. المفتاح مفتوح: الفولتميتر يقيس EMF مباشرة',
      '٣. المفتاح مغلق: Vt = EMF - Ir، I = EMF/(R+r)',
      '٤. اضغط ▶ تشغيل، افتح وأغلق المفتاح',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      const batt = makeComp('battery', 80, 220, 'بطارية', 9, 'V')
      batt._internalR = 1
      components.push(batt)
      components.push(makeComp('switch', 200, 220, 'مفتاح', 0, ''))
      components.push(makeComp('ammeter', 320, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 450, 220, 'R حمل', 50, 'Ω'))
      components.push(makeComp('voltmeter', 450, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'temperature-resistance',
    name: 'Temperature & Resistance',
    nameAr: 'تأثير درجة الحرارة على المقاومة',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← R0 (مقاومة) ← فولتميتر',
      '٢. R = R₀(1 + αΔT)، α = 0.004/°C (نحاس)',
      '٣. غيّر قيمة R0 والحرارة (المقاومة الثانية = الحرارة °C)',
      '٤. اضغط ▶ تشغيل ولاحظ تغير R مع الحرارة',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 6, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 350, 220, 'R₀ (Ω)', 100, 'Ω'))
      components.push(makeComp('resistor', 480, 220, 'T (°C)', 20, '°C'))
      components.push(makeComp('voltmeter', 350, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'cells-series',
    name: 'Cells in Series',
    nameAr: 'توصيل الخلايا على التوالي',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطاريتان على التوالي + أميتر + مقاومة + فولتميتر',
      '٢. EMF الكلي = EMF₁ + EMF₂، r الكلي = r₁ + r₂',
      '٣. I = (EMF₁ + EMF₂) / (R + r₁ + r₂)',
      '٤. اضغط ▶ تشغيل وغيّر قيم البطاريات والمقاومة',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      const b1 = makeComp('battery', 60, 220, 'بطارية 1', 6, 'V')
      b1._internalR = 0.5
      const b2 = makeComp('battery', 180, 220, 'بطارية 2', 4, 'V')
      b2._internalR = 0.5
      components.push(b1, b2)
      components.push(makeComp('ammeter', 300, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 430, 220, 'R حمل', 100, 'Ω'))
      components.push(makeComp('voltmeter', 430, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'cells-parallel',
    name: 'Cells in Parallel',
    nameAr: 'توصيل الخلايا على التوازي',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطاريتان على التوازي + أميتر + مقاومة + فولتميتر',
      '٢. EMF الكلي = المتوسط، r الكلي = (r₁×r₂)/(r₁+r₂)',
      '٣. I = EMF / (R + r_total)',
      '٤. اضغط ▶ تشغيل وغيّر قيم البطاريات',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      const b1 = makeComp('battery', 80, 160, 'بطارية 1', 6, 'V')
      b1._internalR = 1
      const b2 = makeComp('battery', 80, 280, 'بطارية 2', 6, 'V')
      b2._internalR = 1
      components.push(b1, b2)
      components.push(makeComp('ammeter', 250, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 430, 220, 'R حمل', 100, 'Ω'))
      components.push(makeComp('voltmeter', 430, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'rheostat',
    name: 'Rheostat',
    nameAr: 'المقاومة المتغيرة (ريوستات)',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية + أميتر + ريوستات + فولتميتر',
      '٢. الريوستات = مقاومة متغيرة، R = ρL/A',
      '٣. غيّر قيمة R ولاحظ تغير I و V',
      '٤. اضغط ▶ تشغيل وحرّك المنزلق',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 12, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 380, 220, 'ريوستات R', 50, 'Ω'))
      components.push(makeComp('voltmeter', 380, 100, 'فولتميتر', 0, 'V'))
    },
  },
]
