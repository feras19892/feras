<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
defineProps<{
  sourceExperiment: string
}>()

const refs: Record<string, { title: string; relations: { rel: string; desc: string; color: string }[]; notes: string[] }> = {
  'electric-lab-compound': {
    title: '📊 علاقات الدائرة المختلطة',
    relations: [
      { rel: 'Req = R₁ + R₂R₃/(R₂+R₃)', desc: 'مقاومة السلسلة + التوازي', color: '#fbbf24' },
      { rel: 'V = I × Req', desc: 'الجهد الكلي = التيار × المقاومة المكافئة', color: '#67e8f9' },
    ],
    notes: ['💡 احسب المقاومة المكافئة للتوازي أولاً، ثم أضفها للمقاومة التسلسلية.', '⚡ ميل خط V vs I يساوي Req.'],
  },
  'electric-lab-emf': {
    title: '📊 علاقات القوة الدافعة',
    relations: [
      { rel: 'EMF = Vt + I×r', desc: 'القوة الدافعة = جهد الأطراف + هبوط الجهد الداخلي', color: '#fbbf24' },
      { rel: 'r = (EMF−Vt)/I', desc: 'المقاومة الداخلية من فرق الجهد والتيار', color: '#67e8f9' },
    ],
    notes: ['💡 عند فتح الدائرة I=0، Vt = EMF.', '⚡ كلما زاد التيار، زاد هبوط الجهد الداخلي.'],
  },
  'electric-lab-temp-r': {
    title: '📊 تأثير الحرارة على المقاومة',
    relations: [
      { rel: 'R = R₀(1+αΔT)', desc: 'المقاومة تزداد مع الحرارة للمعادن', color: '#fbbf24' },
      { rel: 'α = (R−R₀)/(R₀×ΔT)', desc: 'معامل الحرارة من القياس', color: '#67e8f9' },
    ],
    notes: ['💡 α للنحاس ≈ 0.00393/°C.', '⚡ الرسم البياني R vs T خط مستقيم.'],
  },
  'electric-lab-cells-series': {
    title: '📊 الخلايا على التوالي',
    relations: [
      { rel: 'EMF_total = EMF₁+EMF₂', desc: 'القوى الدافعة تُجمع', color: '#fbbf24' },
      { rel: 'r_total = r₁+r₂', desc: 'المقاومات الداخلية تُجمع', color: '#67e8f9' },
    ],
    notes: ['💡 I = EMF_total / (R + r_total).', '⚡ جهد الأطراف Vt = I × R.'],
  },
  'electric-lab-cells-parallel': {
    title: '📊 الخلايا على التوازي',
    relations: [
      { rel: 'EMF_eq = EMF (متساوية)', desc: 'القوة الدافعة تبقى كما هي', color: '#fbbf24' },
      { rel: 'r_eq = r/n', desc: 'المقاومة الداخلية تُقسم', color: '#67e8f9' },
    ],
    notes: ['💡 الخلايا المتوازية تقلل المقاومة الداخلية.', '⚡ التيار الكلي = n × تيار الخلية الواحدة.'],
  },
  'electric-lab-rheostat': {
    title: '📊 الريوستات',
    relations: [
      { rel: 'R = V/I', desc: 'المقاومة المتغيرة من قانون أوم', color: '#fbbf24' },
      { rel: 'I ∝ 1/R', desc: 'عند ثبوت V، التيار يتناسب عكسياً', color: '#67e8f9' },
    ],
    notes: ['💡 الريوستات يتحكم في التيار بتغيير المقاومة.', '⚡ عند R = 0، التيار يكون أقصى ما يمكن.'],
  },
  'electric-lab-current-divider': {
    title: '📊 مقسم التيار',
    relations: [
      { rel: 'I₁ = It×R₂/(R₁+R₂)', desc: 'تيار الفرع الأول', color: '#fbbf24' },
      { rel: 'I₂ = It×R₁/(R₁+R₂)', desc: 'تيار الفرع الثاني', color: '#67e8f9' },
    ],
    notes: ['💡 التيار يزداد في المسار الأقل مقاومة.', '⚡ I₁ + I₂ = It دائماً.'],
  },
  'electric-lab-source-eff': {
    title: '📊 كفاءة المصدر',
    relations: [
      { rel: 'η = R/(R+r)', desc: 'الكفاءة تزداد مع زيادة R', color: '#fbbf24' },
      { rel: 'P_load = I²R', desc: 'القدرة المستهلكة في الحمل', color: '#67e8f9' },
    ],
    notes: ['💡 عند R = r، الكفاءة = 50% والقدرة قصوى.', '⚡ η تقترب من 100% عندما R >> r.'],
  },
  'electric-lab-two-sources': {
    title: '📊 مصدران متضادان',
    relations: [
      { rel: 'I = (EMF₁−EMF₂)/(R+r₁+r₂)', desc: 'صافي التيار من فرق القوى', color: '#fbbf24' },
      { rel: 'Vt = I × R', desc: 'جهد الأطراف عبر الحمل', color: '#67e8f9' },
    ],
    notes: ['💡 اتجاه التيار يحدده المصدر الأقوى.', '⚡ عند EMF₁ = EMF₂، التيار = صفر.'],
  },
  'electric-lab-diode-iv': {
    title: '📊 خصائص الدايود',
    relations: [
      { rel: 'I = Is(e^(V/ηVt)−1)', desc: 'معادلة شوكلي للدايود', color: '#fbbf24' },
      { rel: 'V_barrier ≈ 0.7V', desc: 'جهد الحاجز للسيليكون', color: '#67e8f9' },
    ],
    notes: ['💡 قبل V_barrier، التيار ≈ صفر.', '⚡ بعد V_barrier، التيار يزداد أُسياً.'],
  },
  'electric-lab-transformer': {
    title: '📊 نسبة المحوّل',
    relations: [
      { rel: 'Vs/Vp = Ns/Np', desc: 'نسبة الجهد = نسبة اللفات', color: '#fbbf24' },
      { rel: 'Is/Ip = Np/Ns', desc: 'نسبة التيار عكسية', color: '#67e8f9' },
    ],
    notes: ['💡 P_primary = P_ideal (حفظ الطاقة).', '⚡ المحوّل الخافض: Vs < Vp، Is > Ip.'],
  },
  'electric-lab-self-inductance': {
    title: '📊 التحريض الذاتي',
    relations: [
      { rel: 'V = −L(dI/dt)', desc: 'الجهد المستحث يعارض التغير', color: '#fbbf24' },
      { rel: 'E = ½LI²', desc: 'الطاقة المخزنة في الملف', color: '#67e8f9' },
    ],
    notes: ['💡 τ = L/R ثابت الزمن للملف.', '⚡ الطاقة تتبادل بين المجال المغناطيسي والدائرة.'],
  },
  'electric-lab-thermistor': {
    title: '📊 الثيرميستور (NTC)',
    relations: [
      { rel: 'R = R₀×e^(β(1/T−1/T₀))', desc: 'المقاومة تقل مع الحرارة', color: '#fbbf24' },
      { rel: 'β ≈ 3950K', desc: 'ثابت المادة', color: '#67e8f9' },
    ],
    notes: ['💡 NTC: معامل حرارة سالب.', '⚡ الرسم البياني ln(R) vs 1/T خط مستقيم.'],
  },
  'electric-lab-magnetic-force': {
    title: '📊 القوة المغناطيسية',
    relations: [
      { rel: 'F = BIL sin(θ)', desc: 'قوة لورنتز على سلك يحمل تيار', color: '#fbbf24' },
      { rel: 'F ∝ I', desc: 'القوة تتناسب طردياً مع التيار', color: '#67e8f9' },
    ],
    notes: ['💡 عند θ = 90°، القوة قصوى.', '⚡ عند θ = 0°، القوة = صفر.'],
  },
  'electric-lab-lc-oscillation': {
    title: '📊 دائرة LC المتذبذبة',
    relations: [
      { rel: 'f = 1/(2π√(LC))', desc: 'تردد التذبذب الطبيعي', color: '#fbbf24' },
      { rel: 'E = ½CV² + ½LI²', desc: 'الطاقة الكلية ثابتة', color: '#67e8f9' },
    ],
    notes: ['💡 الطاقة تتبادل بين المكثف والملف.', '⚡ ω = 1/√(LC) التردد الزاوي.'],
  },
  'electromagnetism-straight-wire': {
    title: '📊 المجال المغناطيسي لسلك مستقيم',
    relations: [
      { rel: 'B = μ₀I / (2πr)', desc: 'قانون بيو-سافار لسلك لا نهائي', color: '#fbbf24' },
      { rel: 'B ∝ I/r', desc: 'المجال يتناسب طردياً مع التيار وعكسياً مع المسافة', color: '#67e8f9' },
      { rel: 'μ₀ = 4π×10⁻⁷ T·m/A', desc: 'نفاذية الفراغ', color: '#22c55e' },
    ],
    notes: ['💡 خطوط المجال عبارة عن دوائر مركزية حول السلك.', '⚡ رسم B vs 1/r يعطي خط مستقيم، ميله = μ₀I/2π.', '🔬 استخدم الميل لحساب μ₀ تجريبياً.'],
  },
  'electromagnetism-circular-coil': {
    title: '📊 المجال المغناطيسي لملف دائري',
    relations: [
      { rel: 'B = μ₀NI / (2R)', desc: 'المجال في مركز ملف دائري', color: '#fbbf24' },
      { rel: 'B ∝ NI/R', desc: 'المجال يتناسب طردياً مع NI وعكسياً مع R', color: '#67e8f9' },
      { rel: 'μ₀ = 4π×10⁻⁷ T·m/A', desc: 'نفاذية الفراغ', color: '#22c55e' },
    ],
    notes: ['💡 المجال أقصى ما يكون في مركز الملف.', '⚡ رسم B vs NI يعطي خط مستقيم، ميله = μ₀/2R.', '🔬 رسم B vs 1/R يعطي خط مستقيم، ميله = μ₀NI/2.'],
  },
}
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <div class="panel-body" v-if="refs[sourceExperiment]">
    <div class="ref-title">{{ refs[sourceExperiment].title }}</div>
    <div class="ref-table">
      <div class="ref-header">
        <span>العلاقة</span>
        <span>الشرح</span>
      </div>
      <div v-for="ref in refs[sourceExperiment].relations" :key="ref.rel" class="ref-row">
        <span :style="{ color: ref.color, fontFamily: 'Courier New, monospace', fontWeight: 700 }">{{ ref.rel }}</span>
        <span>{{ ref.desc }}</span>
      </div>
    </div>
    <div v-for="(note, i) in refs[sourceExperiment].notes" :key="i" class="ref-note">{{ note }}</div>
  </div>
  <div v-else class="panel-body">
    <div class="ref-title">📊 مرجع التجربة</div>
    <div class="ref-note">لا توجد معلومات مرجعية متاحة.</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
.ref-title { font-size: .9rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-table { display: flex; flex-direction: column; gap: .25rem; }
.ref-header { display: flex; justify-content: space-between; padding: .4rem .6rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .8rem; color: #94a3b8; }
.ref-row { display: flex; justify-content: space-between; padding: .35rem .6rem; border-bottom: 1px solid #1e2530; font-size: .78rem; gap: .5rem; }
.ref-row:last-child { border-bottom: none; }
.ref-note { font-size: .75rem; color: #64748b; margin-top: .5rem; }
</style>