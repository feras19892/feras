<script setup lang="ts">
import { ref, computed } from 'vue'
import { C_WATER } from '../../../../composables/specific-heat/useSpecificHeatCalculations'

const props = defineProps<{
  metalMass: number
  waterMass: number
  waterTemp: number
  metalTemp: number
  displayT: number
}>()

// Which steps are revealed?
const showQGained = ref(false)
const showQLost = ref(false)
const showCm = ref(false)
const showMetal = ref(false)

const qGainedVal = computed(() => props.waterMass * C_WATER * (props.displayT - props.waterTemp))
const qLostVal = computed(() => qGainedVal.value)
const cmVal = computed(() => {
  const num = props.waterMass * C_WATER * (props.displayT - props.waterTemp)
  const den = props.metalMass * (props.metalTemp - props.displayT)
  if (den === 0) return 0
  return num / den
})

const METAL_REFERENCE = [
  { name: 'ألمنيوم', c: 900, range: [850, 950] },
  { name: 'نحاس', c: 385, range: [350, 420] },
  { name: 'حديد', c: 450, range: [420, 480] },
  { name: 'رصاص', c: 130, range: [120, 140] },
  { name: 'زنك', c: 390, range: [370, 410] },
  { name: 'فضة', c: 235, range: [220, 250] },
  { name: 'ذهب', c: 129, range: [120, 140] },
  { name: 'نيكل', c: 440, range: [420, 460] },
  { name: 'نحاس أصفر', c: 380, range: [360, 400] },
  { name: 'برونز', c: 435, range: [410, 460] },
  { name: 'قصدير', c: 227, range: [210, 240] },
  { name: 'مغنيسيوم', c: 1020, range: [980, 1060] },
  { name: 'تيتانيوم', c: 523, range: [500, 550] },
]

const matchedMetal = computed(() => {
  const cm = cmVal.value
  return METAL_REFERENCE.find(m => cm >= m.range[0] && cm <= m.range[1])?.name || 'غير معروف'
})
</script>

<template>
  <div class="panel-body">
    <div class="ws-title">📐 خطوات الحساب</div>

    <!-- Step 1: Q_gained -->
    <div class="calc-box">
      <div class="calc-header">
        <span class="calc-num">①</span>
        <span class="calc-label">الطاقة المكتسبة للماء</span>
      </div>
      <div class="formula">Q<sub>gained</sub> = m<sub>w</sub> × c<sub>w</sub> × (T<sub>f</sub> − T<sub>w</sub>)</div>
      <div class="values">= {{ (waterMass*1000).toFixed(0) }}g × {{ C_WATER }} × ({{ displayT.toFixed(1) }} − {{ waterTemp }})</div>
      <button v-if="!showQGained" class="calc-btn" @click="showQGained = true">
        ▶ احسب Q<sub>gained</sub>
      </button>
      <div v-else class="result">
        <span class="result-val">= {{ qGainedVal.toFixed(1) }} J</span>
        <span class="result-note">الطاقة التي امتصها الماء من المعدن الساخن</span>
      </div>
    </div>

    <!-- Step 2: Q_lost -->
    <div class="calc-box">
      <div class="calc-header">
        <span class="calc-num">②</span>
        <span class="calc-label">الطاقة المفقودة من المعدن</span>
      </div>
      <div class="formula">Q<sub>lost</sub> = Q<sub>gained</sub></div>
      <div class="values">(اتزان حراري — ما يفقده المعدن = ما يكتسبه الماء)</div>
      <button v-if="!showQLost && showQGained" class="calc-btn" @click="showQLost = true">
        ▶ احسب Q<sub>lost</sub>
      </button>
      <button v-else-if="!showQGained" class="calc-btn disabled" disabled>
        أكمل الخطوة ① أولاً
      </button>
      <div v-else class="result">
        <span class="result-val">= {{ qLostVal.toFixed(1) }} J</span>
        <span class="result-note">الطاقة التي فقدها المعدن لتسخين الماء</span>
      </div>
    </div>

    <!-- Step 3: c_m -->
    <div class="calc-box">
      <div class="calc-header">
        <span class="calc-num">③</span>
        <span class="calc-label">السعة الحرارية النوعية للمعدن</span>
      </div>
      <div class="formula">c<sub>m</sub> = Q<sub>lost</sub> / [m<sub>m</sub> × (T<sub>m</sub> − T<sub>f</sub>)]</div>
      <div class="values">= {{ qLostVal.toFixed(1) }} / [{{ (metalMass*1000).toFixed(0) }}g × ({{ metalTemp.toFixed(0) }} − {{ displayT.toFixed(1) }})]</div>
      <button v-if="!showCm && showQLost" class="calc-btn" @click="showCm = true">
        ▶ احسب c<sub>m</sub>
      </button>
      <button v-else-if="!showQLost" class="calc-btn disabled" disabled>
        أكمل الخطوة ② أولاً
      </button>
      <div v-else class="result">
        <span class="result-val">= {{ cmVal.toFixed(1) }} J/kg·°C</span>
        <span class="result-note">السعة الحرارية النوعية للمعدن المجهول</span>
      </div>
    </div>

    <!-- Step 4: Identify metal -->
    <div class="calc-box">
      <div class="calc-header">
        <span class="calc-num">④</span>
        <span class="calc-label">تحديد نوع المعدن</span>
      </div>
      <div class="formula">قارن c<sub>m</sub> مع الجدول المرجعي</div>
      <div class="values">c<sub>m</sub> = {{ cmVal.toFixed(1) }} J/kg·°C</div>
      <button v-if="!showMetal && showCm" class="calc-btn" @click="showMetal = true">
        ▶ حدد نوع المعدن
      </button>
      <button v-else-if="!showCm" class="calc-btn disabled" disabled>
        أكمل الخطوة ③ أولاً
      </button>
      <div v-else class="result">
        <span class="result-val">المعدن هو: {{ matchedMetal }}</span>
        <span class="result-note" v-if="matchedMetal !== 'غير معروف'">✓ تم التعرف على المعدن</span>
        <span class="result-note err" v-else>✗ غير موجود في الجدول المرجعي</span>
      </div>
    </div>

    <!-- Reset -->
    <button v-if="showMetal" class="reset-btn" @click="showQGained = showQLost = showCm = showMetal = false">
      🔄 إعادة الحساب
    </button>
  </div>
</template>

<style scoped>
.panel-body { padding:1rem; display:flex; flex-direction:column; gap:.75rem; }
.ws-title { font-size:1rem; font-weight:700; color:#5B8DB8; text-align:center; padding:.5rem; border-bottom:1px solid #1e2530; margin-bottom:.25rem; }

.step-box { display:flex; gap:.5rem; align-items:flex-start; background:rgba(255,255,255,0.02); border:1px solid #1e2530; border-radius:6px; padding:.5rem; }
.step-num { width:22px; height:22px; border-radius:50%; background:#5B8DB8; color:#0B1220; font-weight:700; font-size:.75rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.step-content { display:flex; flex-direction:column; gap:.35rem; flex:1; }
.step-label { font-size:.72rem; font-weight:600; color:#D1D7E0; }
.formula-small { font-size:.65rem; color:#8B95A5; font-family:'Courier New',monospace; }
.step-values { font-size:.65rem; color:#64748b; }

.calc-box { background:rgba(255,255,255,0.02); border:1px solid #1e2530; border-radius:8px; padding:.55rem; display:flex; flex-direction:column; gap:.4rem; }
.calc-header { display:flex; align-items:center; gap:.4rem; }
.calc-num { width:22px; height:22px; border-radius:50%; background:#5B8DB8; color:#0B1220; font-weight:700; font-size:.75rem; display:flex; align-items:center; justify-content:center; }
.calc-label { font-size:.75rem; font-weight:600; color:#D1D7E0; }
.formula { font-family:'Courier New',monospace; font-size:.72rem; color:#8B95A5; text-align:center; padding:.25rem 0; background:rgba(91,141,184,.05); border-radius:4px; }
.values { font-size:.65rem; color:#64748b; text-align:center; }

.calc-btn { padding:.35rem .7rem; border-radius:6px; border:1px solid #5B8DB8; background:rgba(91,141,184,.12); color:#5B8DB8; font-size:.72rem; font-weight:600; cursor:pointer; transition:all .2s; align-self:center; }
.calc-btn:hover { background:rgba(91,141,184,.2); }
.calc-btn.disabled { border-color:#2D3645; background:rgba(255,255,255,0.03); color:#475569; cursor:not-allowed; }

.result { display:flex; flex-direction:column; align-items:center; gap:.2rem; padding:.4rem; background:rgba(34,197,94,.06); border:1px solid rgba(34,197,94,.2); border-radius:6px; }
.result-val { font-size:.85rem; font-weight:700; color:#4ade80; }
.result-note { font-size:.65rem; color:#8B95A5; }
.result-note.err { color:#ef4444; }

.reset-btn { padding:.35rem .7rem; border-radius:6px; border:1px solid rgba(245,158,11,.3); background:rgba(245,158,11,.1); color:#f59e0b; font-size:.72rem; font-weight:600; cursor:pointer; transition:all .2s; }
.reset-btn:hover { background:rgba(245,158,11,.18); }
</style>
