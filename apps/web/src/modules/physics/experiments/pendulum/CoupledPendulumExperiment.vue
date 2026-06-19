<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCoupledPendulum } from '../../../../composables/pendulum/useCoupledPendulum'
import CoupledPendulumCanvas from '../../../../components/experiment/pendulum/CoupledPendulumCanvas.vue'

const params = ref({
  length: 0.5, g: 9.81, mass: 0.05, damping: 0.02,
  springK: 10, springRestLength: 0.08,
  theta10Deg: 10, theta20Deg: 0,
})

const coupled = useCoupledPendulum({
  length: params.value.length,
  g: params.value.g,
  mass: params.value.mass,
  damping: params.value.damping,
  springK: params.value.springK,
  springRestLength: params.value.springRestLength,
  theta10: params.value.theta10Deg * Math.PI / 180,
  theta20: params.value.theta20Deg * Math.PI / 180,
})

function updateParams() {
  coupled.state.running = false
  coupled.state.paused = false
}

function start() {
  coupled.state.theta1 = params.value.theta10Deg * Math.PI / 180
  coupled.state.theta2 = params.value.theta20Deg * Math.PI / 180
  coupled.state.omega1 = 0
  coupled.state.omega2 = 0
  coupled.state.t = 0
  coupled.state.signalSeries = []
  coupled.state.running = true
  coupled.state.paused = false
}

let rafId: number | null = null
function tick() {
  if (coupled.state.running && !coupled.state.paused) {
    coupled.step(1 / 60)
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => { rafId = requestAnimationFrame(tick) })
onUnmounted(() => { if (rafId) cancelAnimationFrame(rafId) })
</script>

<template>
  <div class="coupled-lab">
    <div class="card-header"><h3>🔗 البندول المقترن (Coupled Pendulums)</h3></div>
    <div class="params-row">
      <div class="param"><label>L (m)</label><input type="number" step="0.01" v-model.number="params.length" @change="updateParams" /></div>
      <div class="param"><label>g (m/s²)</label><input type="number" step="0.1" v-model.number="params.g" @change="updateParams" /></div>
      <div class="param"><label>m (kg)</label><input type="number" step="0.01" v-model.number="params.mass" @change="updateParams" /></div>
      <div class="param"><label>k (N/m)</label><input type="number" step="0.5" v-model.number="params.springK" @change="updateParams" /></div>
      <div class="param"><label>θ₁ (°)</label><input type="number" step="1" v-model.number="params.theta10Deg" @change="updateParams" /></div>
      <div class="param"><label>θ₂ (°)</label><input type="number" step="1" v-model.number="params.theta20Deg" @change="updateParams" /></div>
      <button class="btn-primary" @click="start">▶️ بدء</button>
      <button class="btn-secondary" @click="coupled.reset">🔄 إعادة</button>
    </div>
    <CoupledPendulumCanvas
      :params="{ length: params.length, mass: params.mass, springK: params.springK }"
      :sim-state="{ theta1: coupled.state.theta1, theta2: coupled.state.theta2, running: coupled.state.running }"
    />
  </div>
</template>

<style scoped>
.coupled-lab { background: linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); color: #e2e8f0; padding: .6rem .8rem; height: 100vh; display: flex; flex-direction: column; gap: .5rem; overflow: hidden; }
.card-header h3 { margin: 0; font-size: 1rem; }
.params-row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.param { display: flex; flex-direction: column; gap: .1rem; }
.param label { font-size: .65rem; color: #94a3b8; }
.param input { width: 60px; padding: .2rem .4rem; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: .75rem; }
.btn-primary { background: linear-gradient(135deg,#3b82f6,#2563eb); color: #fff; border: none; border-radius: 7px; padding: .4rem .7rem; font-size: .78rem; font-weight: 700; cursor: pointer; }
.btn-secondary { background: linear-gradient(135deg,#334155,#1e293b); color: #cbd5e1; border: 1px solid #475569; border-radius: 7px; padding: .4rem .7rem; font-size: .78rem; font-weight: 700; cursor: pointer; }
</style>
