<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { drawThinLens } from '../../../../composables/thinlens/useThinLensRenderer'

interface Props {
  lensType: 'convex' | 'concave'
  focalLength: number
  objectDistance: number
  objectHeight: number
  imageDistance: number | null
  imageHeight: number | null
  magnification: number | null
  running: boolean
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  drawThinLens(canvas, props)
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

onMounted(() => { resize(); window.addEventListener('resize', resize) })
onUnmounted(() => window.removeEventListener('resize', resize))
watch(() => [props.lensType, props.focalLength, props.objectDistance, props.objectHeight, props.imageDistance, props.imageHeight, props.running], draw, { deep: true })
</script>

<template>
  <canvas ref="canvasRef" class="lens-canvas" />
</template>

<style scoped>
.lens-canvas { width: 100%; height: 100%; border-radius: 8px; }
</style>
