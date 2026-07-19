<script setup lang="ts">
const METALS = [
  { name: 'Ø£Ù„Ù…Ù†ÙŠÙˆÙ…', symbol: 'Al', c: 900, color: '#a8a8a8' },
  { name: 'Ù†Ø­Ø§Ø³', symbol: 'Cu', c: 385, color: '#b87333' },
  { name: 'Ø­Ø¯ÙŠØ¯', symbol: 'Fe', c: 450, color: '#4a4a4a' },
  { name: 'Ø±ØµØ§Øµ', symbol: 'Pb', c: 130, color: '#5a5a6a' },
  { name: 'Ø²Ù†Ùƒ', symbol: 'Zn', c: 390, color: '#7a8a7a' },
  { name: 'ÙØ¶Ø©', symbol: 'Ag', c: 235, color: '#c0c0c0' },
  { name: 'Ø°Ù‡Ø¨', symbol: 'Au', c: 129, color: '#d4af37' },
  { name: 'Ù†ÙŠÙƒÙ„', symbol: 'Ni', c: 440, color: '#6a7a8a' },
  { name: 'Ù†Ø­Ø§Ø³ Ø£ØµÙØ±', symbol: 'Brass', c: 380, color: '#b5a642' },
  { name: 'Ø¨Ø±ÙˆÙ†Ø²', symbol: 'Bronze', c: 435, color: '#cd7f32' },
  { name: 'Ù‚ØµØ¯ÙŠØ±', symbol: 'Sn', c: 227, color: '#718f91' },
  { name: 'Ù…ØºÙ†ÙŠØ³ÙŠÙˆÙ…', symbol: 'Mg', c: 1020, color: '#8f9e8f' },
  { name: 'ØªÙŠØªØ§Ù†ÙŠÙˆÙ…', symbol: 'Ti', c: 523, color: '#7a7a8a' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">ðŸ“‹ Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø³Ø¹Ø§Øª Ø§Ù„Ø­Ø±Ø§Ø±ÙŠØ© Ø§Ù„Ù†ÙˆØ¹ÙŠØ©</div>
    <div class="ref-subtitle">Ù„Ù„Ù…Ù‚Ø§Ø±Ù†Ø© ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ø¹Ø¯Ù† Ø§Ù„Ù…Ø¬Ù‡ÙˆÙ„</div>

    <div class="ref-table">
      <div class="ref-header">
        <span>Ø§Ù„Ù…Ø¹Ø¯Ù†</span>
        <span>Ø§Ù„Ø±Ù…Ø²</span>
        <span>c (J/kgÂ·Â°C)</span>
      </div>
      <div v-for="m in METALS" :key="m.name" class="ref-row">
        <span class="metal-name">
          <span class="metal-dot" :style="{ background: m.color }"></span>
          {{ m.name }}
        </span>
        <span class="metal-symbol">{{ m.symbol }}</span>
        <span class="metal-c">{{ m.c }}</span>
      </div>
    </div>

    <div class="ref-hint">
      <div class="hint-title">ðŸ’¡ Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:</div>
      <ol>
        <li>Ø§Ø­Ø³Ø¨ c_m Ù…Ù† ØªØ¬Ø±Ø¨ØªÙƒ</li>
        <li>Ù‚Ø§Ø±Ù† Ø§Ù„Ù‚ÙŠÙ…Ø© Ù…Ø¹ Ø§Ù„Ø¬Ø¯ÙˆÙ„</li>
        <li>Ø§Ø®ØªØ± Ø£Ù‚Ø±Ø¨ Ù…Ø¹Ø¯Ù†</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding:1rem; display:flex; flex-direction:column; gap:.5rem; }
.ref-title { font-size:.9rem; font-weight:700; color:#5B8DB8; text-align:center; padding-bottom:.3rem; border-bottom:1px solid #1e2530; }
.ref-subtitle { font-size:.65rem; color:#64748b; text-align:center; }

.ref-table { display:flex; flex-direction:column; gap:.15rem; border:1px solid #1e2530; border-radius:6px; overflow:hidden; }
.ref-header { display:grid; grid-template-columns:1fr 60px 80px; gap:.3rem; padding:.3rem .5rem; background:rgba(91,141,184,.1); font-size:.65rem; font-weight:700; color:#5B8DB8; }
.ref-row { display:grid; grid-template-columns:1fr 60px 80px; gap:.3rem; padding:.3rem .5rem; font-size:.68rem; color:#D1D7E0; border-bottom:1px solid rgba(30,37,48,.4); align-items:center; }
.ref-row:last-child { border:none; }

.metal-name { display:flex; align-items:center; gap:.35rem; }
.metal-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
.metal-symbol { color:#8B95A5; text-align:center; }
.metal-c { color:#4ade80; font-weight:600; text-align:center; }

.ref-hint { background:rgba(34,197,94,.05); border:1px solid rgba(34,197,94,.15); border-radius:6px; padding:.4rem .55rem; }
.hint-title { font-size:.7rem; font-weight:600; color:#22c55e; margin-bottom:.3rem; }
.ref-hint ol { margin:0; padding-inline-start: 1.2rem; font-size:.65rem; color:#8B95A5; }
.ref-hint li { margin-bottom:.15rem; }
</style>
