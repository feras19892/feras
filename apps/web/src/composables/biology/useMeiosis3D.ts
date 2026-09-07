import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

const RED = 0xef4444;
const BLUE = 0x3b82f6;

const STAGE_NAMES = ['pairing', 'divisionOne', 'divisionTwo', 'gametes'] as const;
export type MeiosisStageName = (typeof STAGE_NAMES)[number];

function v(x: number, y: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, 0);
}

interface ChromatidSpec {
  color: number;
  length: number;
  targets: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  rots: [number, number, number, number];
  bandColor?: number;
}

/** مواقع المراحل الأربع لكل كروماتيد: اقتران → خليتان → أربع خلايا → أمشاج */
const SPECS: ChromatidSpec[] = [
  { color: RED, length: 0.58, targets: [v(-0.85, 0.42), v(-2.75, 0.25), v(-3.62, 1.32), v(-3.62, 1.32)], rots: [0.45, 0.45, 0.1, 0.1], bandColor: BLUE },
  { color: RED, length: 0.58, targets: [v(-0.85, 0.42), v(-2.75, 0.25), v(-3.18, -1.0), v(-3.18, -1.0)], rots: [-0.45, -0.45, 0.1, 0.1] },
  { color: BLUE, length: 0.4, targets: [v(0.85, 0.42), v(-2.05, 0.25), v(-3.2, 1.02), v(-3.2, 1.02)], rots: [0.45, 0.45, 0.1, 0.1], bandColor: RED },
  { color: BLUE, length: 0.4, targets: [v(0.85, 0.42), v(-2.05, 0.25), v(-3.6, -1.3), v(-3.6, -1.3)], rots: [-0.45, -0.45, 0.1, 0.1] },
  { color: RED, length: 0.58, targets: [v(-0.85, -0.18), v(2.05, 0.25), v(3.62, 1.32), v(3.62, 1.32)], rots: [0.45, 0.45, 0.1, 0.1], bandColor: BLUE },
  { color: RED, length: 0.58, targets: [v(-0.85, -0.18), v(2.05, 0.25), v(3.18, -1.0), v(3.18, -1.0)], rots: [-0.45, -0.45, 0.1, 0.1] },
  { color: BLUE, length: 0.4, targets: [v(0.85, -0.18), v(2.75, 0.25), v(3.2, 1.02), v(3.2, 1.02)], rots: [0.45, 0.45, 0.1, 0.1], bandColor: RED },
  { color: BLUE, length: 0.4, targets: [v(0.85, -0.18), v(2.75, 0.25), v(3.6, -1.3), v(3.6, -1.3)], rots: [-0.45, -0.45, 0.1, 0.1] },
];

export function useMeiosis3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentStageIndex = ref(0);
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const autoRotate = ref(false);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let chromatids: THREE.Mesh[] = [];
  let parentCell: THREE.Mesh | null = null;
  let twoCells: THREE.Group | null = null;
  let fourCells: THREE.Group | null = null;
  function buildChromatids(): void {
    for (const spec of SPECS) {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.07, spec.length, 6, 12),
        new THREE.MeshPhysicalMaterial({ color: spec.color, roughness: 0.35 })
      );
      mesh.position.copy(spec.targets[0]);
      mesh.rotation.z = spec.rots[0];
      if (spec.bandColor !== undefined) {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.095, 0.028, 8, 20),
          new THREE.MeshPhysicalMaterial({ color: spec.bandColor, roughness: 0.3 })
        );
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.13;
        mesh.add(band);
      }
      chromatids.push(mesh);
      scene?.add(mesh);
    }
  }

  function buildCells(): void {
    parentCell = new THREE.Mesh(
      new THREE.SphereGeometry(2.9, 36, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.3, transparent: true, opacity: 0.13 })
    );
    scene?.add(parentCell);

    twoCells = new THREE.Group();
    for (const sign of [-1, 1]) {
      const cell = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 28, 20),
        new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.3, transparent: true, opacity: 0 })
      );
      cell.position.x = sign * 2.4;
      twoCells.add(cell);
    }
    scene?.add(twoCells);

    fourCells = new THREE.Group();
    for (const spot of [v(-3.4, 1.15), v(-3.4, -1.15), v(3.4, 1.15), v(3.4, -1.15)]) {
      const cell = new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 24, 16),
        new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.3, transparent: true, opacity: 0 })
      );
      cell.position.copy(spot);
      fourCells.add(cell);
    }
    scene?.add(fourCells);
  }

  function lerpOpacity(material: THREE.Material | THREE.Material[], target: number): void {
    const mats = Array.isArray(material) ? material : [material];
    for (const m of mats) m.opacity += (target - m.opacity) * 0.08;
  }

  const updateScene = (): void => {
    const si = currentStageIndex.value;
    chromatids.forEach((mesh, i) => {
      mesh.position.lerp(SPECS[i].targets[si], 0.08);
      mesh.rotation.z += (SPECS[i].rots[si] - mesh.rotation.z) * 0.08;
    });
    if (parentCell) lerpOpacity(parentCell.material, [0.13, 0.1, 0, 0][si]);
    if (twoCells) for (const c of twoCells.children) lerpOpacity((c as THREE.Mesh).material, [0, 0.13, 0.1, 0][si]);
    if (fourCells) for (const c of fourCells.children) lerpOpacity((c as THREE.Mesh).material, [0, 0, 0.13, 0.15][si]);
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 10.5);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      isLoading.value = false;
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.value.appendChild(renderer.domElement);

    isLoading.value = false;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 24;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.3;
    controls.saveState();

    addLights(scene);
    buildChromatids();
    buildCells();

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      controls?.update();
      updateScene();
      renderer?.render(scene!, camera!);
    };
    animate();
  };
  const dispose = (): void => {
    cancelAnimationFrame(animationId);
    controls?.dispose();
    scene?.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) mat.dispose();
      }
    });
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
    chromatids = [];
    parentCell = null;
    twoCells = null;
    fourCells = null;
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
  };

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const screenshot = (): string | null => {
    if (!renderer || !scene || !camera) return null;
    try {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  const setStage = (index: number): void => {
    currentStageIndex.value = Math.max(0, Math.min(STAGE_NAMES.length - 1, index));
  };

  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value;
    if (controls) controls.autoRotate = autoRotate.value;
  };

  const resetCamera = (): void => {
    if (controls) controls.reset();
  };

  const resetAll = (): void => {
    setStage(0);
    autoRotate.value = false;
    if (controls) {
      controls.autoRotate = false;
      controls.reset();
    }
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
    currentStageIndex,
    setStage,
    error,
    isLoading,
    autoRotate,
    toggleAutoRotate,
    resetCamera,
    resetAll,
    screenshot,
  };
}
