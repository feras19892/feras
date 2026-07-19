<script setup lang="ts">
const NOTES = [
  '🔌 المكثف يخزن الطاقة في المجال الكهربائي بين لوحيه',
  '⚡ على التوالي: 1/Ceq = 1/C1 + 1/C2 (Ceq أقل)',
  '⚡ على التوازي: Ceq = C1 + C2 (Ceq أكبر)',
  '⏱️ τ = R×C — ثابت الزمن للشحن/التفريغ',
  '🔋 عند t=τ: المكثف يشحن لـ 63.2% من الجهد الكامل',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">🔌 توالي وتوازي المكثفات</div>
    <div class="ref-section">
      <div class="section-title">القوانين الأساسية</div>
      <div class="formula-box" style="color:#67e8f9">1/Ceq = 1/C1 + 1/C2 (توالي)</div>
      <div class="formula-box" style="color:#4ade80">Ceq = C1 + C2 (توازي)</div>
      <div class="formula-box" style="color:#fbbf24">τ = R × C</div>
      <div class="formula-box" style="color:#c084fc">V(t) = V0(1 - e^(-t/τ))</div>
    </div>
    <div class="ref-section">
      <div class="section-title">تطبيقات</div>
      <div class="app-row"><span>📷 فلاش الكاميرا (مكثف + مقاومة)</span></div>
      <div class="app-row"><span>🔊 مرشحات الصوت (crossover)</span></div>
      <div class="app-row"><span>💻 ذاكرة RAM الديناميكية</span></div>
      <div class="app-row"><span>⚡ دوائر التوقيت (555 timer)</span></div>
    </div>
    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #67e8f9; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-box { font-family: 'Courier New', monospace; font-size: .78rem; text-align: center; padding: .3rem; background: rgba(255,255,255,.03); border-radius: 3px; margin-bottom: .2rem; font-weight: 700; }
.app-row { display: flex; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #cbd5e1; }
.app-row:last-child { border-bottom: none; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
