<script setup lang="ts">
const COMPARISON = [
  { prop: 'الجهد V', series: 'نفس V على كل R', parallel: 'نفس V على كل R', colorS: '#fbbf24', colorP: '#67e8f9' },
  { prop: 'التيار I', series: 'نفس I في كل R', parallel: 'I يتوزع: Itotal = I₁ + I₂', colorS: '#fbbf24', colorP: '#67e8f9' },
  { prop: 'R_eq', series: 'R₁ + R₂ + ...', parallel: '1/R₁ + 1/R₂ + ...', colorS: '#fbbf24', colorP: '#67e8f9' },
  { prop: 'R_eq vs R_min', series: 'أكبر من أكبر R', parallel: 'أصغر من أصغر R', colorS: '#fbbf24', colorP: '#67e8f9' },
]

const NOTES = [
  '💡 في التوازي: إضافة مقاومة جديدة تقلل R_eq (مسار إضافي للتيار)',
  '⚡ التيار يختار المسار الأسهل (أقل مقاومة = تيار أكبر)',
  '🔄 الفولتميتر موصول على التوازي دائماً مع المقاومة',
  '📊 الرسم: V vs Itotal → خط مستقيم، الميل = 1/Req',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 مقارنة: توالي vs توازي</div>

    <div class="ref-table">
      <div class="ref-header">
        <span>الخاصية</span>
        <span>توالي</span>
        <span>توازي</span>
      </div>
      <div v-for="row in COMPARISON" :key="row.prop" class="ref-row">
        <span class="prop">{{ row.prop }}</span>
        <span :style="{ color: row.colorS }">{{ row.series }}</span>
        <span :style="{ color: row.colorP }">{{ row.parallel }}</span>
      </div>
    </div>

    <div class="ref-section">
      <div class="section-title">قوانين التوازي</div>
      <div class="formula-box">V = V₁ = V₂ = ...</div>
      <div class="formula-box">I<sub>total</sub> = I₁ + I₂ + ...</div>
      <div class="formula-box">1/R<sub>eq</sub> = 1/R₁ + 1/R₂ + ...</div>
      <div class="formula-box">لاثنتين: R<sub>eq</sub> = R₁·R₂ / (R₁+R₂)</div>
    </div>

    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-table { display: flex; flex-direction: column; gap: .15rem; }
.ref-header { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; padding: .4rem .6rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .72rem; color: #94a3b8; text-align: center; }
.ref-row { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; padding: .35rem .6rem; border-bottom: 1px solid #1e2530; font-size: .72rem; gap: .3rem; text-align: center; }
.ref-row:last-child { border-bottom: none; }
.prop { color: #e2e8f0; font-weight: 600; text-align: end; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-box { font-family: 'Courier New', monospace; font-size: .78rem; color: #f59e0b; text-align: center; padding: .25rem; background: rgba(245,158,11,.06); border-radius: 3px; margin-bottom: .2rem; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
