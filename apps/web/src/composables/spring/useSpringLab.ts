import { ref, type Ref } from 'vue'
import { useSpringPhysics, type SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'

export function useSpringLab(params: SpringParams, onTick?: () => void) {
  const { state: sim, step, start: simStart, stop: simStop, togglePause: simTogglePause, reset, measured, effectiveMass } = useSpringPhysics(params)

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

  async function runSpringLab(recordTrial: () => void, calcFitK: () => void) {
    if (labFlowRunning.value) return
    labFlowRunning.value = true
    try {
      params.k = 20; params.amplitude = 0.12; params.damping = 0; params.measureCycles = 3
      for (const m of [0.3, 0.5, 0.8, 1.0, 1.3, 1.6]) {
        params.mass = m
        reset()
        start()
        const ok = await waitForPeriod()
        stopSim()
        if (!ok) break
        recordTrial()
        await sleep(250)
      }
      calcFitK()
    } finally {
      labFlowRunning.value = false
      resetSim()
    }
  }

  return {
    sim, running, paused, speed, step,
    start, stopSim, togglePause, resetSim, cleanup,
    measured, effectiveMass,
    labFlowRunning, runSpringLab,
  }
}
