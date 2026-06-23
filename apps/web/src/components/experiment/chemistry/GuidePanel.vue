<script setup lang="ts">
const steps = [
  '1. أضف المحلول القلوي (NaOH) إلى السحاحة.',
  '2. ضع عينة حمض الهيدروكلوريك (HCl) في الكأس.',
  '3. أضف 3-4 قطرات من الفينوفتالين.',
  '4. سخن الموقد إذا لزم الأمر.',
  '5. أضف NaOH تدريجياً حتى يتغير اللون.',
];

const equation = 'HCl + NaOH → NaCl + H₂O';
</script>

<template>
  <div class="guide-panel">
    <h3>📋 التوجيه والمعادلات</h3>
    <div class="equation-box">
      <label>المعادلة الحاكمة</label>
      <code>{{ equation }}</code>
    </div>
    <div class="steps">
      <label>خطوات التجربة</label>
      <ol>
        <li v-for="(step, i) in steps" :key="i">{{ step }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.guide-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
}
.guide-panel h3 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #334155;
}
.equation-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}
.equation-box label {
  display: block;
  font-size: 0.65rem;
  color: #10b981;
  font-weight: 700;
  margin-bottom: 0.35rem;
}
.equation-box code {
  display: block;
  font-size: 0.85rem;
  color: #166534;
  font-family: 'Courier New', monospace;
  direction: ltr;
  text-align: center;
}
.steps label {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 0.4rem;
}
.steps ol {
  margin: 0;
  padding-right: 1.2rem;
  font-size: 0.75rem;
  color: #475569;
  line-height: 1.8;
}
.steps li {
  margin-bottom: 0.3rem;
}
</style>
