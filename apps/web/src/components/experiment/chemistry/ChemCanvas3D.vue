<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { ChemistryContainer } from '../../../composables/chemistry/useChemistryExperiment'

const props = defineProps<{
  containers: ChemistryContainer[]
  selectedSubstance: string | null
}>()

const emit = defineEmits<{
  (e: 'pour', containerId: string): void
}>()

const canvasContainer = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls
let raycaster: THREE.Raycaster, mouse: THREE.Vector2
let animFrame: number

// Map container IDs to their 3D groups and liquid meshes
const objectMap = new Map<string, { group: THREE.Group; liquid: THREE.Mesh; body: THREE.Mesh }>()

function glassMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.05,
    transmission: 0.92, thickness: 0.4, transparent: true, opacity: 0.3,
    side: THREE.DoubleSide, clearcoat: 1,
  })
}

function metalMat(color: number) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 })
}

function buildScene() {
  const container = canvasContainer.value!
  const w = container.clientWidth, h = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b1220)

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
  camera.position.set(0, 3, 10)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.target.set(0, 0.5, 0)
  controls.maxPolarAngle = Math.PI / 2.1
  controls.minDistance = 4
  controls.maxDistance = 16
  controls.enableRotate = false

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2(-10, -10)

  // ── Light ──
  scene.add(new THREE.AmbientLight(0x5b8db8, 0.4))
  const sun = new THREE.DirectionalLight(0xffffff, 1.2)
  sun.position.set(5, 8, 5); sun.castShadow = true
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x67e8f9, 0.3)
  fill.position.set(-3, 4, -3); scene.add(fill)

  // ── Table ──
  const top = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 9), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }))
  top.position.y = -0.06; top.receiveShadow = true; scene.add(top)
  const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 12)
  const legMat = metalMat(0x2d3748)
  for (const [lx, lz] of [[-7, -3.5], [7, -3.5], [-7, 3.5], [7, 3.5]]) {
    const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(lx, -1.1, lz); leg.castShadow = true; scene.add(leg)
  }

  // ── Glassware from props ──
  for (const c of props.containers) {
    if (c.type === 'beaker') addBeaker(c.id, c.x / 100 - 3, c.y / 100 - 2, c)
    else if (c.type === 'erlenmeyer') addFlask(c.id, c.x / 100 - 3, c.y / 100 - 2, c)
  }

  // ── Burette ──
  addBurette(2.5, -0.5)

  // ── Burner ──
  addBurner(3.5, 2)

  // ── Floor & wall ──
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.95 }))
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.3; floor.receiveShadow = true; scene.add(floor)

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95 }))
  wall.position.set(0, 4.5, -9); wall.receiveShadow = true; scene.add(wall)

  // Click handler
  renderer.domElement.addEventListener('click', onClick)
  renderer.domElement.style.cursor = 'pointer'
}

function addBeaker(id: string, x: number, z: number, container: ChemistryContainer) {
  const g = new THREE.Group(); g.position.set(x, 0, z); const m = glassMat()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.7, 1.6, 32, 1, true), m)
  body.position.y = 0.8; body.castShadow = true; g.add(body)
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), m)
  bottom.rotation.x = -Math.PI / 2; g.add(bottom)
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.035, 8, 32), m)
  lip.rotation.x = Math.PI / 2; lip.position.y = 1.6; g.add(lip)

  // Liquid
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(container.color), metalness: 0, roughness: 0.3,
    transmission: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
  })
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.01, 32), liquidMat)
  liquid.position.y = 0.02; g.add(liquid)

  scene.add(g)
  objectMap.set(id, { group: g, liquid, body })
}

function addFlask(id: string, x: number, z: number, container: ChemistryContainer) {
  const g = new THREE.Group(); g.position.set(x, 0, z); const m = glassMat()
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.3, 32, 1, true), m)
  body.position.y = 0.65; body.castShadow = true; g.add(body)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 32, 1, true), m)
  neck.position.y = 1.65; neck.castShadow = true; g.add(neck)
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 32), m)
  lip.rotation.x = Math.PI / 2; lip.position.y = 2.0; g.add(lip)

  // Liquid
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(container.color), metalness: 0, roughness: 0.3,
    transmission: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
  })
  const liquid = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.01, 32), liquidMat)
  liquid.position.y = 0.02; g.add(liquid)

  scene.add(g)
  objectMap.set(id, { group: g, liquid, body })
}

function addBurette(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  const metal = metalMat(0x2d3748), glass = glassMat()
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.4), metal)
  base.position.y = 0.04; base.castShadow = true; g.add(base)
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.5, 12), metal)
  rod.position.set(-0.45, 2.75, 0); g.add(rod)
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.8, 24, 1, true), glass)
  tube.position.set(0.25, 3.2, 0); tube.castShadow = true; g.add(tube)
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 12), glass)
  tip.position.set(0.25, 1.12, 0); g.add(tip)
  scene.add(g)
}

function addBurner(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  const metal = metalMat(0x475569)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.12, 24), metal)
  base.position.y = 0.06; base.castShadow = true; g.add(base)
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.1, 16), metal)
  tube.position.y = 0.65; tube.castShadow = true; g.add(tube)
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.5, 12),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.7 })
  )
  flame.position.y = 1.35; g.add(flame)
  scene.add(g)
}

function onClick(e: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)

  // Collect all glassware body meshes for raycasting
  const bodies: THREE.Mesh[] = []
  for (const [, obj] of objectMap) bodies.push(obj.body)

  const hits = raycaster.intersectObjects(bodies, false)
  if (hits.length > 0) {
    const hitBody = hits[0].object as THREE.Mesh
    // Find which container this body belongs to
    for (const [id, obj] of objectMap) {
      if (obj.body === hitBody) {
        if (props.selectedSubstance) {
          emit('pour', id)
        }
        return
      }
    }
  }
}

function updateLiquids() {
  for (const container of props.containers) {
    const obj = objectMap.get(container.id)
    if (!obj) continue
    const mat = obj.liquid.material as THREE.MeshPhysicalMaterial
    mat.color.set(container.color)
    // Scale liquid height based on volume (0-250ml)
    const fillRatio = container.volume / 250
    if (container.type === 'beaker') {
      obj.liquid.scale.y = Math.max(0.01, fillRatio * 50)
      obj.liquid.position.y = 0.02 + (obj.liquid.geometry as THREE.CylinderGeometry).parameters.height * obj.liquid.scale.y / 2
    } else if (container.type === 'erlenmeyer') {
      obj.liquid.scale.y = Math.max(0.01, fillRatio * 60)
      obj.liquid.position.y = 0.02 + (obj.liquid.geometry as THREE.ConeGeometry).parameters.height * obj.liquid.scale.y / 2
    }
  }
}

function render() {
  animFrame = requestAnimationFrame(render)
  updateLiquids()
  controls.update()
  renderer.render(scene, camera)
}

function onResize() {
  const c = canvasContainer.value
  if (!c || !camera || !renderer) return
  const w = c.clientWidth, h = c.clientHeight
  camera.aspect = w / h; camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

let ro: ResizeObserver | null = null
onMounted(() => { buildScene(); render(); ro = new ResizeObserver(onResize); if (canvasContainer.value) ro.observe(canvasContainer.value) })
onUnmounted(() => { cancelAnimationFrame(animFrame); ro?.disconnect(); renderer?.domElement.removeEventListener('click', onClick); renderer?.dispose() })

watch(() => props.containers, updateLiquids, { deep: true })
</script>

<template>
  <div ref="canvasContainer" class="chem-3d" />
</template>

<style scoped>
.chem-3d { width: 100%; height: 100%; border-radius: 8px; overflow: hidden; }
.chem-3d :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
</style>
