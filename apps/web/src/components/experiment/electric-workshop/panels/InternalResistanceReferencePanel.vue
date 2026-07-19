<script setup lang="ts">
const NOTES = [
  '🔋 كل بطارية حقيقية لها مقاومة داخلية r صغيرة',
  '⚡ Vt = ε - I×r — الجهد الطرفي أقل من EMF عند مرور التيار',
  '📉 كلما زاد التيار، زاد الهبوط على المقاومة الداخلية',
  '🔌 عند R = r: أقصى نقل للقدرة (Maximum Power Transfer)',
  '📖 المقاومة الداخلية سبب سخونة البطارية تحت الحمل',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">🔋 المقاومة الداخلية</div>
    <div class="ref-section">
      <div class="section-title">القوانين الأساسية</div>
      <div class="formula-box" style="color:#f59e0b">Vt = ε - I × r</div>
      <div class="formula-box" style="color:#4ade80">I = ε / (R + r)</div>
      <div class="formula-box" style="color:#67e8f9">P_load = Vt² / R</div>
    </div>
    <div class="ref-section">
      <div class="section-title">تطبيقات</div>
      <div class="app-row"><span>🔋 بطاريات السيارة (r صغيرة جداً)</span></div>
      <div class="app-row"><span>📱 بطاريات الهاتف (r تزداد مع العمر)</span></div>
      <div class="app-row"><span>🔌 مصادر الطاقة المخبرية</span></div>
    </div>
    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-box { font-family: 'Courier New', monospace; font-size: .78rem; text-align: center; padding: .3rem; background: rgba(255,255,255,.03); border-radius: 3px; margin-bottom: .2rem; font-weight: 700; }
.app-row { display: flex; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #cbd5e1; }
.app-row:last-child { border-bottom: none; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
