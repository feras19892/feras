import { ref } from 'vue'
import { useLeverPhysics } from '../../modules/physics/experiments/lever/useLeverPhysics'
import { useLeverBeamPhysics } from '../../modules/physics/experiments/lever/useLeverBeamPhysics'

export type LeverMode = 'vector' | 'beam'

export function useLeverLab() {
  const mode = ref<LeverMode>('vector')
  const vector = useLeverPhysics()
  const beam = useLeverBeamPhysics()

  function togglePause() {
    if (mode.value === 'vector') {
      vector.state.running = !vector.state.running
      vector.state.paused = false
    }
  }

  function resetSim() {
    if (mode.value === 'vector') vector.reset()
    else beam.reset()
  }
  function cleanup() {}

  function setMode(m: LeverMode) { mode.value = m; resetSim() }

  return {
    mode, setMode,
    vector, beam,
    running: ref(false), paused: ref(false),
    addForce: vector.addForce, removeForce: vector.removeForce, updateForce: vector.updateForce,
    addMass: beam.addMass, removeMass: beam.removeMass, updateMass: beam.updateMass,
    resetSim, togglePause, cleanup,
    resultant: vector.resultant, equilibriumForce: vector.equilibriumForce, isBalanced: vector.isBalanced,
    netTorque: beam.netTorque, tiltDeg: beam.tiltDeg, leftTorque: beam.leftTorque, rightTorque: beam.rightTorque,
  }
}
