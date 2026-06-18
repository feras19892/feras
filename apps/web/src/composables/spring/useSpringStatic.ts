import { reactive, computed } from 'vue'
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'
import { calculateStaticRow } from './physicsUtils'

export interface StaticReading {
  id: number
  mass: number       // kg
  yLoad: number     // cm (reading during loading)
  yUnload: number   // cm (reading during unloading)
  yAvg: number      // cm
  deltaY: number    // cm
  force: number     // N
}

export type StaticPhase = 'setup' | 'loading' | 'unloading' | 'done'

let nextId = 1

export function useSpringStatic(params: SpringParams) {
  const y0 = computed(() => {
    // Natural equilibrium position in cm (arbitrary scale)
    return 10.0
  })

  const state = reactive({
    phase: 'setup' as StaticPhase,
    currentMass: 0,        // kg (temporary mass being added)
    currentY: 0,         // current position reading
    readings: [] as StaticReading[],
    isDragging: false,
  })

  const stepMass = 0.05  // 50g increments

  function startLoading() {
    state.phase = 'loading'
    state.currentMass = 0
    params.mass = 0
  }

  function addWeight() {
    if (state.phase !== 'loading') return
    state.currentMass += stepMass
    params.mass = state.currentMass
    state.currentY = computeY(state.currentMass)
  }

  function removeWeight() {
    if (state.phase !== 'loading' || state.currentMass <= 0) return
    state.currentMass -= stepMass
    params.mass = state.currentMass
    state.currentY = computeY(state.currentMass)
  }

  function recordLoad() {
    if (state.phase !== 'loading') return
    const validated = calculateStaticRow(nextId, state.currentMass * 1000, params.k)
    state.readings.push({
      id: nextId++,
      mass: state.currentMass,
      yLoad: state.currentY,
      yUnload: 0,
      yAvg: state.currentY,
      deltaY: validated.displacementCm,
      force: validated.forceNewton,
    })
  }

  function startUnloading() {
    state.phase = 'unloading'
    state.currentMass = state.readings[state.readings.length - 1]?.mass || 0
    params.mass = state.currentMass
  }

  function recordUnload() {
    if (state.phase !== 'unloading') return
    const reading = state.readings
      .slice()
      .reverse()
      .find(r => r.mass === state.currentMass && r.yUnload === 0)
    if (reading) {
      reading.yUnload = state.currentY
      reading.yAvg = (reading.yLoad + reading.yUnload) / 2
      reading.deltaY = Math.abs(reading.yAvg - y0.value)
      const validated = calculateStaticRow(reading.id, reading.mass * 1000, params.k)
      reading.force = validated.forceNewton
    }
    state.currentMass -= stepMass
    if (state.currentMass < 0) state.currentMass = 0
    params.mass = state.currentMass
    state.currentY = computeY(state.currentMass)
  }

  function finish() {
    state.phase = 'done'
  }

  function reset() {
    state.phase = 'setup'
    state.currentMass = 0
    state.currentY = 0
    state.readings = []
    nextId = 1
    params.mass = 0
  }

  function computeY(mass: number): number {
    // Hooke's law: deltaY = (m * g) / k
    // Scale to cm display (arbitrary scale factor)
    const stretchMeters = (mass * 9.81) / params.k
    return y0.value + stretchMeters * 100  // convert to cm
  }

  const fit = computed(() => {
    if (state.readings.length < 2) return null
    const valid = state.readings.filter(r => r.yUnload > 0)
    if (valid.length < 2) return null
    const xs = valid.map(r => r.deltaY)
    const ys = valid.map(r => r.force)
    const n = xs.length
    const sumX = xs.reduce((a, b) => a + b, 0)
    const sumY = ys.reduce((a, b) => a + b, 0)
    const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0)
    const sumX2 = xs.reduce((sum, x) => sum + x * x, 0)
    const denom = n * sumX2 - sumX * sumX
    if (Math.abs(denom) < 1e-12) return null
    const slope = (n * sumXY - sumX * sumY) / denom
    const intercept = (sumY - slope * sumX) / n
    return { slope, intercept, k: slope }
  })

  return {
    state,
    y0,
    stepMass,
    startLoading,
    addWeight,
    removeWeight,
    recordLoad,
    startUnloading,
    recordUnload,
    finish,
    reset,
    fit,
  }
}
