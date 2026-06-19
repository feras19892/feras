<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="help-modal" v-if="open" @click.self="emit('close')">
    <div class="help-content">
      <button class="close-btn" @click="emit('close')">✕</button>
      <h2>🎓 دليل تجربة المنحدر المائل</h2>
      <section>
        <h3>📖 المفهوم الفيزيائي</h3>
        <p>المنحدر المائل هو سطح مائل بزاوية θ يتحرك عليه جسم كتلته m. التسارع يعتمد على زاوية المنحدر ومعامل الاحتكاك.</p>
        <p>بدون احتكاك: a = g·sin(θ)</p>
        <p>مع احتكاك: a = g(sin(θ) − μ·cos(θ))</p>
      </section>
      <section>
        <h3>📐 المعادلات الأساسية</h3>
        <ul>
          <li>a = g·sin(θ) − μ·g·cos(θ)</li>
          <li>s = ½·a·t²</li>
          <li>v = a·t</li>
          <li>t = √(2L/a)</li>
          <li>v = √(2aL)</li>
          <li>N = m·g·cos(θ)</li>
          <li>F∥ = m·g·sin(θ)</li>
          <li>f = μ·N = μ·m·g·cos(θ)</li>
        </ul>
      </section>
      <section>
        <h3>🖥️ عناصر مساحة العمل</h3>
        <ul>
          <li>لوحة الرسم — رسم المنحدر والكتلة وأسهم القوى</li>
          <li>المعاملات — زاوية المنحدر، الطول، الكتلة، g، μ</li>
          <li>الجدول — قراءات التجارب المسجلة</li>
          <li>الرسوم — مسار s(t) وإشارة v(t)</li>
          <li>الحسابات — أزرار لحساب القيم النظرية</li>
        </ul>
      </section>
      <section>
        <h3>⌨️ اختصارات لوحة المفاتيح</h3>
        <ul>
          <li>Space — بدء/توقف</li>
          <li>R — إعادة تعيين</li>
          <li>S — تسجيل قراءة</li>
          <li>Ctrl+Z — تراجع</li>
          <li>Ctrl+Shift+Z — إعادة</li>
          <li>? — فتح/إغلاق المساعدة</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.help-modal { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; }
.help-content { background:#161B22; border:1px solid #2D3645; border-radius:12px; padding:1.5rem; max-width:560px; width:90%; max-height:80vh; overflow:auto; position:relative; }
.close-btn { position:absolute; top:.6rem; left:.6rem; background:none; border:none; color:#8B95A5; cursor:pointer; font-size:1.1rem; }
.help-content h2 { color:#5B8DB8; margin:0 0 1rem; font-size:1.1rem; }
.help-content h3 { color:#D1D7E0; margin:1rem 0 .4rem; font-size:.85rem; }
.help-content p { color:#B8C0CC; font-size:.74rem; line-height:1.6; margin:.2rem 0; }
.help-content ul { color:#B8C0CC; font-size:.72rem; line-height:1.7; padding-right:1.2rem; margin:0; }
</style>
