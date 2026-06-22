import { prismVertices, toRad, toDeg, lineIntersection } from './prism-geometry'
import { traceRay } from './prism-raytracer'
import {
  clearCanvas, drawPrismShape, drawLaserRay, drawLaserSource,
  drawRefractedRay, drawTIRRay, drawNormal, drawLabel,
  drawAngleArc, drawVirtualScreen, drawTIRFlash, drawApexHandle,
} from './prism-drawing'
import type { Point } from './prism-geometry'
import type { ViewOptions, DrawResult } from './usePrismInteraction'

interface PrismProps {
  prismAngle: number
  angleIncidence: number
  wavelength: number
  material: string
  hitRatio: number
  angleRefraction1: number | null
  deviation: number | null
  n: number
  totalInternalReflection: boolean
  criticalAngle: number | null
  running: boolean
}

const SPECTRUM = [
  { wavelength: 400, color: '#9400D3' },
  { wavelength: 430, color: '#4B0082' },
  { wavelength: 470, color: '#2244DD' },
  { wavelength: 530, color: '#00BB00' },
  { wavelength: 580, color: '#CCCC00' },
  { wavelength: 600, color: '#FF7700' },
  { wavelength: 650, color: '#EE1111' },
]

const SRC_DIST = 150

export function drawPrism(
  canvas: HTMLCanvasElement,
  props: PrismProps,
  offset: { x: number; y: number },
  options: ViewOptions,
  hoverTarget: string | null,
  dragTarget: string | null
): DrawResult | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const W = canvas.width, H = canvas.height

  clearCanvas(ctx, W, H, options.showGrid)

  const screenX = W - 70
  const prismSize = Math.min(W, H) * 0.48
  const centerX = W * 0.50 + offset.x
  const centerY = H * 0.53 + offset.y

  const { pA, pB, pC, edgeAB_angle } = prismVertices(props.prismAngle, prismSize, centerX, centerY)
  const normal1Angle = edgeAB_angle + Math.PI / 2
  const hr = Math.max(0.05, Math.min(0.95, props.hitRatio))
  const p1: Point = { x: pA.x + hr * (pB.x - pA.x), y: pA.y + hr * (pB.y - pA.y) }

  const incidentRayAngle = normal1Angle + Math.PI + toRad(props.angleIncidence)
  const srcDist = Math.min(SRC_DIST, p1.x - 15)
  const srcX = p1.x - Math.cos(incidentRayAngle) * srcDist
  const srcY = p1.y - Math.sin(incidentRayAngle) * srcDist

  const isDraggingPrism = dragTarget === 'prism'

  if (props.totalInternalReflection) drawTIRFlash(ctx, pA, pB, pC)
  drawPrismShape(ctx, pA, pB, pC, isDraggingPrism)

  if (options.showNormals) drawNormal(ctx, p1, normal1Angle, 60)
  drawLabel(ctx, 'A', pA, -16, -10)

  // ── Draw all spectrum rays ──────────────────────────────────────────────
  const screenHits: { y: number; color: string }[] = []

  SPECTRUM.forEach((ray) => {
    const result = traceRay(p1, pA, pB, pC, props.angleIncidence, ray.wavelength, props.material, edgeAB_angle, normal1Angle)
    if (!result) return

    const isSelected = Math.abs(ray.wavelength - props.wavelength) <= 15
    const alpha = options.showAllWavelengths ? (isSelected ? 1 : 0.22) : (isSelected ? 1 : 0)

    ctx.save(); ctx.globalAlpha = alpha

    drawRefractedRay(ctx, p1, result.p2, ray.color, isSelected ? 2.8 : 1.2, false)

    if (result.tir && result.reflectionAngle !== null) {
      const pBase = lineIntersection(
        result.p2,
        { x: result.p2.x + Math.cos(result.reflectionAngle) * 1e6, y: result.p2.y + Math.sin(result.reflectionAngle) * 1e6 },
        pB, pC, true
      )
      drawTIRRay(ctx, result.p2, pBase, ray.color, result.reflectionAngle)
    } else if (result.emergentAngle !== null) {
      const limitX = options.showScreen ? screenX : W * 1.5
      const pEnd: Point = {
        x: result.p2.x + Math.cos(result.emergentAngle) * limitX * 2,
        y: result.p2.y + Math.sin(result.emergentAngle) * limitX * 2,
      }
      drawRefractedRay(ctx, result.p2, pEnd, ray.color, isSelected ? 3 : 1.4, isSelected)
      if (options.showScreen) {
        const hitY = result.p2.y + (screenX - result.p2.x) * Math.tan(result.emergentAngle)
        screenHits.push({ y: hitY, color: ray.color })
      }
    }

    ctx.restore()
  })

  // ── Incident ray ───────────────────────────────────────────────────────
  if (!props.totalInternalReflection) {
    drawLaserRay(ctx, srcX, srcY, p1)
  }

  // ── Virtual screen ─────────────────────────────────────────────────────
  if (options.showScreen && screenHits.length) {
    drawVirtualScreen(ctx, screenX, H, screenHits)
  }

  // ── Angle arcs ─────────────────────────────────────────────────────────
  if (options.showAngleArcs) {
    if (props.angleIncidence > 0.5) {
      const incDir = normal1Angle + toRad(props.angleIncidence)
      drawAngleArc(ctx, p1, normal1Angle, incDir, 34, '#67e8f9', `θ₁=${props.angleIncidence.toFixed(0)}°`)
    }
    if (props.angleRefraction1 !== null && props.angleRefraction1 > 0.3) {
      const selectedResult = traceRay(p1, pA, pB, pC, props.angleIncidence, props.wavelength, props.material, edgeAB_angle, normal1Angle)
      if (selectedResult) {
        drawAngleArc(ctx, p1, normal1Angle + Math.PI, selectedResult.refractedRayAngle, 28, '#4ade80', `r₁=${props.angleRefraction1.toFixed(1)}°`)
        if (!selectedResult.tir && selectedResult.emergentAngle !== null && props.deviation !== null) {
          const { edgeP, edgeQ } = selectedResult
          const faceDir = { x: edgeQ.x - edgeP.x, y: edgeQ.y - edgeP.y }
          const faceLen = Math.hypot(faceDir.x, faceDir.y)
          const fT = faceLen > 1e-9 ? { x: faceDir.x / faceLen, y: faceDir.y / faceLen } : { x: 1, y: 0 }
          const nCand = { x: -fT.y, y: fT.x }
          const midEdge = { x: (edgeP.x + edgeQ.x) / 2, y: (edgeP.y + edgeQ.y) / 2 }
          const thirdVertex = Math.hypot(edgeP.x - pA.x, edgeP.y - pA.y) < 1 ? pB : pA
          const toThird = { x: thirdVertex.x - midEdge.x, y: thirdVertex.y - midEdge.y }
          const outN2 = (nCand.x * toThird.x + nCand.y * toThird.y < 0) ? nCand : { x: fT.y, y: -fT.x }
          const outNorm2Angle = Math.atan2(outN2.y, outN2.x)
          drawAngleArc(ctx, selectedResult.p2, outNorm2Angle, selectedResult.refractedRayAngle, 26, '#fbbf24', `r₂=${selectedResult.internalIncidentAngle ? toDeg(selectedResult.internalIncidentAngle).toFixed(1) : '?'}°`)
          drawAngleArc(ctx, selectedResult.p2, outNorm2Angle, selectedResult.emergentAngle, 36, '#f87171', `θ₂`)
        }
      }
    }
  }

  // ── Interactive handles ────────────────────────────────────────────────
  drawApexHandle(ctx, pA, hoverTarget === 'apex', dragTarget === 'apex')
  drawLaserSource(ctx, srcX, srcY, dragTarget === 'source', hoverTarget === 'source')

  return { pA, pB, pC, p1, normal1Angle, srcX, srcY }
}
