<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition name="guide-fade">
    <div v-if="visible" class="guide-panel">
      <div class="guide-header">
        <span class="guide-title">📖 طريقة تنفيذ التجربة</span>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="guide-body">
        <div class="step">
          <span class="step-num">١</span>
          <div class="step-text">
            <strong>ضبط التيار:</strong> استخدم منزلق التيار I في لوحة المعلمات لاختيار قيمة (مثلاً 10 A).
          </div>
        </div>

        <div class="step">
          <span class="step-num">٢</span>
          <div class="step-text">
            <strong>تشغيل المحاكاة:</strong> اضغط <span class="badge">▶️ تشغيل</span> لبدء تدفق التيار في القضيب المعدني وظهور خطوط المجال المغناطيسي الدائرية.
          </div>
        </div>

        <div class="step">
          <span class="step-num">٣</span>
          <div class="step-text">
            <strong>تحريك العرض:</strong> استخدم <span class="key">دولاب الماوس</span> للتكبير/التصغير، واسحب بالماوس للتنقل. نقر مزدوج لإعادة الضبط.
          </div>
        </div>

        <div class="step">
          <span class="step-num">٤</span>
          <div class="step-text">
            <strong>وضع المسبار:</strong> اضغط على أيقونة <span style="color:#a855f7">📡 مسبار هول</span> في زاوية مساحة العمل واسحبها إلى النقطة المراد قياس المجال عندها.
          </div>
        </div>

        <div class="step">
          <span class="step-num">٥</span>
          <div class="step-text">
            <strong>قراءة القياس:</strong> عند إفلات المسبار، يُحسب تلقائياً المسافة r عن القضيب وشدة المجال B ويُعرضان بجانب المسبار. القيمة تثبت حتى تنتقل لنقطة أخرى.
          </div>
        </div>

        <div class="step">
          <span class="step-num">٦</span>
          <div class="step-text">
            <strong>تسجيل القراءة:</strong> اضغط <span class="badge">📌 تسجيل قراءة</span> أو مفتاح <span class="key">S</span> لحفظ القياس (I, r, B) في جدول البيانات.
          </div>
        </div>

        <div class="step">
          <span class="step-num">٧</span>
          <div class="step-text">
            <strong>تكرار القياس:</strong> اسحب المسبار إلى نقطة أخرى بمسافة مختلفة وكرّر الخطوات ٤-٦. سجّل على الأقل ٥ قراءات لمسافات مختلفة.
          </div>
        </div>

        <div class="step">
          <span class="step-num">٨</span>
          <div class="step-text">
            <strong>تغيير التيار (اختياري):</strong> غيّر قيمة I وكرّر القياسات لدراسة تأثير التيار على B. القياسات السابقة ستبقى في الجدول.
          </div>
        </div>

        <div class="step">
          <span class="step-num">٩</span>
          <div class="step-text">
            <strong>تصدير البيانات:</strong> اضغط <span class="badge">💾 تصدير CSV</span> لحفظ الجدول كملف، أو <span class="badge green">📈 تحليل النتائج</span> لفتح صفحة التحليل ورسم العلاقة B vs r و B vs 1/r.
          </div>
        </div>

        <div class="formula-note">
          <div class="formula">B = μ₀I / (2πr)</div>
          <div class="note">الميل في رسم B vs 1/r يساوي μ₀I / 2π — استخدمه لحساب μ₀</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.guide-panel { background: rgba(30,37,48,.8); backdrop-filter: blur(12px); border: 1px solid rgba(34,197,94,.15); border-radius: 10px; display: flex; flex-direction: column; max-height: 100%; overflow: hidden; }
.guide-header { display: flex; justify-content: space-between; align-items: center; padding: .5rem .75rem; border-bottom: 1px solid rgba(34,197,94,.1); flex-shrink: 0; }
.guide-title { font-size: .85rem; font-weight: 700; color: #22c55e; }
.close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: .8rem; }
.close-btn:hover { color: #ef4444; }
.guide-body { padding: .6rem .75rem; overflow-y: auto; display: flex; flex-direction: column; gap: .5rem; }
.step { display: flex; gap: .5rem; align-items: flex-start; }
.step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: rgba(34,197,94,.15); color: #22c55e; font-size: .75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.step-text { font-size: .75rem; color: #B8C0CC; line-height: 1.5; }
.step-text strong { color: #D1D7E0; }
.badge { display: inline-block; padding: .1rem .4rem; background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.2); border-radius: 4px; font-size: .7rem; color: #f59e0b; }
.badge.green { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.2); color: #22c55e; }
.key { display: inline-block; padding: .05rem .3rem; background: #2D3645; border: 1px solid #3D4655; border-radius: 3px; font-size: .7rem; font-family: monospace; color: #94a3b8; }
.formula-note { margin-top: .3rem; padding: .5rem; background: rgba(245,158,11,.06); border-radius: 6px; border: 1px solid rgba(245,158,11,.1); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #f59e0b; text-align: center; }
.note { font-size: .68rem; color: #64748b; text-align: center; margin-top: .25rem; }
.guide-fade-enter-active, .guide-fade-leave-active { transition: all .2s ease; }
.guide-fade-enter-from, .guide-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>