<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ Ceq: number; tau: number; C1: number; C2: number }>()

const showSteps = ref<Record<string, boolean>>({ intro: false, step1: false, step2: false, step3: false })

function toggleStep(step: string) { showSteps.value[step] = !showSteps.value[step] }
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">🔌 توالي وتوازي المكثفات — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: المكثفات في الدوائر
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain">المكثف يخزن الشحنة الكهربائية. سعته C تقاس بالفاراد (F).</p>
        <p class="explain"><b>على التوالي</b>: السعة الكلية أقل من أصغر مكثفة.</p>
        <div class="formula">1/Ceq = 1/C1 + 1/C2</div>
        <p class="explain"><b>على التوازي</b>: السعة الكلية = مجموع السعات.</p>
        <div class="formula">Ceq = C1 + C2</div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: حساب السعة المكافئة
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="calc">
          <div class="calc-line">C1 = {{ C1.toFixed(1) }} µF</div>
          <div class="calc-line">C2 = {{ C2.toFixed(1) }} µF</div>
          <div class="calc-line result">Ceq = {{ Ceq.toFixed(2) }} µF</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: ثابت الزمن
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="formula">τ = R × Ceq</div>
        <div class="calc">
          <div class="calc-line result">τ = {{ tau.toFixed(4) }} s = {{ (tau * 1000).toFixed(2) }} ms</div>
        </div>
        <p class="explain">ثابت الزمن يحدد سرعة شحن/تفريغ المكثف.</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: منحنى الشحن
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="formula">V(t) = V0 × (1 - e^(-t/τ))</div>
        <p class="explain">عند t = τ: V = 63.2% من V0</p>
        <p class="explain">عند t = 5τ: V ≈ 99.3% (شحن كامل تقريباً)</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #67e8f9; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: right; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #67e8f9; text-align: center; padding: .4rem; background: rgba(103,232,249,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
</style>
