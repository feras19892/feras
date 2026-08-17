import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  type FlowParticle, createFlowVisualization,
} from './heart-flow';
import { loadHeartModel } from './heart-model-loader';
import { setupControls, setupLighting } from './heart-scene-setup';
import { setupInteractions } from './heart-interactions';
import { disposeHeartScene } from './heart-dispose';
import { applyHeartMaterialState, applyHeartExplode } from './heart-material';

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
  let heartMeshes: THREE.Mesh[] = [];
  let heartModelRef: THREE.Group | null = null;
  let baseScale = 1;
  let clipPlane: THREE.Plane | null = null;
  const lastCameraPosition = new THREE.Vector3();
  const lastControlsTarget = new THREE.Vector3();
  let flowGroup: THREE.Group | null = null;
  let flowParticles: FlowParticle[] = [];
  let onPointerMoveHandler: ((event: PointerEvent) => void) | null = null;
  let onClickHandler: ((event: PointerEvent) => void) | null = null;
  let getAnimationId: () => number = () => 0;

  const applyMaterialState = (): void => {
    applyHeartMaterialState({ heartMeshes, selectedPartId, hoveredPartId, xRayMode, crossSectionMode, clipPlane });
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

  const applyExplode = (): void => {
    applyHeartExplode(heartMeshes, explodeFactor.value);
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

  const toggleBloodFlow = (): void => {
    bloodFlowEnabled.value = !bloodFlowEnabled.value;
    if (bloodFlowEnabled.value) {
      if (!flowGroup) {
        const result = createFlowVisualization();
        flowGroup = result.group;
        flowParticles = result.flowParticles;
      }
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

    controls = setupControls(camera, renderer.domElement);
    setupLighting(scene);

    loadHeartModel(scene, {
      isLoading,
      error,
      heartModelRef: { get current() { return heartModelRef }, set current(v) { heartModelRef = v } },
      baseScale: { get current() { return baseScale }, set current(v) { baseScale = v } },
      heartMeshes: { get current() { return heartMeshes }, set current(v) { heartMeshes = v } },
      applyMaterialState,
      applyExplode,
    });

    const { onPointerMove, onClick, animate, getAnimationId: getAnimId } = setupInteractions({
      renderer,
      scene,
      camera,
      controls,
      getHeartMeshes: () => heartMeshes,
      getHeartModelRef: () => heartModelRef,
      getBaseScale: () => baseScale,
      getFlowParticles: () => flowParticles,
      heartbeatEnabled,
      bloodFlowEnabled,
      hoveredPartId,
      selectedPartId,
      applyMaterialState,
    });

    getAnimationId = getAnimId;
    onPointerMoveHandler = onPointerMove;
    onClickHandler = onClick;
    renderer.domElement.addEventListener('pointermove', onPointerMoveHandler);
    renderer.domElement.addEventListener('click', onClickHandler);
    animate();
  };

  const dispose = (): void => {
    const result = disposeHeartScene({
      renderer,
      controls,
      containerRef: containerRef.value,
      onPointerMoveHandler,
      onClickHandler,
      animationId: getAnimationId(),
      flowGroup,
      heartModelRef,
    });
    flowGroup = result.flowGroup;
    flowParticles = result.flowParticles;
    heartModelRef = null;
    heartMeshes = [];
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
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
    resizeObserver?.disconnect();
    resizeObserver = null;
    dispose();
  });

  return {
    error, isLoading, selectedPartId, hoveredPartId,
    xRayMode, crossSectionMode, crossSectionOffset,
    heartbeatEnabled, autoRotate, insideView,
    explodeFactor, bloodFlowEnabled,
    toggleXRay, toggleCrossSection, setCrossSectionOffset,
    resetCamera, toggleHeartbeat, toggleAutoRotate,
    toggleInsideView, setExplodeFactor, toggleBloodFlow,
    resetAll, selectPartById,
  };
}
