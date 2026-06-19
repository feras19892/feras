<script setup lang="ts">
const steps = [
  'اضبط الارتفاع h باستخدام شريط التمرير.',
  'اضغط "إفلات" لبدء السقوط.',
  'انتظر ارتطام الكرة بلوحة الاصطدام.',
  'اضغط "تسجيل" لحفظ الزمن.',
  'غيّر الارتفاع وكرّر التجربة.',
  'اضغط "حساب g" أو "ملائمة g" للتحليل.',
]
</script>

<template>
  <div>
    <h5>📋 دليل التجربة</h5>
    <ol>
      <li v-for="(s, i) in steps" :key="i">{{ s }}</li>
    </ol>
  </div>
</template>

<style scoped>
h5 { margin: 0 0 .3rem; font-size: .82rem; color: #5B8DB8; }
ol { margin: 0; padding-right: 1.2rem; font-size: .78rem; color: #cbd5e1; line-height: 1.8; }
</style>
