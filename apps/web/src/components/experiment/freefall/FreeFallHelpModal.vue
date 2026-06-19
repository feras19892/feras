<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal">
      <h3>📖 دليل تجربة السقوط الحر</h3>
      <ol>
        <li>اضبط الارتفاع (h) باستخدام شريط التمرير.</li>
        <li>اضغط "إفلات" لبدء السقوط.</li>
        <li>انتظر حتى ارتطام الكرة بلوحة الاصطدام.</li>
        <li>اضغط "تسجيل" لحفظ الزمن والحسابات.</li>
        <li>غيّر الارتفاع وكرر التجربة.</li>
        <li>اضغط "حساب g" لحساب عجلة الجاذبية عملياً.</li>
        <li>اضغط "ملائمة g" لرسم الانحدار الخطي.</li>
      </ol>
      <button @click="emit('close')">إغلاق</button>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; }
.modal { background: #111827; border: 1px solid #2D3645; border-radius: 12px; padding: 1.2rem; max-width: 480px; width: 90%; }
.modal h3 { margin: 0 0 .6rem; font-size: .95rem; color: #e2e8f0; }
.modal ol { margin: 0; padding-right: 1.2rem; font-size: .82rem; color: #cbd5e1; line-height: 1.8; }
.modal button { margin-top: .8rem; background: #5B8DB8; color: #fff; border: none; border-radius: 6px; padding: .4rem 1rem; cursor: pointer; font-size: .8rem; }
</style>
