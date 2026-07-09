import { ref } from 'vue'
import { useI18n } from '../useI18n'
import type { LeverState } from '../../modules/physics/experiments/lever/useLeverPhysics'

export interface LeverTrial {
  id: number; trialNo: number; forceCount: number
  sumFx: number; sumFy: number
  resultantMag: number; resultantAngle: number
  eqForceMag: number; eqForceAngle: number
  isBalanced: boolean
}

const SAVE_KEY = 'lever:trials:v1'

export function useLeverTrials(sim: LeverState, resultant: { value: { fx: number; fy: number; magnitude: number; angleDeg: number } }, equilibriumForce: { value: { magnitude: number; angleDeg: number } | null }, isBalanced: { value: boolean }) {
  const { t } = useI18n()
  const trials = ref<LeverTrial[]>([])
  let nextTrialId = 1
  const history = ref<LeverTrial[][]>([])
  const historyIndex = ref(-1)

  function pushHistory() {
    if (historyIndex.value < history.value.length - 1) history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push([...trials.value])
    historyIndex.value++
    if (history.value.length > 20) { history.value.shift(); historyIndex.value-- }
  }

  function undo() { if (historyIndex.value > 0) { historyIndex.value--; trials.value = [...history.value[historyIndex.value]] } }
  function redo() { if (historyIndex.value < history.value.length - 1) { historyIndex.value++; trials.value = [...history.value[historyIndex.value]] } }
  function canUndo() { return historyIndex.value > 0 }
  function canRedo() { return historyIndex.value < history.value.length - 1 }

  function recordTrial() {
    if (sim.forces.length === 0) { alert(t('experiments.addForceFirst')); return }
    pushHistory()
    const r = resultant.value
    const eq = equilibriumForce.value
    trials.value.push({
      id: nextTrialId++, trialNo: trials.value.length + 1, forceCount: sim.forces.length,
      sumFx: r.fx, sumFy: r.fy,
      resultantMag: r.magnitude, resultantAngle: r.angleDeg,
      eqForceMag: eq?.magnitude ?? 0, eqForceAngle: eq?.angleDeg ?? 0,
      isBalanced: isBalanced.value,
    })
    autoSave()
  }

  function removeTrial(id: number) { pushHistory(); trials.value = trials.value.filter(t => t.id !== id); autoSave() }
  function clearTrials() { pushHistory(); trials.value = []; autoSave() }

  function autoSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ trials: trials.value, nextId: nextTrialId })) } catch { /* storage unavailable */ } }
  function autoLoad() {
    try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) return; const p = JSON.parse(raw); if (Array.isArray(p.trials)) { trials.value = p.trials; nextTrialId = p.nextId ?? 1; history.value = [[...p.trials]]; historyIndex.value = 0 } } catch { /* storage unavailable */ }
  }

  function exportCsv() {
    if (!trials.value.length) return
    const rows = trials.value.map((t, i) => [i + 1, t.forceCount, t.sumFx.toFixed(2), t.sumFy.toFixed(2), t.resultantMag.toFixed(2), t.resultantAngle.toFixed(1), t.eqForceMag.toFixed(2), t.eqForceAngle.toFixed(1), t.isBalanced ? 'Yes' : 'No'])
    const csv = ['#,# Forces,Sum Fx (N),Sum Fy (N),Resultant (N),Resultant Angle (deg),Equilibrium (N),Equilibrium Angle (deg),Balanced', ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lever_equilibrium_data.csv'; a.click(); URL.revokeObjectURL(a.href)
  }

  return { trials, recordTrial, removeTrial, clearTrials, exportCsv, undo, redo, canUndo, canRedo, autoLoad }
}
