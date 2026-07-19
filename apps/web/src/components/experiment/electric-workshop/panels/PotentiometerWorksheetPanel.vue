<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ Vref: number; Vx: number; Vslide: number; Ig: number; balanced: boolean }>()

const showSteps = ref<Record<string, boolean>>({ intro: false, step1: false, step2: false, step3: false })

function toggleStep(step: string) { showSteps.value[step] = !showSteps.value[step] }
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📏 البوتانشيوميتر — حل مفصّل</div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('intro')">
        {{ showSteps.intro ? '▼' : '▶' }} مقدمة: ما هو البوتانشيوميتر؟
      </button>
      <div v-if="showSteps.intro" class="step-content">
        <p class="explain">جهاز دقيق لقياس الجهد (EMF) بدون سحب تيار من المصدر المجهول.</p>
        <p class="explain">سلك مقاوم طويل موصول على بطارية مرجعية — الجهد يتناسب مع الطول.</p>
        <div class="formula">Vslide = (Lx / L) × Vref</div>
        <p class="explain">عند التوازن: الأميتر يقرأ صفراً → εx = Vslide</p>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step1')">
        {{ showSteps.step1 ? '▼' : '▶' }} الخطوة 1: الجهد على السلك
      </button>
      <div v-if="showSteps.step1" class="step-content">
        <div class="calc">
          <div class="calc-line">Vref = {{ Vref.toFixed(2) }} V</div>
          <div class="calc-line">Vslide = {{ Vslide.toFixed(4) }} V</div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step2')">
        {{ showSteps.step2 ? '▼' : '▶' }} الخطوة 2: فحص التوازن
      </button>
      <div v-if="showSteps.step2" class="step-content">
        <div class="calc">
          <div class="calc-line">Ig = {{ Ig.toFixed(2) }} µA</div>
          <div class="calc-line" :class="{ result: balanced }">
            {{ balanced ? '✓ متوازن — Ig ≈ 0' : '✗ غير متوازن — حرّك نقطة التلامس' }}
          </div>
        </div>
      </div>
    </div>

    <div class="step-row">
      <button class="step-toggle" @click="toggleStep('step3')">
        {{ showSteps.step3 ? '▼' : '▶' }} الخطوة 3: قياس الجهد المجهول
      </button>
      <div v-if="showSteps.step3" class="step-content">
        <div class="formula">εx = Vslide (عند التوازن)</div>
        <div class="calc">
          <div class="calc-line">εx المتوقع = {{ Vx.toFixed(4) }} V</div>
          <div class="calc-line">Vslide = {{ Vslide.toFixed(4) }} V</div>
          <div class="calc-line result" v-if="balanced">εx المقاس = {{ Vslide.toFixed(4) }} V ✓</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow-y: auto; }
.ws-title { font-size: 1rem; font-weight: 700; color: #c084fc; text-align: center; padding: .5rem; border-bottom: 1px solid #1e2530; margin-bottom: .25rem; }
.step-row { display: flex; flex-direction: column; gap: .25rem; }
.step-toggle { background: #1E2530; border: 1px solid #2D3645; color: #D1D7E0; padding: .5rem .75rem; border-radius: 6px; cursor: pointer; text-align: end; font-size: .85rem; }
.step-toggle:hover { background: #252D3A; }
.step-content { background: #0d1117; border: 1px solid #1e2530; border-radius: 6px; padding: .75rem; font-size: .85rem; }
.explain { color: #94a3b8; margin: .3rem 0; line-height: 1.6; font-size: .82rem; }
.explain b { color: #e2e8f0; }
.formula { font-family: 'Courier New', monospace; font-size: .9rem; color: #c084fc; text-align: center; padding: .4rem; background: rgba(192,132,252,.08); border-radius: 4px; margin: .3rem 0; }
.calc { display: flex; flex-direction: column; gap: .2rem; color: #D1D7E0; }
.calc-line { font-family: 'Courier New', monospace; font-size: .82rem; padding: .15rem 0; }
.result { color: #22c55e; font-weight: 700; }
</style>
