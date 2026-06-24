<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { drawPrism } from '../../../composables/prism/usePrismRenderer'
import { usePrismInteraction } from '../../../composables/prism/usePrismInteraction'
import type { DrawResult } from '../../../composables/prism/usePrismInteraction'
import { toDeg } from '../../../composables/prism/prism-geometry'

interface Props {
  prismAngle: number
  angleIncidence: number
  wavelength: number
  material: string
  hitRatio: number
  angleRefraction1: number | null
  angleIncidence2: number | null
  angleEmergence: number | null
  deviation: number | null
  n: number
  totalInternalReflection: boolean
  criticalAngle: number | null
  running: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:angleIncidence', v: number): void
  (e: 'update:prismAngle', v: number): void
  (e: 'update:hitRatio', v: number): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { activeTool, prismOffset, options, setTool, toggleOption, resetOffset } = usePrismInteraction()

const hoverTarget = ref<string | null>(null)
const dragTarget = ref<string | null>(null)
const lastGeometry = ref<DrawResult | null>(null)

let dragStartClientY = 0
let dragStartClientX = 0
let dragStartPrismAngle = 0
let dragStartOffsetX = 0
let dragStartOffsetY = 0
let dragStartHitRatio = 0.5

function getCanvasPos(e: PointerEvent): { cx: number; cy: number } {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return { cx: (e.clientX - rect.left) * scaleX, cy: (e.clientY - rect.top) * scaleY }
}

function hitTest(cx: number, cy: number): string | null {
  const g = lastGeometry.value
  if (!g) return null
  if (Math.hypot(cx - g.pA.x, cy - g.pA.y) < 16) return 'apex'
  if (Math.hypot(cx - g.srcX, cy - g.srcY) < 34) return 'source'
  if (pointInTri(cx, cy, g.pA, g.pB, g.pC)) return 'prism'
  return null
}

function pointInTri(px: number, py: number, a: {x:number;y:number}, b: {x:number;y:number}, c: {x:number;y:number}) {
  const d = (b.x-a.x)*(py-a.y)-(b.y-a.y)*(px-a.x)
  const e = (c.x-b.x)*(py-b.y)-(c.y-b.y)*(px-b.x)
  const f = (a.x-c.x)*(py-c.y)-(a.y-c.y)*(px-c.x)
  return (d>=0&&e>=0&&f>=0)||(d<=0&&e<=0&&f<=0)
}

function onPointerDown(e: PointerEvent) {
  const { cx, cy } = getCanvasPos(e)
  const hit = hitTest(cx, cy)
  if (!hit) return
  if (hit === 'prism' && activeTool.value !== 'move') return
  if ((hit === 'source' || hit === 'apex') && activeTool.value === 'move') return
  dragTarget.value = hit
  dragStartClientY = e.clientY
  dragStartClientX = e.clientX
  dragStartPrismAngle = props.prismAngle
  dragStartOffsetX = prismOffset.x
  dragStartOffsetY = prismOffset.y
  dragStartHitRatio = props.hitRatio
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragTarget.value) {
    const { cx, cy } = getCanvasPos(e)
    hoverTarget.value = hitTest(cx, cy)
    draw(); return
  }
  const dy = e.clientY - dragStartClientY
  const dx = e.clientX - dragStartClientX
  const g = lastGeometry.value

  if (dragTarget.value === 'source' && g) {
    const canvas = canvasRef.value!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const dx = e.clientX - dragStartClientX
    const edgeLen = Math.hypot(g.pB.x - g.pA.x, g.pB.y - g.pA.y)
    const edgeDirX = edgeLen > 0 ? (g.pB.x - g.pA.x) / edgeLen : 1
    const projectedDx = (dx * scaleX) * edgeDirX
    const newHit = Math.max(0.05, Math.min(0.95, dragStartHitRatio + projectedDx / edgeLen))
    if (Math.abs(newHit - props.hitRatio) > 0.001) emit('update:hitRatio', newHit)
    const { cx, cy } = getCanvasPos(e)
    const newAngle = toDeg(Math.atan2(g.p1.y - cy, g.p1.x - cx) - (g.normal1Angle + Math.PI))
    const clamped = Math.max(0, Math.min(89, Math.round(newAngle)))
    if (clamped !== props.angleIncidence) emit('update:angleIncidence', clamped)
  } else if (dragTarget.value === 'apex') {
    const newA = Math.max(30, Math.min(89, Math.round(dragStartPrismAngle + dy * 0.3)))
    if (newA !== props.prismAngle) emit('update:prismAngle', newA)
  } else if (dragTarget.value === 'prism') {
    const canvas = canvasRef.value!
    const rect = canvas.getBoundingClientRect()
    prismOffset.x = dragStartOffsetX + dx * (canvas.width / rect.width)
    prismOffset.y = dragStartOffsetY + dy * (canvas.height / rect.height)
    draw()
  }
}

function onPointerUp() { dragTarget.value = null }

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const result = drawPrism(canvas, props, prismOffset, options, hoverTarget.value, dragTarget.value)
  if (result) lastGeometry.value = result
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  canvas.width = parent.clientWidth
  canvas.height = parent.clientHeight
  draw()
}

const cursorMap: Record<string, string> = { source: 'ns-resize', apex: 'ns-resize', prism: 'grab' }
const cursor = ref('default')
watch(hoverTarget, (v) => { cursor.value = dragTarget.value ? 'grabbing' : (v ? cursorMap[v] ?? 'default' : 'default') })
watch(dragTarget, (v) => { cursor.value = v === 'prism' ? 'grabbing' : v ? 'ns-resize' : cursorMap[hoverTarget.value ?? ''] ?? 'default' })

let ro: ResizeObserver | null = null
onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  const parent = canvasRef.value?.parentElement
  if (parent) { ro = new ResizeObserver(resize); ro.observe(parent) }
})
onUnmounted(() => { window.removeEventListener('resize', resize); ro?.disconnect() })

watch(
  () => [props.prismAngle, props.angleIncidence, props.wavelength, props.material, props.hitRatio,
         props.deviation, props.n, props.totalInternalReflection, props.criticalAngle, props.running],
  draw, { deep: true }
)
watch(options, draw, { deep: true })
</script>

<template>
  <div class="canvas-wrap">
    <canvas
      ref="canvasRef"
      class="prism-canvas"
      :style="{ cursor }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />

    <div class="canvas-toolbar">
      <div class="tb-group">
        <button :class="['tb-btn', { active: activeTool === 'select' }]" title="Select (default)" @click="setTool('select')">⊹</button>
        <button :class="['tb-btn', { active: activeTool === 'move' }]" title="Move mode" @click="setTool('move')">✥</button>
      </div>
      <div class="tb-sep" />
      <button :class="['tb-btn icon', { active: options.showNormals }]" title="Normal Lines" @click="toggleOption('showNormals')">
        <span class="icon-label">N</span>
      </button>
      <button :class="['tb-btn icon', { active: options.showAllWavelengths }]" title="Show Spectrum" @click="toggleOption('showAllWavelengths')">
        <span class="icon-label">λ</span>
      </button>
      <button :class="['tb-btn icon', { active: options.showAngleArcs }]" title="Angle Arcs" @click="toggleOption('showAngleArcs')">
        <span class="icon-label">∠</span>
      </button>
      <button :class="['tb-btn icon', { active: options.showScreen }]" title="Virtual Screen" @click="toggleOption('showScreen')">
        <span class="icon-label">▐</span>
      </button>
      <button :class="['tb-btn icon', { active: options.showGrid }]" title="Grid" @click="toggleOption('showGrid')">
        <span class="icon-label">⊞</span>
      </button>
      <div class="tb-sep" />
      <button class="tb-btn" title="Reset view" @click="resetOffset(); draw()">⌂</button>
    </div>

    <div class="canvas-hint">
      <template v-if="activeTool === 'select'">
        <span>⊹ اسحب <b>مصدر الليزر</b> ↕ لتغيير θ₁</span>
        <span class="sep-dot">·</span>
        <span>اسحب <b>A</b> لتغيير زاوية المنشور</span>
      </template>
      <template v-else>
        <span>✥ اسحب <b>المنشور</b> لتحريكه على الشاشة</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.canvas-wrap { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; }
.prism-canvas { width: 100%; flex: 1; min-height: 0; border-radius: 8px; touch-action: none; display: block; }

.canvas-toolbar {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 3px;
  background: rgba(13,17,23,0.88); border: 1px solid rgba(45,54,69,0.8);
  border-radius: 8px; padding: 4px 6px;
  backdrop-filter: blur(8px); z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}
.tb-btn {
  width: 28px; height: 26px; border-radius: 5px; border: 1px solid transparent;
  background: transparent; color: #475569; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all .13s;
}
.tb-btn:hover { background: rgba(255,255,255,0.06); color: #94a3b8; }
.tb-btn.active { background: rgba(103,232,249,0.12); border-color: rgba(103,232,249,0.35); color: #67e8f9; }
.tb-btn .icon-label { font-size: 12px; font-weight: 700; font-family: monospace; }
.tb-sep { width: 1px; height: 18px; background: rgba(45,54,69,0.8); margin: 0 2px; }

.canvas-hint {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
  font-size: .66rem; color: rgba(100,116,139,0.55); pointer-events: none; z-index: 5;
}
.canvas-hint b { color: rgba(148,163,184,0.65); font-weight: 600; }
.sep-dot { opacity: 0.3; }
</style>
