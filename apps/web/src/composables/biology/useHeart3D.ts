import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createHeartGeometry, createAortaGeometry, createHeartMaterial } from './heart-geometry';
import { addLights } from './biology-geometry';

export interface HeartPart {
  id: string;
  nameKey: string;
  descriptionKey: string;
  longDescriptionKey?: string;
  factsKeys?: string[];
  position: [number, number, number];
  color: string;
}

export function useHeart3D(containerRef: Ref<HTMLDivElement | null>, parts: HeartPart[]) {
  const error = ref<string | null>(null);
  const selectedPartId = ref<string | null>(null);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let heartMesh: THREE.Mesh | null = null;
  let aortaMesh: THREE.Mesh | null = null;
  const partMeshes = new Map<string, THREE.Mesh>();

  const getWorldPosition = (id: string): THREE.Vector3 | null => {
    const mesh = partMeshes.get(id);
    return mesh ? mesh.position.clone() : null;
  };

  const highlight = (id: string | null): void => {
    selectedPartId.value = id;
    for (const [partId, mesh] of partMeshes.entries()) {
      const material = mesh.material as THREE.MeshPhysicalMaterial;
      material.emissive.setHex(partId === id ? 0x444444 : 0x000000);
    }
  };

  const pickPart = (clientX: number, clientY: number): string | null => {
    if (!camera || !renderer || !scene || !containerRef.value) return null;
    const rect = containerRef.value.getBoundingClientRect();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(Array.from(partMeshes.values()));
    return intersects.length > 0 ? (intersects[0].object.userData.partId as string) : null;
  };

  const focusOn = (target: THREE.Vector3, distance = 6): void => {
    if (!camera || !controls) return;
    const direction = camera.position.clone().sub(controls.target).normalize().multiplyScalar(distance);
    camera.position.copy(target.clone().add(direction));
    controls.target.copy(target);
    controls.update();
  };

  const resetCamera = (): void => {
    if (!camera || !controls) return;
    camera.position.set(0, 2, 22);
    controls.target.set(0, 2, 0);
    controls.update();
  };

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 22);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    addLights(scene);

    heartMesh = new THREE.Mesh(createHeartGeometry(0.18), createHeartMaterial('#991b1b', 0.9));
    heartMesh.position.y = 2;
    scene.add(heartMesh);

    aortaMesh = new THREE.Mesh(createAortaGeometry(0.35), createHeartMaterial('#7f1d1d'));
    aortaMesh.position.y = 2;
    scene.add(aortaMesh);

    for (const part of parts) {
      const geometry = new THREE.SphereGeometry(0.55, 24, 24);
      const material = createHeartMaterial(part.color, 0.75);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...part.position);
      mesh.userData.partId = part.id;
      scene.add(mesh);
      partMeshes.set(part.id, mesh);
    }

    const pulseStart = performance.now();
    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - pulseStart) / 1000;
      const beat = 1 + Math.sin(elapsed * 4) * 0.03;
      if (heartMesh) {
        heartMesh.scale.set(beat, beat, beat);
      }
      controls?.update();
      renderer?.render(scene!, camera!);
    };
    animate();
  };

  const dispose = (): void => {
    cancelAnimationFrame(animationId);
    controls?.dispose();
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
    partMeshes.clear();
  };

  onMounted(() => {
    init();
    window.addEventListener('resize', resize);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    dispose();
  });

  return {
    error,
    selectedPartId,
    getWorldPosition,
    highlight,
    pickPart,
    focusOn,
    resetCamera,
  };
}
