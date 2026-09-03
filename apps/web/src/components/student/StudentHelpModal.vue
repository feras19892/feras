<template>
  <div v-if="open" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <button class="close-btn" @click="close">×</button>
      <h2>❓ دليل الطالب التفصيلي</h2>
      <p class="intro">
        شرح حرفي لكل عنصر وكل أيقونة وكل زر في لوحة الطالب ووظيفته.
      </p>

      <div class="section">
        <h3>🔝 الشريط العلوي</h3>
        <ul>
          <li><strong>🔍 البحث/الأوامر:</strong> شريط سريع للبحث في التجارب، الفصول، أو التقارير وتشغيل أوامر مختصرة.</li>
          <li><strong>🔔 جرس الإشعارات:</strong> يعرض عدد الإشعارات غير المقروءة. عند الضغط يظهر القائمة المنسدلة مع زر "تعيين الكل مقروء".</li>
          <li><strong>🟢/🟡/🔴 مؤشر الاتصال:</strong> يوضح حالة الاتصال بالخادم: مباشر (SSE)، تحديث دوري، أو غير متصل.</li>
          <li><strong>❓ زر المساعدة:</strong> يفتح هذا الدليل.</li>
        </ul>
      </div>

      <div class="section">
        <h3>📂 القائمة الجانبية</h3>
        <ul>
          <li><strong>🏠 الرئيسية:</strong> ملخصك الشخصي: آخر الإشعارات، التقارير المعلّقة، الاختبارات القادمة، إنجازاتك، ونقاطك.</li>
          <li><strong>🔬 التجارب:</strong> قائمة التجارب العلمية المتاحة. اختر تجربة لتشغيل المحاكاة، تعديل المتغيرات، ملاحظة النتائج، وحفظ التقرير.</li>
          <li><strong>📚 فصولي:</strong> الفصول المسجلة فيها. اضغط على فصل لعرض المعلم، الزملاء، والتقارير المرتبطة به.</li>
          <li><strong>📄 تقاريري:</strong> جميع تقاريرك: التقارير المُرسلة، قيد المراجعة، المعاد إرسالها، أو المصححة. تستطيع فتح كل تقرير لعرض الدرجة والملاحظات.</li>
          <li><strong>📝 الامتحانات:</strong> الاختبارات المتاحة لك حاليًا (نشطة) ونتائجك في الاختبارات السابقة (منتهية).</li>
          <li><strong>💬 الدردشة:</strong> المحادثات الخاصة بفصولك. ارسل رسائل، شاهد التنبيهات، وتابع الإعلانات.</li>
          <li><strong>🔔 الإشعارات:</strong> كل إشعارات النظام لك: تنبيهات، تحذيرات، تقييمات، إعلانات. يمكن تعيينها مقروءة أو حذفها.</li>
          <li><strong>⭐ التقييم والشكاوى:</strong> إرسال تقييم للمعلم أو الفصل أو التجربة، أو إرسال شكوى/اقتراح للإدارة.</li>
          <li><strong>💳 اشتراكي:</strong> حالة اشتراكك، تاريخ الانتهاء، الباقة الحالية، وإمكانية إدخال كود دعوة.</li>
          <li><strong>⚙️ الإعدادات:</strong> تعديل اسمك، البريد، كلمة المرور، الصورة الشخصية، واللغة.</li>
        </ul>
      </div>

      <div class="section">
        <h3>🔬 داخل التجربة</h3>
        <ul>
          <li><strong>شريط المتغيرات:</strong> يتيح تغيير قيم مثل التيار I، عدد اللفات N، الجهد V، المقاومة R، إلخ.</li>
          <li><strong>لوحة الرسم:</strong> تعرض المحاكاة. اضغط واسحب للتكبير/التحريك، استخدم عجلة الفأرة للتقريب، وانقر مرتين لإعادة التكبير.</li>
          <li><strong>مؤشر القياس (Probe):</strong> اسحب أيقونة القياس (📏) للنقطة التي تريد قياسها ثم اتركها لظهور القراءة.</li>
          <li><strong>أزرار التشغيل والإيقاف:</strong> ابدأ المحاكاة، أوقفها مؤقتًا (Pause)، أو أعد تشغيلها.</li>
          <li><strong>زر حفظ التقرير:</strong> بعد انتهاء التجربة، اكتب ملاحظاتك واحفظ التقرير لإرساله للمعلم.</li>
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
          <li>تأكد من حفظ التقرير بعد كل تجربة قبل مغادرة الصفحة.</li>
          <li>إذا أُجمّد حسابك أو فصلك، ستظهر شاشة توضح السبب وتطلب التواصل مع الإدارة.</li>
          <li>استخدم <strong>التقييم والشكاوى</strong> للإبلاغ عن أي مشكلة تقنية أو محتوى.</li>
        </ul>
      </div>

      <div class='section'>
        <h3>🧑‍🎓 كيف تستخدم لوحة الطالب</h3>
        <ul>
          <li><strong>الانضمام لفصل:</strong> اذهب إلى "فصولي" ← اضغط "انضمام بكود" ← أدخل كود الفصل الذي أعطاك المعلم ← اضغط "انضم".</li>
          <li><strong>بدء تجربة:</strong> من "التجارب" اختر الفرع (فيزياء/كيمياء/أحياء/رياضيات) ← اختر التجربة ← اضغط "ابدأ" ← غيّر المتغيرات وشغّل المحاكاة.</li>
          <li><strong>حفظ التقرير:</strong> بعد انتهاء التجربة ← اضغط "حفظ التقرير" ← اكتب ملاحظاتك ← اختر الفصل ← اضغط "إرسال".</li>
          <li><strong>مراجعة الدرجات:</strong> افتح "تقاريري" ← اختر التقرير ← ستجد الدرجة والملاحظات من المعلم.</li>
          <li><strong>إعادة إرسال تقرير:</strong> إذا طلب المعلم تعديلاً، عدّل ملاحظاتك ثم اضغط "إعادة إرسال".</li>
          <li><strong>الاختبارات:</strong> في "الامتحانات" ستجد الاختبارات النشطة ← اضغط "بدء" ← أجب ← تقدّم.</li>
          <li><strong>الدردشة:</strong> في "فصولي" اختر الفصل ثم "فتح الدردشة" ← ارسل أسئلتك أو رد على إعلان المعلم.</li>
          <li><strong>إرسال شكوى أو تقييم:</strong> افتح "التقييم والشكاوى" ← اختر النوع والجهة ← اكتب رسالتك ← اضغط "إرسال".</li>
        </ul>
      </div>
      <div class='section'>
        <h3>⭐ حقائق ونصائح</h3>
        <ul>
          <li>لا تنسَ حفظ التقرير قبل مغادرة التجربة، وإلا ستفقد النتائج.</li>
          <li>يمكنك تكرار التجربة أكثر من مرة لتفهم النتائج قبل إرسال التقرير.</li>
          <li>إذا انتهى اشتراكك، يمكنك إدخال كود دعوة في "اشتراكي" لتمديده.</li>
          <li>استخدم "الإشعارات" لتعرف مواعيد التسليم والاختبارات القادمة.</li>
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
