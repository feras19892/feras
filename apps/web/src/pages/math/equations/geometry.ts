import type { Equation } from '../math-types';
import { fmt } from '../math-utils';

export const geometryEquations: Equation[] = [
  {
    id: 'pythagorean-theorem',
    branchId: 'geometry',
    name: 'نظرية فيثاغورس',
    formula: 'a^2 + b^2 = c^2',
    description: 'تُستخدم في المثلثات القائمة لإيجاد طول ضلع مجهول. تطبق في حساب المسافات، تحليل المتجهات، وحركة القذائف.',
    method: 'لحساب الضلع المجهول في مثلث قائم: 1) نحدد الضلعين المعروفين والوتر c. 2) إذا كان c مجهولاً: c = √(a² + b²). 3) إذا كان a مجهولاً: a = √(c² - b²). 4) إذا كان b مجهولاً: b = √(c² - a²). 5) نعوض القيم العددية ونحسب الناتج.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { a: 3, b: 4 },
        steps: [
          'a = 3, b = 4',
          'c^2 = 3^2 + 4^2 = 9 + 16 = 25',
          'c = √25 = 5',
        ],
      },
    ],
    applicationProblems: [
      {
        question: 'سلم طوله 5 م يستند على حائط. إذا كانت قاعدة السلم على بعد 3 م من الحائط، ما ارتفاع أعلى السلم؟',
        hint: 'استخدم c² = a² + b² حيث c = 5 و a = 3.',
        answer: 'b = 4 م',
        variables: { a: 3, b: 4 },
        expectedValue: 4,
      },
    ],
    relatedExperiments: [
      { id: 'projectile', name: 'حركة القذيفة', route: '/physics/mechanics/projectile', context: 'تستخدم لحساب السرعة الناتجة أو الإزاحة الكلية من مركباتها الأفقية والرأسية.' },
    ],
    variables: [
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
    ],
    solve(values) {
      const a = Number(values.a);
      const b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) {
        return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      }
      const c = Math.sqrt(a * a + b * b);
      return {
        result: `c = ${fmt(c)}`,
        steps: [`c^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}`, `c = √${a * a + b * b} = ${fmt(c)}`],
      };
    },
  },
  {
    id: 'area-circle',
    branchId: 'geometry',
    name: 'مساحة الدائرة',
    formula: 'A = πr^2',
    description: 'تُستخدم لحساب مساحة الدائرة عند معرفة نصف القطر. تطبق في حسابات المساحات والأحجام الدائرية.',
    method: 'لحساب مساحة الدائرة: 1) نحدد نصف القطر r. 2) نعوض في القانون: A = πr². 3) نحسب الناتج باستخدام π ≈ 3.14159. 4) إذا أردنا دقة أعلى نستخدم قيمة π الأكثر دقة.',
    examples: [
      {
        title: 'مثال تطبيقي',
        values: { r: 5 },
        steps: [
          'r = 5',
          'A = π × 5^2 = 25π',
          'A ≈ 78.540',
        ],
      },
    ],
    applicationProblems: [
      {
        question: 'قطعة دائرية من القماش نصف قطرها 7 سم. ما مساحتها؟',
        hint: 'A = π × r².',
        answer: 'A ≈ 153.94 سم²',
        variables: { r: 7 },
        expectedValue: 153.94,
      },
    ],
    variables: [{ name: 'r', label: 'r' }],
    solve(values) {
      const r = Number(values.r);
      if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const area = Math.PI * r * r;
      return {
        result: `A = ${fmt(area)}`,
        steps: [`A = π × ${r}^2`, `A = ${fmt(area)}`],
      };
    },
  },
  {
    id: 'area-rectangle',
    branchId: 'geometry',
    name: 'مساحة المستطيل',
    formula: 'A = l × w',
    description: 'تُستخدم لحساب مساحة سطح المستطيل، أي المساحة المحصورة بين أضلاعه الأربعة. تُستخدم في تصميم الغرف، الحدائق، والألواح.',
    method: '1) قِس الطول l (الضلع الأطول). 2) قِس العرض w (الضلع الأقصر). 3) اضرب الطول في العرض: A = l × w. 4) الوحدة الناتجة هي وحدة طول تربيعية (مثلاً م²).',
    examples: [{ title: 'مثال', values: { l: 8, w: 5 }, steps: ['A = 8 × 5 = 40'] }],
    applicationProblems: [
      {
        question: 'حديقة مستطيلة طولها 12 م وعرضها 7 م. ما مساحتها؟',
        hint: 'A = الطول × العرض.',
        answer: 'A = 84 م²',
        variables: { l: 12, w: 7 },
        expectedValue: 84,
      },
    ],
    variables: [{ name: 'l', label: 'الطول' }, { name: 'w', label: 'العرض' }],
    solve(values) {
      const l = Number(values.l), w = Number(values.w);
      if ([l, w].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `A = ${fmt(l * w)}`, steps: [`A = ${l} × ${w}`, `A = ${fmt(l * w)}`] };
    },
  },
  {
    id: 'area-triangle',
    branchId: 'geometry',
    name: 'مساحة المثلث',
    formula: 'A = 0.5 × b × h',
    description: 'تحسب مساحة أي مثلث باستخدام طول قاعدته والارتفاع العمودي من رأس المثلث إلى تلك القاعدة. تُستخدم في المساحات، الرسومات الهندسية، والهندسة المدنية.',
    method: '1) حدد طول القاعدة b. 2) حدد الارتفاع h العمودي على تلك القاعدة. 3) اضرب نصف القاعدة في الارتفاع: A = 0.5 × b × h.',
    examples: [{ title: 'مثال', values: { b: 6, h: 4 }, steps: ['A = 0.5 × 6 × 4 = 12'] }],
    applicationProblems: [
      {
        question: 'مثلث قاعدته 10 سم وارتفاعه 6 سم. ما مساحته؟',
        hint: 'A = 0.5 × القاعدة × الارتفاع.',
        answer: 'A = 30 سم²',
        variables: { b: 10, h: 6 },
        expectedValue: 30,
      },
    ],
    variables: [{ name: 'b', label: 'القاعدة' }, { name: 'h', label: 'الارتفاع' }],
    solve(values) {
      const b = Number(values.b), h = Number(values.h);
      if ([b, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `A = ${fmt(0.5 * b * h)}`, steps: [`A = 0.5 × ${b} × ${h}`, `A = ${fmt(0.5 * b * h)}`] };
    },
  },
  {
    id: 'circumference-circle',
    branchId: 'geometry',
    name: 'محيط الدائرة',
    formula: 'C = 2πr',
    description: 'يحسب طول المحيط (الدائرة) الخارجية للدائرة. يُستخدم في حسابات العجلات، الأنابيب، والأشكال الدائرية.',
    method: '1) أوجد نصف قطر الدائرة r. 2) اضرب نصف القطر في 2π. 3) C = 2πr. 4) الناتج بطول الدائرة الكامل.',
    examples: [{ title: 'مثال', values: { r: 5 }, steps: ['C ≈ 31.416'] }],
    applicationProblems: [
      {
        question: 'عجلة دراجة نصف قطرها 14 بوصة. ما محيطها؟',
        hint: 'C = 2πr.',
        answer: 'C ≈ 87.96 بوصة',
        variables: { r: 14 },
        expectedValue: 87.96,
      },
    ],
    variables: [{ name: 'r', label: 'r' }],
    solve(values) {
      const r = Number(values.r);
      if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `C = ${fmt(2 * Math.PI * r)}`, steps: [`C = 2π × ${r}`, `C = ${fmt(2 * Math.PI * r)}`] };
    },
  },
  {
    id: 'volume-sphere',
    branchId: 'geometry',
    name: 'حجم الكرة',
    formula: 'V = (4/3)πr^3',
    description: 'يحجم حجم الكرة المجوفة الصلبة. يُستخدم في حسابات الكرات، الفقاعات، والأجرام السماوية تقريباً.',
    method: '1) أوجد نصف قطر الكرة r. 2) ارفع r للأس 3. 3) اضرب في (4/3)π. 4) V = (4/3)πr³.',
    examples: [{ title: 'مثال', values: { r: 3 }, steps: ['V ≈ 113.097'] }],
    applicationProblems: [
      {
        question: 'كرة مطاطية نصف قطرها 2 سم. ما حجمها؟',
        hint: 'V = (4/3) × π × r³.',
        answer: 'V ≈ 33.51 سم³',
        variables: { r: 2 },
        expectedValue: 33.51,
      },
    ],
    constants: [{ label: 'π', value: '3.14159', description: 'ثابت Pi' }],
    variables: [{ name: 'r', label: 'r' }],
    solve(values) {
      const r = Number(values.r);
      if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      return { result: `V = ${fmt((4 / 3) * Math.PI * r ** 3)}`, steps: [`V = (4/3)π × ${r}^3`, `V = ${fmt((4 / 3) * Math.PI * r ** 3)}`] };
    },
  },
  {
    id: 'volume-cylinder',
    branchId: 'geometry',
    name: 'حجم الأسطوانة',
    formula: 'V = πr^2 h',
    description: 'يحسب حجم الأسطوانة الدائرية القائمة، مثل الأنابيب، العلب، والأعمدة.',
    method: '1) أوجد نصف قطر القاعدة r. 2) أوجد ارتفاع الأسطوانة h. 3) احسب مساحة القاعدة πr² ثم اضربها في h. 4) V = πr²h.',
    examples: [{ title: 'مثال', values: { r: 2, h: 5 }, steps: ['V ≈ 62.832'] }],
    applicationProblems: [
      {
        question: 'علبة أسطوانية نصف قطرها 3 سم وارتفاعها 4 سم. ما حجمها؟',
        hint: 'V = π × r² × h.',
        answer: 'V ≈ 113.1 سم³',
        variables: { r: 3, h: 4 },
        expectedValue: 113.1,
      },
    ],
    variables: [{ name: 'r', label: 'r' }, { name: 'h', label: 'h' }],
    solve(values) {
      const r = Number(values.r), h = Number(values.h);
      if ([r, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `V = ${fmt(Math.PI * r * r * h)}`, steps: [`V = π × ${r}^2 × ${h}`, `V = ${fmt(Math.PI * r * r * h)}`] };
    },
  },
  {
    id: 'area-trapezoid',
    branchId: 'geometry',
    name: 'مساحة شبه المنحرف',
    formula: 'A = (a + b)/2 * h',
    description: 'يحسب مساحة شبه المنحرف باستخدام طولي القاعدتين والارتفاع.',
    method: '1) أوجد طول القاعدة العلوية a. 2) أوجد طول القاعدة السفلى b. 3) أوجد الارتفاع h. 4) A = (a + b)/2 × h.',
    examples: [{ title: 'مثال', values: { a: 5, b: 9, h: 4 }, steps: ['A = (5 + 9)/2 × 4 = 28'] }],
    applicationProblems: [
      {
        question: 'شبه منحرف قاعدتاه 8 و12 والارتفاع 6. ما مساحته؟',
        hint: 'A = (8 + 12)/2 × 6.',
        answer: 'A = 60',
        variables: { a: 8, b: 12, h: 6 },
        expectedValue: 60,
      },
    ],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }, { name: 'h', label: 'h' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b), h = Number(values.h);
      if ([a, b, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = ((a + b) / 2) * h;
      return { result: `A = ${fmt(result)}`, steps: [`A = (${a} + ${b})/2 × ${h}`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'volume-cone',
    branchId: 'geometry',
    name: 'حجم المخروط',
    formula: 'V = (1/3)πr^2h',
    description: 'يحسب حجم مخروط باستخدام نصف القطر والارتفاع.',
    method: '1) أوجد نصف قطر القاعدة r. 2) أوجد الارتفاع h. 3) V = (1/3) × π × r² × h.',
    examples: [{ title: 'مثال', values: { r: 3, h: 7 }, steps: ['V = (1/3) × π × 9 × 7 ≈ 65.97'] }],
    variables: [{ name: 'r', label: 'r' }, { name: 'h', label: 'h' }],
    solve(values) {
      const r = Number(values.r), h = Number(values.h);
      if ([r, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (1 / 3) * Math.PI * r * r * h;
      return { result: `V = ${fmt(result)}`, steps: [`V = (1/3) × π × ${r}² × ${h}`, `V = ${fmt(result)}`] };
    },
  },
  {
    id: 'surface-area-sphere',
    branchId: 'geometry',
    name: 'مساحة سطح الكرة',
    formula: 'A = 4πr^2',
    description: 'يحسب المساحة الكلية لسطح كرة.',
    method: '1) أوجد نصف القطر r. 2) A = 4 × π × r².',
    examples: [{ title: 'مثال', values: { r: 4 }, steps: ['A = 4 × π × 16 ≈ 201.06'] }],
    variables: [{ name: 'r', label: 'r' }],
    solve(values) {
      const r = Number(values.r);
      if (Number.isNaN(r)) return { result: 'أدخل رقماً صحيحاً', steps: [] };
      const result = 4 * Math.PI * r * r;
      return { result: `A = ${fmt(result)}`, steps: [`A = 4 × π × ${r}²`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'surface-area-cylinder',
    branchId: 'geometry',
    name: 'المساحة الكلية للأسطوانة',
    formula: 'A = 2πr(r + h)',
    description: 'تحسب المساحة الكلية لأسطوانة دائرية قائمة، أي مجموع مساحتي القاعدتين والمساحة الجانبية.',
    method: '1) أوجد نصف القطر r. 2) أوجد الارتفاع h. 3) احسب A = 2πr² + 2πrh أو A = 2πr(r+h).',
    examples: [{ title: 'مثال', values: { r: 2, h: 5 }, steps: ['A = 2π×2×(2+5) ≈ 87.96'] }],
    variables: [{ name: 'r', label: 'r' }, { name: 'h', label: 'h' }],
    solve(values) {
      const r = Number(values.r), h = Number(values.h);
      if ([r, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = 2 * Math.PI * r * (r + h);
      return { result: `A = ${fmt(result)}`, steps: [`A = 2π × ${r} × (${r} + ${h})`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'area-parallelogram',
    branchId: 'geometry',
    name: 'مساحة متوازي الأضلاع',
    formula: 'A = b × h',
    description: 'يحسب مساحة متوازي الأضلاع باستخدام القاعدة والارتفاع العمودي عليها.',
    method: '1) حدد طول القاعدة b. 2) حدد الارتفاع h العمودي على القاعدة. 3) A = b × h.',
    examples: [{ title: 'مثال', values: { b: 7, h: 4 }, steps: ['A = 28'] }],
    applicationProblems: [
      {
        question: 'متوازي أضلاع قاعدته 9 سم وارتفاعه 5 سم. ما مساحته؟',
        hint: 'A = b × h.',
        answer: 'A = 45 سم²',
        variables: { b: 9, h: 5 },
        expectedValue: 45,
      },
    ],
    variables: [{ name: 'b', label: 'b' }, { name: 'h', label: 'h' }],
    solve(values) {
      const b = Number(values.b), h = Number(values.h);
      if ([b, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = b * h;
      return { result: `A = ${fmt(result)}`, steps: [`A = ${b} × ${h}`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'distance-formula',
    branchId: 'geometry',
    name: 'المسافة بين نقطتين',
    formula: 'd = √((x2-x1)² + (y2-y1)²)',
    description: 'تحسب المسافة الأفقية بين نقطتين في المستوى الإحداثي. مشتقة من نظرية فيثاغورس.',
    method: '1) حدد إحداثيات النقطة الأولى (x1,y1). 2) حدد إحداثيات النقطة الثانية (x2,y2). 3) d = √((x2-x1)² + (y2-y1)²).',
    examples: [{ title: 'مثال', values: { x1: 0, y1: 0, x2: 3, y2: 4 }, steps: ['d = √(9+16) = 5'] }],
    applicationProblems: [
      {
        question: 'ما المسافة بين (1,2) و (4,6)؟',
        hint: 'd = √((4-1)² + (6-2)²).',
        answer: 'd = 5',
        variables: { x1: 1, y1: 2, x2: 4, y2: 6 },
        expectedValue: 5,
      },
    ],
    variables: [{ name: 'x1', label: 'x1' }, { name: 'y1', label: 'y1' }, { name: 'x2', label: 'x2' }, { name: 'y2', label: 'y2' }],
    solve(values) {
      const x1 = Number(values.x1), y1 = Number(values.y1), x2 = Number(values.x2), y2 = Number(values.y2);
      if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return { result: `d = ${fmt(result)}`, steps: [`d = √((${x2} - ${x1})² + (${y2} - ${y1})²)`, `d = ${fmt(result)}`] };
    },
  },
  {
    id: 'midpoint',
    branchId: 'geometry',
    name: 'نقطة المنتصف',
    formula: 'M = ((x1+x2)/2, (y1+y2)/2)',
    description: 'تحديد إحداثيات نقطة المنتصف بين نقطتين في المستوى الإحداثي.',
    method: '1) أوجد متوسط الإحداثيات السينية: (x1+x2)/2. 2) أوجد متوسط الإحداثيات الصادية: (y1+y2)/2.',
    examples: [{ title: 'مثال', values: { x1: 2, y1: 4, x2: 6, y2: 8 }, steps: ['M = (4, 6)'] }],
    variables: [{ name: 'x1', label: 'x1' }, { name: 'y1', label: 'y1' }, { name: 'x2', label: 'x2' }, { name: 'y2', label: 'y2' }],
    solve(values) {
      const x1 = Number(values.x1), y1 = Number(values.y1), x2 = Number(values.x2), y2 = Number(values.y2);
      if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      return { result: `M = (${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`, steps: [`M = ((${x1}+${x2})/2, (${y1}+${y2})/2)`, `M = (${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`] };
    },
  },
  {
    id: 'volume-pyramid',
    branchId: 'geometry',
    name: 'حجم الهرم',
    formula: 'V = (1/3)Bh',
    description: 'يحسب حجم الهرم باستخدام مساحة القاعدة والارتفاع. ينطبق على أهرامات بأي شكل قاعدة.',
    method: '1) أوجد مساحة قاعدة الهرم B. 2) أوجد الارتفاع العمودي h. 3) V = (1/3) × B × h.',
    examples: [{ title: 'مثال', values: { B: 9, h: 4 }, steps: ['V = (1/3) × 9 × 4 = 12'] }],
    variables: [{ name: 'B', label: 'B' }, { name: 'h', label: 'h' }],
    solve(values) {
      const B = Number(values.B), h = Number(values.h);
      if ([B, h].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (1 / 3) * B * h;
      return { result: `V = ${fmt(result)}`, steps: [`V = (1/3) × ${B} × ${h}`, `V = ${fmt(result)}`] };
    },
  },
  {
    id: 'area-sector',
    branchId: 'geometry',
    name: 'مساحة القطاع الدائري',
    formula: 'A = (θ/360) × πr²',
    description: 'يحسب مساحة قطاع دائري محصور بين زاوية مركزية وقوسها.',
    method: '1) حدد زاوية القطاع θ بالدرجات. 2) حدد نصف القطر r. 3) A = (θ/360) × πr².',
    examples: [{ title: 'مثال', values: { theta: 90, r: 4 }, steps: ['A = (90/360) × π × 16 ≈ 12.566'] }],
    variables: [{ name: 'theta', label: 'θ°' }, { name: 'r', label: 'r' }],
    solve(values) {
      const theta = Number(values.theta), r = Number(values.r);
      if ([theta, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (theta / 360) * Math.PI * r * r;
      return { result: `A = ${fmt(result)}`, steps: [`A = (${theta}/360) × π × ${r}²`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'diagonal-rectangle',
    branchId: 'geometry',
    name: 'قطر المستطيل',
    formula: 'd = √(l² + w²)',
    description: 'يحسب طول القطر في مستطيل باستخدام طوله وعرضه. مشتقة مباشرة من نظرية فيثاغورس.',
    method: '1) حدد الطول l. 2) حدد العرض w. 3) d = √(l² + w²).',
    examples: [{ title: 'مثال', values: { l: 6, w: 8 }, steps: ['d = √(36+64) = 10'] }],
    applicationProblems: [
      {
        question: 'ما طول قطر شاشة مستطيلة أبعادها 16 و 9؟',
        hint: 'd = √(16² + 9²).',
        answer: 'd = √337 ≈ 18.36',
        variables: { l: 16, w: 9 },
        expectedValue: 18.36,
      },
    ],
    variables: [{ name: 'l', label: 'l' }, { name: 'w', label: 'w' }],
    solve(values) {
      const l = Number(values.l), w = Number(values.w);
      if ([l, w].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.sqrt(l * l + w * w);
      return { result: `d = ${fmt(result)}`, steps: [`d = √(${l}² + ${w}²)`, `d = ${fmt(result)}`] };
    },
  },
  {
    id: 'surface-area-cone',
    branchId: 'geometry',
    name: 'المساحة الكلية للمخروط',
    formula: 'A = πr(r + l)',
    description: 'تحسب المساحة الكلية لمخروط، أي مجموع مساحة القاعدة والمساحة الجانبية، حيث l هو طول الضلع الجانبي.',
    method: '1) حدد نصف قطر القاعدة r. 2) حدد طول الضلع الجانبي l. 3) A = πr(r + l).',
    examples: [{ title: 'مثال', values: { r: 3, l: 5 }, steps: ['A = π×3×(3+5) ≈ 75.4'] }],
    variables: [{ name: 'r', label: 'r' }, { name: 'l', label: 'l' }],
    solve(values) {
      const r = Number(values.r), l = Number(values.l);
      if ([r, l].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.PI * r * (r + l);
      return { result: `A = ${fmt(result)}`, steps: [`A = π × ${r} × (${r} + ${l})`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'arc-length',
    branchId: 'geometry',
    name: 'طول القوس',
    formula: 's = (θ/360) × 2πr',
    description: 'يحسب طول قوس دائري محصور بزاوية مركزية θ بالدرجات ونصف قطر r.',
    method: '1) حدد الزاوية المركزية θ بالدرجات. 2) حدد نصف القطر r. 3) s = (θ/360) × 2πr.',
    examples: [{ title: 'مثال', values: { theta: 90, r: 4 }, steps: ['s = (90/360) × 2π×4 ≈ 6.283'] }],
    variables: [{ name: 'theta', label: 'θ°' }, { name: 'r', label: 'r' }],
    solve(values) {
      const theta = Number(values.theta), r = Number(values.r);
      if ([theta, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = (theta / 360) * 2 * Math.PI * r;
      return { result: `s = ${fmt(result)}`, steps: [`s = (${theta}/360) × 2π × ${r}`, `s = ${fmt(result)}`] };
    },
  },
  {
    id: 'ellipse-area',
    branchId: 'geometry',
    name: 'مساحة القطع الناقص',
    formula: 'A = πab',
    description: 'يحسب مساحة قطع ناقص بمحورين شبه قطرهما a و b. يعمم دائرة عند a = b = r.',
    method: '1) حدد نصف المحور الأكبر a. 2) حدد نصف المحور الأصغر b. 3) A = π × a × b.',
    examples: [{ title: 'مثال', values: { a: 5, b: 3 }, steps: ['A = π×5×3 ≈ 47.12'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = Math.PI * a * b;
      return { result: `A = ${fmt(result)}`, steps: [`A = π × ${a} × ${b}`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'circle-equation',
    branchId: 'geometry',
    name: 'معادلة الدائرة',
    formula: '(x - h)² + (y - k)² = r²',
    description: 'معادلة الدائرة ذات المركز (h,k) ونصف القطر r في المستوى الإحداثي.',
    method: '1) حدد إحداثيات المركز (h,k). 2) حدد نصف القطر r. 3) عوّض في المعادلة.',
    examples: [{ title: 'مثال', values: { h: 0, k: 0, r: 5 }, steps: ['x² + y² = 25'] }],
    variables: [{ name: 'h', label: 'h' }, { name: 'k', label: 'k' }, { name: 'r', label: 'r' }],
    solve(values) {
      const h = Number(values.h), k = Number(values.k), r = Number(values.r);
      if ([h, k, r].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const result = r * r;
      return { result: `(x - ${h})² + (y - ${k})² = ${result}`, steps: [`(x - ${h})² + (y - ${k})² = ${r}²`, `(x - ${h})² + (y - ${k})² = ${result}`] };
    },
  },
  {
    id: 'point-line-distance',
    branchId: 'geometry',
    name: 'المسافة من نقطة إلى مستقيم',
    formula: 'd = |Ax0 + By0 + C| / √(A² + B²)',
    description: 'تحسب المسافة القصيرة من نقطة (x0,y0) إلى مستقيم بصيغة Ax + By + C = 0.',
    method: '1) حدد معاملات المستقيم A و B و C. 2) حدد إحداثيات النقطة (x0,y0). 3) d = |Ax0+By0+C| / √(A²+B²).',
    examples: [{ title: 'مثال', values: { A: 3, B: 4, C: -5, x0: 1, y0: 2 }, steps: ['d = |3+8-5|/5 = 1.2'] }],
    variables: [{ name: 'A', label: 'A' }, { name: 'B', label: 'B' }, { name: 'C', label: 'C' }, { name: 'x0', label: 'x0' }, { name: 'y0', label: 'y0' }],
    solve(values) {
      const A = Number(values.A), B = Number(values.B), C = Number(values.C), x0 = Number(values.x0), y0 = Number(values.y0);
      if ([A, B, C, x0, y0].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      const num = Math.abs(A * x0 + B * y0 + C);
      const den = Math.sqrt(A * A + B * B);
      if (den === 0) return { result: 'A و B لا يمكن أن يكونا صفرين معاً', steps: [] };
      const result = num / den;
      return { result: `d = ${fmt(result)}`, steps: [`d = |${A}×${x0} + ${B}×${y0} + ${C}| / √(${A}² + ${B}²)`, `d = ${fmt(result)}`] };
    },
  },
  {
    id: 'area-regular-polygon',
    branchId: 'geometry',
    name: 'مساحة المضلع المنتظم',
    formula: 'A = (n s²) / (4 tan(π/n))',
    description: 'يحسب مساحة مضلع منتظم ذو n ضلعاً وطول ضلع s.',
    method: '1) حدد عدد الأضلاع n (n ≥ 3). 2) حدد طول الضلع s. 3) A = (n·s²)/(4·tan(π/n)).',
    examples: [{ title: 'مثال', values: { n: 6, s: 4 }, steps: ['A = (6×16)/(4×tan(π/6)) ≈ 41.57'] }],
    variables: [{ name: 'n', label: 'n' }, { name: 's', label: 's' }],
    solve(values) {
      const n = Number(values.n), s = Number(values.s);
      if ([n, s].some((x) => Number.isNaN(x))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (n < 3) return { result: 'n يجب أن يكون 3 أو أكبر', steps: [] };
      const result = (n * s * s) / (4 * Math.tan(Math.PI / n));
      return { result: `A = ${fmt(result)}`, steps: [`A = (${n}×${s}²)/(4×tan(π/${n}))`, `A = ${fmt(result)}`] };
    },
  },
  {
    id: 'ellipse-foci',
    branchId: 'geometry',
    name: 'البعد البؤري للقطع الناقص',
    formula: 'c = √(a² - b²)',
    description: 'يحسب المسافة من مركز القطع الناقص إلى كل بؤرة، حيث a نصف المحور الأكبر و b نصف المحور الأصغر.',
    method: '1) حدد نصف المحور الأكبر a. 2) حدد نصف المحور الأصغر b (b ≤ a). 3) c = √(a² - b²).',
    examples: [{ title: 'مثال', values: { a: 5, b: 3 }, steps: ['c = √(25-9) = 4'] }],
    variables: [{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }],
    solve(values) {
      const a = Number(values.a), b = Number(values.b);
      if ([a, b].some((n) => Number.isNaN(n))) return { result: 'أدخل أرقاماً صحيحة', steps: [] };
      if (a < b) return { result: 'a يجب أن يكون ≥ b', steps: [] };
      const result = Math.sqrt(a * a - b * b);
      return { result: `c = ${fmt(result)}`, steps: [`c = √(${a}² - ${b}²)`, `c = ${fmt(result)}`] };
    },
  }
];
