import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLCanvasElement,
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.7;
  controls.panSpeed = 0.8;
  controls.enablePan = true;
  controls.minDistance = 2;
  controls.maxDistance = 35;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.4;
  controls.target.set(0, 1.5, 0);
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  };
  return controls;
}

export function setupLighting(scene: THREE.Scene): void {
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x330000, 0.8);
  scene.add(hemiLight);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(5, 8, 10);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xaaccff, 0.7);
  fillLight.position.set(-8, -2, 6);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xffdddd, 0.9);
  rimLight.position.set(-6, 4, -8);
  scene.add(rimLight);
}
