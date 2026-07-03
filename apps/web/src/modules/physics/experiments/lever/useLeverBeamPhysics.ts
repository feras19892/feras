import { reactive, computed } from 'vue'

export interface BeamMass {
  id: number
  mass: number       // kg
  distance: number  // m from fulcrum, positive = right, negative = left
}

export interface BeamState {
  running: boolean
  paused: boolean
  beamLength: number   // total beam length (m), default 2
  masses: BeamMass[]
  nextId: number
}

export function useLeverBeamPhysics() {
  const state = reactive<BeamState>({
    running: false,
    paused: false,
    beamLength: 2,
    masses: [],
    nextId: 1,
  })

  const g = 9.81 // m/s²

  // Torque = m * g * d (positive = counter-clockwise / right side down)
  const torques = computed(() => state.masses.map(m => m.mass * g * m.distance))
  const netTorque = computed(() => torques.value.reduce((s, t) => s + t, 0))

  // Tilt angle (simplified): proportional to net torque
  const maxTilt = 15 // degrees max
  const tiltDeg = computed(() => {
    const limit = 500 // N·m for max tilt
    const raw = (netTorque.value / limit) * maxTilt
    return Math.max(-maxTilt, Math.min(maxTilt, raw))
  })

  const isBalanced = computed(() => Math.abs(netTorque.value) < 0.01)

  // Left / Right sums
  const leftTorque = computed(() => state.masses.filter(m => m.distance < 0).reduce((s, m) => s + m.mass * g * Math.abs(m.distance), 0))
  const rightTorque = computed(() => state.masses.filter(m => m.distance > 0).reduce((s, m) => s + m.mass * g * m.distance, 0))

  function addMass(mass: number, distance: number): number {
    const bm = { id: state.nextId++, mass, distance }
    state.masses.push(bm)
    return bm.id
  }

  function removeMass(id: number) { state.masses = state.masses.filter(m => m.id !== id) }

  function updateMass(id: number, mass: number, distance: number) {
    const m = state.masses.find(x => x.id === id)
    if (!m) return
    m.mass = Math.max(0.1, Math.min(50, mass))
    m.distance = Math.max(-state.beamLength / 2, Math.min(state.beamLength / 2, distance))
  }

  function reset() {
    state.masses = []
    state.nextId = 1
    state.running = false
    state.paused = false
  }

  return { state, netTorque, tiltDeg, isBalanced, leftTorque, rightTorque, torques, addMass, removeMass, updateMass, reset }
}
