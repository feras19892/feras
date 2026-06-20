import { ref } from 'vue'
import { useCollisionPhysics, type CollisionParams } from '../../modules/physics/experiments/collision/useCollisionPhysics'

export interface CollisionSignalPoint {
  t: number
  v1: number
  v2: number
  x1: number
  x2: number
  KE: number
}

export function useCollisionLab(params: CollisionParams, onTick?: () => void) {
  const { sim, step, start: simStart, stop: simStop, togglePause: simTogglePause, reset } = useCollisionPhysics(params)

  const running = ref(false)
  const paused = ref(false)
  const speed = ref(1)
  const signalSeries = ref<CollisionSignalPoint[]>([])
  let rafId: number | null = null
  let lastTime = 0

  function tickFrame() {
    if (!sim.running || sim.paused) return
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    step(dt, speed.value)

    signalSeries.value.push({
      t: sim.t,
      v1: sim.collided ? (sim.v1f ?? sim.v1) : sim.v1,
      v2: sim.collided ? (sim.v2f ?? sim.v2) : sim.v2,
      x1: sim.x1,
      x2: sim.x2,
      KE: sim.collided ? (sim.KEf ?? 0) : (sim.KEi ?? 0),
    })
    if (signalSeries.value.length > 600) signalSeries.value.shift()

    onTick?.()
    if (sim.running && !sim.paused) {
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
    signalSeries.value = []
    reset()
  }

  return {
    sim, running, paused, speed, signalSeries,
    start, stopSim, togglePause, resetSim, cleanup,
  }
}
