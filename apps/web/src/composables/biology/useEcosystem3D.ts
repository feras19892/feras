import { computed, onMounted, onUnmounted, reactive, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

/**
 * محاكاة توازن النظام البيئي — أربعة نماذج رياضية ثلاثية الأبعاد:
 * فريسة/مفترس (لوتكا-فولتيرا)، السعة الاستيعابية، سلسلة غذائية ثلاثية
 * (نباتات ← أرانب ← ثعالب)، وتنافس نوعين على الموارد.
 * كل معاملات النماذج والأعداد الابتدائية قابلة للتعديل من الواجهة.
 */

const STEP_DT = 0.05; // حجم خطوة العدّ
const BOUNDS = 9; // نصف قطر الساحة (وحدات ثلاثية الأبعاد)
/** نافذة القيم المستخدمة لتصنيف حالة النظام */
const PHASE_WINDOW = 120;
/** عدد العينات المحفوظة للرسم البياني */
const CHART_MAX = 600;
/** سقف صلب يمنع انفجار الأعداد عددياً عند اختفاء المفترس */
const POP_CAP = 9999;
/** كفاءة تحويل الغذاء في السلسلة الثلاثية (نصف ما يُؤكل يصير نمواً) */
const TROPHIC_EFFICIENCY = 0.5;

export type EcosystemModelId = 'predator-prey' | 'carrying-capacity' | 'food-chain' | 'competition';
export type EcosystemPhase = 'initial' | 'balance' | 'cycles' | 'crash' | 'extinction' | 'exclusion';

/** معامل قابل للضبط من شريط تمرير في الواجهة. */
export interface ModelParam {
  key: string;
  labelKey: string;
  min: number;
  max: number;
  step: number;
  def: number;
}

export type SpeciesShape = 'cone' | 'sphere' | 'box' | 'tuft';

/** نوع حي يظهر في ساحة المحاكاة. */
export interface SpeciesDef {
  id: string;
  nameKey: string;
  icon: string;
  color: number;
  css: string;
  pool: number;
  y: number;
  speed: number;
  shape: SpeciesShape;
  initMin: number;
  initMax: number;
  initStep: number;
}

/** نموذج بيئي كامل: أنواعه ومعاملاته ومعادلة الخطوة. */
export interface EcosystemModel {
  id: EcosystemModelId;
  nameKey: string;
  descKey: string;
  factKeys: [string, string, string];
  species: SpeciesDef[];
  params: ModelParam[];
  initials: number[];
  step: (s: number[], p: Record<string, number>, dt: number) => number[];
}

const RABBIT: SpeciesDef = {
  id: 'rabbit',
  nameKey: 'biology.ecosystemPreyName',
  icon: '🐇',
  color: 0x4ade80,
  css: '#4ade80',
  pool: 130,
  y: 0.35,
  speed: 3,
  shape: 'cone',
  initMin: 10,
  initMax: 250,
  initStep: 5,
};

const FOX: SpeciesDef = {
  id: 'fox',
  nameKey: 'biology.ecosystemPredatorName',
  icon: '🦊',
  color: 0xfb923c,
  css: '#fb923c',
  pool: 90,
  y: 0.6,
  speed: 2.2,
  shape: 'sphere',
  initMin: 0,
  initMax: 150,
  initStep: 5,
};

const PLANT: SpeciesDef = {
  id: 'plant',
  nameKey: 'biology.ecosystemPlantName',
  icon: '🌿',
  color: 0x84cc16,
  css: '#a3e635',
  pool: 150,
  y: 0.3,
  speed: 0,
  shape: 'tuft',
  initMin: 50,
  initMax: 400,
  initStep: 10,
};

const DEER: SpeciesDef = {
  id: 'deer',
  nameKey: 'biology.ecosystemDeerName',
  icon: '🦌',
  color: 0xfacc15,
  css: '#facc15',
  pool: 120,
  y: 0.42,
  speed: 2.6,
  shape: 'box',
  initMin: 10,
  initMax: 200,
  initStep: 5,
};

/** النماذج الأربعة المتاحة في تجربة توازن النظام البيئي. */
export const ECOSYSTEM_MODELS: EcosystemModel[] = [
  {
    id: 'predator-prey',
    nameKey: 'biology.ecosystemModel.predatorPrey.name',
    descKey: 'biology.ecosystemModel.predatorPrey.desc',
    factKeys: [
      'biology.ecosystemModel.predatorPrey.fact1',
      'biology.ecosystemModel.predatorPrey.fact2',
      'biology.ecosystemModel.predatorPrey.fact3',
    ],
    species: [RABBIT, FOX],
    initials: [120, 30],
    params: [
      { key: 'alpha', labelKey: 'biology.ecosystemParamPreyGrowth', min: 0.1, max: 2, step: 0.05, def: 0.9 },
      { key: 'beta', labelKey: 'biology.ecosystemParamPredation', min: 0.005, max: 0.06, step: 0.001, def: 0.02 },
      { key: 'delta', labelKey: 'biology.ecosystemParamEfficiency', min: 0.002, max: 0.05, step: 0.001, def: 0.012 },
      { key: 'gamma', labelKey: 'biology.ecosystemParamPredDeath', min: 0.1, max: 1.5, step: 0.05, def: 0.5 },
    ],
    // لوتكا-فولتيرا الكلاسيكي: تذبذب دائم حول نقطة التوازن
    step: (s, p, dt) => {
      const [x, y] = s;
      return [
        x + (p.alpha * x - p.beta * x * y) * dt,
        y + (p.delta * x * y - p.gamma * y) * dt,
      ];
    },
  },
  {
    id: 'carrying-capacity',
    nameKey: 'biology.ecosystemModel.carryingCapacity.name',
    descKey: 'biology.ecosystemModel.carryingCapacity.desc',
    factKeys: [
      'biology.ecosystemModel.carryingCapacity.fact1',
      'biology.ecosystemModel.carryingCapacity.fact2',
      'biology.ecosystemModel.carryingCapacity.fact3',
    ],
    species: [RABBIT, FOX],
    initials: [60, 20],
    params: [
      { key: 'r', labelKey: 'biology.ecosystemParamPreyGrowthR', min: 0.1, max: 2.5, step: 0.05, def: 0.9 },
      { key: 'K', labelKey: 'biology.ecosystemParamCapacity', min: 40, max: 400, step: 10, def: 200 },
      { key: 'beta', labelKey: 'biology.ecosystemParamPredation', min: 0.005, max: 0.06, step: 0.001, def: 0.02 },
      { key: 'delta', labelKey: 'biology.ecosystemParamEfficiency', min: 0.002, max: 0.05, step: 0.001, def: 0.012 },
      { key: 'gamma', labelKey: 'biology.ecosystemParamPredDeath', min: 0.1, max: 1.5, step: 0.05, def: 0.5 },
    ],
    // فريسة تنمو لوجستياً حتى السعة K + مفترس — توازن حقيقي مستقر
    step: (s, p, dt) => {
      const [x, y] = s;
      return [
        x + (p.r * x * (1 - x / p.K) - p.beta * x * y) * dt,
        y + (p.delta * x * y - p.gamma * y) * dt,
      ];
    },
  },
  {
    id: 'food-chain',
    nameKey: 'biology.ecosystemModel.foodChain.name',
    descKey: 'biology.ecosystemModel.foodChain.desc',
    factKeys: [
      'biology.ecosystemModel.foodChain.fact1',
      'biology.ecosystemModel.foodChain.fact2',
      'biology.ecosystemModel.foodChain.fact3',
    ],
    species: [PLANT, RABBIT, FOX],
    initials: [260, 80, 15],
    params: [
      { key: 'r', labelKey: 'biology.ecosystemParamPlantGrowth', min: 0.2, max: 3, step: 0.05, def: 1.2 },
      { key: 'K', labelKey: 'biology.ecosystemParamPlantCapacity', min: 60, max: 400, step: 10, def: 260 },
      { key: 'a', labelKey: 'biology.ecosystemParamGrazing', min: 0.002, max: 0.04, step: 0.001, def: 0.012 },
      { key: 'b', labelKey: 'biology.ecosystemParamPredation', min: 0.002, max: 0.05, step: 0.001, def: 0.015 },
      { key: 'm1', labelKey: 'biology.ecosystemParamRabbitDeath', min: 0.05, max: 1, step: 0.05, def: 0.25 },
      { key: 'm2', labelKey: 'biology.ecosystemParamFoxDeath', min: 0.1, max: 1.5, step: 0.05, def: 0.5 },
    ],
    // نباتات (نمو لوجستي) ← أرانب (رعي) ← ثعالب (افتراس)
    step: (s, p, dt) => {
      const [g, n, q] = s;
      return [
        g + (p.r * g * (1 - g / p.K) - p.a * g * n) * dt,
        n + (TROPHIC_EFFICIENCY * p.a * g * n - p.b * n * q - p.m1 * n) * dt,
        q + (TROPHIC_EFFICIENCY * p.b * n * q - p.m2 * q) * dt,
      ];
    },
  },
  {
    id: 'competition',
    nameKey: 'biology.ecosystemModel.competition.name',
    descKey: 'biology.ecosystemModel.competition.desc',
    factKeys: [
      'biology.ecosystemModel.competition.fact1',
      'biology.ecosystemModel.competition.fact2',
      'biology.ecosystemModel.competition.fact3',
    ],
    species: [RABBIT, DEER],
    initials: [80, 60],
    params: [
      { key: 'K', labelKey: 'biology.ecosystemParamSharedCapacity', min: 80, max: 400, step: 10, def: 220 },
      { key: 'r1', labelKey: 'biology.ecosystemParamRabbitGrowth', min: 0.2, max: 2.5, step: 0.05, def: 1.0 },
      { key: 'r2', labelKey: 'biology.ecosystemParamDeerGrowth', min: 0.2, max: 2.5, step: 0.05, def: 0.8 },
      { key: 'c12', labelKey: 'biology.ecosystemParamDeerOnRabbit', min: 0, max: 2, step: 0.05, def: 0.6 },
      { key: 'c21', labelKey: 'biology.ecosystemParamRabbitOnDeer', min: 0, max: 2, step: 0.05, def: 0.5 },
    ],
    // تنافس لوتكا-فولتيرا بين نوعين على نفس المرعى
    step: (s, p, dt) => {
      const [n1, n2] = s;
      return [
        n1 + p.r1 * n1 * (1 - (n1 + p.c12 * n2) / p.K) * dt,
        n2 + p.r2 * n2 * (1 - (n2 + p.c21 * n1) / p.K) * dt,
      ];
    },
  },
];

/**
 * يصنّف حالة النظام من نافذة من قيم المحاكاة الأخيرة — دالة نقية قابلة للاختبار.
 * - extinction: اختفاء النوع الأخير في السلسلة (المفترس الأعلى).
 * - crash: اختفاء نوع أدنى يجرّ الباقي للانهيار.
 * - exclusion: في نموذج التنافس، استبعاد أحد النوعين بينما يزدهر الآخر.
 * - balance: استقرار فعلي (تذبذب ضئيل حول متوسط ثابت).
 * - cycles: تذبذب دوري مستمر.
 */
export function classifyPhase(
  window: number[][],
  speciesCount: number,
  modelId: EcosystemModelId,
): EcosystemPhase {
  if (window.length < 8) return 'initial';
  const last = window[window.length - 1];
  const deadIdx = last.findIndex((v) => v <= 0.5);
  if (deadIdx >= 0) {
    if (modelId === 'competition') return 'exclusion';
    return deadIdx === speciesCount - 1 ? 'extinction' : 'crash';
  }

  const n = window.length;
  for (let i = 0; i < speciesCount; i += 1) {
    let mean = 0;
    for (const s of window) mean += s[i];
    mean /= n;
    let sq = 0;
    for (const s of window) sq += (s[i] - mean) ** 2;
    const std = Math.sqrt(sq / n);
    if (mean > 0 && std >= mean * 0.05) return 'cycles';
  }
  return 'balance';
}

interface Mobile {
  mesh: THREE.Mesh;
  si: number;
  order: number;
  vx: number;
  vz: number;
  bob: number;
}

export function useEcosystem3D(containerRef: Ref<HTMLDivElement | null>) {
  const isRunning = ref(false);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const autoRotate = ref(false);
  const speed = ref(1);
  const iteration = ref(0);
  const phase = ref<EcosystemPhase>('initial');
  const hasRun = ref(false);

  const activeModel = ref<EcosystemModelId>('predator-prey');
  const currentModel = computed<EcosystemModel>(
    () => ECOSYSTEM_MODELS.find((m) => m.id === activeModel.value) ?? ECOSYSTEM_MODELS[0],
  );
  const params = reactive<Record<string, number>>({});
  const initials = ref<number[]>([]);
  const counts = ref<number[]>([]);
  /** يزداد كلما أُضيفت عينة جديدة — إشارة لإعادة رسم المنحنى. */
  const chartTick = ref(0);
  /** سجل الأعداد عبر الزمن — مصفوفة صفوف [عدد كل نوع] بترتيب species. */
  const chartHistory: number[][] = [];

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let clock: THREE.Clock | null = null;
  let animationId = 0;
  let resizeObserver: ResizeObserver | null = null;

  const mobiles: Mobile[] = [];
  const poolResources: Array<THREE.BufferGeometry | THREE.Material> = [];

  let sim: number[][] = [];
  let acc = 0;
  let last: number[] = [];

  const randomPoint = (y: number): THREE.Vector3 =>
    new THREE.Vector3((Math.random() * 2 - 1) * BOUNDS, y, (Math.random() * 2 - 1) * BOUNDS);

  const makeGeometry = (shape: SpeciesShape): THREE.BufferGeometry => {
    switch (shape) {
      case 'sphere':
        return new THREE.SphereGeometry(0.75, 16, 16);
      case 'box':
        return new THREE.BoxGeometry(0.9, 0.9, 0.9);
      case 'tuft':
        return new THREE.CylinderGeometry(0.08, 0.34, 0.9, 6);
      default:
        return new THREE.ConeGeometry(0.5, 1.0, 8);
    }
  };

  const clearPools = (): void => {
    if (scene) for (const m of mobiles) scene.remove(m.mesh);
    mobiles.length = 0;
    for (const r of poolResources) r.dispose();
    poolResources.length = 0;
  };

  const buildPools = (): void => {
    if (!scene) return;
    clearPools();
    currentModel.value.species.forEach((sp, si) => {
      const geo = makeGeometry(sp.shape);
      const mat = new THREE.MeshStandardMaterial({
        color: sp.color,
        roughness: 0.55,
        metalness: 0.06,
        emissive: new THREE.Color(sp.color).multiplyScalar(0.4),
        emissiveIntensity: 0.25,
      });
      poolResources.push(geo, mat);
      for (let i = 0; i < sp.pool; i += 1) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(randomPoint(sp.y));
        mesh.rotation.y = Math.random() * Math.PI * 2;
        mesh.visible = false;
        scene!.add(mesh);
        mobiles.push({
          mesh,
          si,
          order: i,
          vx: (Math.random() - 0.5) * sp.speed,
          vz: (Math.random() - 0.5) * sp.speed,
          bob: Math.random() * Math.PI * 2,
        });
      }
    });
  };

  const syncVisibility = (): void => {
    const shown = currentModel.value.species.map((sp, i) =>
      Math.min(Math.max(Math.round(last[i] ?? 0), 0), sp.pool),
    );
    for (const m of mobiles) m.mesh.visible = m.order < shown[m.si];
  };

  const step = (): void => {
    const m = currentModel.value;
    const tail = sim.length > 0 ? sim[sim.length - 1] : last;
    const next = m
      .step(tail, params, STEP_DT)
      .map((v) => Math.min(POP_CAP, Math.max(0, v)));
    sim.push(next);
    if (sim.length > PHASE_WINDOW) sim.shift();
    last = next;
    iteration.value += 1;
    counts.value = next.map((v) => Math.round(v));
    phase.value = classifyPhase(sim, m.species.length, m.id);
    syncVisibility();
  };

  const moveMobiles = (delta: number): void => {
    const species = currentModel.value.species;
    for (const m of mobiles) {
      const sp = species[m.si];
      if (!sp || sp.speed === 0) continue;
      m.mesh.position.x += m.vx * delta;
      m.mesh.position.z += m.vz * delta;
      m.bob += delta * 2;
      m.mesh.position.y = sp.y + Math.sin(m.bob) * 0.12;
      if (Math.abs(m.mesh.position.x) > BOUNDS) m.vx *= -1;
      if (Math.abs(m.mesh.position.z) > BOUNDS) m.vz *= -1;
      if (sp.shape === 'cone') m.mesh.rotation.y += delta * 1.4;
    }
  };

  const resetSim = (vals: number[]): void => {
    sim = [];
    acc = 0;
    iteration.value = 0;
    last = [...vals];
    counts.value = vals.map((v) => Math.round(v));
    phase.value = 'initial';
    chartHistory.length = 0;
    chartTick.value += 1;
    syncVisibility();
    const species = currentModel.value.species;
    for (const m of mobiles) {
      const sp = species[m.si];
      if (!sp) continue;
      m.mesh.position.copy(randomPoint(sp.y));
      m.vx = (Math.random() - 0.5) * sp.speed;
      m.vz = (Math.random() - 0.5) * sp.speed;
    }
  };

  const animate = (): void => {
    animationId = requestAnimationFrame(animate);
    const delta = Math.min(clock?.getDelta() ?? 0.016, 0.05);

    if (isRunning.value) {
      acc += delta * speed.value;
      let guard = 0;
      while (acc >= STEP_DT && guard < 20) {
        step();
        guard += 1;
        acc -= STEP_DT;
      }
      if (guard > 0) {
        chartHistory.push([...last]);
        if (chartHistory.length > CHART_MAX) chartHistory.shift();
        chartTick.value += 1;
      }
    }

    moveMobiles(delta);
    if (scene && camera && renderer) {
      if (controls) {
        controls.autoRotate = autoRotate.value;
        controls.update();
      }
      renderer.render(scene, camera);
    }
  };

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const w = containerRef.value.clientWidth;
    const h = containerRef.value.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  const dispose = (): void => {
    cancelAnimationFrame(animationId);
    controls?.dispose();
    clearPools();
    scene?.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) m.dispose();
      }
    });
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
    clock = null;
  };

  const applyModelDefaults = (): void => {
    const m = currentModel.value;
    for (const k of Object.keys(params)) delete params[k];
    for (const p of m.params) params[p.key] = p.def;
    initials.value = [...m.initials];
  };

  const init = (): void => {
    try {
      if (!containerRef.value) return;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      camera = new THREE.PerspectiveCamera(
        55,
        containerRef.value.clientWidth / Math.max(1, containerRef.value.clientHeight),
        0.1,
        200,
      );
      camera.position.set(14, 10, 16);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
      renderer.shadowMap.enabled = true;
      containerRef.value.appendChild(renderer.domElement);

      addLights(scene);

      // الأرض والشبكة
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(BOUNDS + 2, 48),
        new THREE.MeshStandardMaterial({ color: 0x0e2417, roughness: 0.95 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.45;
      scene.add(ground);

      const grid = new THREE.GridHelper((BOUNDS + 1) * 2, 20, 0x2d5a43, 0x1c3b2b);
      grid.position.y = -0.44;
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.Material).opacity = 0.5;
      scene.add(grid);

      buildPools();

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 1.2;
      controls.minDistance = 6;
      controls.maxDistance = 34;
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.target.set(0, 0, 0);

      clock = new THREE.Clock();
      resetSim(initials.value);
      animate();
      isLoading.value = false;
    } catch {
      error.value = 'WebGL is not supported or has been disabled in this browser.';
      isLoading.value = false;
    }
  };

  const toggleRun = (): void => {
    if (!hasRun.value) hasRun.value = true;
    isRunning.value = !isRunning.value;
  };

  /** يضبط الشروط الابتدائية ويعيد تشغيل المحاكاة من الصفر. */
  const setInitials = (vals: number[]): void => {
    isRunning.value = false;
    initials.value = [...vals];
    resetSim(vals);
  };

  const reset = (): void => setInitials(initials.value);

  /** يبدّل النموذج البيئي النشط ويعيد بناء الساحة بالأنواع الجديدة. */
  const setModel = (id: EcosystemModelId): void => {
    if (id === activeModel.value) return;
    isRunning.value = false;
    activeModel.value = id;
    applyModelDefaults();
    buildPools();
    resetSim(initials.value);
  };

  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value;
  };

  const resetCamera = (): void => controls?.reset();

  const screenshot = (): string | null => {
    if (!renderer || !scene || !camera) return null;
    try {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  applyModelDefaults();
  last = [...initials.value];
  counts.value = initials.value.map((v) => Math.round(v));

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
    isRunning,
    isLoading,
    error,
    autoRotate,
    speed,
    iteration,
    phase,
    hasRun,
    activeModel,
    currentModel,
    models: ECOSYSTEM_MODELS,
    params,
    initials,
    counts,
    chartHistory,
    chartTick,
    toggleRun,
    setInitials,
    setModel,
    reset,
    toggleAutoRotate,
    resetCamera,
    screenshot,
  };
}
