import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

const STAGE_NAMES = ['root-absorption', 'xylem-ascent', 'leaf-arrival', 'stomata-release'] as const;
export type TranspirationStageName = (typeof STAGE_NAMES)[number];

const COLORS = {
  soil: 0x7c5a3a,
  root: 0xd9c9a8,
  stem: 0x22c55e,
  leaf: 0x16a34a,
  xylem: 0x67e8f9,
  water: 0x38bdf8,
  vapor: 0xbae6fd,
  sun: 0xfacc15,
} as const;

const DROPLET_COUNT = 8;
const VAPOR_COUNT = 10;

export function useTranspiration3D(containerRef: Ref<HTMLDivElement | null>) {
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
  let xylemTube: THREE.Mesh | null = null;
  let dropletsGroup: THREE.Group | null = null;
  let vaporGroup: THREE.Group | null = null;
  let leafTopY = 2.3;

  const buildPlant = (): void => {
    if (!scene) return;

    // التربة
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 0.28, 32),
      new THREE.MeshPhysicalMaterial({ color: COLORS.soil, roughness: 0.8 })
    );
    soil.position.y = -0.62;
    scene.add(soil);

    // الجذور: جذير + جذور جانبية
    const rootMaterial = new THREE.MeshPhysicalMaterial({ color: COLORS.root, roughness: 0.6 });
    const tapPts = [
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0.06, -1.3, 0.04),
      new THREE.Vector3(0, -2.0, 0),
    ];
    scene.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tapPts), 30, 0.09, 6, false),
      rootMaterial,
    ));
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(0, -0.75, 0),
        new THREE.Vector3(Math.cos(a) * 0.75, -1.15, Math.sin(a) * 0.75),
        new THREE.Vector3(Math.cos(a) * 1.25, -1.45, Math.sin(a) * 1.25),
      ];
      scene.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 22, 0.05, 6, false),
        rootMaterial,
      ));
      // شعيرات جذرية دقيقة
      const hair = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.3, 5),
        rootMaterial
      );
      hair.position.set(Math.cos(a) * 1.05, -1.32, Math.sin(a) * 1.05);
      hair.rotation.z = Math.cos(a) * 1.2;
      hair.rotation.x = Math.sin(a) * 1.2;
      scene.add(hair);
    }

    // الساق
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.2, 3.0, 16),
      new THREE.MeshPhysicalMaterial({ color: COLORS.stem, roughness: 0.5 })
    );
    stem.position.y = 0.95;
    scene.add(stem);

    // الأوعية الخشبية: قناة مضيئة داخل الساق
    const xylemPts = [
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(0, 2.1, 0),
    ];
    xylemTube = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(xylemPts), 20, 0.075, 8, false),
      new THREE.MeshPhysicalMaterial({ color: COLORS.xylem, roughness: 0.25, transparent: true, opacity: 0.75, emissive: 0x0e7490, emissiveIntensity: 0.35 })
    );
    scene.add(xylemTube);

    // الأوراق: ثلاث أوراق بالأعلى
    const leafSpecs = [
      { y: 2.0, a: 0.4 },
      { y: 2.3, a: Math.PI + 0.4 },
      { y: 2.55, a: 1.2 },
    ];
    for (const spec of leafSpecs) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 18, 12),
        new THREE.MeshPhysicalMaterial({ color: COLORS.leaf, roughness: 0.45 })
      );
      leaf.scale.set(1.0, 0.12, 0.5);
      leaf.position.set(Math.cos(spec.a) * 0.5, spec.y, Math.sin(spec.a) * 0.5);
      leaf.rotation.y = -spec.a;
      leaf.rotation.z = 0.45;
      scene.add(leaf);
    }
    leafTopY = 2.75;
  };

  const buildDroplets = (): void => {
    const droplets = new THREE.Group();
    const geometry = new THREE.SphereGeometry(0.085, 12, 12);
    for (let i = 0; i < DROPLET_COUNT; i += 1) {
      const drop = new THREE.Mesh(
        geometry,
        new THREE.MeshPhysicalMaterial({ color: COLORS.water, roughness: 0.2, transparent: true, opacity: 0.9 })
      );
      drop.userData.seed = i / DROPLET_COUNT;
      droplets.add(drop);
    }
    dropletsGroup = droplets;
    scene?.add(droplets);
  };

  const buildVapor = (): void => {
    const vapor = new THREE.Group();
    const geometry = new THREE.SphereGeometry(0.11, 10, 10);
    for (let i = 0; i < VAPOR_COUNT; i += 1) {
      const puff = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: COLORS.vapor, transparent: true, opacity: 0.7 })
      );
      puff.userData.seed = i / VAPOR_COUNT;
      puff.visible = false;
      vapor.add(puff);
    }
    vaporGroup = vapor;
    scene?.add(vapor);
  };
  const buildSun = (): void => {
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 20, 20),
      new THREE.MeshBasicMaterial({ color: COLORS.sun })
    );
    sun.position.set(4.2, 4.4, -1.6);
    scene?.add(sun);
  };

  const updateScene = (): void => {
    if (!dropletsGroup || !vaporGroup || !clock) return;
    const t = clock.getElapsedTime();

    // قطرات الماء: حسب المرحلة — امتصاص عند الجذر ثم صعود عبر الخشب
    dropletsGroup.children.forEach((child) => {
      const drop = child as THREE.Mesh;
      const seed = drop.userData.seed as number;
      const stage = STAGE_NAMES[currentStageIndex.value];
      if (stage === 'root-absorption') {
        // تتكتل حول الشعيرات الجذرية تحت التربة
        const orbit = t * 0.5 + seed * Math.PI * 2;
        drop.position.set(
          Math.cos(orbit) * (0.9 + seed * 0.5),
          -1.15 - seed * 0.35,
          Math.sin(orbit) * (0.9 + seed * 0.5),
        );
      } else {
        // صعود متصل داخل قناة الخشب من الجذر إلى الورقة
        const cycle = 1.0;
        const rise = ((t * 0.35 + seed) % cycle) / cycle;
        const y = -0.45 + rise * (leafTopY + 0.25);
        drop.position.set(
          Math.sin(t * 1.5 + seed * 9) * 0.05,
          y,
          Math.cos(t * 1.3 + seed * 7) * 0.05,
        );
      }
    });

    // بخار الماء يتصاعد من أعلى الورقة عبر الثغور (المرحلة الأخيرة فقط)
    vaporGroup.children.forEach((child) => {
      const puff = child as THREE.Mesh;
      const seed = puff.userData.seed as number;
      const rise = (t * 0.32 + seed) % 1;
      puff.visible = currentStageIndex.value === 3 && rise < 0.9;
      puff.position.set(
        Math.sin(t * 1.6 + seed * 10) * (0.25 + rise * 0.9),
        leafTopY + rise * 2.6,
        Math.cos(t * 1.2 + seed * 8) * (0.2 + rise * 0.7),
      );
      const fade = 1 - rise;
      (puff.material as THREE.MeshBasicMaterial).opacity = 0.7 * Math.max(0, fade);
    });
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.6, 11);

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
    buildPlant();
    buildDroplets();
    buildVapor();
    buildSun();
    clock = new THREE.Clock();

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
    xylemTube = null;
    dropletsGroup = null;
    vaporGroup = null;
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
