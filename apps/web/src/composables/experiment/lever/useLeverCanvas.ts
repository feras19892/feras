import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { LeverParams, LeverState } from '../../../modules/physics/experiments/lever/useLeverPhysics'
import { snapPosition } from '../../lever/leverUtils'
import { useI18n } from '../../useI18n'
import {
  drawBackground, drawRuler, drawFloor, drawBeam,
  drawPivot, drawBall, drawForce, drawStatusBadge,
} from './lever-drawers'

export function useLeverCanvas(
  getParams: () => LeverParams,
  getSimState: () => LeverState,
  emit: {
    removeBall: (id: number) => void
    moveBall: (id: number, x: number) => void
    setBallMass: (id: number, mass: number) => void
    removeForce: (id: number) => void
    moveForce: (id: number, x: number) => void
  }
) {
  const { t } = useI18n()
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const wrapRef = ref<HTMLDivElement | null>(null)

  let draggingId: number | null = null
  let dragType: 'ball' | 'force' | null = null

  const hoverTarget = ref<{ type: 'ball' | 'force'; id: number } | null>(null)
  const hoverPx = ref(0)
  const hoverPy = ref(0)

  let currentTilt = 0
  let animRaf: number | null = null

  function animateTilt() {
    const target = getSimState().tiltDeg * Math.PI / 180
    const diff = target - currentTilt
    if (Math.abs(diff) < 0.001) {
      currentTilt = target
      draw()
      return
    }
    currentTilt += diff * 0.15
    draw()
    animRaf = requestAnimationFrame(animateTilt)
  }

  function getScreenPos(worldX: number, worldY: number) {
    const canvas = canvasRef.value
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2 + 40
    const scale = (w - 80) / getParams().beamLength
    const px = cx + worldX * scale
    const py = cy + worldY
    return { x: rect.left + px, y: rect.top + py }
  }

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width, h = canvas.height
    const params = getParams()
    const st = getSimState()

    drawBackground(ctx, w, h)
    drawFloor(ctx, w, h)

    const cx = w / 2
    const cy = h / 2 + 40
    const scale = (w - 80) / params.beamLength
    const halfLen = (params.beamLength / 2) * scale

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(currentTilt)

    drawRuler(ctx, scale, currentTilt, params.beamLength)
    drawBeam(ctx, halfLen)
    drawPivot(ctx)

    for (const b of st.balls) drawBall(ctx, b, scale, currentTilt)
    for (const f of st.forces) drawForce(ctx, f, scale)

    ctx.restore()

    drawStatusBadge(ctx, w, st.isBalanced, st.netTorque, t)
  }

  function toWorldX(clientX: number): number {
    const canvas = canvasRef.value
    if (!canvas) return 0
    const rect = canvas.getBoundingClientRect()
    const cx = canvas.width / 2
    const scale = (canvas.width - 80) / getParams().beamLength
    return (clientX - rect.left - cx) / scale
  }

  function onPointerDown(e: PointerEvent) {
    const x = toWorldX(e.clientX)
    const params = getParams()
    const st = getSimState()
    const snapped = snapPosition(x, params.snapStep, params.beamLength)
    const hitBall = st.balls.find(b => Math.abs(b.x - snapped) < 0.3)
    const hitForce = st.forces.find(f => Math.abs(f.x - snapped) < 0.3)
    if (hitBall) {
      dragType = 'ball'
      draggingId = hitBall.id
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } else if (hitForce) {
      dragType = 'force'
      draggingId = hitForce.id
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (draggingId !== null && dragType !== null) {
      const x = toWorldX(e.clientX)
      if (dragType === 'ball') emit.moveBall(draggingId, x)
      else emit.moveForce(draggingId, x)
      return
    }
    const x = toWorldX(e.clientX)
    const params = getParams()
    const st = getSimState()
    const snapped = snapPosition(x, params.snapStep, params.beamLength)
    const hitBall = st.balls.find(b => Math.abs(b.x - snapped) < 0.35)
    const hitForce = st.forces.find(f => Math.abs(f.x - snapped) < 0.35)
    if (hitBall) {
      hoverTarget.value = { type: 'ball', id: hitBall.id }
      const r = 8 + hitBall.mass * 4
      const pos = getScreenPos(hitBall.x, -r - 6 - r - 4)
      hoverPx.value = pos.x
      hoverPy.value = pos.y
    } else if (hitForce) {
      hoverTarget.value = { type: 'force', id: hitForce.id }
      const arrowLen = (hitForce.force / 100) * 60
      const pos = getScreenPos(hitForce.x, -arrowLen - 20 - 10)
      hoverPx.value = pos.x
      hoverPy.value = pos.y
    } else {
      hoverTarget.value = null
    }
  }

  function onPointerUp() {
    draggingId = null
    dragType = null
  }

  function deleteHover() {
    if (!hoverTarget.value) return
    if (hoverTarget.value.type === 'ball') emit.removeBall(hoverTarget.value.id)
    else emit.removeForce(hoverTarget.value.id)
    hoverTarget.value = null
  }

  function onDblClick(e: MouseEvent) {
    const x = toWorldX(e.clientX)
    const params = getParams()
    const st = getSimState()
    const snapped = snapPosition(x, params.snapStep, params.beamLength)
    const hitBall = st.balls.find(b => Math.abs(b.x - snapped) < 0.3)
    const hitForce = st.forces.find(f => Math.abs(f.x - snapped) < 0.3)
    if (hitBall) {
      const val = prompt(t('experiments.changeBallMassPrompt').replace('{mass}', String(hitBall.mass)), String(hitBall.mass))
      if (val !== null) {
        const num = parseFloat(val)
        if (!isNaN(num) && num > 0) emit.setBallMass(hitBall.id, num)
      }
    } else if (hitForce) {
      if (confirm(t('experiments.deleteForceConfirm'))) emit.removeForce(hitForce.id)
    }
  }

  watch(() => getSimState().tiltDeg, () => {
    if (animRaf) cancelAnimationFrame(animRaf)
    animateTilt()
  })
  watch(() => [getSimState().balls.length, getSimState().forces.length, getSimState().netTorque], draw, { deep: true })

  let ro: ResizeObserver | null = null
  onMounted(() => {
    const canvas = canvasRef.value
    const wrap = wrapRef.value
    if (!canvas || !wrap) return
    const resize = () => {
      canvas.width = wrap.clientWidth
      canvas.height = wrap.clientHeight
      draw()
    }
    resize()
    ro = new ResizeObserver(resize)
    ro.observe(wrap)
  })
  onUnmounted(() => { if (ro) ro.disconnect() })

  return {
    canvasRef,
    wrapRef,
    hoverTarget,
    hoverPx,
    hoverPy,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    deleteHover,
    onDblClick,
  }
}
