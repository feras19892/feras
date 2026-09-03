<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'
import type { NetForceParams, NetForceState, NetForceMeasured } from '../../../modules/physics/experiments/netforce/useNetForcePhysics'
import type { NetForceTrial } from '../../../composables/netforce/useNetForceTrials'

import { sanitizeHtml } from '../../../utils/sanitizeHtml'





const props = defineProps<{
  id: string
  trials: NetForceTrial[]
  params: NetForceParams
  sim: NetForceState
  measured: NetForceMeasured
  trialStats: { f_mean: number; f_std: number; fc_mean: number; fc_std: number }
  calcResult: string
}>()

const emit = defineEmits<{
  (e: 'update:params', p: Partial<NetForceParams>): void
  (e: 'remove', id: number): void
  (e: 'calc-net-force'): void
  (e: 'calc-centripetal'): void
  (e: 'calc-fit'): void
  (e: 'auto-balance'): void
  (e: 'add-force'): void
  (e: 'remove-force', id: number): void
  (e: 'update-force', id: number, patch: Partial<{ magnitude: number; angle: number; label: string }>): void
}>()

const isEquilibrium = computed(() => props.params.mode === 'equilibrium')
const safeCalcResult = computed(() => sanitizeHtml(props.calcResult))
</script>

<template>
  <div class="panel-body">
    <!-- جدول التجارب -->
    <div v-if="id === 'table'">
      <table class="trial-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الوضع</th>
            <th>m</th>
            <th v-if="trials.some(tr => tr.mode === 'equilibrium')">F</th>
            <th v-if="trials.some(tr => tr.mode === 'equilibrium')">θ</th>
            <th v-if="trials.some(tr => tr.mode === 'equilibrium')">F_net</th>
            <th v-if="trials.some(tr => tr.mode === 'centripetal')">ω</th>
            <th v-if="trials.some(tr => tr.mode === 'centripetal')">Fc</th>
            <th>خطأ</th>
            <th>×</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tr, i) in trials" :key="tr.id">
            <td>{{ i + 1 }}</td>
            <td>{{ tr.mode === 'equilibrium' ? 'توازن' : 'شعاعي' }}</td>
            <td>{{ tr.mass.toFixed(2) }}</td>
            <td v-if="tr.mode === 'equilibrium'">{{ tr.appliedForce.toFixed(1) }}</td>
            <td v-if="tr.mode === 'equilibrium'">{{ tr.appliedAngle.toFixed(0) }}°</td>
            <td v-if="tr.mode === 'equilibrium'">{{ tr.netForceMag.toFixed(3) }}</td>
            <td v-if="tr.mode === 'centripetal'">{{ tr.angularVelocity.toFixed(1) }}</td>
            <td v-if="tr.mode === 'centripetal'">{{ tr.centripetalForce.toFixed(3) }}</td>
            <td>{{ tr.err.toFixed(1) }}%</td>
            <td><button class="rm-btn" @click="emit('remove', tr.id)">✕</button></td>
          </tr>
        </tbody>
      </table>
      <p v-if="trials.length === 0" class="empty">{{ t('experiments.noTrials') }}</p>
    </div>

    <!-- المعادلات والحسابات -->
    <div v-else-if="id === 'equations'" class="equations-panel">
      <button class="calc-btn" @click="emit('calc-net-force')">حساب المحصلة / Fc</button>
      <button class="calc-btn" @click="emit('calc-centripetal')">حساب Fc = mv²/r</button>
      <button class="calc-btn" @click="emit('calc-fit')">انحدار Fc vs ω²</button>
      <button class="calc-btn" v-if="isEquilibrium" @click="emit('auto-balance')">⚖️ موازنة تلقائية</button>
      <div class="calc-result" v-html="safeCalcResult" />
    </div>

    <!-- مخطط الجسم الحر -->
    <div v-else-if="id === 'fbd'" class="fbd-panel">
      <template v-if="isEquilibrium">
        <div class="force-list">
          <div class="force-row"><span class="dot w" /> الوزن: W = m×g = {{ (params.mass * params.g).toFixed(2) }} N</div>
          <div class="force-row"><span class="dot n" /> القوة العمودية: N = {{ measured.normalForce?.toFixed(2) ?? '—' }} N</div>
          <div class="force-row"><span class="dot f" /> الاحتكاك: f = {{ measured.frictionForce?.toFixed(2) ?? '—' }} N</div>
          <div class="force-row"><span class="dot a" /> القوة الخارجية: F = {{ params.appliedForce.toFixed(2) }} N</div>
          <div class="force-row" v-if="params.tension > 0"><span class="dot t" /> التوتر: T = {{ params.tension.toFixed(2) }} N</div>
          <div class="force-row net"><span class="dot net" /> المحصلة: F_net = {{ measured.netForceMag?.toFixed(4) ?? '—' }} N</div>
          <div class="balance" :class="{ ok: measured.isBalanced }">
            {{ measured.isBalanced ? '✅ الجسم متوازن' : '❌ الجسم غير متوازن' }}
          </div>
        </div>
      </template>
      <template v-else>
        <div class="force-list">
          <div class="force-row"><span class="dot a" /> الكتلة: m = {{ params.mass }} kg</div>
          <div class="force-row">نصف القطر: r = {{ params.radius }} m</div>
          <div class="force-row">السرعة الزاوية: ω = {{ params.angularVelocity }} rad/s</div>
          <div class="force-row">السرعة الخطية: v = {{ measured.linearVelocity?.toFixed(3) ?? '—' }} m/s</div>
          <div class="force-row net"><span class="dot net" /> القوة المركزية: Fc = {{ measured.centripetalForce?.toFixed(4) ?? '—' }} N</div>
          <div class="force-row">التسارع المركزي: ac = {{ measured.centripetalAcc?.toFixed(4) ?? '—' }} m/s²</div>
          <div class="force-row">الدور: T = {{ measured.period?.toFixed(3) ?? '—' }} s</div>
        </div>
      </template>
    </div>

    <!-- رسائل توجيهية -->
    <div v-else-if="id === 'tutor'" class="tutor-panel">
      <p class="tutor-msg">{{ t('experiments.adjustParamsAndPressStart') }}</p>
      <p v-if="isEquilibrium" class="tutor-hint">جرّب تغيير زاوية القوة وراقب تغير المحصلة.</p>
      <p v-else class="tutor-hint">جرّب زيادة السرعة الزاوية وراقب زيادة القوة المركزية.</p>
    </div>

    <!-- التقرير -->
    <div v-else-if="id === 'report'" class="report-panel">
      <p>عدد التجارب: {{ trials.length }}</p>
      <p>المتوسط (توازن): F_net = {{ trialStats.f_mean.toFixed(4) }} ± {{ trialStats.f_std.toFixed(4) }} N</p>
      <p>المتوسط (شعاعي): Fc = {{ trialStats.fc_mean.toFixed(4) }} ± {{ trialStats.fc_std.toFixed(4) }} N</p>
    </div>

    <!-- المعاملات -->
    <div v-else-if="id === 'params'" class="params-panel">
      <label class="param-row">
        <span>الوضع</span>
        <select :value="params.mode" @change="emit('update:params', { mode: ($event.target as HTMLSelectElement).value as 'equilibrium' | 'centripetal' })">
          <option value="equilibrium">توازني</option>
          <option value="centripetal">شعاعي (دائري)</option>
        </select>
      </label>
      <label class="param-row">
        <span>الكتلة m (kg)</span>
        <input type="range" min="0.1" max="10" step="0.1" :value="params.mass"
          @input="emit('update:params', { mass: Number(($event.target as HTMLInputElement).value) })" />
        <span class="val">{{ params.mass }}</span>
      </label>
      <template v-if="isEquilibrium">
        <label class="param-row">
          <span>القوة F (N)</span>
          <input type="range" min="0" max="50" step="0.5" :value="params.appliedForce"
            @input="emit('update:params', { appliedForce: Number(($event.target as HTMLInputElement).value) })" />
          <span class="val">{{ params.appliedForce }}</span>
        </label>
        <label class="param-row">
          <span>زاوية القوة θ (°)</span>
          <input type="range" min="0" max="360" step="5" :value="params.appliedAngle"
            @input="emit('update:params', { appliedAngle: Number(($event.target as HTMLInputElement).value) })" />
          <span class="val">{{ params.appliedAngle }}°</span>
        </label>
        <label class="param-row">
          <span>معامل الاحتكاك μ</span>
          <input type="range" min="0" max="1" step="0.05" :value="params.mu"
            @input="emit('update:params', { mu: Number(($event.target as HTMLInputElement).value) })" />
          <span class="val">{{ params.mu }}</span>
        </label>
        <label class="param-row">
          <span>زاوية السطح (°)</span>
          <input type="range" min="0" max="45" step="1" :value="params.surfaceAngle"
            @input="emit('update:params', { surfaceAngle: Number(($event.target as HTMLInputElement).value) })" />
          <span class="val">{{ params.surfaceAngle }}°</span>
        </label>
        <label class="param-row">
          <span>التوتر T (N)</span>
          <input type="range" min="0" max="50" step="0.5" :value="params.tension"
            @input="emit('update:params', { tension: Number(($event.target as HTMLInputElement).value) })" />
          <span class="val">{{ params.tension }}</span>
        </label>
      </template>
      <template v-else>
        <label class="param-row">
          <span>نصف القطر r (m)</span>
          <input type="range" min="0.1" max="2" step="0.05" :value="params.radius"
            @input="emit('update:params', { radius: Number(($event.target as HTMLInputElement).value) })" />
          <span class="val">{{ params.radius }}</span>
        </label>
        <label class="param-row">
          <span>السرعة الزاوية ω (rad/s)</span>
          <input type="range" min="0.1" max="10" step="0.1" :value="params.angularVelocity"
            @input="emit('update:params', { angularVelocity: Number(($event.target as HTMLInputElement).value) })" />
          <span class="val">{{ params.angularVelocity }}</span>
        </label>
      </template>

      <!-- قوى إضافية -->
      <div v-if="isEquilibrium" class="custom-forces">
        <div class="forces-header">
          <span>قوى إضافية</span>
          <button class="add-force-btn" @click="emit('add-force')">+ إضافة قوة</button>
        </div>
        <div v-for="cf in params.customForces" :key="cf.id" class="custom-force-row">
          <input class="force-label" type="text" :value="cf.label"
            @input="emit('update-force', cf.id, { label: ($event.target as HTMLInputElement).value })" />
          <label class="mini-param">
            <span>القيمة</span>
            <input type="range" min="0" max="50" step="0.5" :value="cf.magnitude"
              @input="emit('update-force', cf.id, { magnitude: Number(($event.target as HTMLInputElement).value) })" />
            <span class="val">{{ cf.magnitude }}</span>
          </label>
          <label class="mini-param">
            <span>الزاوية</span>
            <input type="range" min="0" max="360" step="5" :value="cf.angle"
              @input="emit('update-force', cf.id, { angle: Number(($event.target as HTMLInputElement).value) })" />
            <span class="val">{{ cf.angle }}°</span>
          </label>
          <button class="rm-force-btn" @click="emit('remove-force', cf.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- الإحصاءات -->
    <div v-else-if="id === 'stats'" class="stats-panel">
      <p>عدد التجارب: {{ trials.length }}</p>
      <p>توازني: F_net = {{ trialStats.f_mean.toFixed(4) }} ± {{ trialStats.f_std.toFixed(4) }} N</p>
      <p>شعاعي: Fc = {{ trialStats.fc_mean.toFixed(4) }} ± {{ trialStats.fc_std.toFixed(4) }} N</p>
    </div>
  </div>
</template>

<style scoped>
.panel-body { padding: .5rem; font-size: .8rem; color: #D1D7E0; }
.trial-table { width: 100%; border-collapse: collapse; font-size: .7rem; }
.trial-table th, .trial-table td { padding: .2rem .3rem; text-align: center; border-bottom: 1px solid #2D3645; }
.trial-table th { color: #8b9bb5; font-weight: 600; }
.rm-btn { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: .8rem; }
.empty { text-align: center; color: #8b9bb5; padding: 1rem; }
.equations-panel { display: flex; flex-direction: column; gap: .4rem; }
.calc-btn { padding: .4rem .6rem; border: 1px solid #2D3645; border-radius: 6px; background: #1c2331; color: #D1D7E0; cursor: pointer; font-size: .75rem; text-align: right; }
.calc-btn:hover { background: #2D3645; border-color: #5B8DB8; }
.calc-result { padding: .5rem; background: rgba(0,0,0,.2); border-radius: 6px; font-size: .75rem; min-height: 2rem; }
.fbd-panel .force-list { display: flex; flex-direction: column; gap: .3rem; }
.force-row { display: flex; align-items: center; gap: .4rem; font-size: .75rem; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot.w { background: #e74c3c; } .dot.n { background: #3498db; } .dot.f { background: #e67e22; }
.dot.a { background: #2ecc71; } .dot.t { background: #9b59b6; } .dot.net { background: #f1c40f; }
.force-row.net { font-weight: bold; margin-top: .3rem; padding-top: .3rem; border-top: 1px solid #2D3645; }
.balance { margin-top: .4rem; font-weight: bold; font-size: .8rem; }
.balance.ok { color: #2ecc71; } .balance:not(.ok) { color: #e74c3c; }
.tutor-panel { font-size: .8rem; line-height: 1.6; }
.tutor-msg { color: #D1D7E0; } .tutor-hint { color: #8b9bb5; margin-top: .3rem; }
.report-panel, .stats-panel { font-size: .75rem; line-height: 1.7; color: #D1D7E0; }
.params-panel { display: flex; flex-direction: column; gap: .55rem; }
.param-row { display: flex; align-items: center; gap: .5rem; font-size: .78rem; }
.param-row span:first-child { min-width: 100px; flex-shrink: 0; color: #8b9bb5; }
.param-row input[type="range"] { flex: 1; min-width: 60px; accent-color: #5B8DB8; }
.param-row select { flex: 1; padding: .25rem; background: #1c2331; border: 1px solid #2D3645; border-radius: 4px; color: #D1D7E0; }
.val { min-width: 48px; text-align: center; color: #7dd3fc; font-weight: 700; font-size: .8rem; background: rgba(91,141,184,.12); padding: .1rem .25rem; border-radius: 4px; }
.custom-forces { margin-top: .5rem; padding-top: .5rem; border-top: 1px solid #2D3645; }
.forces-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .4rem; }
.forces-header span { font-size: .75rem; color: #8b9bb5; }
.add-force-btn { padding: .2rem .5rem; border: 1px solid #2E86C1; border-radius: 4px; background: #1a5276; color: #D1D7E0; cursor: pointer; font-size: .7rem; }
.add-force-btn:hover { background: #2E86C1; }
.custom-force-row { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem; padding: .3rem; background: rgba(255,255,255,.02); border-radius: 6px; margin-bottom: .3rem; }
.force-label { width: 40px; padding: .15rem .3rem; background: #1c2331; border: 1px solid #2D3645; border-radius: 4px; color: #D1D7E0; font-size: .7rem; }
.mini-param { display: flex; align-items: center; gap: .25rem; font-size: .7rem; flex: 1; min-width: 120px; }
.mini-param span:first-child { color: #8b9bb5; width: 35px; flex-shrink: 0; }
.mini-param input[type="range"] { flex: 1; accent-color: #5B8DB8; }
.mini-param .val { min-width: 40px; font-size: .72rem; }
.rm-force-btn { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: .8rem; padding: .1rem .3rem; }
</style>
