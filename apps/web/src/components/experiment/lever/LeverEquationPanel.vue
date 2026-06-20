<script setup lang="ts">
</script>

<template>
  <div class="equation-panel">
    <div class="eq-title">&#x1F9EA; قانون الروافع</div>
    <div class="eq-formula">τ = m · g · x</div>
    <div class="eq-desc">
      <p><strong>m</strong> = الكتلة (kg)</p>
      <p><strong>g</strong> = الجاذبية (9.81 m/s²)</p>
      <p><strong>x</strong> = المسافة من الارتكاز (m)</p>
    </div>
    <div class="eq-example">
      <div class="eq-label">مثال:</div>
      <div>2kg × 9.81 × 3m = <strong>58.86 N·m</strong></div>
    </div>
    <div class="eq-hint">
      العزم <strong>موجب</strong> = دوران عكس عقارب الساعة (يمين)<br>
      العزم <strong>سالب</strong> = دوران مع عقارب الساعة (يسار)
    </div>
  </div>
</template>

<style scoped>
.equation-panel { padding:.6rem; }
.eq-title { font-size:.9rem; font-weight:700; color:#5B8DB8; margin-bottom:.5rem; }
.eq-formula { font-size:1.3rem; font-family:'Courier New', monospace; color:#fbbf24; text-align:center; padding:.5rem; background:rgba(245,158,11,.08); border-radius:6px; margin-bottom:.5rem; }
.eq-desc p { font-size:.8rem; color:#94a3b8; margin:.2rem 0; }
.eq-example { background:rgba(91,141,184,.08); border-radius:6px; padding:.5rem; margin:.5rem 0; font-size:.8rem; color:#e2e8f0; }
.eq-label { color:#5B8DB8; font-weight:700; margin-bottom:.25rem; }
.eq-hint { font-size:.75rem; color:#64748b; margin-top:.5rem; line-height:1.5; }
</style>
