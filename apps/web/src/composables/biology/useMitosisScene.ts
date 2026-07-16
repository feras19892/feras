import { onMounted, onUnmounted, ref, shallowRef, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const addLights = (s: THREE.Scene): void => {
  s.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(5, 8, 5);
  s.add(key);
  const fill = new THREE.DirectionalLight(0xb4c6ef, 0.5);
  fill.position.set(-5, 2, -5);
  s.add(fill);
};

export function useMitosisScene(containerRef: Ref<HTMLDivElement | null>) {
  const scene = shallowRef<THREE.Scene | null>(null);
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null);
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null);
  const controls = shallowRef<OrbitControls | null>(null);
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
    camera.value.position.set(0, 0, 14);

    try {
      renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      return;
    }

    renderer.value.setSize(width, height);
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.value.appendChild(renderer.value.domElement);

    controls.value = new OrbitControls(camera.value, renderer.value.domElement);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.08;
    controls.value.minDistance = 4;
    controls.value.maxDistance = 25;
    controls.value.autoRotate = true;
    controls.value.autoRotateSpeed = 0.4;

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

  return { scene, camera, renderer, controls, error, resize, startAnimation };
}
