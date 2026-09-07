import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

const STAGE_NAMES = ['prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis'] as const;
export type MitosisStageName = (typeof STAGE_NAMES)[number];

const POLE_X = 2.5;
const CENTER_POLE_X = 3.0;
const auxScale = new THREE.Vector3();

interface ChromatidSpec {
  color: number;
  length: number;
  /** مركز الكروموسوم في كل مرحلة [prophase, metaphase, anaphase, telophase, cytokinesis] */
  centers: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  bandColor?: number;
}

const CHROMOSOME_SPECS: ChromatidSpec[] = [
  { color: 0xef4444, length: 0.62, centers: [new THREE.Vector3(-0.8, 0.5, 0), new THREE.Vector3(-1.35, 0, 0), new THREE.Vector3(-POLE_X, -0.9, 0), new THREE.Vector3(-POLE_X, -0.9, 0), new THREE.Vector3(-POLE_X, -0.9, 0)] },
  { color: 0xef4444, length: 0.62, centers: [new THREE.Vector3(0.7, 0.8, 0), new THREE.Vector3(-0.45, 0, 0), new THREE.Vector3(POLE_X, -0.3, 0), new THREE.Vector3(POLE_X, -0.3, 0), new THREE.Vector3(POLE_X, -0.3, 0)] },
  { color: 0x3b82f6, length: 0.42, centers: [new THREE.Vector3(-0.5, -0.7, 0), new THREE.Vector3(0.45, 0, 0), new THREE.Vector3(-POLE_X, 0.3, 0), new THREE.Vector3(-POLE_X, 0.3, 0), new THREE.Vector3(-POLE_X, 0.3, 0)] },
  { color: 0x3b82f6, length: 0.42, centers: [new THREE.Vector3(0.9, -0.5, 0), new THREE.Vector3(1.35, 0, 0), new THREE.Vector3(POLE_X, 0.9, 0), new THREE.Vector3(POLE_X, 0.9, 0), new THREE.Vector3(POLE_X, 0.9, 0)] },
];

interface ChromatidRuntime {
  mesh: THREE.Mesh;
  targets: THREE.Vector3[];
  rots: number[];
}

export function useMitosis3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentStageIndex = ref(0);
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const autoRotate = ref(false);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let parentCell: THREE.Mesh | null = null;
  let nuclearEnvelope: THREE.Mesh | null = null;
  let chromatids: ChromatidRuntime[] = [];
  let spindles: THREE.Line[] = [];
  let centrosomes: THREE.Group | null = null;
  let daughterCells: THREE.Group | null = null;
  let daughterNuclei: THREE.Group | null = null;

  function buildChromatids(): void {
    for (const spec of CHROMOSOME_SPECS) {
      for (const side of [-1, 1]) {
        const mesh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.075, spec.length, 6, 12),
          new THREE.MeshPhysicalMaterial({ color: spec.color, roughness: 0.35 })
        );
        mesh.position.copy(spec.centers[0]);
        mesh.rotation.z = side * 0.45;
        if (spec.bandColor !== undefined) {
          const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.028, 8, 20),
            new THREE.MeshPhysicalMaterial({ color: spec.bandColor, roughness: 0.3 })
          );
          band.rotation.x = Math.PI / 2;
          band.position.y = 0.14;
          mesh.add(band);
        }
        chromatids.push({ mesh, targets: spec.centers, rots: [side * 0.45, side * 0.12, side * 0.15, side * 0.15, 0] });
        scene?.add(mesh);
      }
    }
  }

  function buildSpindles(): void {
    for (let i = 0; i < CHROMOSOME_SPECS.length; i += 1) {
      for (const sign of [-1, 1]) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sign * CENTER_POLE_X, 0, 0),
          new THREE.Vector3(0, 0, 0),
        ]);
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0 })
        );
        spindles.push(line);
        scene?.add(line);
      }
    }
  }
  function buildCells(): void {
    parentCell = new THREE.Mesh(
      new THREE.SphereGeometry(3.0, 36, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.3, transparent: true, opacity: 0.1 })
    );
    scene?.add(parentCell);

    nuclearEnvelope = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 24, 16),
      new THREE.MeshPhysicalMaterial({ color: 0xe2e8f0, roughness: 0.3, transparent: true, opacity: 0.22 })
    );
    scene?.add(nuclearEnvelope);

    daughterCells = new THREE.Group();
    for (const sign of [-1, 1]) {
      const cell = new THREE.Mesh(
        new THREE.SphereGeometry(1.9, 28, 20),
        new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.3, transparent: true, opacity: 0.12 })
      );
      cell.position.x = sign * POLE_X;
      cell.scale.setScalar(0.01);
      daughterCells.add(cell);
    }
    scene?.add(daughterCells);

    daughterNuclei = new THREE.Group();
    for (const sign of [-1, 1]) {
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 20, 14),
        new THREE.MeshPhysicalMaterial({ color: 0xe2e8f0, roughness: 0.3, transparent: true, opacity: 0 })
      );
      nucleus.position.x = sign * POLE_X;
      nucleus.scale.setScalar(0.7);
      daughterNuclei.add(nucleus);
    }
    scene?.add(daughterNuclei);

    centrosomes = new THREE.Group();
    for (const sign of [-1, 1]) {
      const c = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        new THREE.MeshPhysicalMaterial({ color: 0xf97316, roughness: 0.35, transparent: true, opacity: 0 })
      );
      c.position.x = sign * CENTER_POLE_X;
      centrosomes.add(c);
    }
    scene?.add(centrosomes);
  }

  function lerpOpacity(material: THREE.Material | THREE.Material[], target: number): void {
    const mats = Array.isArray(material) ? material : [material];
    for (const m of mats) m.opacity += (target - m.opacity) * 0.08;
  }

  const updateScene = (): void => {
    const si = currentStageIndex.value;

    // الكروماتيدات تتحرك نحو أهداف مرحلتها
    for (const c of chromatids) {
      c.mesh.position.lerp(c.targets[si], 0.08);
      c.mesh.rotation.z += (c.rots[si] - c.mesh.rotation.z) * 0.08;
    }

    // شفافيات الحالة
    if (parentCell) lerpOpacity(parentCell.material, [0.1, 0.1, 0.1, 0.05, 0][si]);
    if (nuclearEnvelope) lerpOpacity(nuclearEnvelope.material, [0.22, 0.04, 0, 0, 0][si]);
    if (centrosomes) for (const c of centrosomes.children) lerpOpacity((c as THREE.Mesh).material, [0, 1, 1, 1, 1][si]);

    if (daughterCells) {
      const sTarget = [0.01, 0.01, 0.01, 0.35, 1][si];
      const oTarget = [0, 0, 0, 0.06, 0.12][si];
      for (const c of daughterCells.children) {
        (c as THREE.Mesh).scale.lerp(auxScale.set(sTarget, sTarget, sTarget), 0.08);
        lerpOpacity((c as THREE.Mesh).material, oTarget);
      }
    }
    if (daughterNuclei) {
      const oTarget = [0, 0, 0, 0.22, 0.25][si];
      const sTarget = [0.7, 0.7, 0.7, 1, 1][si];
      for (const c of daughterNuclei.children) {
        (c as THREE.Mesh).scale.lerp(auxScale.set(sTarget, sTarget, sTarget), 0.08);
        lerpOpacity((c as THREE.Mesh).material, oTarget);
      }
    }
    for (const c of chromatids) lerpOpacity(c.mesh.material, [1, 1, 1, 0.85, 0.35][si]);

    // خيوط المغزل: من القطب إلى موضع الكروماتيد الحالي
    const spindleTarget = [0, 0.55, 0.55, 0.12, 0][si];
    spindles.forEach((line, i) => {
      lerpOpacity(line.material, spindleTarget);
      const pos = line.geometry.attributes.position as THREE.BufferAttribute;
      const sign = i % 2 === 0 ? -1 : 1;
      const chr = chromatids[i];
      pos.setXYZ(0, sign * CENTER_POLE_X, 0, 0);
      pos.setXYZ(1, chr.mesh.position.x, chr.mesh.position.y, chr.mesh.position.z);
      pos.needsUpdate = true;
    });
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
    buildSpindles();
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
    spindles.forEach((line) => line.geometry.dispose());
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
    chromatids = [];
    spindles = [];
    parentCell = null;
    nuclearEnvelope = null;
    centrosomes = null;
    daughterCells = null;
    daughterNuclei = null;
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

  // لقطة شاشة للتقرير — نرسم إطاراً طازجاً قبل الالتقاط
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
