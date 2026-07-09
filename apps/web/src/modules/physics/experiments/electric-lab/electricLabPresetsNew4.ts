import { makeComp, type PresetDef } from './electricLabPresetHelpers'

export const newPresets4: PresetDef[] = [
  {
    id: 'diode-iv',
    name: 'Diode I-V Characteristic',
    nameAr: 'خصائص الدايود',
    level: 'college',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← دايود ← فولتميتر',
      '٢. I = Is×(e^(V/ηVt) − 1)، Vt ≈ 25.85mV عند 300K',
      '٣. الجهد الحاجز ≈ 0.7V للسيليكون، 0.3V للجرمانيوم',
      '٤. اضغط ▶ تشغيل وغيّر جهد البطارية',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 5, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 380, 220, 'R حد', 1000, 'Ω'))
      components.push(makeComp('voltmeter', 380, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'transformer-ratio',
    name: 'Transformer Ratio',
    nameAr: 'نسبة المحوّل الكهربائي',
    level: 'advanced',
    instructions: [
      '١. المحوّل: ملف ابتدائي Np وملف ثانوي Ns',
      '٢. Vs/Vp = Ns/Np، Is/Ip = Np/Ns',
      '٣. P_primary = P_ideal = Vp×Ip = Vs×Is',
      '٤. اضغط ▶ تشغيل وغيّر Np و Ns',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      const b = makeComp('battery', 80, 220, 'Vp مصدر', 120, 'V')
      b._internalR = 0
      components.push(b)
      components.push(makeComp('ammeter', 220, 220, 'Ip أميتر', 0, 'A'))
      components.push(makeComp('resistor', 400, 220, 'R حمل', 50, 'Ω'))
      components.push(makeComp('voltmeter', 400, 100, 'Vs فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'self-inductance',
    name: 'Self-Inductance',
    nameAr: 'التحريض الذاتي',
    level: 'college',
    instructions: [
      '١. الدائرة: بطارية ← ملف L ← أميتر ← مفتاح',
      '٢. V = −L×(dI/dt)، الطاقة E = ½×L×I²',
      '٣. τ = L/R ثابت الزمن للملف',
      '٤. اضغط ▶ تشغيل وغيّر L و R',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 12, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 380, 220, 'R', 100, 'Ω'))
      components.push(makeComp('voltmeter', 380, 100, 'فولتميتر', 0, 'V'))
    },
  },
]
