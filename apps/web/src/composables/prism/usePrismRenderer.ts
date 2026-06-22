import { prismVertices, toRad, lineIntersection } from './prism-geometry'
import { traceRay } from './prism-raytracer'
import { clearCanvas, drawPrismShape, drawIncidentRay, drawRefractedRay, drawTIRRay, drawNormal, drawLabel } from './prism-drawing'
import type { Point } from './prism-geometry'

interface PrismProps {
  prismAngle: number
  angleIncidence: number
  wavelength: number
  material: string
  angleRefraction1: number | null
  angleIncidence2: number | null
  angleEmergence: number | null
  deviation: number | null
  n: number
  totalInternalReflection: boolean
  running: boolean
}

const SPECTRUM = [
  { wavelength: 650, color: '#FF0000', label: 'الأحمر' },
  { wavelength: 600, color: '#FF7F00', label: 'البرتقالي' },
  { wavelength: 580, color: '#FFFF00', label: 'الأصفر' },
  { wavelength: 530, color: '#00FF00', label: 'الأخضر' },
  { wavelength: 470, color: '#0000FF', label: 'الأزرق' },
  { wavelength: 430, color: '#4B0082', label: 'النيلي' },
  { wavelength: 400, color: '#8B00FF', label: 'البنفسجي' }
]

export function drawPrism(canvas: HTMLCanvasElement, props: PrismProps) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height

  clearCanvas(ctx, W, H)

  const prismSize = Math.min(W, H) * 0.5
  const centerX = W * 0.52
  const centerY = H * 0.55

  const { pA, pB, pC, edgeAB_angle } = prismVertices(props.prismAngle, prismSize, centerX, centerY)
  const normal1Angle = edgeAB_angle + Math.PI / 2

  drawPrismShape(ctx, pA, pB, pC)

  const p1: Point = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 }
  const incidentRayAngle = normal1Angle + Math.PI + toRad(props.angleIncidence)
  const sourceX = 0
  const sourceY = p1.y + (sourceX - p1.x) * Math.tan(incidentRayAngle)

  drawIncidentRay(ctx, sourceX, sourceY, p1)

  SPECTRUM.forEach((ray) => {
    const result = traceRay(p1, pA, pB, pC, props.angleIncidence, ray.wavelength, props.material, edgeAB_angle, normal1Angle)
    if (!result) return

    const isSelected = Math.abs(ray.wavelength - props.wavelength) <= 10
    ctx.save()
    ctx.globalAlpha = isSelected ? 1 : 0.22

    drawRefractedRay(ctx, p1, result.p2, ray.color, isSelected ? 2.2 : 1.3, false)

    if (result.tir && result.reflectionAngle !== null) {
      const pBase = lineIntersection(
        result.p2,
        { x: result.p2.x + Math.cos(result.reflectionAngle) * 1e6, y: result.p2.y + Math.sin(result.reflectionAngle) * 1e6 },
        pB, pC, true
      )
      drawTIRRay(ctx, result.p2, pBase, ray.color, result.reflectionAngle)
    } else if (result.emergentAngle !== null) {
      const exitLength = W * 1.5
      const pExitEnd: Point = {
        x: result.p2.x + Math.cos(result.emergentAngle) * exitLength,
        y: result.p2.y + Math.sin(result.emergentAngle) * exitLength
      }
      drawRefractedRay(ctx, result.p2, pExitEnd, ray.color, isSelected ? 2.6 : 1.6, isSelected)
    }

    ctx.restore()
  })

  drawNormal(ctx, p1, normal1Angle, 40)
  drawLabel(ctx, 'A', pA)
}
