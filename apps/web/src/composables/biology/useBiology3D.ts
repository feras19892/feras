import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Organelle3D } from '../../types/biology.types';
import { addLights } from './biology-geometry';
import { createOrganelleMeshes, highlightOrganelle, setExplodeProgress, getOrganelleWorldPosition, type OrganelleMesh } from './biology-mesh';
import { focusOn, resetCamera, pickOrganelle, projectToScreen, type CameraTargets } from './biology-interaction';

export interface ScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}

export interface Biology3DApi {
  setExplodeProgress: (progress: number) => void;
  highlightOrganelle: (id: string | null) => void;
  pickOrganelle: (clientX: number, clientY: number) => string | null;
  projectToScreen: (position: THREE.Vector3) => ScreenPosition;
  getOrganelleWorldPosition: (id: string) => THREE.Vector3 | null;
  focusOn: (target: THREE.Vector3, distance?: number) => void;
  resetCamera: () => void;
  resize: () => void;
  error: Ref<string | null>;
}

export function useBiology3D(
  containerRef: Ref<HTMLDivElement | null>,
  organelles: Organelle3D[],
  onRender?: () => void
): Biology3DApi {
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let meshMap = new Map<string, OrganelleMesh>();
  let currentExplode = 0;
  const error = ref<string | null>(null);

  const defaultCameraPosition = new THREE.Vector3(0, 0, 14);
  const defaultLookAt = new THREE.Vector3(0, 0, 0);
  const targets: CameraTargets = { position: null, lookAt: null };

  const lerpCamera = (): void => {
    if (!camera || !controls) return;
    if (targets.position) {
      camera.position.lerp(targets.position, 0.08);
      if (camera.position.distanceTo(targets.position) < 0.05) {
        targets.position = null;
      }
    }
    if (targets.lookAt) {
      controls.target.lerp(targets.lookAt, 0.08);
      if (controls.target.distanceTo(targets.lookAt) < 0.05) {
        targets.lookAt = null;
      }
    }
  };

  const init = (): void => {
    if (!containerRef.value) return;

    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

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
    controls.minDistance = 2.5;
    controls.maxDistance = 25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    addLights(scene);
    meshMap = createOrganelleMeshes(scene, organelles);

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      lerpCamera();
      controls?.update();
      onRender?.();
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
    meshMap.clear();
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
  };

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
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
    setExplodeProgress: (progress: number) => {
      currentExplode = Math.max(0, Math.min(1, progress));
      setExplodeProgress(meshMap, currentExplode);
    },
    highlightOrganelle: (id: string | null) => highlightOrganelle(meshMap, id),
    pickOrganelle: (clientX: number, clientY: number) => {
      if (!renderer || !camera || !scene || !containerRef.value) return null;
      return pickOrganelle(scene, camera, renderer, clientX, clientY);
    },
    projectToScreen: (position: THREE.Vector3) => {
      if (!camera || !renderer || !containerRef.value) {
        return { x: 0, y: 0, visible: false };
      }
      return projectToScreen(camera, containerRef.value, position);
    },
    getOrganelleWorldPosition: (id: string) => getOrganelleWorldPosition(meshMap, id),
    focusOn: (target: THREE.Vector3, distance = 6) => {
      if (!camera || !controls) return;
      focusOn(camera, controls, target, targets, distance);
    },
    resetCamera: () => {
      if (!controls) return;
      resetCamera(defaultCameraPosition, defaultLookAt, controls, targets);
    },
    resize,
    error,
  };
}
