<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>📖 دليل تجربة السقوط الحر — دليل شامل</h3>
        <button class="close-btn" @click="emit('close')">&#x2715;</button>
      </div>
      <div class="modal-body">
        <section>
          <h4>🔬 مفهوم التجربة</h4>
          <p>تجربة السقوط الحر تهدف إلى قياس عجلة الجاذبية <b>g</b> بشكل عملي. تُسقط كرة معدنية من ارتفاع معروف <b>h</b> وتُقاس زمن السقوط <b>t</b> باستخدام مؤقت رقمي دقيق. بمعرفة <b>h</b> و <b>t</b> يمكن حساب <b>g</b> من العلاقة:</p>
          <div class="formula">h = ½ · g · t²  &nbsp;&nbsp;→&nbsp;&nbsp;  g = 2h / t²</div>
          <p>عند تكرار التجربة بارتفاعات مختلفة و رسم <b>h</b> مقابل <b>t²</b>، يكون ميل الخط = <b>g/2</b>، ومنه نحصل على <b>g</b> تجريبياً.</p>
        </section>

        <section>
          <h4>⚙️ عناصر مساحة العمل</h4>
          <div class="element-grid">
            <div class="element"><b class="tag">🔷 المنطقة المركزية (Canvas)</b> — عرض المحاكاة: المغناطيس الكهربائي، العمود، الكرة، لوحة الاصطدام، والمؤقت الرقمي.</div>
            <div class="element"><b class="tag">📋 جدول القراءات</b> — يسجل كل قياس: h, t, t², v, g_calc, والخطأ النسبي.</div>
            <div class="element"><b class="tag">📈 رسم Scatter</b> — رسم بياني لـ h مقابل t² مع خط الانحدار الخطي.</div>
            <div class="element"><b class="tag">📊 إشارة السقوط</b> — رسم بياني زمني لموقع الكرة y(t) وسرعتها v(t).</div>
            <div class="element"><b class="tag">⚗️ المعادلات والحسابات</b> — أزرار حساب g, t, v, وملائمة الانحدار + قائمة المعادلات الفيزيائية.</div>
            <div class="element"><b class="tag">📊 الإحصائيات</b> — متوسط الزمن، الانحراف المعياري، متوسط g_calc، وانحرافه.</div>
            <div class="element"><b class="tag">⚙️ المعاملات</b> — التحكم في h, g, الكتلة، مقاومة الهواء، ومعامل Drag.</div>
          </div>
        </section>

        <section>
          <h4>🎮 أزرار التحكم (شريط التحكم السفلي)</h4>
          <ul>
            <li><b>▶️ إفلات / ⏸️ توقف</b> — إفلات الكرة لبدء السقوط، أو إيقاف مؤقت.</li>
            <li><b>🔄 إعادة</b> — إعادة تعيين المحاكاة (وضع الكرة أعلى العمود).</li>
            <li><b>📌 تسجيل</b> — حفظ القياس الحالي في جدول القراءات (يظهر بعد الارتطام فقط).</li>
            <li><b>↩️ تراجع / ↪️ إعادة</b> — التراجع عن آخر تسجيل أو استعادته (Ctrl+Z / Ctrl+Y).</li>
            <li><b>🗑️ مسح</b> — حذف جميع القراءات المسجلة.</li>
            <li><b>💾 CSV</b> — تصدير القراءات إلى ملف CSV.</li>
            <li><b>⚡ خطأ نسبي</b> — تفعيل/إطفاء الضجئ (noise) على القياسات. 🟢 = مع خطأ نسبي 2%، ⚫ = قياسات دقيقة 100%.</li>
            <li><b>⚡ السرعة ×</b> — تسريع/إبطاء المحاكاة (من 0.25× إلى 3×).</li>
          </ul>
        </section>

        <section>
          <h4>📐 خطوات العمل — خطوة بخطوة</h4>
          <ol>
            <li><b>اضبط المعاملات:</b> افتح لوحة <b>المعاملات</b> وحدد الارتفاع h (مثلاً 0.50 m)، تأكد أن g = 9.81 m/s².</li>
            <li><b>بدء السقوط:</b> اضغط <b>▶️ إفلات</b> أو مفتاح <b>Space</b>. ستسقط الكرة من المغناطيس.</li>
            <li><b>انتظر الارتطام:</b> شاهد الكرة تسقط حتى ترتطم باللوحة. المؤقت الرقمي يعرض t بالثواني.</li>
            <li><b>تسجيل القياس:</b> بعد الارتطام اضغط <b>📌 تسجيل</b> أو مفتاح <b>S</b>. سيُحفظ الزمن في الجدول.</li>
            <li><b>كرر التجربة:</b> غيّر الارتفاع h (مثلاً 0.20, 0.40, 0.60, 0.80, 1.00 m) وكرر الخطوات 2–4 لكل ارتفاع. <b>تحتاج قياستان على الأقل للانحدار.</b></li>
            <li><b>حساب g من قياس واحد:</b> اضغط <b>📐 حساب g</b> في لوحة <b>المعادلات</b>. يُظهر التعويض والنتيجة والخطأ النسبي.</li>
            <li><b>حساب g من الانحدار (أفضل دقة):</b> اضغط <b>📈 ملائمة g</b>. يُحسب معادلة h = slope·t²، ويُظهر الميل، R²، و g = 2×slope.</li>
            <li><b>راجع الرسم:</b> افتح لوحة <b>Scatter</b> لتشاهد النقاط وخط الانحدار الأحمر. R² القريب من 1 = قياسات دقيقة.</li>
            <li><b>راجع الإشارة:</b> افتح لوحة <b>إشارة السقوط</b> لتشاهد منحنى y(t) الأزرق و v(t) البرتقالي.</li>
            <li><b>راجع الإحصائيات:</b> افتح لوحة <b>الإحصائيات</b> لترى متوسط g_calc وانحرافه المعياري.</li>
            <li><b>اطبع التقرير:</b> اضغط <b>📝 طباعة التقرير</b> لإنشاء تقرير PDF/HTML شامل.</li>
          </ol>
        </section>

        <section>
          <h4>📊 كيفية حساب g بثلاث طرق</h4>
          <div class="method"><b>الطريقة 1 — قياس واحد:</b> g = 2h / t²</div>
          <div class="method"><b>الطريقة 2 — انحدار خطي (أفضل):</b> رسم h مقابل t² ← الميل = g/2 ← g = 2 × slope</div>
          <div class="method"><b>الطريقة 3 — متوسط القياسات:</b> متوسط عمود g_calc في الجدول.</div>
        </section>

        <section>
          <h4>⌨️ اختصارات لوحة المفاتيح</h4>
          <div class="kbd-grid">
            <span><kbd>Space</kbd> إفلات / توقف</span>
            <span><kbd>S</kbd> تسجيل قياس</span>
            <span><kbd>R</kbd> إعادة تعيين</span>
            <span><kbd>Ctrl</kbd>+<kbd>Z</kbd> تراجع</span>
            <span><kbd>Ctrl</kbd>+<kbd>Y</kbd> إعادة</span>
            <span><kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>Z</kbd> إعادة</span>
            <span><kbd>?</kbd> فتح/إغلاق المساعدة</span>
          </div>
        </section>

        <section>
          <h4>⚠️ نصائح مهمة</h4>
          <ul>
            <li>قم بـ <b>5–7 قياسات</b> على الأقل بارتفاعات مختلفة للحصول على نتائج دقيقة.</li>
            <li>ابدأ بارتفاعات <b>صغيرة</b> (0.20–0.50 m) ثم زد تدريجياً لتجنب أخطاء التوقيت الكبيرة.</li>
            <li>عند <b>تفعيل الخطأ النسبي</b> (🟢)، القياسات واقعية مع ضجئ ±2% — استخدمها لتعلم تحليل الأخطاء.</li>
            <li>عند <b>إطفاء الخطأ النسبي</b> (⚫)، القياسات رياضية دقيقة 100% — مثالية للتحقق من الحسابات.</li>
            <li>قارن g_calc المتوسط مع g النظري (9.81). الخطأ &lt; 5% = جيد، &lt; 2% = ممتاز.</li>
            <li>إذا كان <b>R² &lt; 0.95</b>، راجع القياسات — قد يكون هناك خطأ في التوقيت أو الارتفاع.</li>
          </ul>
        </section>

        <section>
          <h4>🔧 أزرار شريط القائمة العلوي</h4>
          <ul>
            <li><b>ملف</b> — تصدير CSV + استعادة الواجهة الافتراضية.</li>
            <li><b>عرض</b> — إظهار/إخفاء اللوحات (جدول، حسابات، إشارة، معاملات، دليل، إحصائيات، Scatter، تحليل، أخطاء).</li>
            <li><b>تشغيل</b> — بدء، إعادة، تسجيل، تشغيل تلقائي (5 قياسات متتالية).</li>
            <li><b>📝 طباعة التقرير</b> — إنشاء تقرير شامل قابل للطباعة.</li>
            <li><b>❓ مساعدة</b> — هذا الدليل الشامل.</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.modal { background: #131a25; border: 1px solid #2D3645; border-radius: 12px; max-width: 680px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; border-bottom: 1px solid #2D3645; flex-shrink: 0; }
.modal-header h3 { margin: 0; font-size: 1rem; color: #e2e8f0; }
.close-btn { background: transparent; border: 1px solid #2D3645; color: #8B95A5; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; padding: 0; }
.close-btn:hover { background: rgba(91,141,184,.1); color: #5B8DB8; }
.modal-body { overflow-y: auto; padding: 1.2rem; font-size: .82rem; color: #cbd5e1; line-height: 1.8; }
.modal-body section { margin-bottom: 1.2rem; }
.modal-body h4 { margin: 0 0 .4rem; font-size: .88rem; color: #5B8DB8; border-bottom: 1px solid #2D3645; padding-bottom: .25rem; }
.modal-body p { margin: .3rem 0; }
.modal-body ol, .modal-body ul { margin: .3rem 0; padding-right: 1.2rem; }
.modal-body li { margin-bottom: .15rem; }
.formula { background: #1a2332; border: 1px solid #2D3645; border-radius: 6px; padding: .5rem .8rem; font-family: monospace; font-size: .9rem; color: #5B8DB8; text-align: center; margin: .4rem 0; direction: ltr; }
.element-grid { display: flex; flex-direction: column; gap: .25rem; }
.element { background: #1a2332; border-radius: 6px; padding: .35rem .5rem; font-size: .78rem; }
.tag { color: #5B8DB8; }
.method { background: #1a2332; border-radius: 6px; padding: .4rem .6rem; margin-bottom: .3rem; font-size: .78rem; }
.kbd-grid { display: flex; flex-wrap: wrap; gap: .4rem; }
.kbd-grid span { background: #1a2332; border: 1px solid #2D3645; border-radius: 5px; padding: .25rem .5rem; font-size: .75rem; }
kbd { background: #252D3A; border: 1px solid #475569; border-radius: 4px; padding: .05rem .3rem; font-family: monospace; font-size: .7rem; color: #D1D7E0; }
</style>
