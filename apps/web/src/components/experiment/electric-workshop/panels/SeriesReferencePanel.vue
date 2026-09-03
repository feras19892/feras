<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
const NOTES = [
  '🔗 في التوالي: التيار واحد في جميع المقاومات',
  '⚡ V = V1 + V2 + V3 — الجهد يتوزع',
  '📊 Req = R1 + R2 + R3 — المقاومة الكلية أكبر من أي مقاومة فردية',
  '💡 إضافة مقاومة في التوالي تزيد المقاومة الكلية وتقلل التيار',
  '🎄 مصابيح شجرة الميلاد القديمة كانت على التوالي — إذا احترقت واحدة تنطفئ الكل',
]
</script>

<template>
  <div class="panel-body">
    <div class="ref-title">🔗 دوائر التوالي</div>
    <div class="ref-section">
      <div class="section-title">القوانين الأساسية</div>
      <div class="formula-box" style="color:#4ade80">Req = R1 + R2 + R3</div>
      <div class="formula-box" style="color:#67e8f9">I = V / Req</div>
      <div class="formula-box" style="color:#fbbf24">Vn = I × Rn</div>
    </div>
    <div class="ref-section">
      <div class="section-title">مقارنة التوالي والتوازي</div>
      <div class="app-row"><span>التوالي: Req أكبر، I واحد</span></div>
      <div class="app-row"><span>التوازي: Req أصغر، V واحد</span></div>
      <div class="app-row"><span>التوالي: إذا انقطع واحد، تتوقف الدائرة</span></div>
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
.app-row { display: flex; gap: .5rem; padding: .25rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-size: .75rem; color: #cbd5e1; }
.app-row:last-child { border-bottom: none; }
.ref-note { font-size: .72rem; color: #64748b; margin-top: .3rem; line-height: 1.5; }
</style>