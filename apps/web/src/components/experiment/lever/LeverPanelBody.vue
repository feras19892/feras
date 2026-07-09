<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import type { LeverTrial } from '../../../composables/lever/useLeverTrials'
import type { LeverForce } from '../../../modules/physics/experiments/lever/useLeverPhysics'
import type { BeamMass } from '../../../modules/physics/experiments/lever/useLeverBeamPhysics'

const { t } = useI18n()
const props = defineProps<{
  id: string
  mode: 'vector' | 'beam'
  trials: LeverTrial[]
  forces: LeverForce[]
  resultant: { fx: number; fy: number; magnitude: number; angleDeg: number }
  equilibriumForce: { magnitude: number; angleDeg: number } | null
  isBalanced: boolean
  masses?: BeamMass[]
  tiltDeg?: number
  netTorque?: number
}>()
const emit = defineEmits<{
  (e: 'removeTrial', id: number): void
  (e: 'clearTrials'): void
  (e: 'removeForce', id: number): void
  (e: 'updateForce', id: number, mag: number, angle: number): void
  (e: 'removeMass', id: number): void
  (e: 'updateMass', id: number, mass: number, distance: number): void
}>()

function onMagInput(id: number, val: string) { const n = parseFloat(val); if (!isNaN(n)) emit('updateForce', id, n, (props.forces.find(f => f.id === id)?.angleDeg ?? 0)) }
function onAngleInput(id: number, val: string) { const n = parseFloat(val); if (!isNaN(n)) emit('updateForce', id, (props.forces.find(f => f.id === id)?.magnitude ?? 0), n) }
function onMassInput(id: number, val: string) { const n = parseFloat(val); if (!isNaN(n)) emit('updateMass', id, n, (props.masses?.find(m => m.id === id)?.distance ?? 0)) }
function onDistInput(id: number, val: string) { const n = parseFloat(val); if (!isNaN(n)) emit('updateMass', id, (props.masses?.find(m => m.id === id)?.mass ?? 1), n) }
</script>
<template>
  <!-- TABLE -->
  <div v-if="id === 'table'" class="panel-body">
    <table class="data-table" v-if="trials.length">
      <thead><tr><th>#</th><th>{{ t('experiments.colForces') }}</th><th>∑Fx</th><th>∑Fy</th><th>|R|</th><th>F_eq</th><th>{{ t('experiments.status') }}</th></tr></thead>
      <tbody>
        <tr v-for="trial in trials" :key="trial.id">
          <td>{{ trial.trialNo }}</td><td>{{ trial.forceCount }}</td><td>{{ trial.sumFx.toFixed(2) }}</td><td>{{ trial.sumFy.toFixed(2) }}</td>
          <td>{{ trial.resultantMag.toFixed(2) }}</td><td>{{ trial.eqForceMag.toFixed(2) }}@{{ trial.eqForceAngle.toFixed(0) }}°</td>
          <td>{{ trial.isBalanced ? '✅' : '❌' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="placeholder">{{ t('experiments.noData') }}</p>
  </div>

  <!-- SIGNAL -->
  <div v-else-if="id === 'signal'" class="panel-body">
    <div v-if="mode === 'vector'">
      <div class="force-list" v-if="forces.length">
        <div v-for="f in forces" :key="f.id" class="force-row">
          <span class="force-color" :style="{background: ['#ef4444','#22c55e','#3b82f6','#f59e0b','#8b5cf6'][forces.indexOf(f) % 5]}"></span>
          <input type="number" :value="f.magnitude" @change="onMagInput(f.id, ($event.target as HTMLInputElement).value)" min="0.1" max="100" step="0.1" />
          <span>N @</span>
          <input type="number" :value="f.angleDeg" @change="onAngleInput(f.id, ($event.target as HTMLInputElement).value)" min="0" max="360" step="1" />
          <span>°</span>
          <button class="del-btn" @click="emit('removeForce', f.id)">×</button>
        </div>
      </div>
      <p v-else class="placeholder">{{ t('experiments.noForces') }}</p>
      <div class="res-info" v-if="forces.length">
        <p><b>{{ t('experiments.resultant') }}:</b> |R| = {{ resultant.magnitude.toFixed(2) }} N @ {{ resultant.angleDeg.toFixed(1) }}°</p>
        <p v-if="equilibriumForce"><b>{{ t('experiments.equilibriumForce') }}:</b> {{ equilibriumForce.magnitude.toFixed(2) }} N @ {{ equilibriumForce.angleDeg.toFixed(1) }}°</p>
        <p v-else><b>{{ t('experiments.equilibriumForce') }}:</b> {{ t('experiments.alreadyBalanced') }}</p>
      </div>
    </div>
    <div v-else>
      <div v-if="masses?.length" class="mass-list">
        <div v-for="m in masses" :key="m.id" class="mass-card">
          <div class="mass-header">
            <span class="mass-color" :style="{background: ['#ef4444','#22c55e','#3b82f6','#f59e0b','#8b5cf6'][(masses.indexOf(m)) % 5]}"></span>
            <span class="mass-label">{{ t('experiments.mass') }} {{ masses.indexOf(m) + 1 }}</span>
            <button class="del-btn" @click="emit('removeMass', m.id)">×</button>
          </div>
          <div class="mass-fields">
            <div class="field">
              <label>{{ t('experiments.mass') }}</label>
              <input type="number" :value="m.mass" @blur="onMassInput(m.id, ($event.target as HTMLInputElement).value)" min="0.1" max="50" step="0.1" />
              <span class="unit">kg</span>
            </div>
            <div class="field">
              <label>{{ t('experiments.distance') }}</label>
              <input type="number" :value="m.distance" @blur="onDistInput(m.id, ($event.target as HTMLInputElement).value)" min="-1" max="1" step="0.05" />
              <span class="unit">m</span>
            </div>
          </div>
          <div class="mass-torque">τ = {{ (m.mass * 9.81 * m.distance).toFixed(2) }} N·m</div>
        </div>
      </div>
      <p v-else class="placeholder">{{ t('experiments.noMasses') }}</p>
      <div class="res-info" v-if="masses?.length">
        <p><b>{{ t('experiments.netTorque') }}:</b> τ = {{ (netTorque ?? 0).toFixed(2) }} N·m</p>
        <p><b>{{ t('experiments.tiltAngle') }}:</b> θ = {{ (tiltDeg ?? 0).toFixed(1) }}°</p>
      </div>
    </div>
  </div>

  <!-- EQUATIONS -->
  <div v-else-if="id === 'equations'" class="panel-body">
    <template v-if="mode === 'vector'">
      <div class="equation"><div class="eq-title">∑Fx = 0</div><div class="eq-desc">{{ t('experiments.eqSumFxDesc') }}</div><div class="eq-val">∑Fx = {{ resultant.fx.toFixed(2) }} N</div></div>
      <div class="equation"><div class="eq-title">∑Fy = 0</div><div class="eq-desc">{{ t('experiments.eqSumFyDesc') }}</div><div class="eq-val">∑Fy = {{ resultant.fy.toFixed(2) }} N</div></div>
      <div class="equation"><div class="eq-title">R = √(∑Fx² + ∑Fy²)</div><div class="eq-desc">{{ t('experiments.eqResultantDesc') }}</div><div class="eq-val">R = {{ resultant.magnitude.toFixed(2) }} N @ {{ resultant.angleDeg.toFixed(1) }}°</div></div>
      <div class="equation" v-if="equilibriumForce"><div class="eq-title">F_eq = -R</div><div class="eq-desc">{{ t('experiments.eqEquilibriumDesc') }}</div><div class="eq-val">F_eq = {{ equilibriumForce.magnitude.toFixed(2) }} N @ {{ equilibriumForce.angleDeg.toFixed(1) }}°</div></div>
    </template>
    <template v-else>
      <div class="equation"><div class="eq-title">τ = F × d</div><div class="eq-desc">{{ t('experiments.eqTorqueDesc') }}</div><div class="eq-val">{{ t('experiments.torqueFormula') }}</div></div>
      <div class="equation"><div class="eq-title">∑τ = 0</div><div class="eq-desc">{{ t('experiments.eqSumTorqueDesc') }}</div><div class="eq-val">∑τ = {{ (netTorque ?? 0).toFixed(2) }} N·m</div></div>
      <div class="equation"><div class="eq-title">θ ∝ ∑τ</div><div class="eq-desc">{{ t('experiments.eqTiltDesc') }}</div><div class="eq-val">θ = {{ (tiltDeg ?? 0).toFixed(1) }}°</div></div>
    </template>
  </div>

  <!-- GUIDE -->
  <div v-else-if="id === 'guide'" class="panel-body guide">
    <p><b>{{ t('experiments.step') }} 1:</b> {{ t('experiments.leverStep1') }}</p>
    <p><b>{{ t('experiments.step') }} 2:</b> {{ t('experiments.leverStep2') }}</p>
    <p><b>{{ t('experiments.step') }} 3:</b> {{ t('experiments.leverStep3') }}</p>
    <p><b>{{ t('experiments.step') }} 4:</b> {{ t('experiments.leverStep4') }}</p>
    <p><b>{{ t('experiments.step') }} 5:</b> {{ t('experiments.leverStep5') }}</p>
  </div>

  <!-- REPORT -->
  <div v-else-if="id === 'report'" class="panel-body">
    <p><b>{{ t('experiments.trialCount') }}:</b> {{ trials.length }}</p>
    <p><b>{{ t('experiments.balancedTrials') }}:</b> {{ trials.filter(trial => trial.isBalanced).length }}</p>
    <p v-if="isBalanced" class="success">✅ {{ t('experiments.currentBalanced') }}</p>
    <p v-else class="warn">❌ {{ t('experiments.currentUnbalanced') }}</p>
  </div>
</template>
<style scoped>
.panel-body { display:flex; flex-direction:column; gap:.35rem; font-size:.75rem; color:#D1D7E0; }
.data-table { width:100%; border-collapse:collapse; font-size:.7rem; }
.data-table th { text-align:left; padding:.25rem .3rem; color:#5B8DB8; border-bottom:1px solid #2D3645; }
.data-table td { padding:.2rem .3rem; border-bottom:1px solid rgba(45,54,69,0.4); }
.placeholder { color:#64748b; text-align:center; padding:1rem; }
.force-list { display:flex; flex-direction:column; gap:.3rem; }
.force-row { display:flex; align-items:center; gap:.3rem; background:rgba(255,255,255,0.03); padding:.25rem .35rem; border-radius:4px; }
.force-color { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.force-row input { width:55px; background:#0d1117; border:1px solid #2D3645; color:#D1D7E0; border-radius:3px; padding:.15rem; font-size:.7rem; }
.mass-list { display:flex; flex-direction:column; gap:.5rem; }
.mass-card { background:rgba(30,37,48,0.6); border:1px solid rgba(91,141,184,0.12); border-radius:8px; padding:.5rem; }
.mass-header { display:flex; align-items:center; gap:.4rem; margin-bottom:.35rem; }
.mass-color { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.mass-label { color:#5B8DB8; font-weight:700; font-size:.75rem; flex:1; }
.mass-fields { display:flex; gap:.4rem; }
.field { display:flex; flex-direction:column; gap:.1rem; flex:1; }
.field label { font-size:.6rem; color:#8B95A5; text-transform:uppercase; letter-spacing:.3px; }
.field input { width:100%; background:#0d1117; border:1px solid #2D3645; color:#D1D7E0; border-radius:4px; padding:.25rem; font-size:.72rem; box-sizing:border-box; }
.field .unit { font-size:.6rem; color:#64748b; margin-top:.05rem; }
.mass-torque { margin-top:.35rem; padding:.25rem .35rem; background:rgba(91,141,184,0.08); border-radius:4px; color:#5B8DB8; font-size:.7rem; font-weight:600; text-align:center; }
.del-btn { background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:.9rem; padding:0 .2rem; line-height:1; }
.res-info { margin-top:.4rem; padding:.35rem; background:rgba(91,141,184,0.06); border-radius:4px; border:1px solid rgba(91,141,184,0.1); }
.equation { padding:.4rem; background:rgba(255,255,255,0.02); border-radius:4px; border:1px solid rgba(91,141,184,0.08); }
.eq-title { color:#5B8DB8; font-weight:700; font-size:.78rem; }
.eq-desc { color:#8B95A5; font-size:.68rem; margin-top:.15rem; }
.eq-val { color:#D1D7E0; font-size:.72rem; margin-top:.2rem; font-family:monospace; }
.guide p { margin:0; line-height:1.5; color:#8B95A5; }
.success { color:#22c55e; }
.warn { color:#ef4444; }
</style>
