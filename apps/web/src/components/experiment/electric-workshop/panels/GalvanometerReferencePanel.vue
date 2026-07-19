<script setup lang="ts">
const NOTES = [
  '📐 الجلفانوميتر يقيس تيارات صغيرة جداً (µA) بدقة عالية',
  '⚡ قانون فاراداي: ε = -N × ΔΦ/Δt — أساس المولدات الكهربائية',
  '🔄 اتجاه التيار يعتمد على اتجاه حركة المغناطيس (قانون لينز)',
  '📈 ε ∝ N — زيادة اللفات = زيادة الـ EMF',
  '🏃 ε ∝ v — زيادة سرعة المغناطيس = زيادة الـ EMF',
  '🧲 التدفق المغناطيسي Φ = B × A × cos(θ)',
  '⚙️ المولد الكهربائي يستخدم نفس المبدأ (لفات + مغناطيس + حركة)',
  '💡 المحول الكهربائي يعمل بالحث المتبادل بين ملفين',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📐 الجلفانوميتر والحث</div>

    <div class="ref-section">
      <div class="section-title">القوانين الأساسية</div>
      <div class="formula-box" style="color:#c084fc">ε = -N × ΔΦ/Δt</div>
      <div class="formula-box" style="color:#4ade80">I = ε / R</div>
      <div class="formula-box" style="color:#67e8f9">Φ = B × A × cos(θ)</div>
      <div class="formula-box" style="color:#fbbf24">ε = N × v × B × L</div>
    </div>

    <div class="ref-section">
      <div class="section-title">تطبيقات الحث الكهرومغناطيسي</div>
      <div class="app-row"><span class="app-icon">⚙️</span><span>المولدات الكهربائية</span></div>
      <div class="app-row"><span class="app-icon">🔌</span><span>المحولات الكهربائية</span></div>
      <div class="app-row"><span class="app-icon">🍳</span><span>أفران الحث (Induction)</span></div>
      <div class="app-row"><span class="app-icon">🔋</span><span>شحن لاسلكي</span></div>
      <div class="app-row"><span class="app-icon">🎸</span><span>الجيتار الكهربائي (Pickup)</span></div>
    </div>

    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #c084fc; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-box { font-family: 'Courier New', monospace; font-size: .78rem; text-align: center; padding: .3rem; background: rgba(255,255,255,.03); border-radius: 3px; margin-bottom: .2rem; font-weight: 700; }
.app-row { display: flex; align-items: center; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #cbd5e1; }
.app-row:last-child { border-bottom: none; }
.app-icon { font-size: 1rem; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
