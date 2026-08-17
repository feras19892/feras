import { ref } from 'vue'
import { useNetForcePhysics, type NetForceParams } from '../../modules/physics/experiments/netforce/useNetForcePhysics'

export function useNetForceLab(params: NetForceParams, onTick?: () => void) {
  const { sim, measured, step, start: physStart, stop: physStop, togglePause: physTogglePause, reset, updateMeasurements } = useNetForcePhysics(params)

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

  const waitForSettled = (timeoutMs = 10000): Promise<boolean> => new Promise((resolve) => {
    const t0 = performance.now()
    const tick = () => {
      if (sim.settled || sim.t > 5) { waitRafId = null; resolve(true); return }
      if (!sim.running || performance.now() - t0 > timeoutMs) { waitRafId = null; resolve(false); return }
      waitRafId = requestAnimationFrame(tick)
    }
    tick()
  })

  const waitForRotations = (count: number, timeoutMs = 15000): Promise<boolean> => new Promise((resolve) => {
    const t0 = performance.now()
    const target = sim.angle + count * Math.PI * 2
    const tick = () => {
      if (sim.angle >= target || sim.t > count * 2 * Math.PI / params.angularVelocity + 1) { waitRafId = null; resolve(true); return }
      if (!sim.running || performance.now() - t0 > timeoutMs) { waitRafId = null; resolve(false); return }
      waitRafId = requestAnimationFrame(tick)
    }
    tick()
  })

  async function runNetForceLab(recordTrial: () => void) {
    if (labFlowRunning.value) return
    labFlowRunning.value = true
    const saved = { ...params, customForces: [...params.customForces] }
    try {
      if (params.mode === 'equilibrium') {
        // Phase 1: Vary applied angle with fixed force
        for (const angle of [0, 30, 60, 90, 120, 150]) {
          params.appliedAngle = angle
          params.appliedForce = 15
          params.mu = 0
          params.surfaceAngle = 0
          reset()
          start()
          const ok = await waitForSettled()
          stopSim()
          if (!ok) break
          recordTrial()
          await sleep(250)
        }
        // Phase 2: Vary mass
        for (const m of [0.5, 1, 2, 5]) {
          params.mass = m
          params.appliedForce = 15
          params.appliedAngle = 45
          params.mu = 0
          params.surfaceAngle = 0
          reset()
          start()
          const ok = await waitForSettled()
          stopSim()
          if (!ok) break
          recordTrial()
          await sleep(250)
        }
        // Phase 3: Vary friction
        for (const mu of [0, 0.1, 0.3, 0.5]) {
          params.mu = mu
          params.mass = 1
          params.appliedForce = 15
          params.appliedAngle = 0
          params.surfaceAngle = 20
          reset()
          start()
          const ok = await waitForSettled()
          stopSim()
          if (!ok) break
          recordTrial()
          await sleep(250)
        }
        // Phase 4: Vary surface angle
        for (const sa of [0, 15, 30, 45]) {
          params.surfaceAngle = sa
          params.mu = 0.2
          params.mass = 1
          params.appliedForce = 15
          params.appliedAngle = 0
          reset()
          start()
          const ok = await waitForSettled()
          stopSim()
          if (!ok) break
          recordTrial()
          await sleep(250)
        }
      } else {
        for (const omega of [1, 3, 5, 7, 9]) {
          params.angularVelocity = omega
          reset()
          start()
          const ok = await waitForRotations(2)
          stopSim()
          if (!ok) break
          recordTrial()
          await sleep(250)
        }
      }
    } finally {
      labFlowRunning.value = false
      Object.assign(params, saved)
      params.customForces = saved.customForces
      resetSim()
    }
  }

  return {
    sim, running, paused, speed,
    start, stopSim, togglePause, resetSim, cleanup,
    measured, updateMeasurements,
    labFlowRunning, runNetForceLab,
  }
}
