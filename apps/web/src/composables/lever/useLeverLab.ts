import { ref } from 'vue'
import { useLeverPhysics, type LeverParams } from '../../modules/physics/experiments/lever/useLeverPhysics'

export function useLeverLab(params: LeverParams, onTick?: () => void) {
  const physics = useLeverPhysics(params)
  const running = ref(false)
  const paused = ref(false)
  const speed = ref(1)

  let rafId: number | null = null

  function tickFrame() {
    if (!physics.state.running || physics.state.paused) return
    physics.step()
    onTick?.()
    rafId = requestAnimationFrame(tickFrame)
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId)
    physics.state.running = true
    physics.state.paused = false
    running.value = true
    paused.value = false
    rafId = requestAnimationFrame(tickFrame)
  }

  function togglePause() {
    if (!physics.state.running) { start(); return }
    physics.togglePause()
    running.value = physics.state.running
    paused.value = physics.state.paused
    if (!physics.state.paused) rafId = requestAnimationFrame(tickFrame)
  }

  function stopSim() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    physics.stop()
    running.value = false
    paused.value = false
  }

  function resetSim() {
    stopSim()
    physics.reset()
    running.value = false
    paused.value = false
  }

  function cleanup() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  }

  return {
    sim: physics.state,
    running,
    paused,
    speed,
    addBall: physics.addBall,
    removeBall: physics.removeBall,
    moveBall: physics.moveBall,
    setBallMass: physics.setBallMass,
    addForce: physics.addForce,
    removeForce: physics.removeForce,
    moveForce: physics.moveForce,
    setForceValue: physics.setForceValue,
    setForceDirection: physics.setForceDirection,
    toggleForceDirection: physics.toggleForceDirection,
    start,
    stopSim,
    togglePause,
    resetSim,
    cleanup,
  }
}
