<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ V: number; I_ohmic: number; I_lamp: number; R_dyn: number }>()

const showSteps = ref<Record<string, boolean>>({ intro: false, step1: false, step2: false, step3: false })

function toggleStep(step: string) { showSteps.value[step] = !showSteps.value[step] }
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">💡 المواد اللاأومية — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: أومي vs لا أومي
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>مادة أومية</b>: V = I×R (علاقة خطية)، R ثابتة (مثل المقاومة المعدنية).</p>
        <p class="explain"><b>مادة لا أومية</b>: V ≠ I×R، R تتغير مع التيار/الحرارة (مثل المصباح، الصمام).</p>
        <div class="formula">أومي: V = I × R (خط مستقيم)</div>
        <div class="formula">لا أومي: V ≠ I × R (منحنى)</div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: التيار في المقاومة الأومية
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">I = V / R</div>
        <div class="calc">
          <div class="calc-line">V = {{ V.toFixed(2) }} V</div>
          <div class="calc-line result">I_ohmic = {{ I_ohmic.toFixed(4) }} A</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: التيار في المصباح (لا أومي)
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain">المصباح: R يزيد مع الحرارة → R_eff = R × (1 + 0.05×V)</p>
        <div class="calc">
          <div class="calc-line result">I_lamp = {{ I_lamp.toFixed(4) }} A</div>
        </div>
        <p class="explain">الفرق: I_lamp &lt; I_ohmic (لأن R_effective أكبر بسبب الحرارة).</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: المقاومة الديناميكية
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="formula">R_dyn = dV / dI</div>
        <div class="calc">
          <div class="calc-line result">R_dyn = {{ R_dyn.toFixed(2) }} Ω</div>
        </div>
        <p class="explain">R_dyn تتغير من نقطة لأخرى على المنحنى — ليست ثابتة.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #fbbf24; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #fbbf24; text-align: center; padding: .4rem; background: rgba(251,191,36,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
</style>
