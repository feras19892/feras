<script setup lang="ts">
const LAWS = [
  { law: 'KCL', name: 'Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ø¹Ù‚Ø¯Ø©', desc: 'Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„ØªÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¯Ø§Ø®Ù„Ø© = Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„ØªÙŠØ§Ø±Ø§Øª Ø§Ù„Ø®Ø§Ø±Ø¬Ø©', color: '#4ade80', formula: 'Î£I(in) = Î£I(out)' },
  { law: 'KVL', name: 'Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ø­Ù„Ù‚Ø©', desc: 'Ù…Ø¬Ù…ÙˆØ¹ ÙØ±ÙˆÙ‚ Ø§Ù„Ø¬Ù‡Ø¯ ÙÙŠ Ø­Ù„Ù‚Ø© Ù…ØºÙ„Ù‚Ø© = ØµÙØ±', color: '#fbbf24', formula: 'Î£V = 0' },
]

const STEPS = [
  { n: 1, text: 'Ø­Ø¯Ø¯ Ø§Ù„Ø¹Ù‚Ø¯ ÙˆØ§Ù„Ø­Ù„Ù‚Ø§Øª ÙÙŠ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©' },
  { n: 2, text: 'Ø§ÙØªØ±Ø¶ Ø§ØªØ¬Ø§Ù‡ Ø§Ù„ØªÙŠØ§Ø±Ø§Øª ÙÙŠ ÙƒÙ„ ÙØ±Ø¹' },
  { n: 3, text: 'Ø§ÙƒØªØ¨ Ù…Ø¹Ø§Ø¯Ù„Ø© KCL Ø¹Ù†Ø¯ ÙƒÙ„ Ø¹Ù‚Ø¯Ø©' },
  { n: 4, text: 'Ø§ÙƒØªØ¨ Ù…Ø¹Ø§Ø¯Ù„Ø© KVL Ù„ÙƒÙ„ Ø­Ù„Ù‚Ø© Ù…Ø³ØªÙ‚Ù„Ø©' },
  { n: 5, text: 'Ø­Ù„ Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ù„Ø¥ÙŠØ¬Ø§Ø¯ Ø§Ù„ØªÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ø¬Ù‡ÙˆÙ„Ø©' },
  { n: 6, text: 'ØªØ­Ù‚Ù‚ Ù…Ù† ØµØ­Ø© Ø§Ù„Ø­Ù„ Ø¨Ø§Ù„ØªØ¹ÙˆÙŠØ¶' },
]

const SIGNS = [
  { sign: '+', desc: 'Ø§Ù„Ø¨Ø·Ø§Ø±ÙŠØ©: Ù…Ù† Ø§Ù„Ù‚Ø·Ø¨ Ø§Ù„Ø³Ø§Ù„Ø¨ Ø¥Ù„Ù‰ Ø§Ù„Ù…ÙˆØ¬Ø¨', color: '#22c55e' },
  { sign: 'âˆ’', desc: 'Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø©: ÙÙŠ Ø§ØªØ¬Ø§Ù‡ Ø§Ù„ØªÙŠØ§Ø± (Ù‡Ø¨ÙˆØ· Ø¬Ù‡Ø¯)', color: '#ef4444' },
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">ðŸ“Š Ù‚Ø§Ù†ÙˆÙ†Ø§ ÙƒÙŠØ±Ø´ÙˆÙ</div>

    <div class="ref-table">
      <div class="ref-header">
        <span>Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†</span>
        <span>Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø©</span>
      </div>
      <div v-for="law in LAWS" :key="law.law" class="ref-row">
        <div class="law-info">
          <span :style="{ color: law.color, fontWeight: 700 }">{{ law.law }}</span>
          <span class="law-name">{{ law.name }}</span>
        </div>
        <span class="law-formula" :style="{ color: law.color }">{{ law.formula }}</span>
      </div>
      <div v-for="law in LAWS" :key="law.law + '-desc'" class="ref-desc">
        {{ law.desc }}
      </div>
    </div>

    <div class="ref-section">
      <div class="section-title">Ø¥Ø´Ø§Ø±Ø§Øª Ø§Ù„Ø¬Ù‡Ø¯ ÙÙŠ KVL</div>
      <div v-for="s in SIGNS" :key="s.sign" class="sign-row">
        <span class="sign" :style="{ color: s.color }">{{ s.sign }}</span>
        <span>{{ s.desc }}</span>
      </div>
    </div>

    <div class="ref-section">
      <div class="section-title">Ø®Ø·ÙˆØ§Øª Ø§Ù„Ø­Ù„</div>
      <ol class="steps-list">
        <li v-for="s in STEPS" :key="s.n">{{ s.text }}</li>
      </ol>
    </div>

    <div class="ref-note">
      ðŸ’¡ Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª = Ø¹Ø¯Ø¯ Ø§Ù„Ø­Ù„Ù‚Ø§Øª Ø§Ù„Ù…Ø³ØªÙ‚Ù„Ø© + (Ø¹Ø¯Ø¯ Ø§Ù„Ø¹Ù‚Ø¯ âˆ’ 1)
    </div>
    <div class="ref-note">
      âš¡ ÙÙŠ Ø¯Ø§Ø¦Ø±ØªÙŠÙ† Ø¨Ø­Ù„Ù‚ØªÙŠÙ†: Ù…Ø¹Ø§Ø¯Ù„Ø© KCL ÙˆØ§Ø­Ø¯Ø© + Ù…Ø¹Ø§Ø¯Ù„ØªØ§ KVL = 3 Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ù„Ù€ 3 Ù…Ø¬Ø§Ù‡ÙŠÙ„
    </div>
    <div class="ref-note">
      ðŸ”„ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ù‚ÙŠÙ…Ø© Ø§Ù„ØªÙŠØ§Ø± Ø³Ø§Ù„Ø¨Ø©ØŒ ÙØ¥Ù† Ø§Ù„Ø§ØªØ¬Ø§Ù‡ Ø§Ù„ÙØ¹Ù„ÙŠ Ø¹ÙƒØ³ Ø§Ù„Ù…ÙØªØ±Ø¶
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; overflow-y: auto; }
.ref-title { font-size: .9rem; font-weight: 700; color: #f59e0b; text-align: center; padding-bottom: .3rem; border-bottom: 1px solid #1e2530; }
.ref-table { display: flex; flex-direction: column; gap: .15rem; }
.ref-header { display: flex; justify-content: space-between; padding: .4rem .6rem; background: #1E2530; border-radius: 4px; font-weight: 700; font-size: .78rem; color: #94a3b8; }
.ref-row { display: flex; justify-content: space-between; align-items: center; padding: .35rem .6rem; border-bottom: 1px solid #1e2530; font-size: .78rem; gap: .5rem; }
.law-info { display: flex; flex-direction: column; gap: .1rem; }
.law-name { font-size: .72rem; color: #64748b; }
.law-formula { font-family: 'Courier New', monospace; font-weight: 700; font-size: .8rem; }
.ref-desc { font-size: .72rem; color: #94a3b8; padding: .2rem .6rem; }
.ref-section { margin-top: .4rem; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.section-title { font-size: .78rem; font-weight: 700; color: #67e8f9; margin-bottom: .3rem; }
.sign-row { display: flex; align-items: center; gap: .4rem; font-size: .75rem; color: #cbd5e1; padding: .15rem 0; }
.sign { font-size: 1rem; font-weight: 700; width: 1.2rem; text-align: center; }
.steps-list { margin: 0; padding-inline-start: 1.2rem; padding-inline-start: 0; }
.steps-list li { font-size: .75rem; color: #cbd5e1; line-height: 1.6; margin-bottom: .15rem; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>
