/**
 * Canvas 2D drawing helpers for the prism lab.
 */

import type { Point } from './prism-geometry'

export function clearCanvas(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#161B22'
  ctx.fillRect(0, 0, W, H)
}

export function drawPrismShape(
  ctx: CanvasRenderingContext2D,
  pA: Point,
  pB: Point,
  pC: Point
) {
  ctx.beginPath()
  ctx.moveTo(pA.x, pA.y)
  ctx.lineTo(pB.x, pB.y)
  ctx.lineTo(pC.x, pC.y)
  ctx.closePath()
  ctx.fillStyle = 'rgba(103, 232, 249, 0.06)'
  ctx.fill()
  ctx.strokeStyle = '#8B95A5'
  ctx.lineWidth = 2
  ctx.stroke()
}

export function drawIncidentRay(
  ctx: CanvasRenderingContext2D,
  sourceX: number,
  sourceY: number,
  p1: Point
) {
  ctx.beginPath()
  ctx.moveTo(sourceX, sourceY)
  ctx.lineTo(p1.x, p1.y)
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2.5
  ctx.shadowBlur = 10
  ctx.shadowColor = '#FFFFFF'
  ctx.stroke()
  ctx.shadowBlur = 0
}

export function drawRefractedRay(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  color: string,
  lineWidth = 1.5,
  shadow = false
) {
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  if (shadow) {
    ctx.shadowBlur = 4
    ctx.shadowColor = color
  } else {
    ctx.shadowBlur = 0
  }
  ctx.stroke()
}

export function drawTIRRay(
  ctx: CanvasRenderingContext2D,
  p2: Point,
  end: Point | null,
  color: string,
  reflectionAngle: number,
  fallbackLength = 100
) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(p2.x, p2.y)
  if (end) {
    ctx.lineTo(end.x, end.y)
  } else {
    ctx.lineTo(p2.x + Math.cos(reflectionAngle) * fallbackLength, p2.y + Math.sin(reflectionAngle) * fallbackLength)
  }
  ctx.strokeStyle = color
  ctx.setLineDash([3, 3])
  ctx.stroke()
  ctx.restore()
}

export function drawNormal(
  ctx: CanvasRenderingContext2D,
  p: Point,
  normalAngle: number,
  length = 40
) {
  ctx.save()
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(p.x - Math.cos(normalAngle) * length, p.y - Math.sin(normalAngle) * length)
  ctx.lineTo(p.x + Math.cos(normalAngle) * length, p.y + Math.sin(normalAngle) * length)
  ctx.stroke()
  ctx.restore()
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  p: Point,
  dx = -4,
  dy = -8
) {
  ctx.fillStyle = '#8B95A5'
  ctx.font = '12px Inter, Arial, sans-serif'
  ctx.fillText(text, p.x + dx, p.y + dy)
}
