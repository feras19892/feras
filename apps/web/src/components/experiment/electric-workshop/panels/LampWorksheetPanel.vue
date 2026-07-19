<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  V: number
  I: number
  R: number
  P: number
  PLight: number
  PHeat: number
}>()

const showSteps = ref<Record<string, boolean>>({
  intro: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  step5: false,
})

const efficiency = computed(() => props.P === 0 ? 0 : (props.PLight / props.P * 100))
const pCalc = computed(() => props.V * props.I)
const brightness = computed(() => Math.min(100, (props.P / 10) * 100))

function toggleStep(step: string) {
  showSteps.value[step] = !showSteps.value[step]
}
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">💡 دائرة المصباح والكفاءة — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: تحويل الطاقة الكهربائية
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain"><b>المصباح الكهربائي</b> يحوّل الطاقة الكهربائية إلى ضوء وحرارة.</p>
        <p class="explain">المصباح التقليدي (التنجستن): ~5% ضوء، ~95% حرارة</p>
        <p class="explain">LED: ~40% ضوء، ~60% حرارة (أكثر كفاءة)</p>
        <div class="circuit-desc">
          <div class="branch"><span class="branch-label" style="color:#fbbf24">الجهد:</span> V = {{ V.toFixed(1) }}V</div>
          <div class="branch"><span class="branch-label" style="color:#4ade80">التيار:</span> I = {{ I.toFixed(3) }}A</div>
          <div class="branch"><span class="branch-label" style="color:#67e8f9">المقاومة:</span> R = {{ R.toFixed(1) }}Ω</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: القدرة الكلية
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="formula">P = V × I</div>
        <div class="calc">
          <div class="calc-line">P = {{ V.toFixed(1) }} × {{ I.toFixed(3) }}</div>
          <div class="calc-line result">P = {{ pCalc.toFixed(3) }} W</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: قدرة الضوء
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <p class="explain">فقط 5% من الطاقة تتحول إلى ضوء:</p>
        <div class="formula">P_light = P × 0.05</div>
        <div class="calc">
          <div class="calc-line">P_light = {{ P.toFixed(3) }} × 0.05</div>
          <div class="calc-line result">P_light = {{ PLight.toFixed(4) }} W</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: قدرة الحرارة
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <p class="explain">95% من الطاقة تتحول إلى حرارة (طاقة مفقودة):</p>
        <div class="formula">P_heat = P × 0.95</div>
        <div class="calc">
          <div class="calc-line">P_heat = {{ P.toFixed(3) }} × 0.95</div>
          <div class="calc-line result">P_heat = {{ PHeat.toFixed(3) }} W</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step4')">
        {{ showSteps.step4 ? '▼' : '▶' }} الخطوة 4: التحقق
      </button>
      <div v-if="showSteps.step4" class="step-content">
        <div class="formula">P_light + P_heat = P</div>
        <div class="calc">
          <div class="calc-line">{{ PLight.toFixed(4) }} + {{ PHeat.toFixed(3) }} = {{ (PLight + PHeat).toFixed(3) }} W</div>
          <div class="calc-line">P = {{ P.toFixed(3) }} W</div>
          <div :class="Math.abs(PLight + PHeat - P) < 0.001 ? 'result' : 'warn'">
            {{ Math.abs(PLight + PHeat - P) < 0.001 ? '✓ متطابق' : '✗ هناك فرق' }}
          </div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step5')">
        {{ showSteps.step5 ? '▼' : '▶' }} الخطوة 5: الكفاءة
      </button>
      <div v-if="showSteps.step5" class="step-content">
        <div class="formula">η = P_light / P × 100%</div>
        <div class="calc">
          <div class="calc-line">η = {{ PLight.toFixed(4) }} / {{ P.toFixed(3) }} × 100%</div>
          <div class="calc-line result">η = {{ efficiency.toFixed(1) }}%</div>
        </div>
        <p class="explain">كفاءة المصباح التقليدي منخفضة جداً (~5%) — معظم الطاقة تُهدر حرارة!</p>
        <div class="brightness-bar">
          <div class="b-label">الإضاءة: {{ brightness.toFixed(0) }}%</div>
          <div class="b-bar-bg"><div class="b-bar-fill" :style="{ width: brightness + '%' }"></div></div>
        </div>
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
.circuit-desc { display: flex; flex-direction: column; gap: .3rem; margin: .5rem 0; padding: .5rem; background: rgba(255,255,255,.02); border-radius: 4px; }
.branch { font-size: .78rem; color: #cbd5e1; display: flex; gap: .4rem; align-items: baseline; }
.branch-label { font-weight: 700; white-space: nowrap; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #fbbf24; text-align: center; padding: .4rem; background: rgba(251,191,36,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
.warn { color: #ef4444; font-weight: 700; }
.brightness-bar { margin-top: .5rem; }
.b-label { font-size: .75rem; color: #c084fc; margin-bottom: .2rem; }
.b-bar-bg { height: 10px; background: #1e2530; border-radius: 5px; overflow: hidden; }
.b-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24, #fde047); border-radius: 5px; transition: width .3s; }
</style>
