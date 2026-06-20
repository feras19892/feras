import { drawSpringDigital } from './drawSpringDigital'
import { drawSpringScene } from './useSpringScene'
import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'

interface SimState {
  x: number; v: number; t: number; running: boolean; paused: boolean
}

export function useSpringDraw(
  canvasRef: { value: HTMLCanvasElement | null },
  params: SpringParams,
  simState: SimState
) {
  function resizeCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    const wrap = canvas.parentElement as HTMLDivElement
    if (!wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
  }

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    resizeCanvas()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, w, h)

    const { massY, natEqY, staticStretchCm, pxPerCm } = drawSpringScene(ctx, w, h, params, simState)
    drawSpringDigital(ctx, w, params, simState, massY, natEqY, staticStretchCm, pxPerCm)
  }

  return { draw, resizeCanvas }
}
