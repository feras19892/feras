<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { METAL_CATALOG } from '../../../composables/specific-heat/useSpecificHeatCalculations'

const props = defineProps<{
  metalType: string
  metalMass: number
  waterMass: number
  waterTemp: number
  metalTemp: number
  displayT: number
  finalT: number
  phase: 'ready' | 'heating' | 'transfer' | 'mixing' | 'done'
  running: boolean
  paused: boolean
  unknownMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'updateSim', dt: number): void
  (e: 'transfer'): void
  (e: 'togglePause'): void
  (e: 'recordTrial'): void
}>()

const animId = ref(0)
const lastTs = ref(0)
const isDragOver = ref(false)

const metalLocation = computed(() => {
  if (props.phase === 'ready') return 'table'
  if (props.phase === 'heating' || props.phase === 'transfer') return 'bath'
  return 'calorimeter'
})

const heaterOn = computed(() => props.phase === 'heating')
const isHot = computed(() => props.metalTemp >= 95)
const metalNameAr = computed(() => props.unknownMode ? 'مجهول' : (METAL_CATALOG[props.metalType]?.nameAr ?? props.metalType))

function toggleHeater() {
  if (!props.running) emit('togglePause')
}

function transfer() {
  if (props.phase === 'transfer') emit('transfer')
}


function loop(ts: number) {
  const dt = lastTs.value ? Math.min((ts - lastTs.value) / 1000, 0.05) : 0
  lastTs.value = ts
  emit('updateSim', dt)
  animId.value = requestAnimationFrame(loop)
}

function startAnim() {
  lastTs.value = 0
  animId.value = requestAnimationFrame(loop)
}

function stopAnim() {
  cancelAnimationFrame(animId.value)
}

watch(() => props.running, (val) => {
  if (val) startAnim()
  else stopAnim()
})
</script>

<template>
  <div class="lab-container">
    <!-- عنوان المرحلة -->
    <div class="phase-banner" :class="phase">
      <span v-if="phase === 'ready'">🧪 جاهز — اضبط المعطيات واضغط "بدء"</span>
      <span v-else-if="phase === 'heating'">🔥 جاري تسخين المعدن — انتظر حتى 100°C</span>
      <span v-else-if="phase === 'transfer'">⚠️ المعدن ساخن! انقر "نقل للمسعر"</span>
      <span v-else-if="phase === 'mixing'">🔄 الاتزان الحراري — انتظر ثبات الحرارة</span>
      <span v-else-if="phase === 'done'">✅ اكتمل! اضغط "تسجيل"</span>
    </div>

    <!-- مساحة العمل -->
    <div class="workbench">

      <!-- السخان المائي (يسار) -->
      <div class="apparatus water-bath" :class="{ active: heaterOn, hasMetal: metalLocation === 'bath' }">
        <div class="app-label">سخان مائي</div>

        <!-- جسم السخان -->
        <div class="bath-body">
          <!-- الماء -->
          <div class="water" :class="{ boiling: heaterOn }">
            <!-- فقاعات -->
            <div v-if="heaterOn" class="bubbles">
              <span v-for="i in 8" :key="i" class="bubble" :style="{ left: (10 + i * 10) + '%', animationDelay: (i * 0.3) + 's' }"></span>
            </div>
          </div>

          <!-- ملف التسخين -->
          <div class="heater-coil" :class="{ glowing: heaterOn }">
            <svg viewBox="0 0 100 20" class="coil-svg">
              <path d="M5,10 Q15,2 25,10 T45,10 T65,10 T85,10 T95,10" fill="none" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>

          <!-- القطعة في السخان -->
          <Transition name="metal-drop">
            <div v-if="metalLocation === 'bath'" class="metal-in-bath">
              <div class="metal-block" :class="{ hot: isHot, glowing: heaterOn, draggable: phase === 'transfer' }" draggable="true" @dragstart="$event.dataTransfer?.setData('text/plain','metal')">
                <span class="metal-label">{{ (metalMass * 1000).toFixed(0) }}g</span>
                <span class="metal-temp">{{ metalTemp.toFixed(0) }}°C</span>
              </div>
              <div v-if="heaterOn" class="heat-particles">
                <span v-for="i in 5" :key="i" class="heat-particle" :style="{ left: (15 + i * 15) + '%', animationDelay: (i * 0.3) + 's' }"></span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- ميزان حرارة السخان -->
        <div class="thermometer bath-therm">
          <div class="therm-tube">
            <div class="therm-liquid" :style="{ height: (metalTemp / 120 * 100) + '%', background: isHot ? '#ef4444' : '#f59e0b' }"></div>
          </div>
          <div class="therm-bulb" :class="{ hot: isHot }"></div>
          <div class="therm-read">T_m = {{ metalTemp.toFixed(1) }}°C</div>
        </div>

        <!-- زر السخان -->
        <button v-if="metalLocation === 'bath'" class="heater-btn" :class="{ on: heaterOn }" @click="toggleHeater">
          {{ heaterOn ? '⏹️ إيقاف السخان' : '▶️ تشغيل السخان' }}
        </button>
      </div>

      <!-- المنطقة الوسطى (القطعة على الطاولة أو سهم النقل) -->
      <div class="center-zone">
        <!-- القطعة على الطاولة (قبل البدء) -->
        <Transition name="metal-fade">
          <div v-if="metalLocation === 'table'" class="metal-on-table">
            <div class="metal-block" :class="{ hot: isHot }">
              <span class="metal-label">{{ (metalMass * 1000).toFixed(0) }}g</span>
              <span class="metal-temp">{{ metalTemp.toFixed(0) }}°C</span>
            </div>
            <div class="hint">اضغط "بدء" لوضع القطعة في السخان</div>
          </div>
        </Transition>

        <!-- سهم النقل -->
        <Transition name="arrow-slide">
          <div v-if="phase === 'transfer'" class="transfer-arrow" @click="transfer">
            <div class="arrow-body">← نقل للمسعر</div>
            <div class="arrow-tip">⬅️</div>
          </div>
        </Transition>
      </div>

      <!-- المسعر الحراري (يمين) -->
      <div class="apparatus calorimeter" :class="{ hasMetal: metalLocation === 'calorimeter', mixing: phase === 'mixing', 'drag-over': isDragOver }" @dragover.prevent @dragenter="isDragOver = true" @dragleave="isDragOver = false" @drop="isDragOver = false; transfer()">
        <div class="app-label">مسعر حراري</div>

        <!-- جسم المسعر -->
        <div class="cal-body">
          <!-- الغطاء -->
          <div class="lid" :class="{ closed: metalLocation === 'calorimeter' }">
            <div class="lid-inner"></div>
          </div>

          <!-- الجدار الخارجي -->
          <div class="outer-wall">
            <!-- الجدار الداخلي -->
            <div class="inner-cup">
              <!-- الماء -->
              <div class="water" :style="{ height: (40 + (waterMass - 0.1) / 0.2 * 40) + '%' }">
                <!-- بخار -->
                <div v-if="phase === 'mixing'" class="steam">
                  <span v-for="i in 6" :key="i" class="steam-puff" :style="{ left: (15 + i * 12) + '%', animationDelay: (i * 0.4) + 's' }"></span>
                </div>
              </div>

              <!-- القطعة في المسعر -->
              <Transition name="metal-sink">
                <div v-if="metalLocation === 'calorimeter'" class="metal-in-calorimeter">
                  <div class="metal-block submerged" :class="{ cooling: phase === 'mixing' }">
                    <span class="metal-label">{{ (metalMass * 1000).toFixed(0) }}g</span>
                    <span class="metal-temp">{{ metalTemp.toFixed(0) }}°C</span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- ميزان حرارة المسعر -->
        <div class="thermometer cal-therm">
          <div class="therm-tube">
            <div class="therm-liquid" :style="{ height: (displayT / 120 * 100) + '%' }"></div>
          </div>
          <div class="therm-bulb"></div>
          <div class="therm-read">T_f = {{ displayT.toFixed(1) }}°C</div>
        </div>

        <!-- معلومات الماء -->
        <div class="water-info">
          <span>T_w = {{ waterTemp }}°C</span>
          <span>{{ (waterMass * 1000).toFixed(0) }}g</span>
        </div>
      </div>
    </div>

    <!-- شريط معلومات التجربة -->
    <div class="params-bar">
      <div class="param-item"><span class="param-label">المعدن</span><span class="param-val">{{ metalNameAr }}</span></div>
      <div class="param-item"><span class="param-label">m_m</span><span class="param-val">{{ (metalMass * 1000).toFixed(0) }} g</span></div>
      <div class="param-item"><span class="param-label">m_w</span><span class="param-val">{{ (waterMass * 1000).toFixed(0) }} g</span></div>
      <div class="param-item"><span class="param-label">T_w</span><span class="param-val">{{ waterTemp }}°C</span></div>
    </div>

  </div>
</template>


<style scoped src='./SpecificHeatLab.css'></style>
