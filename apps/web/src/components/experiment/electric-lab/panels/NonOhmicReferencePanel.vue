<script setup lang="ts">
const NOTES = [
  '💡 المصباح الكهربائي مادة لا أومية — R تزيد مع الحرارة',
  '⚡ المواد الأومية: V = I×R (خط مستقيم في رسم V vs I)',
  '📊 المواد اللاأومية: منحنى في رسم V vs I (R متغيرة)',
  '🔬 الصمام (Diode) مادة لا أومية — يسمح بالتيار باتجاه واحد',
  '🌡️ الحرارة تزيد مقاومة المصباح (تناقض المعادن التي تزيد مقاومتها مع الحرارة)',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">💡 المواد اللاأومية</div>
    <div class="ref-section">
      <div class="section-title">القوانين</div>
      <div class="formula-box" style="color:#4ade80">أومي: V = I × R</div>
      <div class="formula-box" style="color:#fbbf24">لا أومي: R = f(V, I)</div>
      <div class="formula-box" style="color:#c084fc">R_dyn = dV/dI</div>
    </div>
    <div class="ref-section">
      <div class="section-title">أمثلة على مواد لا أومية</div>
      <div class="app-row"><span>💡 المصباح الكهربائي (تنجستن)</span></div>
      <div class="app-row"><span>🔌 الصمام (Diode)</span></div>
      <div class="app-row"><span>⚡ الترانزستور</span></div>
      <div class="app-row"><span>🌡️ الثرمستور (NTC/PTC)</span></div>
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
.app-row { display: flex; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #cbd5e1; }
.app-row:last-child { border-bottom: none; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
