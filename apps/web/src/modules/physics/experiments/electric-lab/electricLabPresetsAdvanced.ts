import { makeComp, type PresetDef } from './electricLabPresetHelpers'

export const advancedPresets: PresetDef[] = [
  {
    id: 'rc-circuit',
    name: "RC Circuit",
    nameAr: 'شحن وتفريغ مكثف',
    level: 'college',
    instructions: [
      '١. الدائرة: بطارية ← مفتاح ← مقاومة ← مكثف ← عودة',
      '٢. الفولتميتر يقيس جهد المكثف Vc، والأميتر يقيس تيار الشحن',
      '٣. اضغط ▶ تشغيل لبدء المحاكاة — سيبدأ المكثف بالشحن',
      '٤. راقب منحنى الشحن: Vc يرتفع تدريجياً حتى يصل إلى V0',
      '٥. التيار يبدأ عالياً ثم يتناقص أثناء الشحن',
      '٦. ثابت الزمن τ = R × C — كلما زاد τ، أبطأ الشحن',
      '٧. اضغط 🔘 مفتاح لتبديل بين الشحن والتفريغ',
      '٨. عند التفريغ: Vc يتناقص من قيمته الحالية إلى الصفر',
      '٩. سجّل نقاط من المنحنى ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   80, 220, 'بطارية',  9,     'V'))
      const sw = makeComp('switch', 200, 220, 'مفتاح', 0, '')
      sw._closed = true
      components.push(sw)
      components.push(makeComp('resistor',  350, 220, 'R',       10000, 'Ω'))
      components.push(makeComp('ammeter',   480, 220, 'أميتر',   0,     'A'))
      components.push(makeComp('capacitor', 600, 220, 'C',       100,   'µF'))
      components.push(makeComp('voltmeter', 600, 100, 'فولتميتر', 0,    'V'))
    },
  },
  {
    id: 'lamp-circuit',
    name: "Lamp Circuit",
    nameAr: 'دائرة المصباح والكفاءة',
    level: 'intermediate',
    instructions: [
      '١. الدائرة: بطارية ← مفتاح ← مصباح ← أميتر ← عودة',
      '٢. الفولتميتر يقيس جهد المصباح',
      '٣. اضغط ▶ تشغيل — سيضيء المصباح حسب الجهد',
      '٤. المصباح يحوّل الكهرباء إلى ضوء (5%) وحرارة (95%)',
      '٥. القدرة الكلية: P = V × I',
      '٦. قدرة الضوء: P_light = P × 0.05',
      '٧. قدرة الحرارة: P_heat = P × 0.95',
      '٨. غيّر جهد البطارية وراقب كيف تتغير الإضاءة',
      '٩. سجّل قراءات بجهد مختلف ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   80, 220, 'بطارية',   6,   'V'))
      const sw = makeComp('switch', 200, 220, 'مفتاح', 0, '')
      sw._closed = true
      components.push(sw)
      components.push(makeComp('lamp',      350, 220, 'مصباح',    6,   'V'))
      components.push(makeComp('ammeter',   500, 220, 'أميتر',    0,   'A'))
      components.push(makeComp('voltmeter', 350, 100, 'فولتميتر', 0,   'V'))
    },
  },
  {
    id: 'galvanometer',
    name: "Galvanometer & EM Induction",
    nameAr: 'الجلفانوميتر والحث الكهرومغناطيسي',
    level: 'college',
    instructions: [
      '١. هذه التجربة تحاكي الحث الكهرومغناطيسي (قانون فاراداي)',
      '٢. المقاومة تمثل عدد لفات الملف (N) — غيّرها لزيادة اللفات',
      '٣. البطارية تمثل سرعة المغناطيس (m/s) — غيّرها لتغيير السرعة',
      '٤. الجلفانوميتر يكشف التيار المستحث (µA)',
      '٥. القانون: ε = -N × ΔΦ/Δt — كلما زادت اللفات والسرعة، زاد التيار',
      '٦. اضغط ▶ تشغيل وراقب انحراف مؤشر الجلفانوميتر',
      '٧. جرّب لفات مختلفة (100, 200, 500) وسجل القراءات',
      '٨. جرّب سرعات مختلفة (1, 5, 10) ولاحظ العلاقة',
      '٩. سجّل نقاط ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',      80, 220, 'سرعة المغناطيس', 5,   'm/s'))
      components.push(makeComp('switch',       220, 220, 'مفتاح',          0,   ''))
      components.push(makeComp('resistor',     380, 220, 'اللفات (N)',     200, 'turns'))
      components.push(makeComp('galvanometer', 540, 220, 'G',              0,   'µA'))
    },
  },
  {
    id: 'wheatstone',
    name: "Wheatstone Bridge",
    nameAr: 'جسر ويستون لقياس المقاومة',
    level: 'advanced',
    instructions: [
      '١. جسر ويستون يقيس مقاومة مجهولة (Rx) بدقة عالية',
      '٢. المقاومة R1 (الأولى) و R2 (الثانية) = نسبة معروفة',
      '٣. المقاومة R3 (الثالثة) = مقاومة ضبط قابلة للتغيير',
      '٤. Rx = 150Ω (مقاومة مجهولة ثابتة في هذه التجربة)',
      '٥. عدّل R3 حتى يقرأ الجلفانوميتر صفراً (التوازن)',
      '٦. عند التوازن: Rx = R2 × R3 / R1',
      '٧. اضغط ▶ تشغيل وراقب جهد الجلفانوميتر',
      '٨. عدّل R3 حتى يصبح Vg ≈ 0 (الجسر متوازن)',
      '٩. سجّل نقاط بقيم R3 مختلفة ثم اضغط 📈 تحليل',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',      80, 280, 'بطارية',   6,   'V'))
      const sw = makeComp('switch', 200, 280, 'مفتاح', 0, '')
      sw._closed = true
      components.push(sw)
      components.push(makeComp('resistor',     350, 180, 'R1',       100, 'Ω'))
      components.push(makeComp('resistor',     500, 180, 'R2',       200, 'Ω'))
      components.push(makeComp('resistor',     350, 380, 'R3 (ضبط)', 100, 'Ω'))
      components.push(makeComp('galvanometer', 500, 280, 'G',        0,   'mA'))
    },
  },
  {
    id: 'voltage-divider',
    name: "Voltage Divider",
    nameAr: 'مقسم الجهد',
    level: 'intermediate',
    instructions: [
      '١. مقسم الجهد: مقاومتان على التوالي تقسمان الجهد',
      '٢. الجهد عبر كل مقاومة يتناسب مع قيمتها',
      '٣. V1 = V × R1/(R1+R2) و V2 = V × R2/(R1+R2)',
      '٤. الفولتميتر يقيس الجهد عبر R2',
      '٥. عدّل R1 و R2 لرؤية كيف يتوزع الجهد',
      '٦. جرّب: R1 = R2 → V1 = V2 = V/2',
      '٧. جرّب: R1 = 3×R2 → V1 = 3×V2',
      '٨. اضغط ▶ تشغيل وسجّل قراءات بقيم مختلفة',
      '٩. سجّل نقاط ثم اضغط 📈 تحليل النتائج',
    ],
    build: (components, reset) => {
      reset()
      components.push(makeComp('battery',   80, 220, 'بطارية',   9,   'V'))
      const sw = makeComp('switch', 200, 220, 'مفتاح', 0, '')
      sw._closed = true
      components.push(sw)
      components.push(makeComp('resistor',  340, 220, 'R1',       200, 'Ω'))
      components.push(makeComp('resistor',  480, 220, 'R2',       200, 'Ω'))
      components.push(makeComp('ammeter',   620, 220, 'أميتر',    0,   'A'))
      components.push(makeComp('voltmeter', 480, 100, 'فولتميتر', 0,   'V'))
    },
  },
]
