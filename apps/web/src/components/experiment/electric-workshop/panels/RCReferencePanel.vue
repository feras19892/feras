<script setup lang="ts">
const NOTES = [
  '🔌 المكثف يخزن الطاقة في شكل شحنة كهربائية Q = C×V',
  '⚡ عند الشحن: Vc يرتفع، I يتناقص (منحنى أسي)',
  '📉 عند التفريغ: Vc يتناقص، I يتناقص (منحنى أسي تنازلي)',
  '⏱️ τ = R×C — ثابت الزمن يحدد سرعة العملية',
  '✅ بعد 5τ: المكثف مشحون/مفرغ تقريباً تماماً (99.3%)',
  '🔄 المكثف لا يمرر تياراً مستمراً (بعد الشحن الكامل I=0)',
  '📊 الرسم: Vc مقابل t → منحنى أسي، الميل عند t=0 = V₀/τ',
]

const COMPONENTS = [
  { name: 'مكثف', icon: '🔌', desc: 'يخزن الشحنة — C بالفاراد (F)', color: '#fbbf24' },
  { name: 'مفتاح', icon: '🔘', desc: 'يتحكم في فتح/إغلاق الدائرة', color: '#4ade80' },
  { name: 'مصباح', icon: '💡', desc: 'يحوّل الكهرباء إلى ضوء', color: '#f59e0b' },
  { name: 'جلفانوميتر', icon: '📐', desc: 'يقيس تيارات صغيرة جداً (µA)', color: '#67e8f9' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">🔌 دائرة RC</div>

    <div class="ref-section">
      <div class="section-title">المكونات الجديدة</div>
      <div v-for="c in COMPONENTS" :key="c.name" class="comp-row">
        <span class="comp-icon">{{ c.icon }}</span>
        <div class="comp-info">
          <span class="comp-name" :style="{ color: c.color }">{{ c.name }}</span>
          <span class="comp-desc">{{ c.desc }}</span>
        </div>
      </div>
    </div>

    <div class="ref-section">
      <div class="section-title">القوانين الأساسية</div>
      <div class="formula-box" style="color:#fbbf24">τ = R × C</div>
      <div class="formula-box" style="color:#4ade80">شحن: Vc = V₀(1 - e^(-t/τ))</div>
      <div class="formula-box" style="color:#f87171">تفريغ: Vc = V₀ × e^(-t/τ)</div>
      <div class="formula-box" style="color:#67e8f9">Q = C × V</div>
    </div>

    <div v-for="(note, i) in NOTES" :key="i" class="ref-note">{{ note }}</div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #fbbf24; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.comp-row { display: flex; align-items: center; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.comp-row:last-child { border-bottom: none; }
.comp-icon { font-size: 1.2rem; }
.comp-info { display: flex; flex-direction: column; gap: .1rem; }
.comp-name { font-weight: 700; font-size: .8rem; }
.comp-desc { font-size: .7rem; color: #64748b; }
.formula-box { font-family: 'Courier New', monospace; font-size: .78rem; text-align: center; padding: .3rem; background: rgba(255,255,255,.03); border-radius: 3px; margin-bottom: .2rem; font-weight: 700; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
