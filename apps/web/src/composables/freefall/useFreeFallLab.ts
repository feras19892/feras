import { ref } from 'vue'
import { useFreeFallPhysics, type FreeFallParams } from '../../modules/physics/experiments/freefall/useFreeFallPhysics'

export function useFreeFallLab(params: FreeFallParams, onTick?: () => void) {
  const { sim, step, start: physStart, stop: physStop, togglePause: physTogglePause, reset, measured } = useFreeFallPhysics(params)

  const running = ref(false)
  const paused = ref(false)
  const speed = ref(1)
  const labFlowRunning = ref(false)
  let rafId: number | null = null
  let waitRafId: number | null = null
  let lastTime = 0

  function tickFrame() {
    if (!sim.running || sim.paused) return
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    step(dt, speed.value)
    onTick?.()
    rafId = requestAnimationFrame(tickFrame)
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId)
    physStart()
    running.value = sim.running
    paused.value = sim.paused
    lastTime = performance.now()
    rafId = requestAnimationFrame(tickFrame)
  }

  function togglePause() {
    if (!sim.running) { start(); return }
    physTogglePause()
    running.value = sim.running
    paused.value = sim.paused
    if (!sim.paused) { lastTime = performance.now(); rafId = requestAnimationFrame(tickFrame) }
  }

  function stopSim() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    physStop()
    running.value = sim.running
    paused.value = sim.paused
  }

  function cleanup() {
    if (rafId) cancelAnimationFrame(rafId)
    if (waitRafId) cancelAnimationFrame(waitRafId)
    rafId = null
    waitRafId = null
  }

  function resetSim() {
    stopSim()
    reset()
  }

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

  const waitForLanding = (timeoutMs = 30000): Promise<boolean> => new Promise((resolve) => {
    const t0 = performance.now()
    const tick = () => {
      if (sim.landed) { waitRafId = null; resolve(true); return }
      if (!sim.running || performance.now() - t0 > timeoutMs) { waitRafId = null; resolve(false); return }
      waitRafId = requestAnimationFrame(tick)
    }
    tick()
  })

  async function runFreeFallLab(recordTrial: () => void, calcFitG: () => void) {
    if (labFlowRunning.value) return
    labFlowRunning.value = true
    try {
      params.g = 9.81
      for (const h of [0.20, 0.40, 0.60, 0.80, 1.00]) {
        params.h = h
        reset()
        start()
        const ok = await waitForLanding()
        stopSim()
        if (!ok) break
        recordTrial()
        await sleep(250)
      }
      calcFitG()
    } finally {
      labFlowRunning.value = false
      resetSim()
    }
  }

  return {
    sim, running, paused, speed,
    start, stopSim, togglePause, resetSim, cleanup,
    measured,
    labFlowRunning, runFreeFallLab,
  }
}
