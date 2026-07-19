import type { WorkshopComponent, WorkshopWire, Complex } from './types'
import { cSub, cAbs } from '@my-modern-app/math-engine'

function getTermWorldPos(c: WorkshopComponent, t: { dx: number; dy: number }): [number, number] {
  const s = c.scale ?? 1
  const r = c.rotation * Math.PI / 180
  const cos = Math.cos(r), sin = Math.sin(r)
  return [c.x + (t.dx * cos - t.dy * sin) * s, c.y + (t.dx * sin + t.dy * cos) * s]
}

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2)
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.sqrt((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2)
}

function findNearestNode(
  probe: { x: number; y: number } | undefined,
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  terminalNodeIndex: Map<string, number>,
): number | null {
  if (!probe) return null
  let bestNode: number | null = null
  let bestDist = Infinity
  for (const c of components) {
    if (c.type === 'multimeter') continue
    for (const t of c.terminals) {
      const [tx, ty] = getTermWorldPos(c, t)
      const d = Math.sqrt((tx - probe.x) ** 2 + (ty - probe.y) ** 2)
      if (d < bestDist) {
        bestDist = d
        bestNode = terminalNodeIndex.get(`${c.id}:${t.index}`) ?? null
      }
    }
  }
  for (const w of wires) {
    const fromComp = components.find(c => c.id === w.fromCompId)
    const toComp = components.find(c => c.id === w.toCompId)
    if (!fromComp || !toComp) continue
    const fromTerm = fromComp.terminals[w.fromTerminalIndex]
    const toTerm = toComp.terminals[w.toTerminalIndex]
    if (!fromTerm || !toTerm) continue
    const [fx, fy] = getTermWorldPos(fromComp, fromTerm)
    const [tx, ty] = getTermWorldPos(toComp, toTerm)
    const pts: { x: number; y: number }[] = [{ x: fx, y: fy }]
    for (const p of w.points) pts.push({ x: p.x, y: p.y })
    pts.push({ x: tx, y: ty })
    for (let j = 0; j < pts.length - 1; j++) {
      const d = distToSeg(probe.x, probe.y, pts[j].x, pts[j].y, pts[j + 1].x, pts[j + 1].y)
      if (d < bestDist) {
        bestDist = d
        bestNode = terminalNodeIndex.get(`${fromComp.id}:${fromTerm.index}`) ?? null
      }
    }
  }
  if (bestDist > 40) return null
  return bestNode
}

function findNearestWire(
  pos: { x: number; y: number },
  wires: WorkshopWire[],
  components: WorkshopComponent[],
): WorkshopWire | null {
  let bestWire: WorkshopWire | null = null
  let bestDist = Infinity
  for (const w of wires) {
    const fromComp = components.find(c => c.id === w.fromCompId)
    const toComp = components.find(c => c.id === w.toCompId)
    if (!fromComp || !toComp) continue
    const fromTerm = fromComp.terminals[w.fromTerminalIndex]
    const toTerm = toComp.terminals[w.toTerminalIndex]
    if (!fromTerm || !toTerm) continue
    const [fx, fy] = getTermWorldPos(fromComp, fromTerm)
    const [tx, ty] = getTermWorldPos(toComp, toTerm)
    const pts: { x: number; y: number }[] = [{ x: fx, y: fy }]
    for (const p of w.points) pts.push({ x: p.x, y: p.y })
    pts.push({ x: tx, y: ty })
    for (let j = 0; j < pts.length - 1; j++) {
      const d = distToSeg(pos.x, pos.y, pts[j].x, pts[j].y, pts[j + 1].x, pts[j + 1].y)
      if (d < bestDist) { bestDist = d; bestWire = w }
    }
  }
  if (bestDist >= 40) return null
  return bestWire
}

export function measureMultimeterDC(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  terminalNodeIndex: Map<string, number>,
  X: number[],
  componentCurrents: Map<number, number>,
  componentVoltages: Map<number, number>,
): void {
  for (const comp of components) {
    if (comp.type !== 'multimeter') continue
    const mode = comp.multimeterMode || 'voltage'
    if (mode === 'current') {
      const clampPos = comp.clampPos
      if (clampPos) {
        const bestWire = findNearestWire(clampPos, wires, components)
        if (bestWire) {
          const fromComp = components.find(c => c.id === bestWire.fromCompId)
          const toComp = components.find(c => c.id === bestWire.toCompId)
          const IFrom = fromComp ? (componentCurrents.get(fromComp.id) ?? 0) : 0
          const ITo = toComp ? (componentCurrents.get(toComp.id) ?? 0) : 0
          const I = Math.abs(IFrom) > Math.abs(ITo) ? IFrom : ITo
          componentCurrents.set(comp.id, I)
          componentVoltages.set(comp.id, 0)
        } else {
          componentCurrents.set(comp.id, 0)
          componentVoltages.set(comp.id, 0)
        }
      } else {
        componentCurrents.set(comp.id, 0)
        componentVoltages.set(comp.id, 0)
      }
    } else {
      const blackNode = findNearestNode(comp.probeBlack, components, wires, terminalNodeIndex)
      const redNode = findNearestNode(comp.probeRed, components, wires, terminalNodeIndex)
      if (blackNode !== null && redNode !== null) {
        const vBlack = X[blackNode] ?? 0
        const vRed = X[redNode] ?? 0
        const measuredV = vRed - vBlack
        componentVoltages.set(comp.id, measuredV)
        if (mode === 'resistance') {
          if (blackNode === redNode) {
            componentCurrents.set(comp.id, 0)
            comp.value = 0
          } else {
            let foundI = 0
            for (const c of components) {
              if (c.type === 'multimeter') continue
              const n0 = terminalNodeIndex.get(`${c.id}:0`)
              const n1 = terminalNodeIndex.get(`${c.id}:1`)
              if (n0 === undefined || n1 === undefined) continue
              if ((n0 === blackNode && n1 === redNode) || (n0 === redNode && n1 === blackNode)) {
                foundI = Math.abs(componentCurrents.get(c.id) ?? 0)
                break
              }
            }
            if (foundI === 0) {
              for (const c of components) {
                if (c.type === 'multimeter' || c.type === 'battery' || c.type === 'ground') continue
                const n0 = terminalNodeIndex.get(`${c.id}:0`)
                const n1 = terminalNodeIndex.get(`${c.id}:1`)
                if (n0 === undefined || n1 === undefined) continue
                if (n0 === redNode || n1 === redNode || n0 === blackNode || n1 === blackNode) {
                  const I = Math.abs(componentCurrents.get(c.id) ?? 0)
                  if (I > foundI) foundI = I
                }
              }
            }
            componentCurrents.set(comp.id, foundI)
            comp.value = foundI > 1e-10 ? Math.abs(measuredV / foundI) : 0
          }
        } else {
          componentCurrents.set(comp.id, 0)
        }
      } else {
        componentVoltages.set(comp.id, 0)
        componentCurrents.set(comp.id, 0)
      }
    }
  }
}

export function measureMultimeterAC(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  terminalNodeIndex: Map<string, number>,
  nodeVoltagePhasors: Map<number, Complex>,
  componentCurrentPhasors: Map<number, Complex>,
  componentVoltagePhasors: Map<number, Complex>,
): void {
  for (const comp of components) {
    if (comp.type !== 'multimeter') continue
    const mode = comp.multimeterMode || 'voltage'
    if (mode === 'current') {
      if (!comp.clampPos) {
        componentCurrentPhasors.set(comp.id, { re: 0, im: 0 })
        componentVoltagePhasors.set(comp.id, { re: 0, im: 0 })
        continue
      }
      const bestWire = findNearestWire(comp.clampPos, wires, components)
      if (!bestWire) {
        componentCurrentPhasors.set(comp.id, { re: 0, im: 0 })
        componentVoltagePhasors.set(comp.id, { re: 0, im: 0 })
        continue
      }
      const fromComp = components.find(c => c.id === bestWire.fromCompId)
      const toComp = components.find(c => c.id === bestWire.toCompId)
      const fromI = fromComp ? (componentCurrentPhasors.get(fromComp.id) ?? { re: 0, im: 0 }) : { re: 0, im: 0 }
      const toI = toComp ? (componentCurrentPhasors.get(toComp.id) ?? { re: 0, im: 0 }) : { re: 0, im: 0 }
      const currentPhasor = cAbs(fromI) > cAbs(toI) ? fromI : toI
      componentCurrentPhasors.set(comp.id, currentPhasor)
      componentVoltagePhasors.set(comp.id, { re: 0, im: 0 })
    } else {
      const blackNode = findNearestNode(comp.probeBlack, components, wires, terminalNodeIndex)
      const redNode = findNearestNode(comp.probeRed, components, wires, terminalNodeIndex)
      if (blackNode !== null && redNode !== null) {
        const vBlack = nodeVoltagePhasors.get(blackNode) ?? { re: 0, im: 0 }
        const vRed = nodeVoltagePhasors.get(redNode) ?? { re: 0, im: 0 }
        const measuredV = cSub(vRed, vBlack)
        componentVoltagePhasors.set(comp.id, measuredV)
        if (mode === 'resistance') {
          if (blackNode === redNode) {
            componentCurrentPhasors.set(comp.id, { re: 0, im: 0 })
          } else {
            let foundI: Complex = { re: 0, im: 0 }
            for (const c of components) {
              if (c.type === 'multimeter') continue
              const n0 = terminalNodeIndex.get(`${c.id}:0`)
              const n1 = terminalNodeIndex.get(`${c.id}:1`)
              if (n0 === undefined || n1 === undefined) continue
              if ((n0 === blackNode && n1 === redNode) || (n0 === redNode && n1 === blackNode)) {
                foundI = componentCurrentPhasors.get(c.id) ?? { re: 0, im: 0 }
                break
              }
            }
            if (cAbs(foundI) === 0) {
              for (const c of components) {
                if (c.type === 'multimeter' || c.type === 'battery' || c.type === 'ground') continue
                const n0 = terminalNodeIndex.get(`${c.id}:0`)
                const n1 = terminalNodeIndex.get(`${c.id}:1`)
                if (n0 === undefined || n1 === undefined) continue
                if (n0 === redNode || n1 === redNode || n0 === blackNode || n1 === blackNode) {
                  const I = componentCurrentPhasors.get(c.id) ?? { re: 0, im: 0 }
                  if (cAbs(I) > cAbs(foundI)) foundI = I
                }
              }
            }
            componentCurrentPhasors.set(comp.id, foundI)
          }
        } else {
          componentCurrentPhasors.set(comp.id, { re: 0, im: 0 })
        }
      } else {
        componentVoltagePhasors.set(comp.id, { re: 0, im: 0 })
        componentCurrentPhasors.set(comp.id, { re: 0, im: 0 })
      }
    }
  }
}
