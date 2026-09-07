import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';
import { applyMaterialState } from './glb-material-state';
import { createCameraTweenState, updateCameraTween, focusOnPart } from './glb-camera-tween';
import { loadModel as loadGLBModel } from './glb-model-loader';

export interface ModelPart {
  id: string;
  nameKey: string;
  descriptionKey: string;
  longDescriptionKey?: string;
  factsKeys?: string[];
  position: [number, number, number];
  groupNames?: string[];
  meshNames?: string[];
  namePatterns?: string[];
  excludePatterns?: string[];
  dimOpacity?: number;
}

export function useGLBModel(
  containerRef: Ref<HTMLDivElement | null>,
  modelPath: string,
  parts: ModelPart[],
  modelGenerator?: () => THREE.Object3D,
  modelEnhancer?: (model: THREE.Object3D) => void,
) {
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const loadProgress = ref(0);
  const selectedPartId = ref<string | null>(null);
  const hoveredPartId = ref<string | null>(null);
  const xRayMode = ref(false);
  const crossSectionMode = ref(false);
  const crossSectionOffset = ref(0);
  const autoRotate = ref(false);

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let clipPlane: THREE.Plane | null = null;
  let animationId = 0;
  let loadedModel: THREE.Object3D | null = null;
  const partMeshes = new Map<string, THREE.Mesh[]>();
  const allMeshes: THREE.Mesh[] = [];
  const originalMeshPositions = new Map<THREE.Mesh, THREE.Vector3>();
  const meshExplodeVectors = new Map<THREE.Mesh, THREE.Vector3>();
  const explodeFactor = ref(0);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const defaultCameraPos = new THREE.Vector3(0, 2, 18);
  const defaultTarget = new THREE.Vector3(0, 2, 0);
  const camTween = createCameraTweenState();
  let pmremGenerator: THREE.PMREMGenerator | null = null;
  let envTexture: THREE.Texture | null = null;
  let envRenderTarget: THREE.WebGLRenderTarget | null = null;

  const callApplyMaterialState = (): void => {
    applyMaterialState({ partMeshes, parts, selectedPartId, hoveredPartId, xRayMode, crossSectionMode, clipPlane });
  };

  const highlight = (id: string | null, focus = true): void => {
    selectedPartId.value = id;
    callApplyMaterialState();
    if (id && focus && camera && controls) {
      const meshes = partMeshes.get(id);
      if (meshes && meshes.length > 0) {
        focusOnPart(camTween, camera, controls, meshes);
      }
    }
  };

  const setHovered = (id: string | null): void => {
    hoveredPartId.value = id;
    callApplyMaterialState();
  };

  const pickPart = (clientX: number, clientY: number): string | null => {
    if (!containerRef.value || !camera || !loadedModel) return null;
    const rect = containerRef.value.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const visibleMeshes = allMeshes.filter((m) => m.visible);
    const intersects = raycaster.intersectObjects(visibleMeshes, false);
    const isVisibleEnough = (mesh: THREE.Mesh): boolean => {
      if (!mesh.material) return false;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      return materials.some((m) => m && (!m.transparent || m.opacity >= 0.5));
    };
    for (const hit of intersects) {
      const hitMesh = hit.object as THREE.Mesh;
      if (!isVisibleEnough(hitMesh)) continue;
      for (const [partId, meshes] of partMeshes) {
        if (meshes.includes(hitMesh)) return partId;
      }
    }
    return null;
  };

  const resetCamera = (): void => {
    if (!camera || !controls) return;
    camera.position.copy(defaultCameraPos);
    controls.target.copy(defaultTarget);
    controls.update();
  };

  const computeExplodeData = (): void => {
    originalMeshPositions.clear();
    meshExplodeVectors.clear();
    if (!loadedModel || allMeshes.length === 0) return;

    const modelBox = new THREE.Box3().setFromObject(loadedModel);
    const modelCenter = modelBox.getCenter(new THREE.Vector3());
    const modelSize = modelBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const modelScale = loadedModel.scale.x || 1;

    for (const mesh of allMeshes) {
      originalMeshPositions.set(mesh, mesh.position.clone());
      const meshBox = new THREE.Box3().setFromObject(mesh);
      const meshCenter = meshBox.getCenter(new THREE.Vector3());
      const dir = new THREE.Vector3().subVectors(meshCenter, modelCenter);
      if (dir.lengthSq() < 0.0001) dir.set(0, 1, 0);
      dir.normalize();
      dir.multiplyScalar(maxDim * 0.35);
      meshExplodeVectors.set(mesh, dir.divideScalar(modelScale));
    }
    applyExplode();
  };

  const applyExplode = (): void => {
    for (const mesh of allMeshes) {
      const origin = originalMeshPositions.get(mesh);
      const vec = meshExplodeVectors.get(mesh);
      if (!origin || !vec) continue;
      mesh.position.copy(origin).add(vec.clone().multiplyScalar(explodeFactor.value));
    }
  };

  const setExplodeFactor = (value: number): void => {
    explodeFactor.value = value;
    applyExplode();
  };

  const toggleXRay = (): void => { xRayMode.value = !xRayMode.value; callApplyMaterialState(); };
  const toggleCrossSection = (): void => { crossSectionMode.value = !crossSectionMode.value; callApplyMaterialState(); };
  const setCrossSectionOffset = (value: number): void => {
    crossSectionOffset.value = value;
    if (clipPlane) clipPlane.constant = -value;
    callApplyMaterialState();
  };
  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value;
    if (controls) controls.autoRotate = autoRotate.value;
  };
  const screenshot = (): string | null => {
    if (!renderer || !scene || !camera) return null;
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  };
  const resetAll = (): void => {
    xRayMode.value = false; crossSectionMode.value = false; crossSectionOffset.value = 0;
    if (clipPlane) clipPlane.constant = 0;
    autoRotate.value = false;
    if (controls) controls.autoRotate = false;
    selectedPartId.value = null; hoveredPartId.value = null;
    explodeFactor.value = 0;
    applyExplode();
    callApplyMaterialState(); resetCamera();
  };
  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const w = containerRef.value.clientWidth, h = containerRef.value.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.copy(defaultCameraPos);

    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { error.value = 'WebGL is not supported or has been disabled in this browser.'; isLoading.value = false; return; }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.value.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmremGenerator = pmrem;
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x223344);
    const envRT = pmrem.fromScene(envScene, 0.04);
    envRenderTarget = envRT;
    envTexture = envRT.texture;
    scene.environment = envRT.texture;
    clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8; controls.panSpeed = 0.8; controls.zoomSpeed = 1.0;
    controls.minDistance = 2; controls.maxDistance = 40;

    addLights(scene);
    loadProgress.value = 0;
    loadGLBModel(
      scene, modelPath, parts, partMeshes, allMeshes,
      () => { isLoading.value = false; callApplyMaterialState(); },
      (msg) => { isLoading.value = false; error.value = msg; },
      (model) => { loadedModel = model; computeExplodeData(); },
      modelGenerator, modelEnhancer,
      (ratio) => { loadProgress.value = ratio; },
    );

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      if (camera && controls) updateCameraTween(camTween, camera, controls);
      controls?.update();
      renderer?.render(scene!, camera!);
    };
    animate();
  };

  const dispose = (): void => {
    cancelAnimationFrame(animationId);
    controls?.dispose();
    allMeshes.forEach((mesh) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) m.dispose();
      }
    });
    if (loadedModel) {
      loadedModel.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry && !allMeshes.includes(mesh)) mesh.geometry.dispose();
        if (mesh.material && !allMeshes.includes(mesh)) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) m.dispose();
        }
      });
    }
    if (envTexture) envTexture.dispose();
    if (envRenderTarget) envRenderTarget.dispose();
    pmremGenerator?.dispose();
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) containerRef.value.removeChild(renderer.domElement);
    scene = null; camera = null; renderer = null; controls = null;
    loadedModel = null; partMeshes.clear(); allMeshes.length = 0;
    originalMeshPositions.clear(); meshExplodeVectors.clear();
    envTexture = null; envRenderTarget = null; pmremGenerator = null;
  };

  let resizeObserver: ResizeObserver | null = null;
  onMounted(() => {
    init();
    window.addEventListener('resize', resize);
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(containerRef.value);
    }
  });
  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    resizeObserver?.disconnect(); resizeObserver = null;
    dispose();
  });

  return {
    error, isLoading, loadProgress, selectedPartId, hoveredPartId,
    xRayMode, crossSectionMode, crossSectionOffset, autoRotate, explodeFactor,
    highlight, setHovered, pickPart, resetCamera,
    toggleXRay, toggleCrossSection, setCrossSectionOffset,
    toggleAutoRotate, screenshot, resetAll, resize,
    setExplodeFactor,
  };
}
