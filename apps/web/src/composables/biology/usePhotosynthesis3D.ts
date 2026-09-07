import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

const STAGE_NAMES = ['light-absorption', 'water-splitting', 'carbon-fixation', 'calvin-cycle'] as const;
export type PhotosynthesisStageName = (typeof STAGE_NAMES)[number];

const COLORS = {
  chloroplast: 0x22c55e,
  grana: 0x15803d,
  photon: 0xfacc15,
  oxygen: 0x67e8f9,
  co2Carbon: 0x475569,
  co2Oxygen: 0xf87171,
  waterOxygen: 0xef4444,
  hydrogen: 0xf8fafc,
  glucose: 0xf59e0b,
} as const;

const WATER_COUNT = 3;
const PHOTON_COUNT = 8;
const CO2_COUNT = 2;

export function usePhotosynthesis3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentStageIndex = ref(0);
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const autoRotate = ref(false);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let clock: THREE.Clock | null = null;
  let chloroplastGroup: THREE.Group | null = null;
  let photonsGroup: THREE.Group | null = null;
  let waterGroup: THREE.Group | null = null;
  let oxygenGroup: THREE.Group | null = null;
  let co2Group: THREE.Group | null = null;
  let glucoseGroup: THREE.Group | null = null;

  const buildChloroplast = (): THREE.Group => {
    const group = new THREE.Group();
    const outer = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 40, 28),
      new THREE.MeshPhysicalMaterial({ color: COLORS.chloroplast, roughness: 0.4, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    outer.scale.set(1.4, 0.9, 0.95);
    group.add(outer);

    const coinGeometry = new THREE.CylinderGeometry(0.34, 0.34, 0.09, 20);
    const granaMaterial = new THREE.MeshPhysicalMaterial({ color: COLORS.grana, roughness: 0.35 });
    const granaPositions: THREE.Vector3[] = [
      new THREE.Vector3(-0.75, 0.15, 0.15),
      new THREE.Vector3(0.1, -0.2, -0.25),
      new THREE.Vector3(0.8, 0.2, 0.2),
    ];
    for (const pos of granaPositions) {
      const stack = new THREE.Group();
      for (let i = 0; i < 4; i += 1) {
        const coin = new THREE.Mesh(coinGeometry, granaMaterial);
        coin.position.y = (i - 1.5) * 0.12;
        stack.add(coin);
      }
      stack.position.copy(pos);
      stack.rotation.y = Math.random() * Math.PI;
      group.add(stack);
    }
    return group;
  };

  const buildPhotons = (): THREE.Group => {
    const group = new THREE.Group();
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshBasicMaterial({ color: COLORS.photon })
    );
    sun.position.set(4.6, 4.2, -1.5);
    group.add(sun);

    const photonGeometry = new THREE.SphereGeometry(0.09, 12, 12);
    for (let i = 0; i < PHOTON_COUNT; i += 1) {
      const photon = new THREE.Mesh(
        photonGeometry,
        new THREE.MeshBasicMaterial({ color: COLORS.photon, transparent: true, opacity: 0.9 })
      );
      photon.userData.seed = Math.random();
      photon.userData.offset = Math.random() * 1.6 - 0.8;
      group.add(photon);
    }
    return group;
  };

  const buildWaterMolecule = (): THREE.Group => {
    const group = new THREE.Group();
    const oxygen = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 20, 20),
      new THREE.MeshPhysicalMaterial({ color: COLORS.waterOxygen, roughness: 0.3 })
    );
    group.add(oxygen);
    const hydrogenGeometry = new THREE.SphereGeometry(0.11, 16, 16);
    const hydrogenMaterial = new THREE.MeshPhysicalMaterial({ color: COLORS.hydrogen, roughness: 0.3 });
    const h1 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
    h1.position.set(0.18, 0.14, 0);
    const h2 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
    h2.position.set(-0.18, 0.14, 0);
    group.add(h1, h2);
    return group;
  };

  const buildWaters = (): THREE.Group => {
    const group = new THREE.Group();
    for (let i = 0; i < WATER_COUNT; i += 1) {
      const molecule = buildWaterMolecule();
      molecule.userData.seed = i / WATER_COUNT;
      group.add(molecule);
    }
    return group;
  };
  const buildOxygenBubble = (): THREE.Group => {
    const group = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(0.17, 18, 18);
    const material = new THREE.MeshPhysicalMaterial({ color: COLORS.oxygen, roughness: 0.25, transparent: true, opacity: 0.95 });
    const a = new THREE.Mesh(sphereGeometry, material);
    a.position.set(0.14, 0, 0);
    const b = new THREE.Mesh(sphereGeometry, material);
    b.position.set(-0.14, 0, 0);
    group.add(a, b);
    return group;
  };

  const buildOxygens = (): THREE.Group => {
    const group = new THREE.Group();
    for (let i = 0; i < WATER_COUNT; i += 1) {
      const bubble = buildOxygenBubble();
      bubble.userData.seed = i / WATER_COUNT;
      bubble.visible = false;
      group.add(bubble);
    }
    return group;
  };

  const buildCo2Molecule = (): THREE.Group => {
    const group = new THREE.Group();
    const carbon = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 18, 18),
      new THREE.MeshPhysicalMaterial({ color: COLORS.co2Carbon, roughness: 0.35 })
    );
    group.add(carbon);
    const oxygenGeometry = new THREE.SphereGeometry(0.14, 16, 16);
    const oxygenMaterial = new THREE.MeshPhysicalMaterial({ color: COLORS.co2Oxygen, roughness: 0.3 });
    const o1 = new THREE.Mesh(oxygenGeometry, oxygenMaterial);
    o1.position.set(0.26, 0.06, 0);
    const o2 = new THREE.Mesh(oxygenGeometry, oxygenMaterial);
    o2.position.set(-0.26, -0.06, 0);
    group.add(o1, o2);
    return group;
  };

  const buildCo2 = (): THREE.Group => {
    const group = new THREE.Group();
    for (let i = 0; i < CO2_COUNT; i += 1) {
      const molecule = buildCo2Molecule();
      molecule.userData.seed = i / CO2_COUNT;
      group.add(molecule);
    }
    return group;
  };

  const buildGlucose = (): THREE.Group => {
    const group = new THREE.Group();
    const atomGeometry = new THREE.SphereGeometry(0.2, 20, 20);
    const material = new THREE.MeshPhysicalMaterial({ color: COLORS.glucose, roughness: 0.25, metalness: 0.15, emissive: 0x7c4a03, emissiveIntensity: 0.25 });
    const radius = 0.55;
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2;
      const atom = new THREE.Mesh(atomGeometry, material);
      atom.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      group.add(atom);
    }
    return group;
  };

  const updateScene = (): void => {
    if (!photonsGroup || !waterGroup || !oxygenGroup || !co2Group || !glucoseGroup || !clock) return;
    const stage = STAGE_NAMES[currentStageIndex.value];
    const t = clock.getElapsedTime();

    // الفوتونات تتساقط دائماً نحو البلاستيدة (الضوء مصدر الطاقة)
    photonsGroup.children.forEach((child, i) => {
      if (i === 0) return; // الشمس ثابتة
      const photon = child as THREE.Mesh;
      const seed = photon.userData.seed as number;
      const cycle = 1.6;
      const progress = ((t * 0.55 + seed) % cycle) / cycle;
      photon.position.set(
        4.4 + (-0.4 + (photon.userData.offset as number) * 0.6 - 4.4) * progress,
        4.0 + (0.3 - 4.0) * progress,
        -1.5 + progress * 1.2
      );
      photon.visible = progress < 0.92;
    });

    // جزيئات الماء تسبح وتقترب من البلاستيدة مع تقدّم المراحل
    waterGroup.children.forEach((child) => {
      const molecule = child as THREE.Group;
      const seed = molecule.userData.seed as number;
      const orbit = t * 0.35 + seed * Math.PI * 2;
      const radius = stage === 'light-absorption' ? 4.4 : 3.0;
      molecule.position.set(
        Math.cos(orbit) * radius - 1.0,
        Math.sin(orbit * 0.8) * 0.9 - 0.4,
        Math.sin(orbit) * 0.8
      );
    });

    // فقاعات الأكسجين تتصاعد بعد تحلل الماء (المرحلة 2+)
    oxygenGroup.children.forEach((child) => {
      const bubble = child as THREE.Group;
      const seed = bubble.userData.seed as number;
      const rise = t * 0.4 + seed;
      const cyclePos = rise % 1;
      bubble.visible = currentStageIndex.value >= 1 && cyclePos < 0.85;
      bubble.position.set(
        -0.3 + seed * 1.2 + Math.sin(t * 2 + seed * 8) * 0.15,
        0.2 + cyclePos * 4.2,
        Math.cos(t * 1.6 + seed * 6) * 0.3
      );
      const fade = 1 - Math.max(0, (cyclePos - 0.6) / 0.25);
      bubble.traverse((c) => {
        const mesh = c as THREE.Mesh;
        if (mesh.material) {
          (mesh.material as THREE.MeshPhysicalMaterial).opacity = 0.95 * Math.max(0, fade);
        }
      });
    });

    // جزيئات CO2 تدخل من الجانب عند التثبيت (المرحلة 3+)
    co2Group.children.forEach((child) => {
      const molecule = child as THREE.Group;
      const seed = molecule.userData.seed as number;
      const orbit = t * 0.3 + seed * Math.PI * 2 + Math.PI;
      const radius = currentStageIndex.value >= 2 ? 2.6 : 4.6;
      molecule.position.set(
        Math.cos(orbit) * radius + 0.8,
        Math.sin(orbit * 0.7) * 0.8 + 0.2,
        Math.sin(orbit) * 0.7
      );
      molecule.visible = currentStageIndex.value >= 2;
    });

    // جزيء الجلوكوز يتشكل وينبض في قلب البلاستيدة (المرحلة 4)
    const showGlucose = currentStageIndex.value === 3;
    glucoseGroup.visible = showGlucose;
    if (showGlucose) {
      const grow = Math.min(1, glucoseGroup.scale.x + 0.03);
      const pulse = 1 + Math.sin(t * 2.2) * 0.04;
      glucoseGroup.scale.setScalar(grow * pulse);
      glucoseGroup.rotation.y = t * 0.5;
    } else {
      glucoseGroup.scale.setScalar(0.01);
    }
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
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.3;
    controls.saveState();

    addLights(scene);
    clock = new THREE.Clock();

    chloroplastGroup = buildChloroplast();
    scene.add(chloroplastGroup);

    photonsGroup = buildPhotons();
    scene.add(photonsGroup);

    waterGroup = buildWaters();
    scene.add(waterGroup);

    oxygenGroup = buildOxygens();
    scene.add(oxygenGroup);

    co2Group = buildCo2();
    scene.add(co2Group);

    glucoseGroup = buildGlucose();
    glucoseGroup.scale.setScalar(0.01);
    scene.add(glucoseGroup);

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
    const groups = [chloroplastGroup, photonsGroup, waterGroup, oxygenGroup, co2Group, glucoseGroup];
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
    chloroplastGroup = null;
    photonsGroup = null;
    waterGroup = null;
    oxygenGroup = null;
    co2Group = null;
    glucoseGroup = null;
    clock = null;
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
