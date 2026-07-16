import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface HeartPart {
  id: string;
  nameKey: string;
  descriptionKey: string;
  longDescriptionKey?: string;
  factsKeys?: string[];
  position: [number, number, number];
}

export function useHeartGLB(
  containerRef: Ref<HTMLDivElement | null>,
  _parts: HeartPart[]
) {
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const selectedPartId = ref<string | null>(null);
  const hoveredPartId = ref<string | null>(null);
  const xRayMode = ref(false);
  const crossSectionMode = ref(false);
  const crossSectionOffset = ref(0);
  const heartbeatEnabled = ref(false);
  const autoRotate = ref(false);
  const insideView = ref(false);
  const explodeFactor = ref(0);
  const bloodFlowEnabled = ref(false);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let heartMeshes: THREE.Mesh[] = [];
  let heartModelRef: THREE.Group | null = null;
  let baseScale = 1;
  let clipPlane: THREE.Plane | null = null;
  const lastCameraPosition = new THREE.Vector3();
  const lastControlsTarget = new THREE.Vector3();
  let flowGroup: THREE.Group | null = null;
  interface FlowParticle {
    mesh: THREE.Mesh;
    curve: THREE.CatmullRomCurve3;
    speed: number;
    offset: number;
  }
  let flowParticles: FlowParticle[] = [];
  let onPointerMoveHandler: ((event: PointerEvent) => void) | null = null;
  let onClickHandler: ((event: PointerEvent) => void) | null = null;

  const applyMaterialState = (): void => {
    for (const mesh of heartMeshes) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        const material = mat as THREE.MeshPhysicalMaterial;
        const isSelected = mesh.name === selectedPartId.value;
        const isHovered = mesh.name === hoveredPartId.value;
        if (isSelected) {
          material.emissive.setHex(0xff6600);
          material.emissiveIntensity = 0.5;
        } else if (isHovered) {
          material.emissive.setHex(0x444444);
          material.emissiveIntensity = 0.25;
        } else {
          material.emissive.setHex(0x000000);
          material.emissiveIntensity = 0;
        }

        if (xRayMode.value) {
          material.transparent = true;
          material.opacity = 0.35;
          material.depthWrite = false;
        } else {
          material.transparent = false;
          material.opacity = 1;
          material.depthWrite = true;
        }

        material.clippingPlanes = crossSectionMode.value && clipPlane ? [clipPlane] : [];
      }
    }
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

  const toggleHeartbeat = (): void => {
    heartbeatEnabled.value = !heartbeatEnabled.value;
    if (!heartbeatEnabled.value && heartModelRef) {
      heartModelRef.scale.set(baseScale, baseScale, baseScale);
    }
  };

  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value;
    if (controls) controls.autoRotate = autoRotate.value;
  };

  const toggleInsideView = (): void => {
    if (!camera || !controls) return;
    insideView.value = !insideView.value;
    if (insideView.value) {
      lastCameraPosition.copy(camera.position);
      lastControlsTarget.copy(controls.target);
      autoRotate.value = false;
      controls.autoRotate = false;
      camera.position.set(0, 2, 1.2);
      controls.target.set(0, 2, 0);
      controls.update();
    } else {
      camera.position.copy(lastCameraPosition);
      controls.target.copy(lastControlsTarget);
      controls.update();
    }
  };

  const explodeVectors: Record<string, THREE.Vector3> = {
    left_atrium: new THREE.Vector3(-1.6, 1.2, 0.5),
    right_atrium: new THREE.Vector3(1.6, 1.2, 0.5),
    left_ventricle: new THREE.Vector3(-1.4, -1.4, 0.6),
    right_ventricle: new THREE.Vector3(1.4, -1.4, 0.6),
    septum: new THREE.Vector3(0, 0, 1.6),
    aortic_valve: new THREE.Vector3(-0.4, 2.0, 0.2),
    mitral_valve: new THREE.Vector3(-0.7, 0.2, 1.1),
    pulmonary_valve: new THREE.Vector3(0.4, 2.0, 0.2),
    tricuspid_valve: new THREE.Vector3(0.7, 0.2, 1.1),
  };

  const applyExplode = (): void => {
    for (const mesh of heartMeshes) {
      const original = mesh.userData.originalPosition as THREE.Vector3 | undefined;
      if (!original) continue;
      const vector = explodeVectors[mesh.name] ?? (mesh.userData.explodeCenter as THREE.Vector3 | undefined);
      if (!vector) continue;
      mesh.position.copy(original).add(vector.clone().multiplyScalar(explodeFactor.value));
    }
  };

  const setExplodeFactor = (value: number): void => {
    explodeFactor.value = value;
    if (value > 0 && bloodFlowEnabled.value) {
      bloodFlowEnabled.value = false;
      if (flowGroup && scene) scene.remove(flowGroup);
    }
    applyExplode();
  };

  const resetAll = (): void => {
    xRayMode.value = false;
    crossSectionMode.value = false;
    crossSectionOffset.value = 0;
    if (clipPlane) clipPlane.constant = 0;
    if (bloodFlowEnabled.value) {
      bloodFlowEnabled.value = false;
      if (flowGroup && scene) scene.remove(flowGroup);
    }
    if (insideView.value && camera && controls) {
      insideView.value = false;
      camera.position.copy(lastCameraPosition);
      controls.target.copy(lastControlsTarget);
      controls.update();
    }
    autoRotate.value = false;
    if (controls) controls.autoRotate = false;
    selectedPartId.value = null;
    hoveredPartId.value = null;
    setExplodeFactor(0);
    applyMaterialState();
    resetCamera();
  };

  const selectPartById = (partId: string, meshNameMap: Record<string, string>): void => {
    selectedPartId.value = meshNameMap[partId] ?? null;
    applyMaterialState();
  };

  const createFlowVisualization = (): THREE.Group => {
    const group = new THREE.Group();

    const systemicPoints = [
      new THREE.Vector3(-1.2, 0.2, 0.5),
      new THREE.Vector3(-1.6, 2.0, 0),
      new THREE.Vector3(-1.3, 4.0, -1.0),
      new THREE.Vector3(0.0, 4.5, -1.5),
      new THREE.Vector3(1.5, 3.8, -0.5),
      new THREE.Vector3(2.2, 2.0, 0.5),
      new THREE.Vector3(2.0, 0.0, 0.5),
      new THREE.Vector3(1.5, -1.5, 0),
      new THREE.Vector3(0.0, -2.0, -0.5),
      new THREE.Vector3(-1.0, -1.0, 0),
    ];

    const pulmonaryPoints = [
      new THREE.Vector3(1.2, 0.2, 0.5),
      new THREE.Vector3(1.6, 2.0, 0),
      new THREE.Vector3(1.3, 4.0, -1.0),
      new THREE.Vector3(0.0, 4.5, -1.5),
      new THREE.Vector3(-1.5, 3.8, -0.5),
      new THREE.Vector3(-2.2, 2.0, 0.5),
      new THREE.Vector3(-2.0, 0.0, 0.5),
      new THREE.Vector3(-1.5, -1.5, 0),
      new THREE.Vector3(0.0, -2.0, -0.5),
      new THREE.Vector3(1.0, -1.0, 0),
    ];

    const systemicCurve = new THREE.CatmullRomCurve3(systemicPoints, true);
    const pulmonaryCurve = new THREE.CatmullRomCurve3(pulmonaryPoints, true);

    const systemicMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
    });
    const pulmonaryMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.35,
    });

    group.add(
      new THREE.Mesh(new THREE.TubeGeometry(systemicCurve, 140, 0.07, 10, true), systemicMaterial)
    );
    group.add(
      new THREE.Mesh(new THREE.TubeGeometry(pulmonaryCurve, 140, 0.06, 10, true), pulmonaryMaterial)
    );

    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6666 });
    const particleGeometry = new THREE.SphereGeometry(0.09, 12, 12);

    flowParticles = [];
    for (let i = 0; i < 16; i += 1) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone());
      const isSystemic = i % 2 === 0;
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(isSystemic ? 0xff6666 : 0x60a5fa);
      group.add(mesh);
      flowParticles.push({
        mesh,
        curve: isSystemic ? systemicCurve : pulmonaryCurve,
        speed: isSystemic ? 0.12 : 0.1,
        offset: (i / 16) * 0.9,
      });
    }

    return group;
  };

  const toggleBloodFlow = (): void => {
    bloodFlowEnabled.value = !bloodFlowEnabled.value;
    if (bloodFlowEnabled.value) {
      if (!flowGroup) flowGroup = createFlowVisualization();
      scene?.add(flowGroup);
    } else {
      if (flowGroup && scene) scene.remove(flowGroup);
    }
  };

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const loadModel = (scene: THREE.Scene): void => {
    if (!containerRef.value || !camera) return;

    const loader = new GLTFLoader();
    loader.load(
      '/models/heart-hubmap.glb',
      (gltf) => {
        isLoading.value = false;
        const heartModel = gltf.scene;
        heartModelRef = heartModel;

        const box = new THREE.Box3().setFromObject(heartModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        baseScale = 8 / maxDim;
        heartModel.scale.set(baseScale, baseScale, baseScale);
        heartModel.position.sub(center.clone().multiplyScalar(baseScale));
        heartModel.position.y += 2;

        scene.add(heartModel);

        const partColors: Record<string, number> = {
          left_atrium: 0xcc2222,
          left_ventricle: 0xb91c1c,
          right_atrium: 0x3b5bdb,
          right_ventricle: 0x2563eb,
          septum: 0x9f2b2b,
          aortic_valve: 0xfca5a5,
          mitral_valve: 0xfca5a5,
          pulmonary_valve: 0x93c5fd,
          tricuspid_valve: 0x93c5fd,
        };

        heartModel.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.material) return;
          const baseColor = partColors[mesh.name] ?? 0xb83a3a;
          const sourceMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mesh.material = sourceMats.map((mat) => {
            const source = mat as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
            return new THREE.MeshPhysicalMaterial({
              color: baseColor,
              emissive: 0x000000,
              emissiveIntensity: 0,
              map: source.map ?? undefined,
              roughness: 0.45,
              metalness: 0.02,
              clearcoat: 0.08,
              clearcoatRoughness: 0.25,
              side: THREE.DoubleSide,
            });
          });
          if (Array.isArray(mesh.material) && mesh.material.length === 1) {
            mesh.material = mesh.material[0];
          }
        });

        heartMeshes = [];
        heartModel.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.geometry) return;
          mesh.geometry.computeBoundingBox();
          const boundingBox = mesh.geometry.boundingBox;
          if (!boundingBox) return;
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          mesh.userData.originalPosition = mesh.position.clone();
          mesh.userData.explodeCenter = center;
          heartMeshes.push(mesh);
        });
        applyExplode();
        applyMaterialState();
      },
      undefined,
      (err) => {
        isLoading.value = false;
        error.value = `Failed to load heart model from /models/heart-hubmap.glb. (${err instanceof Error ? err.message : String(err)})`;
      }
    );
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.02);

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
    loadModel(scene);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updatePointer = (event: PointerEvent): void => {
      if (!renderer) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    onPointerMoveHandler = (event: PointerEvent): void => {
      updatePointer(event);
      if (!camera || heartMeshes.length === 0) return;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(heartMeshes, false);
      const hit = intersects[0]?.object as THREE.Mesh | undefined;
      hoveredPartId.value = hit?.name ?? null;
      applyMaterialState();
    };

    onClickHandler = (event: PointerEvent): void => {
      updatePointer(event);
      if (!camera || heartMeshes.length === 0) return;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(heartMeshes, false);
      const hit = intersects[0]?.object as THREE.Mesh | undefined;
      selectedPartId.value = hit?.name ?? null;
      applyMaterialState();
    };

    renderer.domElement.addEventListener('pointermove', onPointerMoveHandler);
    renderer.domElement.addEventListener('click', onClickHandler);

    const clock = new THREE.Clock();
    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls?.update();
      if (heartbeatEnabled.value && heartModelRef) {
        const pulse = 1 + Math.sin(elapsed * 8) * 0.035;
        heartModelRef.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);
      }
      if (bloodFlowEnabled.value && flowParticles.length) {
        for (const particle of flowParticles) {
          const t = (elapsed * particle.speed + particle.offset) % 1;
          particle.mesh.position.copy(particle.curve.getPointAt(t));
        }
      }
      renderer?.render(scene!, camera!);
    };
    animate();
  };

  const dispose = (): void => {
    if (renderer?.domElement) {
      if (onPointerMoveHandler) renderer.domElement.removeEventListener('pointermove', onPointerMoveHandler);
      if (onClickHandler) renderer.domElement.removeEventListener('click', onClickHandler);
    }
    cancelAnimationFrame(animationId);
    controls?.dispose();
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
    if (flowGroup) {
      flowGroup.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) mat.dispose();
        }
      });
      flowGroup = null;
      flowParticles = [];
    }
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
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
    hoveredPartId,
    xRayMode,
    crossSectionMode,
    crossSectionOffset,
    heartbeatEnabled,
    autoRotate,
    insideView,
    explodeFactor,
    bloodFlowEnabled,
    toggleXRay,
    toggleCrossSection,
    setCrossSectionOffset,
    resetCamera,
    toggleHeartbeat,
    toggleAutoRotate,
    toggleInsideView,
    setExplodeFactor,
    toggleBloodFlow,
    resetAll,
    selectPartById,
  };
}
