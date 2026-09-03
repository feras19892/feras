<template>
  <div v-if="open" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <button class="close-btn" @click="close">×</button>
      <h2>❓ دليل المدرسة التفصيلي</h2>
      <p class="intro">
        شرح حرفي لكل عنصر وكل أيقونة وكل زر في لوحة المدرسة ووظيفته.
      </p>

      <div class="section">
        <h3>🔝 الشريط العلوي</h3>
        <ul>
          <li><strong>🔍 البحث/الأوامر:</strong> شريط سريع للبحث في المعلمين، الطلاب، الفصول، أو تنفيذ أوامر مختصرة.</li>
          <li><strong>🔔 جرس الإشعارات:</strong> يعرض عدد الإشعارات غير المقروءة. عند الضغط يظهر القائمة المنسدلة مع زر "تعيين الكل مقروء".</li>
          <li><strong>🟢/🟡/🔴 مؤشر الاتصال:</strong> يوضح حالة الاتصال بالخادم: مباشر (SSE)، تحديث دوري، أو غير متصل.</li>
          <li><strong>❓ زر المساعدة:</strong> يفتح هذا الدليل.</li>
        </ul>
      </div>

      <div class="section">
        <h3>📂 القائمة الجانبية</h3>
        <ul>
          <li><strong>📊 نظرة عامة:</strong> ملخص شامل: عدد المعلمين والطلاب والفصول، التقارير المُسلّمة، الاختبارات النشطة، آخر النشاطات، وأكثر الفصول نشاطًا.</li>
          <li><strong>🔬 التجارب:</strong> قائمة التجارب العلمية المتاحة للمدرسة. تستطيع تفعيل/تعطيل التجربة أو عرض إحصائيات استخدامها.</li>
          <li><strong>👨‍🏫 المدرسون:</strong> قائمة معلمي المدرسة. يمكن قبول أو رفض انضمام معلم، تجميد حسابه، أو حذفه.</li>
          <li><strong>👨‍🎓 الطلاب:</strong> قائمة طلاب المدرسة. يمكن قبول أو رفض انضمام طالب، تجميد حسابه، نقله لفصل آخر، أو حذفه.</li>
          <li><strong>📚 الفصول:</strong> إنشاء فصل جديد، تعديل اسمه، ربطه بمعلم، تجميده، أو حذفه. كما تعرض كود دعوة كل فصل.</li>
          <li><strong>⚠️ التحذيرات:</strong> إرسال تحذير للطلاب أو المعلمين: اكتب العنوان، الرسالة، واختر مستلميها (دور محدد أو فصل معين).</li>
          <li><strong>🔔 الإشعارات:</strong> إشعارات النظام المخصصة للمدرسة: قبول طلبات، تحديثات، تنبيهات.</li>
          <li><strong>💬 الشكاوى والتقييمات:</strong> مراجعة شكاوى وتقييمات المستخدمين التابعة للمدرسة والرد عليها أو تحويلها للأدمن.</li>
          <li><strong>⏱️ سجل النشاطات:</strong> سجل زمني بكل الأحداث داخل نطاق المدرسة: تسجيلات دخول، إنشاء فصول، إرسال تحذيرات.</li>
          <li><strong>📄 التقارير:</strong> متابعة تقارير طلاب المدرسة حسب الفصل والمعلم والحالة.</li>
          <li><strong>💳 الاشتراكات والفوترة:</strong> حالة اشتراك المدرسة، تاريخ التجديد، الباقة، وإنشاء أكواد دعوة للطلاب والمعلمين.</li>
          <li><strong>⚙️ الإعدادات:</strong> تعديل اسم المدرسة، الشعار، بيانات التواصل، والصلاحيات الافتراضية.</li>
        </ul>
      </div>

      <div class="section">
        <h3>⚠️ داخل صفحة التحذيرات</h3>
        <ul>
          <li><strong>نموذج التحذير:</strong> أدخل العنوان والرسالة واختر شدة التحذير (منخفض/متوسط/عالي).</li>
          <li><strong>المستلمون:</strong> اختر إرسال لكل المعلمين، كل الطلاب، أو طلاب/معلمي فصل محدد.</li>
          <li><strong>سجل التحذيرات:</strong> يعرض التحذيرات المرسلة سابقًا مع حالة القراءة.</li>
        </ul>
      </div>

      <div class="section">
        <h3>💡 اختصارات</h3>
        <ul>
          <li><strong>Alt + رقم (1–9):</strong> الانتقال السريع للتبويب المطابق في القائمة الجانبية.</li>
          <li><strong>Ctrl/Cmd + K:</strong> فتح لوحة البحث والأوامر.</li>
        </ul>
      </div>

      <div class="section">
        <h3>⚠️ ملاحظات مهمة</h3>
        <ul>
          <li>عدد المعلمين والطلاب محدود بحسب باقة الاشتراك الحالية.</li>
          <li>يمكن تجميد أو حظر مستخدم من تبويب المدرسون/الطلاب.</li>
          <li>كل التغييرات تُسجَّل في <strong>سجل النشاطات</strong> للرجوع إليها.</li>
        </ul>
      </div>

      <div class='section'>
        <h3>🎓 كيف تدير مدرستك خطوة بخطوة</h3>
        <ul>
          <li><strong>إضافة معلم أو طالب:</strong> انسخ "كود المدرسة" الظاهر في الشريط العلوي وأرسله للمعلم/الطالب. عند تسجيلهم يكتبون الكود في خانة "كود الدعوة" أثناء التسجيل، ثم سيظهرون في قوائم "المدرسون" أو "الطلاب"؛ اضغط "قبول" لتفعيل الحساب.</li>
          <li><strong>إنشاء فصل جديد:</strong> ادخل "الفصول" ← اضغط "إنشاء فصل" ← أدخل الاسم والمرحلة ← يُنشأ كود دعوة للفصل ← شاركه مع الطلاب لينضموا تلقائياً.</li>
          <li><strong>توليد أكواد دعوة:</strong> في صفحة "الفصول" اضغط على الفصل ثم "إعادة توليد الكود"، سيُنشأ كود جديد والقديم يتوقف عن العمل.</li>
          <li><strong>إدارة الطلاب والمدرسين:</strong> من "المستخدمون" ← "الطلاب/المدرسون" يمكنك تجميد حساب، نقله لفصل آخر، أو حذفه نهائياً.</li>
          <li><strong>مراقبة التقارير:</strong> اذهب إلى "التقارير" ← راجع تقارير الطلاب حسب الفصل أو الحالة (مُرسل/مصحّح/معاد).</li>
          <li><strong>إرسال تحذير:</strong> افتح "التحذيرات" ← اكتب العنوان والرسالة ← اختر المستلمين (كل المعلمين، كل الطلاب، أو فصل) ← اضغط "إرسال".</li>
        </ul>
      </div>
      <div class='section'>
        <h3>⚡ سيناريوهات يومية</h3>
        <ul>
          <li><strong>طالب متأخر في الانضمام:</strong> أرسل له كود الفصل ← يسجّل بحساب جديد أو يدخل الكود في إعداداته ← ينضم للفصل فوراً.</li>
          <li><strong>معلم نسي كود الفصل:</strong> من "الفصول" اضغط على الفصل ثم "عرض الكود" ← انسخه وأرسله له.</li>
          <li><strong>تقرير غير مكتمل:</strong> افتح "التقارير" ← اختر التقرير ← ارجعه للطالب بملاحظة "أعد الإرسال بعد إكمال الخطوات".</li>
          <li><strong>تجميد حساب مؤقتاً:</strong> في "المستخدمون" اختر المستخدم ثم "تجميد" ← اكتب السبب ← لن يتمكن من الدخول حتى تُلغي التجميد.</li>
        </ul>
      </div>
      <button class='btn-submit' @click='close'>إغلاق</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

function close() { emit('close'); }
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 1200;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(2px);
}
.modal-card {
  background: #0f172a; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; padding: 1.5rem; max-width: 600px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  position: relative;
}
.close-btn {
  position: absolute; top: 0.6rem; inset-inline-end: 0.8rem;
  background: none; border: none; color: #94a3b8; font-size: 1.4rem;
  cursor: pointer;
}
h2 { margin-top: 0; color: #f1f5f9; text-align: center; }
.intro { color: #94a3b8; text-align: center; margin-bottom: 1rem; }
.section { margin-bottom: 1.2rem; }
.section h3 { color: #a5b4fc; margin: 0 0 0.5rem; font-size: 1rem; }
.section ul { margin: 0; padding-right: 1.2rem; color: #cbd5e1; font-size: 0.9rem; line-height: 1.8; }
.section li { margin-bottom: 0.4rem; }
.btn-submit {
  width: 100%; padding: 0.7rem; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
  font-weight: 700; cursor: pointer; margin-top: 0.5rem;
}
</style>
