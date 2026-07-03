import { reactive, computed } from 'vue'

export interface LeverForce {
  id: number
  magnitude: number
  angleDeg: number
}

export interface LeverState {
  running: boolean
  paused: boolean
  forces: LeverForce[]
  nextId: number
}

export function useLeverPhysics() {
  const state = reactive<LeverState>({
    running: false,
    paused: false,
    forces: [],
    nextId: 1,
  })

  const sumFx = computed(() => state.forces.reduce((s, f) => s + f.magnitude * Math.cos(f.angleDeg * Math.PI / 180), 0))
  const sumFy = computed(() => state.forces.reduce((s, f) => s + f.magnitude * Math.sin(f.angleDeg * Math.PI / 180), 0))

  const resultant = computed(() => {
    const fx = sumFx.value, fy = sumFy.value
    const mag = Math.sqrt(fx * fx + fy * fy)
    const angle = mag < 1e-6 ? 0 : Math.atan2(fy, fx) * 180 / Math.PI
    return { fx, fy, magnitude: mag, angleDeg: angle }
  })

  const equilibriumForce = computed(() => {
    const r = resultant.value
    if (r.magnitude < 1e-6) return null
    return { fx: -r.fx, fy: -r.fy, magnitude: r.magnitude, angleDeg: (r.angleDeg + 180) % 360 }
  })

  const isBalanced = computed(() => resultant.value.magnitude < 0.01)

  function addForce(magnitude: number, angleDeg: number): number {
    const lf = { id: state.nextId++, magnitude, angleDeg }
    state.forces.push(lf)
    return lf.id
  }

  function removeForce(id: number) { state.forces = state.forces.filter(f => f.id !== id) }

  function updateForce(id: number, magnitude: number, angleDeg: number) {
    const f = state.forces.find(x => x.id === id)
    if (!f) return
    f.magnitude = Math.max(0.1, Math.min(100, magnitude))
    f.angleDeg = ((angleDeg % 360) + 360) % 360
  }

  function reset() {
    state.forces = []
    state.nextId = 1
    state.running = false
    state.paused = false
  }

  return { state, resultant, equilibriumForce, isBalanced, addForce, removeForce, updateForce, reset }
}
