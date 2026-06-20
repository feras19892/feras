import { ref } from 'vue'
import { useCollisionPhysics, type CollisionParams } from '../../modules/physics/experiments/collision/useCollisionPhysics'

export function useCollisionLab(params: CollisionParams, onTick?: () => void) {
  const { sim, step, start: simStart, stop: simStop, togglePause: simTogglePause, reset } = useCollisionPhysics(params)

  const running = ref(false)
  const paused = ref(false)
  const speed = ref(1)
  let rafId: number | null = null
  let lastTime = 0

  function tickFrame() {
    if (!sim.running || sim.paused || sim.collided) return
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    step(dt, speed.value)
    onTick?.()
    if (sim.running && !sim.paused && !sim.collided) {
      rafId = requestAnimationFrame(tickFrame)
    }
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId)
    simStart()
    running.value = sim.running
    paused.value = sim.paused
    lastTime = performance.now()
    rafId = requestAnimationFrame(tickFrame)
  }

  function togglePause() {
    if (!sim.running) { start(); return }
    simTogglePause()
    running.value = sim.running
    paused.value = sim.paused
    if (!sim.paused) { lastTime = performance.now(); rafId = requestAnimationFrame(tickFrame) }
  }

  function stopSim() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    simStop()
    running.value = sim.running
    paused.value = sim.paused
  }

  function cleanup() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  }

  function resetSim() {
    stopSim()
    reset()
  }

  return {
    sim, running, paused, speed,
    start, stopSim, togglePause, resetSim, cleanup,
  }
}
