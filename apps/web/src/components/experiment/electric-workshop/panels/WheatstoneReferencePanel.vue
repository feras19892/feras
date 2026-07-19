<script setup lang="ts">
const NOTES = [
  '⚖️ جسر ويستون اخترعه صموئيل هانتيجتون ويستون 1843',
  '📏 يقيس مقاومات من 1Ω إلى 1MΩ بدقة عالية جداً',
  '⚖️ شرط التوازن: R1/R2 = R3/Rx → Rx = R2×R3/R1',
  '🔍 الجلفانوميتر يكشف فرق الجهد بين نقطتي الجسر',
  '📊 عند التوازن: Vg = 0، Ig = 0 (لا يمر تيار في الجلفانوميتر)',
  '⚙️ يستخدم في معايرة أجهزة القياس ومستشعرات الإجهاد',
  '💡 حساسية الجسر تعتمد على جهد البطارية وحساسية الجلفانوميتر',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">⚖️ جسر ويستون</div>

    <div class="ref-section">
      <div class="section-title">القوانين</div>
      <div class="formula-box" style="color:#4ade80">R1/R2 = R3/Rx</div>
      <div class="formula-box" style="color:#fbbf24">Rx = R2 × R3 / R1</div>
      <div class="formula-box" style="color:#67e8f9">Vg = V × (R2/(R1+R2) - Rx/(R3+Rx))</div>
    </div>

    <div class="ref-section">
      <div class="section-title">خطوات الاستخدام</div>
      <div class="app-row"><span class="step-num">1</span><span>اضبط R3 حتى يقرأ الجلفانوميتر صفراً</span></div>
      <div class="app-row"><span class="step-num">2</span><span>سجّل قيمة R3 عند التوازن</span></div>
      <div class="app-row"><span class="step-num">3</span><span>احسب Rx = R2 × R3 / R1</span></div>
      <div class="app-row"><span class="step-num">4</span><span>كرّر بقيم R1, R2 مختلفة للتحقق</span></div>
    </div>

    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #4ade80; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.formula-box { font-family: 'Courier New', monospace; font-size: .78rem; text-align: center; padding: .3rem; background: rgba(255,255,255,.03); border-radius: 3px; margin-bottom: .2rem; font-weight: 700; }
.app-row { display: flex; align-items: center; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #cbd5e1; }
.app-row:last-child { border-bottom: none; }
.step-num { background: #1E2530; color: #4ade80; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .68rem; font-weight: 700; flex-shrink: 0; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
