import { makeComp, type PresetDef } from './electricLabPresetHelpers'

export const newPresets5: PresetDef[] = [
  {
    id: 'thermistor-ntc',
    name: 'Thermistor (NTC)',
    nameAr: 'الثيرميستور (NTC)',
    level: 'college',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← ثيرميستور ← فولتميتر',
      '٢. R = R₀×e^(β×(1/T − 1/T₀))، β ≈ 3950K',
      '٣. كلما زادت الحرارة قلّت المقاومة (NTC)',
      '٤. اضغط ▶ تشغيل وغيّر درجة الحرارة',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 9, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 380, 220, 'ثيرميستور', 25, '°C'))
      components.push(makeComp('voltmeter', 380, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'magnetic-force',
    name: 'Magnetic Force on Wire',
    nameAr: 'القوة المغناطيسية على سلك',
    level: 'advanced',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← سلك في مجال مغناطيسي',
      '٢. F = B×I×L×sin(θ)',
      '٣. B = المجال المغناطيسي (T)، L = طول السلك (m)',
      '٤. اضغط ▶ تشغيل وغيّر التيار وزاوية المجال',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 12, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 380, 220, 'R حد', 5, 'Ω'))
      components.push(makeComp('resistor', 530, 220, 'B (mT)', 500, 'mT'))
      components.push(makeComp('resistor', 680, 220, 'L (cm)', 10, 'cm'))
      components.push(makeComp('resistor', 830, 220, 'θ (°)', 90, '°'))
      components.push(makeComp('voltmeter', 380, 100, 'فولتميتر', 0, 'V'))
    },
  },
  {
    id: 'lc-oscillation',
    name: 'LC Oscillation',
    nameAr: 'دائرة LC المتذبذبة',
    level: 'college',
    instructions: [
      '١. الدائرة: بطارية ← ملف L ← مكثف C',
      '٢. f = 1/(2π√(LC))، ω = 1/√(LC)',
      '٣. الطاقة تتبادل بين المجال الكهربائي والمغناطيسي',
      '٤. E_total = ½CV² + ½LI² = ثابت',
      '٥. سجّل قراءات ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery', 80, 220, 'بطارية', 10, 'V'))
      components.push(makeComp('ammeter', 220, 220, 'أميتر', 0, 'A'))
      components.push(makeComp('resistor', 380, 220, 'R', 10, 'Ω'))
      components.push(makeComp('resistor', 530, 220, 'L (mH)', 100, 'mH'))
      components.push(makeComp('capacitor', 680, 220, 'C (µF)', 1, 'µF'))
      components.push(makeComp('voltmeter', 380, 100, 'فولتميتر', 0, 'V'))
    },
  },
]
