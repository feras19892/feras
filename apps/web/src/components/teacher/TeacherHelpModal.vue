<template>
  <div v-if="open" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <button class="close-btn" @click="close">×</button>
      <h2>❓ دليل المدرس التفصيلي</h2>
      <p class="intro">
        شرح حرفي لكل عنصر وكل أيقونة وكل زر في لوحة المدرس ووظيفته.
      </p>

      <div class="section">
        <h3>🔝 الشريط العلوي</h3>
        <ul>
          <li><strong>🔍 البحث/الأوامر:</strong> شريط سريع للبحث في الطلاب، الفصول، التقارير، أو تنفيذ أوامر مختصرة.</li>
          <li><strong>🔔 جرس الإشعارات:</strong> يعرض عدد الإشعارات غير المقروءة. عند الضغط يظهر القائمة المنسدلة مع زر "تعيين الكل مقروء".</li>
          <li><strong>🟢/🟡/🔴 مؤشر الاتصال:</strong> يوضح حالة الاتصال بالخادم: مباشر (SSE)، تحديث دوري، أو غير متصل.</li>
          <li><strong>❓ زر المساعدة:</strong> يفتح هذا الدليل.</li>
        </ul>
      </div>

      <div class="section">
        <h3>📂 القائمة الجانبية</h3>
        <ul>
          <li><strong>🏠 الرئيسية:</strong> ملخص فصولك: عدد الطلاب، التقارير المعلّقة، الاختبارات النشطة، آخر النشاطات، والتنبيهات.</li>
          <li><strong>📚 فصولي:</strong> إدارة فصولك: إنشاء فصل جديد، إعادة توليد كود الدعوة، تعديل الاسم، تجميد الفصل، أو حذفه.</li>
          <li><strong>📝 الامتحانات:</strong> إنشاء اختبار جديد، تحديد الأسئلة والفصول المستهدفة، ومراجعة نتائج الطلاب.</li>
          <li><strong>🔬 التجارب:</strong> قائمة التجارب العلمية التي يمكن توجيه الطلاب لتنفيذها، مع معاينة الإعدادات.</li>
          <li><strong>📄 تقارير التجارب:</strong> جميع تقارير طلاب فصولك. يمكنك فتح التقرير، تصحيح الدرجة، إضافة ملاحظات، وإعادته للطالب.</li>
          <li><strong>💬 الدردشة:</strong> محادثات فصولك. اقرأ الرسائل، أرسل إعلانات، واحذف الرسائل المخالفة.</li>
          <li><strong>🔔 الإشعارات:</strong> إشعارات النظام لك: تنبيهات بتسليم تقرير، رسائل إدارية، إعلانات.</li>
          <li><strong>⭐ التقييم والشكاوى:</strong> إرسال تقييم أو شكوى للإدارة، أو مراجعة التقييمات الواردة عليك.</li>
          <li><strong>💳 الاشتراك والدعوات:</strong> حالة اشتراكك، كود دعوة الطلاب، وإدارة الأكواد.</li>
          <li><strong>⚙️ الإعدادات:</strong> تعديل بياناتك الشخصية، كلمة المرور، واللغة.</li>
        </ul>
      </div>

      <div class="section">
        <h3>📄 داخل صفحة التقارير</h3>
        <ul>
          <li><strong>قائمة التقارير:</strong> تعرض تقارير الطلاب حسب الفصل والحالة: مُرسل، مصحح، معاد، مسودة.</li>
          <li><strong>زر التصحيح:</strong> يفتح نموذج تحديد الدرجة (0–100) وكتابة الملاحظات الفورية.</li>
          <li><strong>زر الإعادة:</strong> يرجع التقرير للطالب مع ملاحظة لإجراء التعديلات المطلوبة.</li>
          <li><strong>فلترة البحث:</strong> ابحث بتجربة معينة أو طالب معين لتسريع المراجعة.</li>
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
          <li>شارك <strong>كود الدعوة</strong> مع طلابك ليتمكنوا من الانضمام لفصلك.</li>
          <li>يمكنك تجميد طالب أو فصل مؤقتًا من صفحة فصولي.</li>
          <li>أي رسالة مخالفة في الدردشة يمكن الإبلاغ عنها للأدمن.</li>
        </ul>
      </div>

      <div class='section'>
        <h3>👨‍🏫 سيناريوهات يومية للمعلم</h3>
        <ul>
          <li><strong>إنشاء فصل:</strong> من "فصولي" ← "إنشاء فصل" ← أدخل الاسم ← ستحصل على كود دعوة ← شاركه مع طلابك.</li>
          <li><strong>إضافة طلاب للفصل:</strong> أعطِ الطلاب كود الفصل ← عند تسجيلهم يكتبونه ← يظهرون في "فصولي" ← اضغط "قبول".</li>
          <li><strong>تصحيح تقرير:</strong> افتح "تقارير التجارب" ← اختر التقرير ← اضغط "تصحيح" ← أدخل الدرجة والملاحظات ← "حفظ".</li>
          <li><strong>إعادة تقرير:</strong> في نفس نافذة التصحيح اضغط "إعادة" ← اكتب ما ينقص الطالب ← سيصله إشعار لإعادة الإرسال.</li>
          <li><strong>إنشاء اختبار:</strong> من "الامتحانات" ← "جديد" ← أدخل الأسئلة والخيارات ← حدد الفصول المستهدفة ← نشر الاختبار.</li>
          <li><strong>توجيه تجربة:</strong> من "التجارب" اختر التجربة ثم "توجيه للفصول" ← حدد الفصل والموعد.</li>
          <li><strong>إرسال إعلان:</strong> من "الدردشة" اختر الفصل ثم "إعلان" ← اكتب الرسالة ← سيراها الجميع.</li>
        </ul>
      </div>
      <div class='section'>
        <h3>✅ نصائح للاستخدام الأمثل</h3>
        <ul>
          <li>راجع "الرئيسية/الملخص اليومي" صباحاً لتعرف التقارير غير المصحّحة والاختبارات النشطة.</li>
          <li>استخدم "الإشعارات" للتنبيه على موعد اختبار أو تجربة قادمة.</li>
          <li>إذا واجهت مشكلة تقنية، استخدم "التقييم والشكاوى" وأرسلها للإدارة.</li>
          <li>يمكنك فلترة التقارير بالتجربة أو الطالب لتصحيح أسرع.</li>
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
