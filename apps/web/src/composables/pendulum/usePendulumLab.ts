import { ref } from 'vue'
import { usePendulumPhysics, type PendulumParams } from '../../modules/physics/experiments/pendulum/usePendulumPhysics'

export function usePendulumLab(params: PendulumParams, onTick?: () => void) {
  const { state: sim, step, start: simStart, stop: simStop, togglePause: simTogglePause, reset, measured, getCutState } = usePendulumPhysics(params)

  const running = ref(false)
  const paused = ref(false)
  const speed = ref(1)
  const labFlowRunning = ref(false)
  let rafId: number | null = null
  let waitRafId: number | null = null

  function tickFrame() {
    if (!sim.running || sim.paused) return
    step(1 / 60, speed.value)
    onTick?.()
    rafId = requestAnimationFrame(tickFrame)
  }

  function start() {
    if (rafId) cancelAnimationFrame(rafId)
    simStart()
    running.value = sim.running
    paused.value = sim.paused
    rafId = requestAnimationFrame(tickFrame)
  }

  function togglePause() {
    if (!sim.running) { start(); return }
    simTogglePause()
    running.value = sim.running
    paused.value = sim.paused
    if (!sim.paused) rafId = requestAnimationFrame(tickFrame)
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
    if (waitRafId) cancelAnimationFrame(waitRafId)
    rafId = null
    waitRafId = null
  }

  function resetSim() {
    stopSim()
    reset()
  }

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

  const waitForPeriod = (timeoutMs = 90000): Promise<boolean> => new Promise((resolve) => {
    const t0 = performance.now()
    const tick = () => {
      if (sim.measurementPeriod != null) { waitRafId = null; resolve(true); return }
      if (!sim.running || performance.now() - t0 > timeoutMs) { waitRafId = null; resolve(false); return }
      waitRafId = requestAnimationFrame(tick)
    }
    tick()
  })

  async function runPendulumLab(recordTrial: () => void, calcFitG: () => void) {
    if (labFlowRunning.value) return
    labFlowRunning.value = true
    try {
      params.g = 9.81; params.theta0 = 10 * Math.PI / 180; params.damping = 0; params.measureCycles = 20
      for (const L of [0.20, 0.30, 0.40, 0.50, 0.60, 0.70]) {
        params.length = L
        reset()
        start()
        const ok = await waitForPeriod()
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
    sim, running, paused, speed, step,
    start, stopSim, togglePause, resetSim, cleanup,
    measured, getCutState,
    labFlowRunning, runPendulumLab,
  }
}
