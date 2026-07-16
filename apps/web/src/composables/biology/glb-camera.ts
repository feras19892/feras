import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Ref } from 'vue';

interface GLBCameraDefaults {
  position: THREE.Vector3;
  target: THREE.Vector3;
  insidePosition: THREE.Vector3;
  insideTarget: THREE.Vector3;
}

const createDefaults = (
  position = new THREE.Vector3(0, 2, 18),
  target = new THREE.Vector3(0, 2, 0)
): GLBCameraDefaults => ({
  position,
  target,
  insidePosition: new THREE.Vector3(0, 2, 1.2),
  insideTarget: new THREE.Vector3(0, 2, 0),
});

export const createGLBCamera = (
  camera: Ref<THREE.PerspectiveCamera | null>,
  controls: Ref<OrbitControls | null>,
  insideView: Ref<boolean>,
  defaults: Partial<GLBCameraDefaults> = {}
) => {
  const {
    position = new THREE.Vector3(0, 2, 18),
    target = new THREE.Vector3(0, 2, 0),
    insidePosition = new THREE.Vector3(0, 2, 1.2),
    insideTarget = new THREE.Vector3(0, 2, 0),
  } = { ...createDefaults(), ...defaults };

  const lastCameraPosition = new THREE.Vector3();
  const lastControlsTarget = new THREE.Vector3();

  const resetCamera = (): void => {
    if (!camera.value || !controls.value) return;
    camera.value.position.copy(position);
    controls.value.target.copy(target);
    controls.value.update();
  };

  const focusOn = (focusTarget: THREE.Vector3, distance = 6): void => {
    if (!camera.value || !controls.value) return;
    const direction = camera.value.position
      .clone()
      .sub(controls.value.target)
      .normalize()
      .multiplyScalar(distance);
    camera.value.position.copy(focusTarget.clone().add(direction));
    controls.value.target.copy(focusTarget);
    controls.value.update();
  };

  const toggleInsideView = (): void => {
    if (!camera.value || !controls.value) return;
    insideView.value = !insideView.value;
    if (insideView.value) {
      lastCameraPosition.copy(camera.value.position);
      lastControlsTarget.copy(controls.value.target);
      camera.value.position.copy(insidePosition);
      controls.value.target.copy(insideTarget);
      controls.value.update();
    } else {
      camera.value.position.copy(lastCameraPosition);
      controls.value.target.copy(lastControlsTarget);
      controls.value.update();
    }
  };

  const restoreCamera = (): void => {
    if (!camera.value || !controls.value) return;
    camera.value.position.copy(lastCameraPosition);
    controls.value.target.copy(lastControlsTarget);
    controls.value.update();
  };

  return { resetCamera, focusOn, toggleInsideView, restoreCamera };
};
