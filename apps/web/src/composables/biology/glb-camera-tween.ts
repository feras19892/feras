import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface CameraTweenState {
  tweenId: number;
  start: number;
  duration: number;
  fromPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toPos: THREE.Vector3;
  toTarget: THREE.Vector3;
}

export function createCameraTweenState(): CameraTweenState {
  return {
    tweenId: 0,
    start: 0,
    duration: 800,
    fromPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
  };
}

export function startCameraTween(
  state: CameraTweenState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  targetPos: THREE.Vector3,
  targetLookAt: THREE.Vector3,
): void {
  state.fromPos.copy(camera.position);
  state.fromTarget.copy(controls.target);
  state.toPos.copy(targetPos);
  state.toTarget.copy(targetLookAt);
  state.start = performance.now();
  state.tweenId++;
}

export function updateCameraTween(
  state: CameraTweenState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): void {
  if (state.tweenId === 0) return;
  const elapsed = performance.now() - state.start;
  const t = Math.min(elapsed / state.duration, 1);
  const ease = 1 - Math.pow(1 - t, 3);
  camera.position.lerpVectors(state.fromPos, state.toPos, ease);
  controls.target.lerpVectors(state.fromTarget, state.toTarget, ease);
  if (t >= 1) {
    state.tweenId = 0;
  }
}

export function focusOnPart(
  state: CameraTweenState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  meshes: THREE.Mesh[],
): void {
  if (!camera || !controls || meshes.length === 0) return;

  const box = new THREE.Box3();
  meshes.forEach((m) => box.expandByObject(m));
  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = Math.max(maxDim * 2.5, 3);

  const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
  if (dir.lengthSq() < 0.01) dir.set(0.5, 0.3, 1).normalize();

  const targetPos = center.clone().add(dir.multiplyScalar(distance));
  startCameraTween(state, camera, controls, targetPos, center);
}
