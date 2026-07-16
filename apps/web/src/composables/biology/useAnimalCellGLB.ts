import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { HeartPart } from './useHeartGLB';

export interface AnimalCellPart extends HeartPart {}

export interface AnnotationAnchor {
  x: number;
  y: number;
  visible: boolean;
}

export function useAnimalCellGLB(
  containerRef: Ref<HTMLDivElement | null>,
  parts: AnimalCellPart[]
) {
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const selectedPartId = ref<string | null>(null);
  const xRayMode = ref(false);
  const crossSectionMode = ref(false);
  const crossSectionOffset = ref(0);
  const autoRotate = ref(false);
  const insideView = ref(false);
  const annotationAnchor = ref<AnnotationAnchor>({ x: 0, y: 0, visible: false });

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let cellModelRef: THREE.Group | null = null;
  let baseScale = 1;
  let clipPlane: THREE.Plane | null = null;
  const modelMeshes: THREE.Mesh[] = [];
  let markerGroup: THREE.Group | null = null;
  let onClickHandler: ((event: PointerEvent) => void) | null = null;

  const getPartWorldPosition = (partId: string): THREE.Vector3 | null => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return null;
    return new THREE.Vector3(...part.position);
  };

  const findNearestPart = (point: THREE.Vector3): string | null => {
    let nearestId: string | null = null;
    let nearestDist = Infinity;
    for (const part of parts) {
      const partPos = getPartWorldPosition(part.id);
      if (!partPos) continue;
      const dist = point.distanceToSquared(partPos);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = part.id;
      }
    }
    return nearestId;
  };

  const applyMaterialState = (): void => {
    if (!cellModelRef) return;
    cellModelRef.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        const material = mat as THREE.MeshPhysicalMaterial;
        if (xRayMode.value) {
          material.transparent = true;
          material.opacity = 0.35;
          material.depthWrite = false;
        } else {
          material.transparent = material.userData.originalTransparent ?? false;
          material.opacity = material.userData.originalOpacity ?? 1;
          material.depthWrite = material.userData.originalDepthWrite ?? true;
        }
        material.clippingPlanes = crossSectionMode.value && clipPlane ? [clipPlane] : [];
      }
    });
  };

  const toggleXRay = (): void => {
    xRayMode.value = !xRayMode.value;
    applyMaterialState();
  };

  const toggleCrossSection = (): void => {
    crossSectionMode.value = !crossSectionMode.value;
    applyMaterialState();
  };

  const setCrossSectionOffset = (value: number): void => {
    crossSectionOffset.value = value;
    if (clipPlane) clipPlane.constant = -value;
    applyMaterialState();
  };

  const resetCamera = (): void => {
    if (!camera || !controls) return;
    camera.position.set(0, 1.5, 14);
    controls.target.set(0, 1.5, 0);
    controls.update();
  };

  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value;
    if (controls) controls.autoRotate = autoRotate.value;
  };

  const toggleInsideView = (): void => {
    if (!camera || !controls) return;
    insideView.value = !insideView.value;
    if (insideView.value) {
      camera.position.set(0, 2, 1.2);
      controls.target.set(0, 2, 0);
      controls.update();
    } else {
      resetCamera();
    }
  };

  const resetAll = (): void => {
    xRayMode.value = false;
    crossSectionMode.value = false;
    crossSectionOffset.value = 0;
    if (clipPlane) clipPlane.constant = 0;
    autoRotate.value = false;
    insideView.value = false;
    selectedPartId.value = null;
    if (controls) controls.autoRotate = false;
    applyMaterialState();
    resetCamera();
  };

  const removeMarker = (): void => {
    if (markerGroup && scene) {
      scene.remove(markerGroup);
      markerGroup = null;
    }
    annotationAnchor.value = { x: 0, y: 0, visible: false };
  };

  const updateMarker = (partPos: THREE.Vector3): void => {
    if (!scene || !camera) return;
    removeMarker();

    markerGroup = new THREE.Group();

    const ringGeometry = new THREE.RingGeometry(0.18, 0.24, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(partPos);
    ring.userData.isRing = true;
    markerGroup.add(ring);

    const center = new THREE.Vector3(0, 1.5, 0);
    const dir = partPos.clone().sub(center).normalize();
    if (dir.lengthSq() < 0.001) dir.set(0, 1, 0);
    const anchor = partPos.clone().add(dir.multiplyScalar(2));

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([partPos, anchor]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    markerGroup.add(line);

    markerGroup.userData.anchor = anchor;
    scene.add(markerGroup);
  };

  const updateAnnotationAnchor = (): void => {
    if (!markerGroup || !camera || !renderer) return;
    const anchor = markerGroup.userData.anchor as THREE.Vector3 | undefined;
    if (!anchor) return;
    const projected = anchor.clone().project(camera);
    const width = renderer.domElement.width;
    const height = renderer.domElement.height;
    annotationAnchor.value = {
      x: (projected.x * 0.5 + 0.5) * width,
      y: (-projected.y * 0.5 + 0.5) * height,
      visible: projected.z < 1 && projected.z > -1,
    };
  };

  const selectPartById = (partId: string | null): void => {
    selectedPartId.value = partId;
    if (!camera || !controls || !partId) {
      removeMarker();
      return;
    }
    const partPos = getPartWorldPosition(partId);
    if (!partPos) {
      removeMarker();
      return;
    }
    const center = new THREE.Vector3(0, 1.5, 0);
    const direction = camera.position.clone().sub(center).normalize();
    const distance = Math.max(camera.position.distanceTo(center) * 0.65, 6);
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
    controls.target.copy(center);
    controls.update();
    updateMarker(partPos);
  };

  const loadModel = (scene: THREE.Scene): void => {
    if (!containerRef.value || !camera) return;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      '/models/animal-cell.glb',
      (gltf) => {
        isLoading.value = false;
        const model = gltf.scene;
        cellModelRef = model;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        baseScale = 6 / maxDim;
        model.scale.set(baseScale, baseScale, baseScale);
        model.position.sub(center.clone().multiplyScalar(baseScale));
        model.position.y += 1.5;

        scene.add(model);

        modelMeshes.length = 0;
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.material) return;
          modelMeshes.push(mesh);
          const sourceMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mesh.material = sourceMats.map((mat) => {
            const source = mat as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
            source.side = THREE.DoubleSide;
            source.userData.originalOpacity = source.opacity;
            source.userData.originalTransparent = source.transparent;
            source.userData.originalDepthWrite = source.depthWrite;
            return source;
          });
          if (Array.isArray(mesh.material) && mesh.material.length === 1) {
            mesh.material = mesh.material[0];
          }
        });

        applyMaterialState();
      },
      undefined,
      (err) => {
        isLoading.value = false;
        error.value = `Failed to load animal cell model from /models/animal-cell.glb. (${err instanceof Error ? err.message : String(err)})`;
      }
    );
  };

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 14);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -crossSectionOffset.value);
    containerRef.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;
    controls.panSpeed = 0.8;
    controls.enablePan = true;
    controls.minDistance = 5;
    controls.maxDistance = 22;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.4;
    controls.target.set(0, 1.5, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
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

    loadModel(scene);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updatePointer = (event: PointerEvent): void => {
      if (!renderer) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    onClickHandler = (event: PointerEvent): void => {
      updatePointer(event);
      if (!camera || modelMeshes.length === 0) return;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(modelMeshes, false);
      const hit = intersects[0]?.point;
      if (hit) {
        const id = findNearestPart(hit);
        selectPartById(id ?? null);
      }
    };

    renderer.domElement.addEventListener('click', onClickHandler);

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      controls?.update();
      if (markerGroup && camera) {
        const camPos = camera.position;
        markerGroup.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.userData.isRing) {
            mesh.lookAt(camPos);
          }
        });
      }
      updateAnnotationAnchor();
      renderer?.render(scene!, camera!);
    };
    animate();
  };

  const dispose = (): void => {
    if (renderer?.domElement && onClickHandler) {
      renderer.domElement.removeEventListener('click', onClickHandler);
    }
    cancelAnimationFrame(animationId);
    removeMarker();
    controls?.dispose();
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
    modelMeshes.length = 0;
    scene = null;
    camera = null;
    renderer = null;
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
    autoRotate,
    insideView,
    annotationAnchor,
    toggleXRay,
    toggleCrossSection,
    setCrossSectionOffset,
    resetCamera,
    toggleAutoRotate,
    toggleInsideView,
    resetAll,
    selectPartById,
  };
}
