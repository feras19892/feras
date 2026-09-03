<script setup lang="ts">

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { drawMirror } from '../../../composables/mirror/useMirrorRenderer'
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();

interface Props {
  mirrorType: 'concave' | 'convex'
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
  drawMirror(canvas, props, t)
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
watch(() => [props.mirrorType, props.focalLength, props.objectDistance, props.objectHeight, props.imageDistance, props.imageHeight, props.running], draw, { deep: true })
</script>

<template>
  <canvas ref="canvasRef" class="mirror-canvas" />
</template>

<style scoped>
.mirror-canvas { width: 100%; height: 100%; border-radius: 8px; }
</style>
