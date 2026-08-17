import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

const STAGE_NAMES = ['initiation', 'elongation-1', 'elongation-2', 'elongation-3', 'termination'] as const;
export type ProteinSynthesisStageName = (typeof STAGE_NAMES)[number];

const CODON_COLORS: Record<string, number> = {
  AUG: 0xfacc15,
  UUU: 0x22c55e,
  UUA: 0x3b82f6,
  UAG: 0xef4444,
};

const AMINO_ACID_COLORS = [0xf59e0b, 0x22c55e, 0x3b82f6];

const STAGE_CODON_INDEX: Record<string, number> = {
  initiation: 0,
  'elongation-1': 0,
  'elongation-2': 1,
  'elongation-3': 2,
  termination: 3,
};

export function useProteinSynthesis3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentStageIndex = ref(0);
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const autoRotate = ref(true);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let mrnaGroup: THREE.Group | null = null;
  let ribosomeGroup: THREE.Group | null = null;
  let chainGroup: THREE.Group | null = null;
  const aminoAcids: THREE.Mesh[] = [];

  const createNucleotide = (base: string, x: number): THREE.Group => {
    const group = new THREE.Group();
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshPhysicalMaterial({ color: base === 'A' ? 0x22c55e : base === 'U' ? 0xfacc15 : base === 'G' ? 0xef4444 : 0x3b82f6, roughness: 0.3 })
    );
    sphere.position.x = x;
    group.add(sphere);
    return group;
  };

  const buildMrna = (): THREE.Group => {
    const group = new THREE.Group();
    const sequence = 'AUGUUUUUAG';
    const startX = -((sequence.length - 1) * 0.42) / 2;
    for (let i = 0; i < sequence.length; i += 1) {
      const base = sequence[i];
      const nt = createNucleotide(base, startX + i * 0.42);
      group.add(nt);
    }

    const backboneCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: sequence.length }, (_, i) => new THREE.Vector3(startX + i * 0.42, 0, 0))
    );
    const backbone = new THREE.Mesh(
      new THREE.TubeGeometry(backboneCurve, 32, 0.06, 8, false),
      new THREE.MeshPhysicalMaterial({ color: 0xf97316, transparent: true, opacity: 0.8 })
    );
    group.add(backbone);

    const codons = ['AUG', 'UUU', 'UUA', 'UAG'];
    for (let i = 0; i < codons.length; i += 1) {
      const centerX = startX + i * 1.26 + 0.42;
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.05, 0.35),
        new THREE.MeshBasicMaterial({ color: CODON_COLORS[codons[i]] ?? 0x94a3b8, transparent: true, opacity: 0.25 })
      );
      marker.position.set(centerX, 0, 0);
      group.add(marker);
    }

    return group;
  };

  const buildRibosome = (): THREE.Group => {
    const group = new THREE.Group();
    const smallSubunit = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshPhysicalMaterial({ color: 0xa855f7, roughness: 0.35, transparent: true, opacity: 0.95 })
    );
    smallSubunit.scale.set(1.6, 0.55, 1);
    smallSubunit.position.y = -0.55;

    const largeSubunit = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshPhysicalMaterial({ color: 0xec4899, roughness: 0.35, transparent: true, opacity: 0.95 })
    );
    largeSubunit.scale.set(1.8, 0.75, 1.1);
    largeSubunit.position.y = 0.65;

    group.add(smallSubunit, largeSubunit);
    return group;
  };

  const buildAminoAcid = (color: number, index: number): THREE.Mesh => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 24),
      new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, metalness: 0.1 })
    );
    mesh.position.set(-0.4 + index * 0.5, 1.1, 0);
    return mesh;
  };

  const updateScene = (): void => {
    if (!mrnaGroup || !ribosomeGroup || !chainGroup) return;
    const stage = STAGE_NAMES[currentStageIndex.value];
    const codonIndex = STAGE_CODON_INDEX[stage] ?? 0;
    const targetRibosomeX = -0.63 + codonIndex * 1.26;

    ribosomeGroup.position.x += (targetRibosomeX - ribosomeGroup.position.x) * 0.08;
    const ribosomeX = ribosomeGroup.position.x;

    aminoAcids.forEach((aa, index) => {
      const visible =
        (stage === 'elongation-1' && index <= 0) ||
        (stage === 'elongation-2' && index <= 1) ||
        (stage === 'elongation-3' && index <= 2) ||
        stage === 'termination';
      aa.visible = visible;
      if (visible) {
        const targetX = ribosomeX - 0.45 + (index - 2) * 0.48;
        aa.position.x += (targetX - aa.position.x) * 0.08;
      }
    });
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 12);

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
    controls.maxDistance = 25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.saveState();

    addLights(scene);

    mrnaGroup = buildMrna();
    scene.add(mrnaGroup);

    ribosomeGroup = buildRibosome();
    scene.add(ribosomeGroup);

    chainGroup = new THREE.Group();
    for (let i = 0; i < 3; i += 1) {
      const aa = buildAminoAcid(AMINO_ACID_COLORS[i], i);
      aa.visible = false;
      aminoAcids.push(aa);
      chainGroup.add(aa);
    }
    scene.add(chainGroup);

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
    const groups = [mrnaGroup, ribosomeGroup, chainGroup];
    for (const group of groups) {
      if (!group) continue;
      group.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) mat.dispose();
        }
      });
    }
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
    mrnaGroup = null;
    ribosomeGroup = null;
    chainGroup = null;
    aminoAcids.length = 0;
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
    autoRotate.value = true;
    if (controls) {
      controls.autoRotate = true;
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
  };
}
