<script setup lang="ts">
const props = defineProps<{ L0: number; t0: number; t1: number; alpha: number; dL: number; material?: string }>()
</script>
<template>
  <div class="laws-panel">
    <div class="law-box expansion">
      <div class="law-title">قانون التمدد الخطي</div>
      <div class="formula">ΔL = α × L₀ × ΔT</div>
      <div class="data-grid">
        <div class="data-item"><span class="data-label">L₀</span><span class="data-val">{{ L0.toFixed(2) }} m</span></div>
        <div class="data-item"><span class="data-label">ΔT</span><span class="data-val">{{ (t1 - t0) }} °C</span></div>
        <div class="data-item"><span class="data-label">α</span><span class="data-val">{{ alpha.toFixed(1) }} × 10⁻⁶/K</span></div>
        <div class="data-item highlight"><span class="data-label">ΔL</span><span class="data-val green">{{ (dL * 1000).toFixed(3) }} mm</span></div>
      </div>
    </div>
    <div class="law-box calc">
      <div class="law-title">حساب معامل التمدد α</div>
      <div class="formula">α = ΔL / (L₀ × ΔT)</div>
      <div class="data-grid">
        <div class="data-item"><span class="data-label">ΔL</span><span class="data-val">{{ (dL * 1000).toFixed(3) }} mm</span></div>
        <div class="data-item"><span class="data-label">L₀ × ΔT</span><span class="data-val">{{ (L0 * (t1 - t0)).toFixed(2) }} m·°C</span></div>
        <div class="data-item highlight"><span class="data-label">α (محسوب)</span><span class="data-val green">{{ (dL / (L0 * (t1 - t0)) * 1e6).toFixed(1) }} × 10⁻⁶/K</span></div>
        <div class="data-item"><span class="data-label">α (حقيقي)</span><span class="data-val blue">{{ alpha.toFixed(1) }} × 10⁻⁶/K</span></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.laws-panel { display:flex; flex-direction:column; gap:.4rem; padding:.3rem; }
.law-box { border-radius:8px; padding:.6rem .7rem; margin-bottom:.3rem; }
.law-box.expansion { background:rgba(245,158,11,.06); border:1px solid rgba(245,158,11,.18); }
.law-box.calc { background:rgba(91,141,184,.06); border:1px solid rgba(91,141,184,.18); }
.law-title { font-weight:800; font-size:.8rem; margin-bottom:.4rem; }
.law-box.expansion .law-title { color:#fbbf24; }
.law-box.calc .law-title { color:#5B8DB8; }
.formula { font-family:'Courier New', monospace; font-size:.9rem; color:#D1D7E0; text-align:center; margin:.25rem 0 .3rem; letter-spacing:.5px; }
.data-grid { display:flex; flex-direction:column; gap:.2rem; }
.data-item { display:flex; justify-content:space-between; padding:.25rem .35rem; border-radius:4px; background:rgba(255,255,255,.02); font-size:.74rem; }
.data-item.highlight { background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.2); }
.data-label { color:#8B95A5; }
.data-val { color:#D1D7E0; font-weight:700; }
.data-val.green { color:#4ade80; }
.data-val.blue { color:#5B8DB8; }
</style>
