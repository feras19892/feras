export type ProbeState = 'idle' | 'dragging' | 'placed'

export function createProbeState() {
  let probeState: ProbeState = 'idle'
  let probePos = { x: 0, y: 0 }
  let probeMeasured = { R: 0, B: 0 }
  let probeIconPos = { x: 0, y: 0 }

  return {
    get state() { return probeState },
    set state(v: ProbeState) { probeState = v },
    get pos() { return probePos },
    set pos(v: { x: number; y: number }) { probePos = v },
    get measured() { return probeMeasured },
    set measured(v: { R: number; B: number }) { probeMeasured = v },
    get iconPos() { return probeIconPos },
    set iconPos(v: { x: number; y: number }) { probeIconPos = v },
  }
}

export type ProbeStateManager = ReturnType<typeof createProbeState>
