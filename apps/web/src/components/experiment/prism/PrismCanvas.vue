<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { drawPrism } from '../../../composables/prism/usePrismRenderer'

interface Props {
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

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  drawPrism(canvas, props)
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

let ro: ResizeObserver | null = null
onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  const parent = canvasRef.value?.parentElement
  if (parent) {
    ro = new ResizeObserver(resize)
    ro.observe(parent)
  }
})
onUnmounted(() => {
  window.removeEventListener('resize', resize)
  ro?.disconnect()
})
watch(() => [props.prismAngle, props.angleIncidence, props.wavelength, props.material, props.angleRefraction1, props.angleIncidence2, props.angleEmergence, props.deviation, props.n, props.totalInternalReflection, props.running], draw, { deep: true })
</script>

<template>
  <canvas ref="canvasRef" class="prism-canvas" />
</template>

<style scoped>
.prism-canvas { width: 100%; height: 100%; border-radius: 8px; }
</style>
