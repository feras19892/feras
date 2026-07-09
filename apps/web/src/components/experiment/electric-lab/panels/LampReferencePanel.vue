<script setup lang="ts">
const LAMP_TYPES = [
  { type: 'تنجستن (مصباح تقليدي)', efficiency: 5, color: '#fbbf24' },
  { type: 'هالوجين', efficiency: 10, color: '#f59e0b' },
  { type: 'فلورسنت', efficiency: 25, color: '#4ade80' },
  { type: 'LED', efficiency: 40, color: '#67e8f9' },
]

const NOTES = [
  '💡 المصباح التقليدي يحوّل 5% فقط إلى ضوء والباقي حرارة',
  '🔥 المصباح الساخن = طاقة مهدورة (P_heat = 95% من P)',
  '📊 P ∝ V² — مضاعفة الجهد = 4× القدرة (و4× الإضاءة)',
  '⚡ LED أكثر كفاءة بـ 8× من التنجستن',
  '🔧 مقاومة المصباح تزيد مع الحرارة (تأثير حراري)',
  '📏 العمر الافتراضي يقل مع زيادة الجهد',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">💡 المصباح والكفاءة</div>

    <div class="ref-section">
      <div class="section-title">القوانين</div>
      <div class="formula-box" style="color:#fbbf24">P = V × I</div>
      <div class="formula-box" style="color:#fde047">P_light = P × η</div>
      <div class="formula-box" style="color:#f87171">P_heat = P × (1 - η)</div>
      <div class="formula-box" style="color:#4ade80">η = P_light / P × 100%</div>
    </div>

    <div class="ref-section">
      <div class="section-title">مقارنة أنواع المصابيح</div>
      <div class="eff-table">
        <div class="eff-header"><span>النوع</span><span>الكفاءة</span></div>
        <div v-for="l in LAMP_TYPES" :key="l.type" class="eff-row">
          <span :style="{ color: l.color }">{{ l.type }}</span>
          <div class="eff-bar-area">
            <div class="eff-bar" :style="{ width: l.efficiency * 2 + '%', background: l.color }"></div>
            <span class="eff-val">{{ l.efficiency }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #fbbf24; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-box { font-family: 'Courier New', monospace; font-size: .78rem; text-align: center; padding: .3rem; background: rgba(255,255,255,.03); border-radius: 3px; margin-bottom: .2rem; font-weight: 700; }
.eff-table { display: flex; flex-direction: column; gap: .15rem; }
.eff-header { display: flex; justify-content: space-between; padding: .3rem .5rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .72rem; color: #94a3b8; }
.eff-row { display: flex; justify-content: space-between; align-items: center; padding: .25rem .5rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .72rem; }
.eff-bar-area { display: flex; align-items: center; gap: .3rem; width: 55%; }
.eff-bar { height: 8px; border-radius: 4px; transition: width .3s; }
.eff-val { font-size: .68rem; color: #94a3b8; white-space: nowrap; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
