<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="help-overlay" @click.self="$emit('close')">
      <div class="help-modal">
        <button class="close-btn" @click="$emit('close')">✕</button>
        <h2>⚖️ دليل تجربة محصلة القوى</h2>
        <h3>🔬 1. المقدمة</h3>
        <p>محصلة القوى هي القوة الواحدة المكافئة لجميع القوى المؤثرة على جسم. حسب قانون نيوتن الثاني: F = m × a.</p>
        <p>إذا كانت المحصلة = صفر، فالجسم في توازن (ساكن أو بسرعة ثابتة).</p>
        <h3>📐 2. الوضع التوازني</h3>
        <ul>
          <li>اضبط الكتلة والقوة الخارجية وزاويتها ومعامل الاحتكاك.</li>
          <li>راقب أسهم القوى على Canvas — كل سهم ملون يمثل قوة.</li>
          <li>السهم الأصفر السميك = المحصلة. إذا اختفى → الجسم متوازن.</li>
          <li>اضغط "موازنة تلقائية" لحساب القوة المطلوبة لتحقيق التوازن.</li>
        </ul>
        <h3>🔄 3. الوضع الشعاعي (القوة المركزية)</h3>
        <ul>
          <li>اضبط الكتلة ونصف القطر والسرعة الزاوية.</li>
          <li>السهم الأحمر = القوة المركزية نحو المركز.</li>
          <li>السهم الأخضر = السرعة المماسية.</li>
          <li>القانون: Fc = m × ω² × r</li>
        </ul>
        <h3>📝 4. تسجيل التجارب</h3>
        <ul>
          <li>اضبط المعاملات → اضغط تشغيل → انتظر الاستقرار → اضغط تسجيل.</li>
          <li>أو اضغط "تشغيل المختبر" لتسجيل سلسلة تجارب آلياً.</li>
          <li>صدّر البيانات CSV أو أرسلها لتحليل البيانات.</li>
        </ul>
        <h3>⌨️ 5. اختصارات</h3>
        <ul>
          <li>Space: تشغيل/إيقاف</li>
          <li>R: إعادة</li>
          <li>S: تسجيل تجربة</li>
          <li>?: المساعدة</li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.help-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 150; display: flex; align-items: center; justify-content: center; }
.help-modal { background: #0d1117; border: 1px solid #2D3645; border-radius: 12px; padding: 1.5rem; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; }
.close-btn { position: absolute; top: .5rem; left: .5rem; background: none; border: none; color: #8b9bb5; font-size: 1.2rem; cursor: pointer; }
h2 { color: #5B8DB8; margin-bottom: 1rem; }
h3 { color: #4a7fb5; margin: 1rem 0 .3rem; }
p, li { color: #D1D7E0; font-size: .85rem; line-height: 1.6; }
ul { padding-right: 1.5rem; margin: .3rem 0; }
</style>
