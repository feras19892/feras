import type { ACCanvasState } from './acCanvasState'
import { onMouseDown, onMouseMove, onMouseUp } from './acMouseEvents'

export function onWheel(s: ACCanvasState, e: WheelEvent) {
  const [sx, sy] = s.getMousePos(e as unknown as MouseEvent)

  if (s.workshop.selectedComponentId.value !== null) {
    const comp = s.workshop.components.find(c => c.id === s.workshop.selectedComponentId.value)
    if (comp) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = (comp.scale ?? 1) * delta
      s.workshop.setComponentScale(comp.id, newScale)
      s.workshop.rerouteAllWires()
      if (s.workshop.running.value) s.workshop.solve()
      s.redraw()
      return
    }
  }

  const [wxBefore, wyBefore] = s.screenToWorld(sx, sy)
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  s.zoom.value = Math.max(0.3, Math.min(3, s.zoom.value * delta))
  const [wxAfter, wyAfter] = s.screenToWorld(sx, sy)
  s.panX.value += (wxAfter - wxBefore) * s.zoom.value
  s.panY.value += (wyAfter - wyBefore) * s.zoom.value
  s.redraw()
}

export function onDblClick(s: ACCanvasState, e: MouseEvent) {
  const [sx, sy] = s.getMousePos(e)
  const wireHit = s.hitTestWire(sx, sy)
  if (wireHit) {
    s.workshop.selectedWireId.value = wireHit.id
    s.workshop.selectedComponentId.value = null
    s.editingWire.value = wireHit
    s.editWireColor.value = wireHit.color
    s.editWireThickness.value = wireHit.thickness
    s.showWireEditor.value = true
    return
  }
  const hit = s.hitTestComponent(sx, sy)
  if (hit) {
    if (hit.type === 'switch') {
      s.workshop.toggleSwitch(hit.id)
      if (s.workshop.running.value) s.workshop.solve()
    } else if (hit.type === 'multimeter') {
      const modes = ['voltage', 'current', 'resistance'] as const
      const cur = hit.multimeterMode || 'voltage'
      const idx = modes.indexOf(cur)
      const next = modes[(idx + 1) % modes.length]
      s.workshop.setMultimeterMode(hit.id, next)
    } else if (hit.type === 'breaker' && hit.breakerTripped) {
      s.workshop.resetBreaker(hit.id)
      if (s.workshop.running.value) s.workshop.solve()
    } else if (hit.type === 'fuse' && hit.fuseBlown) {
      s.workshop.resetFuse(hit.id)
      if (s.workshop.running.value) s.workshop.solve()
    }
    s.redraw()
  }
}

export function onTouchStart(s: ACCanvasState, e: TouchEvent) {
  const t = e.touches[0]
  onMouseDown(s, { clientX: t.clientX, clientY: t.clientY } as MouseEvent)
}

export function onTouchMove(s: ACCanvasState, e: TouchEvent) {
  const t = e.touches[0]
  onMouseMove(s, { clientX: t.clientX, clientY: t.clientY } as MouseEvent)
}

export function onTouchEnd(s: ACCanvasState, _e: TouchEvent) {
  onMouseUp(s, { clientX: s.lastMouseX, clientY: s.lastMouseY } as MouseEvent)
}

export function onKeyDown(s: ACCanvasState, e: KeyboardEvent) {
  // If focus is on an input field, let the key work normally (don't delete component)
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (s.workshop.selectedComponentId.value !== null) {
      s.workshop.removeComponent(s.workshop.selectedComponentId.value)
      if (s.workshop.running.value) s.workshop.solve()
    } else if (s.workshop.selectedWireId.value !== null) {
      s.workshop.removeWire(s.workshop.selectedWireId.value)
      if (s.workshop.running.value) s.workshop.solve()
    }
    s.redraw()
  } else if (e.key === 'r' || e.key === 'R') {
    if (s.workshop.selectedComponentId.value !== null) {
      s.workshop.rotateComponent(s.workshop.selectedComponentId.value)
      s.redraw()
    }
  } else if (e.key === ' ') {
    e.preventDefault()
    s.toggleRun()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    s.workshop.undo()
    s.redraw()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
    e.preventDefault()
    s.workshop.redo()
    s.redraw()
  }
}