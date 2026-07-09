import { makeComp, type PresetDef } from './electricLabPresetHelpers'

export const basicPresets: PresetDef[] = [
  {
    id: 'ohms-law',
    name: "Ohm's Law",
    nameAr: 'قانون أوم',
    level: 'beginner',
    instructions: [
      '١. تأكد أن الدائرة موصولة: بطارية ← أميتر ← مقاومة ← عودة للبطارية',
      '٢. الفولتميتر موصول على التوازي مع المقاومة',
      '٣. اضغط ▶ تشغيل لبدء المحاكاة',
      '٤. انقر على البطارية وغيّر الجهد V باستخدام المنزلق',
      '٥. اقرأ التيار I من الأميتر في مساحة العمل',
      '٦. اضغط 📋 تسجيل لتسجيل القراءة (V, I)',
      '٧. كرر بتغيير الجهد ٥ مرات على الأقل (مثلاً: 2V, 4V, 6V, 8V, 10V)',
      '٨. اضغط 📈 تحليل النتائج لرسم V مقابل I وإيجاد الميل = R',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   100, 200, 'بطارية',    6,   'V'))
      components.push(makeComp('ammeter',   300, 200, 'أميتر',     0,   'A'))
      components.push(makeComp('resistor',  500, 200, 'مقاومة',    100, 'Ω'))
      components.push(makeComp('voltmeter', 500, 80,  'فولتميتر',  0,   'V'))
    },
  },
  {
    id: 'kirchhoff',
    name: "Kirchhoff's Laws",
    nameAr: 'قانون كيرشوف',
    level: 'intermediate',
    instructions: [
      '١. الدائرة تحتوي على حلقتين: اليسرى (V1, R1, R3) واليمنى (V2, R2, R3)',
      '٢. R3 هي المقاومة المشتركة بين الحلقتين',
      '٣. اضغط ▶ تشغيل لبدء المحاكاة',
      '٤. انقر على أي بطارية أو مقاومة وغيّر قيمتها بالمنزلق',
      '٥. راقب التيارات I1, I2, I3 على الأميترات في مساحة العمل',
      '٦. تحقق من KCL عند العقدة: I1 + I2 = I3',
      '٧. تحقق من KVL في كل حلقة: ΣV = ΣIR',
      '٨. اضغط 📋 تسجيل لتسجيل القراءة، ثم 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   80, 120, 'V1',   10,  'V'))
      components.push(makeComp('battery',   80, 320, 'V2',   5,   'V'))
      components.push(makeComp('resistor',  250, 120, 'R1',   100, 'Ω'))
      components.push(makeComp('resistor',  250, 320, 'R2',   50,  'Ω'))
      components.push(makeComp('resistor',  450, 220, 'R3',   200, 'Ω'))
      components.push(makeComp('ammeter',   170, 120, 'A1',   0,   'A'))
      components.push(makeComp('ammeter',   170, 320, 'A2',   0,   'A'))
      components.push(makeComp('ammeter',   370, 220, 'A3',   0,   'A'))
    },
  },
  {
    id: 'ohms-law-parallel',
    name: "Ohm's Law — Parallel",
    nameAr: 'قانون أوم — توازي',
    level: 'beginner',
    instructions: [
      '١. الدائرة: بطارية واحدة، مقاومتان R1 و R2 موصولتان على التوازي',
      '٢. كل مقاومة لها أميتر خاص: A1 يقيس I1، A2 يقيس I2',
      '٣. الأميتر الرئيسي At يقيس التيار الكلي Itotal = I1 + I2',
      '٤. الفولتميتر يقيس الجهد V المشترك على المقاومتين',
      '٥. اضغط ▶ تشغيل لبدء المحاكاة',
      '٦. انقر على البطارية وغيّر الجهد V بالمنزلق',
      '٧. لكل مقاومة: I = V / R (نفس الجهد على المقاومتين)',
      '٨. المقاومة المكافئة: 1/Req = 1/R1 + 1/R2',
      '٩. سجّل عدة قرارات بجهد مختلف، ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   80, 220, 'بطارية',    6,   'V'))
      components.push(makeComp('ammeter',   200, 220, 'At',        0,   'A'))
      components.push(makeComp('resistor',  400, 120, 'R1',        100, 'Ω'))
      components.push(makeComp('resistor',  400, 320, 'R2',        200, 'Ω'))
      components.push(makeComp('ammeter',   300, 120, 'A1',        0,   'A'))
      components.push(makeComp('ammeter',   300, 320, 'A2',        0,   'A'))
      components.push(makeComp('voltmeter', 500, 220, 'فولتميتر',  0,   'V'))
    },
  },
  {
    id: 'power',
    name: "Electrical Power",
    nameAr: 'القدرة الكهربائية',
    level: 'beginner',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← مقاومة ← عودة للبطارية',
      '٢. الفولتميتر موصول على التوازي مع المقاومة',
      '٣. اضغط ▶ تشغيل لبدء المحاكاة',
      '٤. انقر على البطارية وغيّر الجهد V بالمنزلق',
      '٥. اقرأ التيار I من الأميتر والجهد V من الفولتميتر',
      '٦. القدرة الكهربائية: P = V × I (بالواط W)',
      '٧. صيغ أخرى: P = I²×R و P = V²/R',
      '٨. سجّل ٥ قرارات بجهد مختلف، ثم اضغط 📈 تحليل النتائج',
      '٩. ارسم P مقابل V أو P مقابل I — العلاقة يجب أن تكون خطية',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   100, 200, 'بطارية',    6,   'V'))
      components.push(makeComp('ammeter',   300, 200, 'أميتر',     0,   'A'))
      components.push(makeComp('resistor',  500, 200, 'مقاومة',    100, 'Ω'))
      components.push(makeComp('voltmeter', 500, 80,  'فولتميتر',  0,   'V'))
    },
  },
  {
    id: 'resistivity',
    name: "Resistivity",
    nameAr: 'مقاومية الموصل',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← أميتر ← سلك موصل ← عودة للبطارية',
      '٢. الفولتميتر يقيس الجهد على السلك',
      '٣. اضغط ▶ تشغيل لبدء المحاكاة',
      '٤. انقر على السلك (المقاومة) وغيّر قيمتها — تمثل R المقاسة',
      '٥. المقاومية: ρ = R × A / L (القانون الأساسي)',
      '٦. L = طول السلك (م)، A = مساحة المقطع (م²)',
      '٧. غيّر الجهد وسجّل عدة قراءات (V, I, R)',
      '٨. احسب ρ لكل قراءة — يجب أن تكون ثابتة لنفس المادة',
      '٩. اضغط 📈 تحليل النتائج لرسم R مقابل L وإيجاد الميل = ρ/A',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   100, 200, 'بطارية',    6,   'V'))
      components.push(makeComp('ammeter',   300, 200, 'أميتر',     0,   'A'))
      const res = makeComp('resistor', 500, 200, 'سلك', 100, 'Ω')
      res._length = 1.0
      res._area = 1e-6
      components.push(res)
      components.push(makeComp('voltmeter', 500, 80,  'فولتميتر',  0,   'V'))
    },
  },
]
