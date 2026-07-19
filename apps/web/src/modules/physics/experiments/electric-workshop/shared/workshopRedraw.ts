import type { Ref } from 'vue'
import type { useWorkshop } from './useWorkshop'

type Workshop = ReturnType<typeof useWorkshop>

interface DragStateLike {
  wireStart: { comp: any; termIndex: number } | null
  junctionStart: { worldX: number; worldY: number } | null
  tempWireEnd: { x: number; y: number }
  hoverWireId: number | null
}

interface CanvasHelpers {
  worldToScreen: (x: number, y: number) => [number, number]
  draw: (canvas: HTMLCanvasElement, selectedCompId: number | null, selectedWireId: number | null, tempW: any) => void
}

export function createRedraw(
  canvasRef: Ref<HTMLCanvasElement | null>,
  zoom: Ref<number>,
  panX: Ref<number>,
  panY: Ref<number>,
  workshop: Workshop,
  dragState: DragStateLike,
  helpers: CanvasHelpers,
) {
  function redraw() {
    if (!canvasRef.value) return
    const ds = dragState
    const tempW = ds.wireStart || ds.junctionStart ? { fromX: 0, fromY: 0, toX: ds.tempWireEnd.x, toY: ds.tempWireEnd.y } : null
    if (ds.wireStart && canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      if (ctx) {
        const comp = ds.wireStart.comp
        const term = comp.terminals[ds.wireStart.termIndex]
        const s = comp.scale ?? 1
        const r = comp.rotation * Math.PI / 180
        const cos = Math.cos(r), sin = Math.sin(r)
        const dx = term.dx * s
        const dy = term.dy * s
        const wx = comp.x + dx * cos - dy * sin
        const wy = comp.y + dx * sin + dy * cos
        const [sfx, sfy] = [wx * zoom.value + panX.value, wy * zoom.value + panY.value]
        if (tempW) { tempW.fromX = sfx; tempW.fromY = sfy }
      }
    } else if (ds.junctionStart && canvasRef.value) {
      if (tempW) {
        tempW.fromX = ds.junctionStart.worldX * zoom.value + panX.value
        tempW.fromY = ds.junctionStart.worldY * zoom.value + panY.value
      }
    }
    helpers.draw(canvasRef.value, workshop.selectedComponentId.value, workshop.selectedWireId.value, tempW)

    if (ds.hoverWireId !== null && canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      if (ctx) {
        const wire = workshop.wires.find(w => w.id === ds.hoverWireId)
        if (wire) {
          const fromComp = workshop.components.find(c => c.id === wire.fromCompId)
          const toComp = workshop.components.find(c => c.id === wire.toCompId)
          if (fromComp && toComp) {
            const fromTerm = fromComp.terminals[wire.fromTerminalIndex]
            const toTerm = toComp.terminals[wire.toTerminalIndex]
            if (fromTerm && toTerm) {
              const s = fromComp.scale ?? 1
              const r1 = fromComp.rotation * Math.PI / 180
              const r2 = toComp.rotation * Math.PI / 180
              const fwx = fromComp.x + fromTerm.dx * s * Math.cos(r1) - fromTerm.dy * s * Math.sin(r1)
              const fwy = fromComp.y + fromTerm.dx * s * Math.sin(r1) + fromTerm.dy * s * Math.cos(r1)
              const twx = toComp.x + toTerm.dx * s * Math.cos(r2) - toTerm.dy * s * Math.sin(r2)
              const twy = toComp.y + toTerm.dx * s * Math.sin(r2) + toTerm.dy * s * Math.cos(r2)
              ctx.strokeStyle = 'rgba(34,197,94,0.6)'
              ctx.lineWidth = 6 * zoom.value
              ctx.lineCap = 'round'
              ctx.beginPath()
              const [sfx, sfy] = helpers.worldToScreen(fwx, fwy)
              ctx.moveTo(sfx, sfy)
              for (const p of wire.points) {
                const [px, py] = helpers.worldToScreen(p.x, p.y)
                ctx.lineTo(px, py)
              }
              const [stx, sty] = helpers.worldToScreen(twx, twy)
              ctx.lineTo(stx, sty)
              ctx.stroke()
            }
          }
        }
      }
    }
  }

  return { redraw }
}

export function getMousePos(canvasRef: Ref<HTMLCanvasElement | null>, e: MouseEvent): [number, number] {
  const c = canvasRef.value; if (!c) return [0, 0]
  const rect = c.getBoundingClientRect()
  return [e.clientX - rect.left, e.clientY - rect.top]
}

export function resizeCanvas(canvasRef: Ref<HTMLCanvasElement | null>, redraw: () => void) {
  const c = canvasRef.value; if (!c) return
  const parent = c.parentElement; if (!parent) return
  c.width = parent.clientWidth
  c.height = parent.clientHeight
  redraw()
}
