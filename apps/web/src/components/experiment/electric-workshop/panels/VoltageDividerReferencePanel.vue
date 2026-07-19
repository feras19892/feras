<script setup lang="ts">
const NOTES = [
  '📊 مقسم الجهد أساس إلكترونيات كثير — من البوتشيومتر للـ ADC',
  '⚖️ V_out = V × R2/(R1+R2) — الجهد يتناسب مع نسبة المقاومة',
  '🔄 البوتشيومتر (Potentiometer) = مقسم جهد قابل للتعديل',
  '⚡ إذا R1 = R2 → V_out = V/2 (نصف الجهد)',
  '📉 كلما زادت R2 → زاد V_out (حتى يصل إلى V)',
  '🔧 يستخدم في تحديد مستوى الصوت، الإضاءة، الحساسات',
  '⚠️ مع حمل (load) متصل: R2 يجب أن تكون أصغر بكثير من R_load',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">📊 مقسم الجهد</div>

    <div class="ref-section">
      <div class="section-title">القوانين</div>
      <div class="formula-box" style="color:#fbbf24">V_out = V × R2/(R1+R2)</div>
      <div class="formula-box" style="color:#3b82f6">V1 = V × R1/(R1+R2)</div>
      <div class="formula-box" style="color:#4ade80">I = V / (R1+R2)</div>
    </div>

    <div class="ref-section">
      <div class="section-title">حالات خاصة</div>
      <div class="case-row"><span class="case-cond">R1 = R2</span><span class="case-result">V_out = V/2</span></div>
      <div class="case-row"><span class="case-cond">R2 = 2×R1</span><span class="case-result">V_out = 2V/3</span></div>
      <div class="case-row"><span class="case-cond">R2 = 3×R1</span><span class="case-result">V_out = 3V/4</span></div>
      <div class="case-row"><span class="case-cond">R2 ≫ R1</span><span class="case-result">V_out ≈ V</span></div>
      <div class="case-row"><span class="case-cond">R2 ≪ R1</span><span class="case-result">V_out ≈ 0</span></div>
    </div>

    <div class="ref-section">
      <div class="section-title">التطبيقات</div>
      <div class="app-row"><span class="app-icon">🔊</span><span>التحكم في مستوى الصوت</span></div>
      <div class="app-row"><span class="app-icon">💡</span><span>تحكم في سطوع LED</span></div>
      <div class="app-row"><span class="app-icon">🌡️</span><span>قراءة الحساسات (thermistor)</span></div>
      <div class="app-row"><span class="app-icon">🎚️</span><span>البوتشيومتر (Potentiometer)</span></div>
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
.case-row { display: flex; justify-content: space-between; padding: .2rem .4rem; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .72rem; }
.case-row:last-child { border-bottom: none; }
.case-cond { color: #cbd5e1; }
.case-result { color: #4ade80; font-weight: 600; font-family: 'Courier New', monospace; }
.app-row { display: flex; align-items: center; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #cbd5e1; }
.app-row:last-child { border-bottom: none; }
.app-icon { font-size: 1rem; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
