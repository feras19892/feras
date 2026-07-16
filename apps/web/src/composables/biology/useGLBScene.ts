import { onMounted, onUnmounted, ref, shallowRef, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

export function useGLBScene(containerRef: Ref<HTMLDivElement | null>) {
  const scene = shallowRef<THREE.Scene | null>(null);
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null);
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null);
  const controls = shallowRef<OrbitControls | null>(null);
  const clipPlane = shallowRef<THREE.Plane | null>(null);
  const error = ref<string | null>(null);
  let animationId = 0;

  const resize = (): void => {
    if (!containerRef.value || !camera.value || !renderer.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    camera.value.aspect = width / height;
    camera.value.updateProjectionMatrix();
    renderer.value.setSize(width, height);
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene.value = new THREE.Scene();
    scene.value.background = new THREE.Color(0x0f172a);

    camera.value = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.value.position.set(0, 2, 18);

    try {
      renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      return;
    }

    renderer.value.setSize(width, height);
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.value.localClippingEnabled = true;
    containerRef.value.appendChild(renderer.value.domElement);

    clipPlane.value = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    controls.value = new OrbitControls(camera.value, renderer.value.domElement);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.05;
    controls.value.rotateSpeed = 0.7;
    controls.value.panSpeed = 0.8;
    controls.value.enablePan = true;
    controls.value.minDistance = 2;
    controls.value.maxDistance = 35;
    controls.value.target.set(0, 2, 0);
    controls.value.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.value.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    if (scene.value) {
      addLights(scene.value as THREE.Scene);
    }
  };

  const startAnimation = (loop: () => void): void => {
    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      loop();
    };
    animate();
  };

  const dispose = (): void => {
    cancelAnimationFrame(animationId);
    controls.value?.dispose();
    renderer.value?.dispose();
    if (renderer.value?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.value.domElement);
    }
    scene.value = null;
    camera.value = null;
    renderer.value = null;
    controls.value = null;
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
    scene,
    camera,
    renderer,
    controls,
    clipPlane,
    error,
    resize,
    startAnimation,
  };
}
