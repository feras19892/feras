import * as THREE from 'three';
import type { ScreenPosition } from './useBiology3D';

const mouse = new THREE.Vector2();

export const pickOrganelle = (
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  clientX: number,
  clientY: number
): string | null => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  for (const hit of intersects) {
    if (hit.object.userData.blocksRaycast) continue;
    const id = hit.object.userData.partId;
    if (id) return id;
  }
  return null;
};

export const projectToScreen = (
  camera: THREE.Camera,
  container: HTMLDivElement,
  position: THREE.Vector3
): ScreenPosition => {
  const vector = position.clone().project(camera);
  const rect = container.getBoundingClientRect();
  const x = ((vector.x + 1) / 2) * rect.width;
  const y = ((-vector.y + 1) / 2) * rect.height;
  const visible = vector.z < 1;
  return { x, y, visible };
};

export interface CameraTargets {
  position: THREE.Vector3 | null;
  lookAt: THREE.Vector3 | null;
}

export const focusOn = (
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; autoRotate: boolean },
  target: THREE.Vector3,
  targets: CameraTargets,
  distance = 6
): void => {
  controls.autoRotate = false;
  const direction = camera.position.clone().sub(controls.target).normalize();
  targets.position = target.clone().add(direction.multiplyScalar(distance));
  targets.lookAt = target.clone();
};

export const resetCamera = (
  defaultPosition: THREE.Vector3,
  defaultLookAt: THREE.Vector3,
  controls: { autoRotate: boolean },
  targets: CameraTargets
): void => {
  controls.autoRotate = true;
  targets.position = defaultPosition.clone();
  targets.lookAt = defaultLookAt.clone();
};
