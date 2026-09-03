<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref } from 'vue'


const props = defineProps<{ Vt: number; I: number; emf: number; r: number }>()

const showSteps = ref<Record<string, boolean>>({ intro: false, step1: false, step2: false, step3: false })

function toggleStep(step: string) { showSteps.value[step] = !showSteps.value[step] }
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">🔋 المقاومة الداخلية للبطارية — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هي المقاومة الداخلية؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain">البطارية الحقيقية ليست مثالية — لها <b>مقاومة داخلية r</b> صغيرة.</p>
        <p class="explain">الجهد الحقيقي (EMF) ينقسم: جزء على المقاومة الداخلية، وجزء على الحمل الخارجي.</p>
        <div class="formula">Vt = ε - I × r</div>
        <p class="explain">حيث: ε = القوة الدافعة، r = المقاومة الداخلية، Vt = الجهد الطرفي</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: حساب التيار
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <p class="explain">التيار الكلي يمر عبر المقاومة الداخلية والخارجية على التوالي:</p>
        <div class="formula">I = ε / (R + r)</div>
        <div class="calc">
          <div class="calc-line">ε = {{ emf.toFixed(2) }} V</div>
          <div class="calc-line result">I = {{ I.toFixed(4) }} A</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: الجهد الطرفي
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">Vt = ε - I × r</div>
        <div class="calc">
          <div class="calc-line">Vt = {{ emf.toFixed(2) }} - {{ I.toFixed(4) }} × {{ r.toFixed(2) }}</div>
          <div class="calc-line result">Vt = {{ Vt.toFixed(4) }} V</div>
        </div>
        <p class="explain">الهبوط على المقاومة الداخلية: ΔV = I × r = {{ (I * r).toFixed(4) }} V</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: حالات خاصة
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain"><b>دائرة مفتوحة</b> (R → ∞): I = 0، Vt = ε (قراءة الفولتميتر = EMF)</p>
        <p class="explain"><b>دائرة قصر</b> (R = 0): I = ε/r (تيار عالي جداً)، Vt = 0</p>
        <p class="explain"><b>عند R = r</b>: Vt = ε/2 (أقصى نقل للقدرة)</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #f59e0b; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #f59e0b; text-align: center; padding: .4rem; background: rgba(245,158,11,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
</style>
