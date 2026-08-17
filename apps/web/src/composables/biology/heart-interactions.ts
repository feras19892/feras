import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FlowParticle } from './heart-flow';

export interface InteractionDeps {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  getHeartMeshes: () => THREE.Mesh[];
  getHeartModelRef: () => THREE.Group | null;
  getBaseScale: () => number;
  getFlowParticles: () => FlowParticle[];
  heartbeatEnabled: { value: boolean };
  bloodFlowEnabled: { value: boolean };
  hoveredPartId: { value: string | null };
  selectedPartId: { value: string | null };
  applyMaterialState: () => void;
}

export function setupInteractions(deps: InteractionDeps): {
  onPointerMove: (event: PointerEvent) => void;
  onClick: (event: PointerEvent) => void;
  animate: () => void;
  getAnimationId: () => number;
} {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const updatePointer = (event: PointerEvent): void => {
    const rect = deps.renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const onPointerMove = (event: PointerEvent): void => {
    updatePointer(event);
    const meshes = deps.getHeartMeshes();
    if (meshes.length === 0) return;
    raycaster.setFromCamera(mouse, deps.camera);
    const intersects = raycaster.intersectObjects(meshes, false);
    const hit = intersects[0]?.object as THREE.Mesh | undefined;
    const newHovered = hit?.name ?? null;
    if (newHovered !== deps.hoveredPartId.value) {
      deps.hoveredPartId.value = newHovered;
      deps.applyMaterialState();
    }
  };

  const onClick = (event: PointerEvent): void => {
    updatePointer(event);
    const meshes = deps.getHeartMeshes();
    if (meshes.length === 0) return;
    raycaster.setFromCamera(mouse, deps.camera);
    const intersects = raycaster.intersectObjects(meshes, false);
    const hit = intersects[0]?.object as THREE.Mesh | undefined;
    deps.selectedPartId.value = hit?.name ?? null;
    deps.applyMaterialState();
  };

  const clock = new THREE.Clock();
  let animationId = 0;

  const animate = (): void => {
    animationId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    deps.controls.update();
    const heartModel = deps.getHeartModelRef();
    if (deps.heartbeatEnabled.value && heartModel) {
      const scale = deps.getBaseScale();
      const pulse = 1 + Math.sin(elapsed * 8) * 0.035;
      heartModel.scale.set(scale * pulse, scale * pulse, scale * pulse);
    }
    if (deps.bloodFlowEnabled.value) {
      const particles = deps.getFlowParticles();
      if (particles.length) {
        for (const particle of particles) {
          const t = (elapsed * particle.speed + particle.offset) % 1;
          particle.mesh.position.copy(particle.curve.getPointAt(t));
        }
      }
    }
    deps.renderer.render(deps.scene, deps.camera);
  };

  return { onPointerMove, onClick, animate, getAnimationId: () => animationId };
}
