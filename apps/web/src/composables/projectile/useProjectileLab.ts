import { ref, watch } from 'vue'
import { useProjectilePhysics, type ProjectileParams } from '../../modules/physics/experiments/projectile/useProjectilePhysics'

export function useProjectileLab(params: ProjectileParams, onTick?: () => void) {
  const { state: sim, step, start: simStart, stop: simStop, togglePause: simTogglePause, reset, measured } = useProjectilePhysics(params)

  const running = ref(false)
  const paused = ref(false)
  const speed = ref(1)
  const labFlowRunning = ref(false)
  let rafId: number | null = null
  let waitRafId: number | null = null
  let autoResetTimer: ReturnType<typeof setTimeout> | null = null

  // Auto-reset only in target mode when target is missed (not in normal projectile mode)
  watch(() => sim.landed, (landed) => {
    if (autoResetTimer) { clearTimeout(autoResetTimer); autoResetTimer = null }
    const inTargetMode = params.targetMode === true && params.targetVisible === true
    if (landed && inTargetMode && sim.targetHit === false) {
      autoResetTimer = setTimeout(() => {
        autoResetTimer = null
        if (sim.landed && sim.targetHit === false) resetSim()
      }, 1000)
    }
  })

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
    if (autoResetTimer) { clearTimeout(autoResetTimer); autoResetTimer = null }
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

  async function runProjectileLab(recordTrial: () => void, calcFitRange: () => void) {
    if (labFlowRunning.value) return
    labFlowRunning.value = true
    const saved = { v0: params.v0, angleDeg: params.angleDeg, g: params.g, x0: params.x0, y0: params.y0, dragCoeff: params.dragCoeff }
    try {
      // Scenario 1: constant v0=10, varying angle
      params.v0 = 10; params.g = 9.81; params.x0 = 0; params.y0 = 0
      for (const angle of [15, 30, 45, 60, 75]) {
        params.angleDeg = angle
        reset()
        start()
        const ok = await waitForLanding()
        stopSim()
        if (!ok) break
        recordTrial()
        await sleep(250)
      }
      calcFitRange()
    } finally {
      labFlowRunning.value = false
      params.v0 = saved.v0
      params.angleDeg = saved.angleDeg
      params.g = saved.g
      params.x0 = saved.x0
      params.y0 = saved.y0
      params.dragCoeff = saved.dragCoeff
      resetSim()
    }
  }

  return {
    sim, running, paused, speed, step,
    start, stopSim, togglePause, resetSim, cleanup,
    measured,
    labFlowRunning, runProjectileLab,
  }
}
