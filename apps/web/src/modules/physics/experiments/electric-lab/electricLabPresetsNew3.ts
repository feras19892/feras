import { makeComp, type PresetDef } from './electricLabPresetHelpers'

export const newPresets3: PresetDef[] = [
  {
    id: 'current-divider',
    name: 'Current Divider',
    nameAr: 'مقسم التيار',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← أميتر (كلي) ← R1∥R2 ← فولتميتر',
      '٢. I₁ = It × R₂/(R₁+R₂)، I₂ = It × R₁/(R₁+R₂)',
      '٣. It = V × (1/R₁ + 1/R₂) = V/Req',
      '٤. اضغط ▶ تشغيل وغيّر R1 و R2',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 12, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر It', 0, 'A'))
      components.push(makeComp('resistor', 380, 160, 'R1', 100, 'Ω'))
      components.push(makeComp('resistor', 380, 280, 'R2', 200, 'Ω'))
      components.push(makeComp('voltmeter', 380, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'source-efficiency',
    name: 'Source Efficiency',
    nameAr: 'كفاءة المصدر الكهربائي',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية(r) ← أميتر ← R حمل ← فولتميتر',
      '٢. η = P_load/P_total = R/(R+r)',
      '٣. P_load = I²R، P_loss = I²r، P_total = EMF×I',
      '٤. عند R=r: η=50%، والقدرة العظمى تنقل',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      const b = makeComp('battery', 80, 220, 'بطارية', 12, 'V')
      b._internalR = 2
      components.push(b)
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 400, 220, 'R حمل', 50, 'Ω'))
      components.push(makeComp('voltmeter', 400, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'two-sources',
    name: 'Two Opposing Sources',
    nameAr: 'دائرة بمصدرين متضادين',
    level: 'advanced',
    instructions: [
      '١. الدائرة: بطارية1 ← بطارية2 (معاكسة) ← أميتر ← R ← فولتميتر',
      '٢. I = (EMF₁ − EMF₂)/(R + r₁ + r₂)',
      '٣. إذا EMF₁ > EMF₂: التيار في اتجاه 1→2',
      '٤. اضغط ▶ تشغيل وغيّر قيم البطاريات',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      const b1 = makeComp('battery', 60, 220, 'بطارية 1', 12, 'V')
      b1._internalR = 1
      const b2 = makeComp('battery', 200, 220, 'بطارية 2', 8, 'V')
      b2._internalR = 1
      components.push(b1, b2)
      components.push(makeComp('ammeter', 330, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 460, 220, 'R حمل', 100, 'Ω'))
      components.push(makeComp('voltmeter', 460, 100, 'فولتميتر', 0, 'V'))
    },
  },
]
