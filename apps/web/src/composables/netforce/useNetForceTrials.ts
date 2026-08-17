import { ref, computed, type Ref } from 'vue'
import { useI18n } from '../useI18n'
import { downloadCsv } from '../../components/experiment/spring/downloadCsv'
import { linearRegression } from '../../components/experiment/spring/linearRegression'
import { calcCentripetal } from './netforceUtils'
import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'
import type { NetForceParams } from '../../modules/physics/experiments/netforce/useNetForcePhysics'

export interface NetForceTrial {
  id: number
  mode: 'equilibrium' | 'centripetal'
  mass: number
  appliedForce: number
  appliedAngle: number
  mu: number
  netForceX: number
  netForceY: number
  netForceMag: number
  isBalanced: boolean
  radius: number
  angularVelocity: number
  centripetalForce: number
  centripetalAcc: number
  err: number
}

export interface NetForceMeasured {
  netForceX: number | null
  netForceY: number | null
  netForceMag: number | null
  netForceDir: number | null
  normalForce: number | null
  frictionForce: number | null
  maxStaticFriction: number | null
  centripetalForce: number | null
  centripetalAcc: number | null
  tensionForce: number | null
  isBalanced: boolean | null
  isStatic: boolean | null
  isSliding: boolean | null
  motionState: 'rest' | 'sliding' | 'equilibrium' | null
  linearVelocity: number | null
  period: number | null
}

export function useNetForceTrials(
  params: NetForceParams,
  measured: Ref<NetForceMeasured>,
  enableNoise: Ref<boolean>,
) {
  const { t } = useI18n()
  const calcResult = ref(t('experiments.clickBtnShowCalc'))

  const base = useExperimentTrials<NetForceTrial>({
    storageKey: 'netforce:trials:v1',
  })

  const trialStats = computed(() => {
    if (base.trials.value.length === 0)
      return { f_mean: 0, f_std: 0, fc_mean: 0, fc_std: 0 }
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    const std = (arr: number[]) => {
      const m = mean(arr)
      return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length)
    }
    const eqTrials = base.trials.value.filter(tr => tr.mode === 'equilibrium')
    const cpTrials = base.trials.value.filter(tr => tr.mode === 'centripetal')
    return {
      f_mean: eqTrials.length > 0 ? mean(eqTrials.map(tr => tr.netForceMag)) : 0,
      f_std: eqTrials.length > 0 ? std(eqTrials.map(tr => tr.netForceMag)) : 0,
      fc_mean: cpTrials.length > 0 ? mean(cpTrials.map(tr => tr.centripetalForce)) : 0,
      fc_std: cpTrials.length > 0 ? std(cpTrials.map(tr => tr.centripetalForce)) : 0,
    }
  })

  function gaussianNoise(mean: number, stdDev: number) {
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev
  }

  function recordTrial() {
    const m = measured.value
    if (m.netForceMag === null && m.centripetalForce === null) return
    const noiseLevel = 0.02
    const n = enableNoise.value

    if (params.mode === 'equilibrium') {
      const mag = n ? gaussianNoise(m.netForceMag!, m.netForceMag! * noiseLevel + 0.001) : m.netForceMag!
      const fx = n ? gaussianNoise(m.netForceX!, 0.001) : m.netForceX!
      const fy = n ? gaussianNoise(m.netForceY!, 0.001) : m.netForceY!
      const err = Math.abs(mag - (m.netForceMag ?? 0)) / (Math.abs(m.netForceMag ?? 0) + 0.001) * 100
      base.addTrial({
        mode: 'equilibrium', mass: params.mass,
        appliedForce: params.appliedForce, appliedAngle: params.appliedAngle, mu: params.mu,
        netForceX: Number(fx.toFixed(4)), netForceY: Number(fy.toFixed(4)),
        netForceMag: Number(mag.toFixed(4)), isBalanced: m.isBalanced ?? false,
        radius: 0, angularVelocity: 0, centripetalForce: 0, centripetalAcc: 0,
        err: Number(err.toFixed(2)),
      })
    } else {
      const fc = n ? gaussianNoise(m.centripetalForce!, m.centripetalForce! * noiseLevel) : m.centripetalForce!
      const ac = n ? gaussianNoise(m.centripetalAcc!, m.centripetalAcc! * noiseLevel) : m.centripetalAcc!
      const err = Math.abs(fc - (m.centripetalForce ?? 0)) / (m.centripetalForce ?? 0.001) * 100
      base.addTrial({
        mode: 'centripetal', mass: params.mass,
        appliedForce: 0, appliedAngle: 0, mu: 0,
        netForceX: 0, netForceY: 0, netForceMag: 0, isBalanced: false,
        radius: params.radius, angularVelocity: params.angularVelocity,
        centripetalForce: Number(fc.toFixed(4)), centripetalAcc: Number(ac.toFixed(4)),
        err: Number(err.toFixed(2)),
      })
    }
  }

  function exportCsv() {
    if (!base.trials.value.length) return
    downloadCsv('netforce_data.csv', [
      ['#', 'mode', 'mass(kg)', 'F(N)', 'angle(deg)', 'mu', 'Fx(N)', 'Fy(N)', 'Fnet(N)', 'balanced', 'r(m)', 'omega(rad/s)', 'Fc(N)', 'ac(m/s2)', 'error'],
      ...base.trials.value.map((tr, i) => [
        i + 1, tr.mode, tr.mass.toFixed(2),
        tr.appliedForce.toFixed(2), tr.appliedAngle.toFixed(1), tr.mu.toFixed(2),
        tr.netForceX.toFixed(4), tr.netForceY.toFixed(4), tr.netForceMag.toFixed(4),
        tr.isBalanced ? 'yes' : 'no',
        tr.radius.toFixed(2), tr.angularVelocity.toFixed(2),
        tr.centripetalForce.toFixed(4), tr.centripetalAcc.toFixed(4),
        tr.err.toFixed(2) + '%',
      ]),
    ])
  }

  function calcNetForce() {
    if (params.mode === 'centripetal') {
      const c = calcCentripetal(params.mass, params.angularVelocity, params.radius)
      calcResult.value = `<b>${t('experiments.equationLabel')}:</b> Fc = m·ω²·r<br><b>${t('experiments.substitutionLabel')}:</b> Fc = ${params.mass}×${params.angularVelocity}²×${params.radius}<br><b>${t('experiments.resultLabel')}:</b> Fc = <b>${c.fc.toFixed(4)} N</b>`
      return
    }
    const m = measured.value
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> F_net = √(ΣFx² + ΣFy²)<br><b>${t('experiments.substitutionLabel')}:</b> F_net = √(${m.netForceX}² + ${m.netForceY}²)<br><b>${t('experiments.resultLabel')}:</b> F_net = <b>${m.netForceMag?.toFixed(4)} N</b>`
  }

  function calcCentripetalForce() {
    const c = calcCentripetal(params.mass, params.angularVelocity, params.radius)
    calcResult.value = `<b>${t('experiments.equationLabel')}:</b> Fc = m·v²/r<br><b>${t('experiments.substitutionLabel')}:</b> Fc = ${params.mass}×${c.v.toFixed(3)}²/${params.radius}<br><b>${t('experiments.resultLabel')}:</b> Fc = <b>${c.fc.toFixed(4)} N</b>`
  }

  function calcFitCentripetal() {
    const cpTrials = base.trials.value.filter(tr => tr.mode === 'centripetal')
    if (cpTrials.length < 2) { calcResult.value = t('experiments.atLeastTwoTrials'); return }
    const xs = cpTrials.map(tr => tr.angularVelocity * tr.angularVelocity)
    const ys = cpTrials.map(tr => tr.centripetalForce)
    const fit = linearRegression(xs, ys)
    if (!fit || Math.abs(fit.slope) < 1e-12) { calcResult.value = t('experiments.insufficientData'); return }
    const mCalc = fit.slope / (cpTrials[0].radius || 1)
    const quality = fit.r2 > 0.98 ? '✅' : fit.r2 > 0.9 ? '🟡' : '⚠️'
    calcResult.value = `Fc = ${fit.slope.toFixed(5)}·ω² ${fit.intercept >= 0 ? '+' : ''} ${fit.intercept.toFixed(5)}<br>R² = ${fit.r2.toFixed(4)} ${quality}<br>m·r = slope → m = <b>${mCalc.toFixed(3)} kg</b>`
  }

  return {
    trials: base.trials, trialStats, recordTrial, removeTrial: base.removeTrial, clearTrials: base.clearTrials, exportCsv,
    undo: base.undo, redo: base.redo, canUndo: base.canUndo, canRedo: base.canRedo, autoLoad: base.autoLoad,
    calcResult, calcNetForce, calcCentripetalForce, calcFitCentripetal,
  }
}
