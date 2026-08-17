import { ref } from 'vue'
import { useInclinedPhysics, type InclinedParams } from '../../modules/physics/experiments/inclined/useInclinedPhysics'

export function useInclinedLab(params: InclinedParams, onTick?: () => void) {
  const { sim, step, start: physStart, stop: physStop, togglePause: physTogglePause, reset, measured } = useInclinedPhysics(params)

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

  const waitForArrival = (timeoutMs = 30000): Promise<boolean> => new Promise((resolve) => {
    const t0 = performance.now()
    const tick = () => {
      if (sim.arrived) { waitRafId = null; resolve(true); return }
      if (!sim.running || performance.now() - t0 > timeoutMs) { waitRafId = null; resolve(false); return }
      waitRafId = requestAnimationFrame(tick)
    }
    tick()
  })

  async function runInclinedLab(recordTrial: () => void) {
    if (labFlowRunning.value) return
    labFlowRunning.value = true
    const saved = { thetaDeg: params.thetaDeg, length: params.length, mass: params.mass, g: params.g, mu: params.mu, airResistance: params.airResistance, bodyTypeId: params.bodyTypeId, cd: params.cd, area: params.area }
    try {
      for (const theta of [15, 30, 45, 60]) {
        params.thetaDeg = theta
        reset()
        start()
        const ok = await waitForArrival()
        stopSim()
        if (!ok) break
        recordTrial()
        await sleep(250)
      }
    } finally {
      labFlowRunning.value = false
      params.thetaDeg = saved.thetaDeg
      params.length = saved.length
      params.mass = saved.mass
      params.g = saved.g
      params.mu = saved.mu
      params.airResistance = saved.airResistance
      params.bodyTypeId = saved.bodyTypeId
      params.cd = saved.cd
      params.area = saved.area
      resetSim()
    }
  }

  return {
    sim, running, paused, speed,
    start, stopSim, togglePause, resetSim, cleanup,
    measured,
    labFlowRunning, runInclinedLab,
  }
}
