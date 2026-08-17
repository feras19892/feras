<script setup lang="ts">
import type { NetForceTrial } from '../../../composables/netforce/useNetForceTrials'
import type { NetForceParams } from '../../../modules/physics/experiments/netforce/useNetForcePhysics'
import { calcEquilibrium } from '../../../composables/netforce/netforceUtils'

const props = defineProps<{
  trials: NetForceTrial[]
  params: NetForceParams
  trialStats: { f_mean: number; f_std: number; fc_mean: number; fc_std: number }
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const eqTrials = () => props.trials.filter(tr => tr.mode === 'equilibrium')
const cpTrials = () => props.trials.filter(tr => tr.mode === 'centripetal')

const currentEq = () => {
  if (props.params.mode !== 'equilibrium') return null
  return calcEquilibrium(
    props.params.mass, props.params.g, props.params.appliedForce, props.params.appliedAngle,
    props.params.mu, props.params.surfaceAngle, props.params.tension, props.params.tensionAngle,
    props.params.customForces,
  )
}
</script>

<template>
  <div class="report-modal" @click.self="emit('close')">
    <div class="report-content">
      <button class="close-btn" @click="emit('close')">✕</button>
      <h2>📋 تقرير توازن القوى</h2>

      <!-- المعاملات الحالية -->
      <div class="report-section">
        <h4>المعاملات الحالية</h4>
        <p>الوضع: {{ params.mode === 'equilibrium' ? 'توازني' : 'شعاعي (دائري)' }}</p>
        <p>الكتلة m = {{ params.mass }} kg، g = {{ params.g }} m/s²</p>
        <p v-if="params.mode === 'equilibrium'">
          القوة المطبقة F = {{ params.appliedForce }} N @ {{ params.appliedAngle }}°،
          الاحتكاك μ = {{ params.mu }}، زاوية السطح = {{ params.surfaceAngle }}°
        </p>
        <p v-if="params.tension > 0">التوتر T = {{ params.tension }} N @ {{ params.tensionAngle }}°</p>
        <p v-if="params.mode === 'centripetal'">
          نصف القطر r = {{ params.radius }} m، ω = {{ params.angularVelocity }} rad/s
        </p>
        <div v-if="params.customForces.length > 0">
          <p><b>القوى الإضافية:</b></p>
          <p v-for="cf in params.customForces" :key="cf.id">
            {{ cf.label }}: {{ cf.magnitude }} N @ {{ cf.angle }}°
          </p>
        </div>
      </div>

      <!-- تحليل القوى الحالي (وضع التوازن) -->
      <div v-if="currentEq()" class="report-section">
        <h4>تحليل القوى الحالي</h4>
        <table>
          <thead><tr><th>القوة</th><th>القيمة (N)</th><th>الاتجاه</th></tr></thead>
          <tbody>
            <tr><td>الوزن (W)</td><td>{{ currentEq()!.weight.toFixed(3) }}</td><td>عمودي للأسفل</td></tr>
            <tr><td>القوة العمودية (N)</td><td>{{ currentEq()!.normalForce.toFixed(3) }}</td><td>عمودي على السطح</td></tr>
            <tr><td>الاحتكاك (f)</td><td>{{ currentEq()!.frictionForce.toFixed(3) }}</td><td>على السطح</td></tr>
            <tr><td>القوة المطبقة (F)</td><td>{{ params.appliedForce.toFixed(3) }}</td><td>{{ params.appliedAngle }}°</td></tr>
            <tr v-if="params.tension > 0"><td>التوتر (T)</td><td>{{ params.tension.toFixed(3) }}</td><td>{{ params.tensionAngle }}°</td></tr>
            <tr v-for="cf in params.customForces" :key="cf.id">
              <td>{{ cf.label }}</td><td>{{ cf.magnitude.toFixed(3) }}</td><td>{{ cf.angle }}°</td>
            </tr>
            <tr class="net-row">
              <td><b>المحصلة (F_net)</b></td>
              <td><b>{{ currentEq()!.netForce.mag.toFixed(4) }}</b></td>
              <td><b>{{ currentEq()!.netForce.dir.toFixed(2) }}°</b></td>
            </tr>
          </tbody>
        </table>
        <p :class="currentEq()!.isBalanced ? 'ok' : 'not-ok'">
          <b>الحالة: {{ currentEq()!.isBalanced ? '✅ متوازن (F_net ≈ 0)' : '❌ غير متوازن' }}</b>
        </p>
      </div>

      <!-- المعادلات -->
      <div class="report-section">
        <h4>المعادلات المستخدمة</h4>
        <p>W = m × g (الوزن)</p>
        <p>N = مركبة عمودية = -(ΣF_perp) (القوة العمودية)</p>
        <p>f ≤ μ × N (الاحتكاك السكوني الأقصى)</p>
        <p>F_net = √(ΣFx² + ΣFy²) (المحصلة)</p>
        <p>التوازن: F_net = 0</p>
        <p v-if="params.mode === 'centripetal'">Fc = m × ω² × r (القوة المركزية)</p>
      </div>

      <!-- جدول القراءات -->
      <div v-if="trials.length" class="report-section">
        <h4>القراءات ({{ trials.length }} تجربة)</h4>
        <table>
          <thead>
            <tr>
              <th>#</th><th>الوضع</th><th>m</th><th>F</th><th>θ</th><th>μ</th>
              <th>Fx</th><th>Fy</th><th>F_net</th><th>متوازن</th><th>خطأ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tr, i) in trials" :key="tr.id">
              <td>{{ i + 1 }}</td>
              <td>{{ tr.mode === 'equilibrium' ? 'توازن' : 'دائري' }}</td>
              <td>{{ tr.mass }}</td>
              <td>{{ tr.appliedForce }}</td>
              <td>{{ tr.appliedAngle }}°</td>
              <td>{{ tr.mu }}</td>
              <td>{{ tr.netForceX }}</td>
              <td>{{ tr.netForceY }}</td>
              <td>{{ tr.netForceMag }}</td>
              <td>{{ tr.isBalanced ? 'نعم' : 'لا' }}</td>
              <td>{{ tr.err }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الإحصاءات -->
      <div v-if="trials.length" class="report-section">
        <h4>الإحصاءات</h4>
        <p v-if="eqTrials().length">توازني: F_net المتوسط = {{ trialStats.f_mean.toFixed(4) }} ± {{ trialStats.f_std.toFixed(4) }} N</p>
        <p v-if="cpTrials().length">شعاعي: Fc المتوسط = {{ trialStats.fc_mean.toFixed(4) }} ± {{ trialStats.fc_std.toFixed(4) }} N</p>
        <p>عدد التجارب التوازنية: {{ eqTrials().length }}</p>
        <p>عدد التجارب الدائرية: {{ cpTrials().length }}</p>
      </div>

      <!-- الخلاصة -->
      <div v-if="trials.length" class="report-section">
        <h4>الخلاصة</h4>
        <p v-if="eqTrials().length">
          من {{ eqTrials().length }} تجربة توازنية،
          {{ eqTrials().filter(tr => tr.isBalanced).length }} كانت متوازنة و
          {{ eqTrials().filter(tr => !tr.isBalanced).length }} غير متوازنة.
        </p>
        <p v-if="cpTrials().length">
          من {{ cpTrials().length }} تجربة دائرية، القوة المركزية المتوسط = {{ trialStats.fc_mean.toFixed(4) }} N.
        </p>
      </div>

      <div v-if="!trials.length" class="report-section">
        <p style="color: #8b9bb5;">لا توجد تجارب مسجلة بعد. شغّل التجربة وسجّل قراءات لعرضها هنا.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-modal { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; }
.report-content { background: #161B22; border: 1px solid #2D3645; border-radius: 12px; padding: 1.5rem; max-width: 700px; width: 90%; max-height: 85vh; overflow: auto; position: relative; }
.close-btn { position: absolute; top: .6rem; left: .6rem; background: none; border: none; color: #8B95A5; cursor: pointer; font-size: 1.1rem; }
.report-content h2 { color: #5B8DB8; margin: 0 0 1rem; font-size: 1.1rem; }
.report-section { margin-bottom: 1rem; }
.report-section h4 { color: #D1D7E0; margin: 0 0 .3rem; font-size: .82rem; }
.report-section p { color: #B8C0CC; font-size: .74rem; margin: .2rem 0; }
.report-section table { width: 100%; border-collapse: collapse; font-size: .7rem; }
.report-section th, .report-section td { padding: .2rem .3rem; text-align: center; border: 1px solid #2D3645; color: #B8C0CC; }
.report-section th { background: rgba(255,255,255,.03); }
.net-row { background: rgba(241,196,15,.08); }
.ok { color: #2ecc71; }
.not-ok { color: #e74c3c; }
</style>
