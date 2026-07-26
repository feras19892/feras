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
  meshNames?: string[];
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
  const autoRotate = ref(false);
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
  const pickableMeshes: THREE.Mesh[] = [];
  const partWorldPositions = new Map<string, THREE.Vector3>();
  const partMeshes = new Map<string, THREE.Mesh[]>();
  const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const highlightMaterials = new Map<string, THREE.MeshStandardMaterial>();
  let currentHighlightedId: string | null = null;

  const getWorldPosition = (id: string): THREE.Vector3 | null => {
    const pos = partWorldPositions.get(id);
    return pos ? pos.clone() : null;
  };

  const highlight = (id: string | null): void => {
    selectedPartId.value = id;

    if (currentHighlightedId && currentHighlightedId !== id) {
      const meshes = partMeshes.get(currentHighlightedId);
      if (meshes) {
        for (const mesh of meshes) {
          const orig = originalMaterials.get(mesh);
          if (orig) mesh.material = orig;
        }
      }
      currentHighlightedId = null;
    }

    if (id && id !== currentHighlightedId) {
      const meshes = partMeshes.get(id);
      if (meshes) {
        let hlMat = highlightMaterials.get(id);
        if (!hlMat) {
          const firstMesh = meshes[0];
          const origMat = Array.isArray(firstMesh.material) ? firstMesh.material[0] : firstMesh.material;
          hlMat = (origMat as THREE.MeshStandardMaterial).clone();
          hlMat.emissive = new THREE.Color(0x66ff66);
          hlMat.emissiveIntensity = 1.5;
          highlightMaterials.set(id, hlMat);
        }
        for (const mesh of meshes) {
          if (!originalMaterials.has(mesh)) {
            originalMaterials.set(mesh, mesh.material);
          }
          mesh.material = hlMat;
        }
        currentHighlightedId = id;
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
    const intersects = raycaster.intersectObjects(pickableMeshes);
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

  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value;
    if (controls) {
      controls.autoRotate = autoRotate.value;
      controls.autoRotateSpeed = 1.5;
    }
  };

  const screenshot = (): string | null => {
    if (!renderer || !scene || !camera) return null;
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
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
    if (autoRotate.value) {
      autoRotate.value = false;
      if (controls) controls.autoRotate = false;
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

        for (let pi = 0; pi < parts.length; pi++) {
          const part = parts[pi];
          if (part.meshNames && part.meshNames.length > 0) {
            const matchedMeshes: THREE.Mesh[] = [];
            loadedModel.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (!mesh.isMesh) return;
              if (part.meshNames!.includes(mesh.name)) {
                mesh.userData.partId = part.id;
                matchedMeshes.push(mesh);
              }
            });
            if (matchedMeshes.length > 0) {
              const box = new THREE.Box3();
              for (const m of matchedMeshes) box.expandByObject(m);
              const center = box.getCenter(new THREE.Vector3());
              partWorldPositions.set(part.id, center);
              partMeshes.set(part.id, matchedMeshes);
              pickableMeshes.push(...matchedMeshes);
            }
          } else {
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
            pickableMeshes.push(mesh);
            partWorldPositions.set(part.id, new THREE.Vector3(...part.position));
            markerBasePositions.set(part.id, new THREE.Vector3(...part.position));
          }
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
    pickableMeshes.length = 0;
    partWorldPositions.clear();
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
    toggleAutoRotate,
    autoRotate,
    screenshot,
    resetAll,
  };
}
