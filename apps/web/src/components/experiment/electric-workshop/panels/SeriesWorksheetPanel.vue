<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref } from 'vue'


const props = defineProps<{ V: number; I: number; Req: number; V1: number; V2: number; V3: number }>()

const showSteps = ref<Record<string, boolean>>({ intro: false, step1: false, step2: false, step3: false })

function toggleStep(step: string) { showSteps.value[step] = !showSteps.value[step] }
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">🔗 دوائر التوالي — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هي دائرة التوالي؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain">في دائرة التوالي، المكونات متصلة على خط واحد — <b>نفس التيار</b> يمر في جميع المقاومات.</p>
        <p class="explain">الجهد الكلي = مجموع الجهود على كل مقاومة.</p>
        <div class="formula">V = V1 + V2 + V3</div>
        <div class="formula">Req = R1 + R2 + R3</div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: المقاومة المكافئة
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">Req = R1 + R2 + R3</div>
        <div class="calc">
          <div class="calc-line result">Req = {{ Req.toFixed(2) }} Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: التيار
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">I = V / Req</div>
        <div class="calc">
          <div class="calc-line">I = {{ V.toFixed(2) }} / {{ Req.toFixed(2) }}</div>
          <div class="calc-line result">I = {{ I.toFixed(4) }} A</div>
        </div>
        <p class="explain">نفس التيار يمر في جميع المقاومات.</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: تقسيم الجهد
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="calc">
          <div class="calc-line">V1 = I × R1 = {{ V1.toFixed(4) }} V</div>
          <div class="calc-line">V2 = I × R2 = {{ V2.toFixed(4) }} V</div>
          <div class="calc-line">V3 = I × R3 = {{ V3.toFixed(4) }} V</div>
          <div class="calc-line result">V1 + V2 + V3 = {{ (V1 + V2 + V3).toFixed(4) }} V ≈ {{ V.toFixed(2) }} V ✓</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #4ade80; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #4ade80; text-align: center; padding: .4rem; background: rgba(74,222,128,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
</style>
