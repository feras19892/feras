import { onMounted, onUnmounted, ref, shallowRef, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function useHeartScene(containerRef: Ref<HTMLDivElement | null>) {
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
    scene.value.background = new THREE.Color(0x070b14);
    scene.value.fog = new THREE.FogExp2(0x070b14, 0.02);

    camera.value = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.value.position.set(0, 1.5, 14);

    try {
      renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      return;
    }

    renderer.value.setSize(width, height);
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.value.localClippingEnabled = true;
    clipPlane.value = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    containerRef.value.appendChild(renderer.value.domElement);

    controls.value = new OrbitControls(camera.value, renderer.value.domElement);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.05;
    controls.value.rotateSpeed = 0.7;
    controls.value.panSpeed = 0.8;
    controls.value.enablePan = true;
    controls.value.minDistance = 2;
    controls.value.maxDistance = 35;
    controls.value.autoRotate = false;
    controls.value.autoRotateSpeed = 0.4;
    controls.value.target.set(0, 1.5, 0);
    controls.value.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.value.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.value.add(ambient);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x330000, 0.8);
    scene.value.add(hemiLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 10);
    scene.value.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.7);
    fillLight.position.set(-8, -2, 6);
    scene.value.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffdddd, 0.9);
    rimLight.position.set(-6, 4, -8);
    scene.value.add(rimLight);
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
