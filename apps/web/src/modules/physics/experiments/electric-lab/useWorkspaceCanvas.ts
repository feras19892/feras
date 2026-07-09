import type { Ref } from 'vue'
import type { CircuitComponent } from './types'
import type { CanvasContext, WorkspaceProps } from './workspaceTypes'
import { drawComponent } from './workspaceDrawComponent'
import { drawWires } from './workspaceDrawWires'

const GRID_SIZE = 20
const COMP_W = 80
const COMP_H = 40

export function useWorkspaceCanvas(
  zoom: Ref<number>,
  panX: Ref<number>,
  panY: Ref<number>,
  props: WorkspaceProps,
) {
  function worldToScreen(x: number, y: number): [number, number] {
    return [x * zoom.value + panX.value, y * zoom.value + panY.value]
  }

  function screenToWorld(sx: number, sy: number): [number, number] {
    return [(sx - panX.value) / zoom.value, (sy - panY.value) / zoom.value]
  }

  function hitTest(sx: number, sy: number): CircuitComponent | null {
    for (let i = props.components.length - 1; i >= 0; i--) {
      const c = props.components[i]
      const [cx, cy] = worldToScreen(c.x, c.y)
      if (sx >= cx - COMP_W * zoom.value / 2 && sx <= cx + COMP_W * zoom.value / 2 &&
          sy >= cy - COMP_H * zoom.value / 2 && sy <= cy + COMP_H * zoom.value / 2) {
        return c
      }
    }
    return null
  }

  const cc: CanvasContext = { zoom, panX, panY, worldToScreen }

  function draw(canvas: HTMLCanvasElement, selectedId: number | null) {
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H)
    const gs = GRID_SIZE * zoom.value
    const ox = panX.value % gs, oy = panY.value % gs
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = ox; x < W; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, H) }
    for (let y = oy; y < H; y += gs) { ctx.moveTo(0, y); ctx.lineTo(W, y) }
    ctx.stroke()
    drawWires(ctx, cc, props)
    for (const comp of props.components) { drawComponent(ctx, comp, selectedId, cc, props) }
    ctx.fillStyle = '#475569'; ctx.font = '0.7rem sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`Zoom: ${zoom.value.toFixed(2)}x`, 10, 20)
    ctx.fillText(`مكونات: ${props.components.length}`, 10, 38)
    if (props.components.length === 0) {
      ctx.fillStyle = '#334155'; ctx.font = '0.85rem sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('انقر على أداة من القائمة لإضافتها', W / 2, H / 2)
    }
  }

  return { worldToScreen, screenToWorld, hitTest, draw }
}
