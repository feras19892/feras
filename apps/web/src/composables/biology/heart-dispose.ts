import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FlowParticle } from './heart-flow';

export interface DisposeDeps {
  renderer: THREE.WebGLRenderer | null;
  controls: OrbitControls | null;
  containerRef: HTMLDivElement | null;
  onPointerMoveHandler: ((event: PointerEvent) => void) | null;
  onClickHandler: ((event: PointerEvent) => void) | null;
  animationId: number;
  flowGroup: THREE.Group | null;
  heartModelRef: THREE.Group | null;
}

function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) mat.dispose();
    }
  });
}

export function disposeHeartScene(deps: DisposeDeps): {
  flowGroup: null;
  flowParticles: FlowParticle[];
} {
  if (deps.renderer?.domElement) {
    if (deps.onPointerMoveHandler) deps.renderer.domElement.removeEventListener('pointermove', deps.onPointerMoveHandler);
    if (deps.onClickHandler) deps.renderer.domElement.removeEventListener('click', deps.onClickHandler);
  }
  cancelAnimationFrame(deps.animationId);
  deps.controls?.dispose();
  if (deps.heartModelRef) disposeObject(deps.heartModelRef);
  if (deps.flowGroup) disposeObject(deps.flowGroup);
  deps.renderer?.dispose();
  if (deps.renderer?.domElement && deps.containerRef) {
    deps.containerRef.removeChild(deps.renderer.domElement);
  }
  return { flowGroup: null, flowParticles: [] };
}
