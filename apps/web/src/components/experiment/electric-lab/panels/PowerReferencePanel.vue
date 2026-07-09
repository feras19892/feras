<script setup lang="ts">
const FORMULAS = [
  { formula: 'P = V × I', desc: 'الصيغة الأساسية', color: '#f87171' },
  { formula: 'P = I² × R', desc: 'باستخدام التيار والمقاومة', color: '#fbbf24' },
  { formula: 'P = V² / R', desc: 'باستخدام الجهد والمقاومة', color: '#67e8f9' },
  { formula: 'E = P × t', desc: 'الطاقة = القدرة × الزمن', color: '#a78bfa' },
]

const UNITS = [
  { unit: 'W', name: 'واط', desc: '1 W = 1 J/s' },
  { unit: 'kW', name: 'كيلوواط', desc: '1 kW = 1000 W' },
  { unit: 'kWh', name: 'كيلوواط·ساعة', desc: 'وحدة طاقة للعدّاد' },
  { unit: 'J', name: 'جول', desc: '1 J = 1 W × 1s' },
]

const NOTES = [
  '💡 القدرة تزداد مع مربع الجهد: P ∝ V² (عند ثبوت R)',
  '⚡ المقاومة الصغيرة = قدرة كبيرة (عند ثبوت V)',
  '🔥 كل القدرة في المقاومة تتحول إلى حرارة (Joule heating)',
  '📊 الرسم: P vs V → قطع مكافئ (P = V²/R)',
  '📊 الرسم: P vs I → قطع مكافئ (P = I²×R)',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">⚡ القدرة الكهربائية</div>

    <div class="ref-section">
      <div class="section-title">الصيغ الأساسية</div>
      <div v-for="f in FORMULAS" :key="f.formula" class="formula-row">
        <span class="formula-text" :style="{ color: f.color }">{{ f.formula }}</span>
        <span class="formula-desc">{{ f.desc }}</span>
      </div>
    </div>

    <div class="ref-section">
      <div class="section-title">الوحدات</div>
      <div class="units-table">
        <div v-for="u in UNITS" :key="u.unit" class="unit-row">
          <span class="unit-symbol" style="color:#f87171">{{ u.unit }}</span>
          <span class="unit-name">{{ u.name }}</span>
          <span class="unit-desc">{{ u.desc }}</span>
        </div>
      </div>
    </div>

    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #f87171; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-row { display: flex; justify-content: space-between; align-items: center; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.formula-row:last-child { border-bottom: none; }
.formula-text { font-family: 'Courier New', monospace; font-weight: 700; font-size: .85rem; }
.formula-desc { font-size: .7rem; color: #64748b; }
.units-table { display: flex; flex-direction: column; gap: .15rem; }
.unit-row { display: flex; align-items: center; gap: .4rem; padding: .2rem 0; font-size: .75rem; }
.unit-symbol { font-weight: 700; width: 2.5rem; text-align: center; }
.unit-name { color: #e2e8f0; width: 5rem; }
.unit-desc { color: #64748b; font-size: .7rem; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
