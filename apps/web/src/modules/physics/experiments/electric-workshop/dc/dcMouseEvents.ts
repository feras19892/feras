import type { DCCanvasState } from './dcCanvasState'

export function createMouseEvents(s: DCCanvasState) {
  function onMouseDown(e: MouseEvent) {
    const [sx, sy] = s.getMousePos(e)

    const probeHit = s.hitTestProbe(sx, sy)
    if (probeHit) {
      s.isDraggingProbe = true
      s.draggingProbeCompId = probeHit.comp.id
      s.draggingProbeType = probeHit.probe
      s.workshop.selectedComponentId.value = probeHit.comp.id
      s.workshop.selectedWireId.value = null
      return
    }

    const clampHit = s.hitTestClamp(sx, sy)
    if (clampHit) {
      s.isDraggingClamp = true
      s.draggingClampCompId = clampHit.comp.id
      s.workshop.selectedComponentId.value = clampHit.comp.id
      s.workshop.selectedWireId.value = null
      return
    }

    if (s.workshop.selectedWireId.value !== null) {
      const jHit = s.hitTestWireJunction(sx, sy)
      if (jHit && jHit.wire.id === s.workshop.selectedWireId.value) {
        s.isDraggingWirePoint = true
        s.draggingWireId = jHit.wire.id
        s.draggingPointIndex = jHit.pointIndex
        return
      }
    }

    const termHit = s.hitTestTerminal(sx, sy)
    if (termHit) {
      s.isDraggingWire = true
      s.wireStart = termHit
      s.junctionStart = null
      s.tempWireEnd = { x: sx, y: sy }
      return
    }

    const jHit = s.hitTestWireJunction(sx, sy)
    if (jHit) {
      s.isDraggingWire = true
      s.junctionStart = { wireId: jHit.wire.id, pointIndex: jHit.pointIndex, worldX: jHit.worldX, worldY: jHit.worldY }
      s.wireStart = null
      s.tempWireEnd = { x: sx, y: sy }
      return
    }

    const compHit = s.hitTestComponent(sx, sy)
    if (compHit) {
      s.isDraggingComp = true
      s.draggedCompType = compHit.type
      s.workshop.selectedComponentId.value = compHit.id
      s.workshop.selectedWireId.value = null
      const [wx, wy] = s.screenToWorld(sx, sy)
      s.dragOffsetX = compHit.x - wx
      s.dragOffsetY = compHit.y - wy
    } else {
      const wireHit = s.hitTestWire(sx, sy)
      if (wireHit) {
        const wasSelected = s.workshop.selectedWireId.value === wireHit.id
        s.workshop.selectedWireId.value = wireHit.id
        s.workshop.selectedComponentId.value = null
        if (wasSelected) {
          const segHit = s.hitTestWireSegment(sx, sy)
          if (segHit && segHit.wire.id === wireHit.id && wireHit.points.length > 0) {
            s.isDraggingWireSegment = true
            s.dragSegWireId = wireHit.id
            s.dragSegIndex = segHit.segIndex
            const [wx, wy] = s.screenToWorld(sx, sy)
            s.dragSegLastWX = wx
            s.dragSegLastWY = wy
          }
        }
      } else {
        s.isPanning = true
        s.workshop.selectedComponentId.value = null
        s.workshop.selectedWireId.value = null
      }
    }
    s.lastMouseX = e.clientX
    s.lastMouseY = e.clientY
    s.redraw()
  }

  function onMouseMove(e: MouseEvent) {
    const [sx, sy] = s.getMousePos(e)

    if (s.isDraggingProbe && s.draggingProbeCompId !== null) {
      const [wx, wy] = s.screenToWorld(sx, sy)
      const comp = s.workshop.components.find(c => c.id === s.draggingProbeCompId)
      if (comp) {
        if (s.draggingProbeType === 'black') {
          comp.probeBlack = { x: Math.round(wx / 20) * 20, y: Math.round(wy / 20) * 20 }
        } else if (s.draggingProbeType === 'red') {
          comp.probeRed = { x: Math.round(wx / 20) * 20, y: Math.round(wy / 20) * 20 }
        }
        if (s.workshop.running.value) s.workshop.solve()
      }
      s.redraw()
      return
    }

    if (s.isDraggingClamp && s.draggingClampCompId !== null) {
      const [wx, wy] = s.screenToWorld(sx, sy)
      const comp = s.workshop.components.find(c => c.id === s.draggingClampCompId)
      if (comp) {
        comp.clampPos = { x: Math.round(wx / 20) * 20, y: Math.round(wy / 20) * 20 }
        if (s.workshop.running.value) s.workshop.solve()
      }
      s.redraw()
      return
    }

    if (s.isDraggingWire && s.wireStart) {
      s.tempWireEnd = { x: sx, y: sy }
      s.redraw()
      return
    }

    if (s.isDraggingWirePoint) {
      const [wx, wy] = s.screenToWorld(sx, sy)
      s.workshop.moveWirePoint(s.draggingWireId, s.draggingPointIndex, wx, wy)
      if (s.workshop.running.value) s.workshop.solve()
      s.redraw()
      return
    }

    if (s.isDraggingWireSegment) {
      const [wx, wy] = s.screenToWorld(sx, sy)
      const dx = wx - s.dragSegLastWX
      const dy = wy - s.dragSegLastWY
      const wire = s.workshop.wires.find(w => w.id === s.dragSegWireId)
      if (wire) {
        if (s.dragSegIndex === 0) {
          if (wire.points.length > 0) {
            s.workshop.moveWirePoint(s.dragSegWireId, 0, wire.points[0].x + dx, wire.points[0].y + dy)
          }
        } else if (s.dragSegIndex === wire.points.length) {
          if (wire.points.length > 0) {
            const lastIdx = wire.points.length - 1
            s.workshop.moveWirePoint(s.dragSegWireId, lastIdx, wire.points[lastIdx].x + dx, wire.points[lastIdx].y + dy)
          }
        } else {
          if (wire.points[s.dragSegIndex - 1]) {
            s.workshop.moveWirePoint(s.dragSegWireId, s.dragSegIndex - 1, wire.points[s.dragSegIndex - 1].x + dx, wire.points[s.dragSegIndex - 1].y + dy)
          }
          if (wire.points[s.dragSegIndex]) {
            s.workshop.moveWirePoint(s.dragSegWireId, s.dragSegIndex, wire.points[s.dragSegIndex].x + dx, wire.points[s.dragSegIndex].y + dy)
          }
        }
      }
      s.dragSegLastWX = wx
      s.dragSegLastWY = wy
      if (s.workshop.running.value) s.workshop.solve()
      s.redraw()
      return
    }

    if (s.isDraggingComp && s.workshop.selectedComponentId.value !== null) {
      const [wx, wy] = s.screenToWorld(sx, sy)
      s.workshop.moveComponent(s.workshop.selectedComponentId.value, wx + s.dragOffsetX, wy + s.dragOffsetY)
      s.workshop.rerouteWiresForComponent(s.workshop.selectedComponentId.value)
      if (s.workshop.running.value) s.workshop.solve()

      if (s.draggedCompType === 'ammeter') {
        const wireHit = s.hitTestWire(sx, sy)
        const compId = s.workshop.selectedComponentId.value
        s.hoverWireId = (wireHit && wireHit.fromCompId !== compId && wireHit.toCompId !== compId) ? wireHit.id : null
      }

      s.redraw()
      return
    }

    if (s.isPanning) {
      s.panX.value += e.clientX - s.lastMouseX
      s.panY.value += e.clientY - s.lastMouseY
    }
    s.lastMouseX = e.clientX
    s.lastMouseY = e.clientY
    s.redraw()
  }

  function onMouseUp(e: MouseEvent) {
    const [sx, sy] = s.getMousePos(e)
    if (s.isDraggingWire && (s.wireStart || s.junctionStart)) {
      const termHit = s.hitTestTerminal(sx, sy)
      if (s.wireStart && termHit && termHit.comp.id !== s.wireStart.comp.id) {
        s.workshop.addWire(
          s.wireStart.comp.id, s.wireStart.termIndex,
          termHit.comp.id, termHit.termIndex,
          s.workshop.selectedWireColor.value,
        )
        if (s.workshop.running.value) s.workshop.solve()
      } else if (s.junctionStart && termHit) {
        s.workshop.addWireFromJunction(
          s.junctionStart.wireId, s.junctionStart.pointIndex,
          termHit.comp.id, termHit.termIndex,
          s.workshop.selectedWireColor.value,
        )
        if (s.workshop.running.value) s.workshop.solve()
      }
      s.wireStart = null
      s.junctionStart = null
      s.isDraggingWire = false
    }
    s.isPanning = false
    s.isDraggingComp = false
    s.isDraggingWirePoint = false
    s.isDraggingWireSegment = false
    s.isDraggingProbe = false
    s.draggingProbeCompId = null
    s.draggingProbeType = null
    s.isDraggingClamp = false
    s.draggingClampCompId = null

    for (const comp of s.workshop.components) {
      if (comp.type !== 'multimeter') continue
      const snapDist = 30
      const snapProbe = (probe: { x: number; y: number } | undefined): { x: number; y: number } | undefined => {
        if (!probe) return probe
        let bestDist = snapDist
        let bestPos = probe
        for (const c of s.workshop.components) {
          if (c.type === 'multimeter') continue
          for (const t of c.terminals) {
            const sc = c.scale ?? 1
            const r = c.rotation * Math.PI / 180
            const cos = Math.cos(r), sin = Math.sin(r)
            const tx = c.x + (t.dx * cos - t.dy * sin) * sc
            const ty = c.y + (t.dx * sin + t.dy * cos) * sc
            const d = Math.sqrt((tx - probe.x) ** 2 + (ty - probe.y) ** 2)
            if (d < bestDist) { bestDist = d; bestPos = { x: tx, y: ty } }
          }
        }
        return bestPos
      }
      if (comp.probeBlack) comp.probeBlack = snapProbe(comp.probeBlack)
      if (comp.probeRed) comp.probeRed = snapProbe(comp.probeRed)
    }
    if (s.workshop.running.value) s.workshop.solve()

    if (s.draggedCompType === 'ammeter' && s.workshop.selectedComponentId.value !== null) {
      const comp = s.workshop.components.find(c => c.id === s.workshop.selectedComponentId.value)
      if (comp && comp.type === 'ammeter') {
        const [csx, csy] = s.worldToScreen(comp.x, comp.y)
        const wireHit = s.hitTestWire(csx, csy)
        if (wireHit && wireHit.fromCompId !== comp.id && wireHit.toCompId !== comp.id) {
          s.workshop.insertAmmeterIntoWire(wireHit.id, comp.id)
          if (s.workshop.running.value) s.workshop.solve()
        }
      }
    }

    s.draggedCompType = null
    s.hoverWireId = null
    s.redraw()
  }

  return { onMouseDown, onMouseMove, onMouseUp }
}
