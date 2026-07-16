import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { addLights } from './biology-geometry';

export interface ModelPart {
  id: string;
  nameKey: string;
  descriptionKey: string;
  longDescriptionKey?: string;
  factsKeys?: string[];
  position: [number, number, number];
}

export function useGLBModel(
  containerRef: Ref<HTMLDivElement | null>,
  modelPath: string,
  parts: ModelPart[],
  modelColor?: string
) {
  const error = ref<string | null>(null);
  const selectedPartId = ref<string | null>(null);
  const isLoading = ref(true);
  const xRayMode = ref(false);
  const crossSectionMode = ref(false);
  const crossSectionOffset = ref(0);
  const insideView = ref(false);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let clipPlane: THREE.Plane | null = null;
  let animationId = 0;
  let loadedModel: THREE.Object3D | null = null;
  const lastCameraPosition = new THREE.Vector3();
  const lastControlsTarget = new THREE.Vector3();
  const markerBasePositions = new Map<string, THREE.Vector3>();
  const partMeshes = new Map<string, THREE.Mesh>();

  const getWorldPosition = (id: string): THREE.Vector3 | null => {
    const mesh = partMeshes.get(id);
    return mesh ? mesh.position.clone() : null;
  };

  const highlight = (id: string | null): void => {
    selectedPartId.value = id;
    for (const [partId, mesh] of partMeshes.entries()) {
      const material = mesh.material as THREE.MeshPhysicalMaterial | undefined;
      if (material && 'emissive' in material) {
        material.emissive.setHex(partId === id ? 0x444444 : 0x000000);
      }
    }
  };

  const pickPart = (clientX: number, clientY: number): string | null => {
    if (!camera || !renderer || !containerRef.value) return null;
    const rect = containerRef.value.getBoundingClientRect();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(Array.from(partMeshes.values()));
    return intersects.length > 0 ? (intersects[0].object.userData.partId as string) : null;
  };

  const focusOn = (target: THREE.Vector3, distance = 6): void => {
    if (!camera || !controls) return;
    const direction = camera.position.clone().sub(controls.target).normalize().multiplyScalar(distance);
    camera.position.copy(target.clone().add(direction));
    controls.target.copy(target);
    controls.update();
  };

  const resetCamera = (): void => {
    if (!camera || !controls) return;
    camera.position.set(0, 2, 18);
    controls.target.set(0, 2, 0);
    controls.update();
  };

  const applyXRay = (): void => {
    if (!loadedModel) return;
    loadedModel.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        const material = mat as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
        if (!('transparent' in material)) continue;
        if (xRayMode.value) {
          material.userData.originalOpacity = material.opacity;
          material.userData.originalTransparent = material.transparent;
          material.transparent = true;
          material.opacity = 0.25;
          material.depthWrite = false;
        } else {
          material.opacity = material.userData.originalOpacity ?? 1;
          material.transparent = material.userData.originalTransparent ?? false;
          material.depthWrite = true;
        }
      }
    });
  };

  const toggleXRay = (): void => {
    xRayMode.value = !xRayMode.value;
    applyXRay();
  };

  const applyCrossSection = (): void => {
    if (!loadedModel || !clipPlane) return;
    const plane = clipPlane as THREE.Plane;
    const active = crossSectionMode.value;
    loadedModel.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        if ('clippingPlanes' in mat) {
          (mat as THREE.MeshStandardMaterial).clippingPlanes = active ? [plane] : [];
        }
      }
    });
    plane.constant = active ? crossSectionOffset.value : 100;
  };

  const toggleCrossSection = (): void => {
    crossSectionMode.value = !crossSectionMode.value;
    applyCrossSection();
  };

  const setCrossSectionOffset = (value: number): void => {
    crossSectionOffset.value = value;
    if (clipPlane) clipPlane.constant = value;
  };

  const toggleInsideView = (): void => {
    if (!camera || !controls) return;
    insideView.value = !insideView.value;
    if (insideView.value) {
      lastCameraPosition.copy(camera.position);
      lastControlsTarget.copy(controls.target);
      camera.position.set(0, 2, 1.2);
      controls.target.set(0, 2, 0);
      controls.update();
    } else {
      camera.position.copy(lastCameraPosition);
      controls.target.copy(lastControlsTarget);
      controls.update();
    }
  };

  const resetAll = (): void => {
    if (xRayMode.value) {
      xRayMode.value = false;
      applyXRay();
    }
    if (crossSectionMode.value) {
      crossSectionMode.value = false;
      applyCrossSection();
    }
    if (insideView.value && camera && controls) {
      insideView.value = false;
      camera.position.copy(lastCameraPosition);
      controls.target.copy(lastControlsTarget);
      controls.update();
    }
    selectedPartId.value = null;
    highlight(null);
    resetCamera();
  };

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const loadModel = (): void => {
    if (!containerRef.value || !scene || !camera) return;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      modelPath,
      (gltf) => {
        isLoading.value = false;
        loadedModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 8 / maxDim;
        loadedModel.scale.set(scale, scale, scale);
        loadedModel.position.sub(center.clone().multiplyScalar(scale));
        loadedModel.position.y += 2;

        scene!.add(loadedModel);

        if (modelColor) {
          loadedModel.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh || !mesh.material) return;
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const mat of materials) {
              if ('color' in mat) (mat as THREE.MeshStandardMaterial).color.set(modelColor);
            }
          });
        }

        for (const part of parts) {
          const geometry = new THREE.SphereGeometry(0.3, 20, 20);
          const material = new THREE.MeshPhysicalMaterial({
            color: '#4ade80',
            transparent: true,
            opacity: 0.6,
            emissive: 0x000000,
            roughness: 0.2,
            clearcoat: 0.5,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(...part.position);
          mesh.userData.partId = part.id;
          scene!.add(mesh);
          partMeshes.set(part.id, mesh);
          markerBasePositions.set(part.id, new THREE.Vector3(...part.position));
        }
      },
      undefined,
      (err) => {
        isLoading.value = false;
        error.value = `Failed to load model from ${modelPath}. (${err instanceof Error ? err.message : String(err)})`;
      }
    );
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 18);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    containerRef.value.appendChild(renderer.domElement);

    clipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;
    controls.panSpeed = 0.8;
    controls.enablePan = true;
    controls.minDistance = 2;
    controls.maxDistance = 35;
    controls.target.set(0, 2, 0);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    addLights(scene);
    loadModel();

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      controls?.update();
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
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
    partMeshes.clear();
    markerBasePositions.clear();
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
    error,
    isLoading,
    selectedPartId,
    xRayMode,
    crossSectionMode,
    crossSectionOffset,
    insideView,
    getWorldPosition,
    highlight,
    pickPart,
    focusOn,
    resetCamera,
    toggleXRay,
    toggleCrossSection,
    setCrossSectionOffset,
    toggleInsideView,
    resetAll,
  };
}
