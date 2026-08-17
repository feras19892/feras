<script setup lang="ts">
defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="guide-panel" v-if="visible">
    <div class="guide-header">
      <span class="guide-title">📋 خطوات التجربة</span>
      <button class="close-btn" @click="emit('close')">✕</button>
    </div>
    <div class="guide-body">
      <div class="step"><span class="step-num">1</span><div class="step-text">اختر الوضع: توازني أو شعاعي (دائري).</div></div>
      <div class="step"><span class="step-num">2</span><div class="step-text">اضبط المعاملات: الكتلة، القوة، الزاوية، الاحتكاك.</div></div>
      <div class="step"><span class="step-num">3</span><div class="step-text">اضغط ▶️ تشغيل وراقب حركة الجسم والأسهم.</div></div>
      <div class="step"><span class="step-num">4</span><div class="step-text">لاحظ حالة الجسم: ساكن، منزلق، أو متوازن.</div></div>
      <div class="step"><span class="step-num">5</span><div class="step-text">عند التوازن، اضغط 📝 تسجيل (S).</div></div>
      <div class="step"><span class="step-num">6</span><div class="step-text">كرر بقيم مختلفة لتجميع بيانات متعددة.</div></div>
      <div class="step"><span class="step-num">7</span><div class="step-text">اضغط 🧪 تشغيل المختبر لتسجيل تلقائي.</div></div>
      <div class="step"><span class="step-num">8</span><div class="step-text">اضغط 🤖 لتحليل البيانات المجمعة.</div></div>
      <div class="formula-hint">
        <div class="formula">F_net = √(ΣFx² + ΣFy²)</div>
        <div class="formula-desc">محصلة القوى = الجذر التربيعي لمجموع مربعات المركبات</div>
        <div class="formula" style="margin-top:.4rem">f ≤ μ × N</div>
        <div class="formula-desc">الاحتكاك السكوني الأقصى = معامل الاحتكاك × القوة العمودية</div>
        <div class="formula" style="margin-top:.4rem">Fc = m · ω² · r</div>
        <div class="formula-desc">القوة المركزية = الكتلة × مربع السرعة الزاوية × نصف القطر</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-panel { background: #161B22; border: 1px solid #2D3645; border-radius: 8px; display: flex; flex-direction: column; max-height: 100%; overflow: hidden; }
.guide-header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .75rem; border-bottom: 1px solid #2D3645; }
.guide-title { font-size: .85rem; font-weight: 700; color: #67e8f9; }
.close-btn { background: none; border: none; color: #64748b; cursor: pointer; font-size: .9rem; }
.close-btn:hover { color: #ef4444; }
.guide-body { padding: .6rem .75rem; overflow-y: auto; display: flex; flex-direction: column; gap: .5rem; }
.step { display: flex; gap: .5rem; align-items: flex-start; }
.step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: rgba(103,232,249,.15); color: #67e8f9; font-size: .7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.step-text { font-size: .75rem; color: #94a3b8; line-height: 1.5; }
.formula-hint { margin-top: .5rem; padding: .6rem; background: rgba(103,232,249,.06); border-radius: 6px; border: 1px solid rgba(103,232,249,.12); }
.formula { font-family: 'Courier New', monospace; font-size: .85rem; color: #67e8f9; text-align: center; }
.formula-desc { font-size: .65rem; color: #64748b; text-align: center; margin-top: .25rem; }
</style>
