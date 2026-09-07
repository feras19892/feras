import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

/**
 * مراحل PCR الثلاث — تتحكم في أنيميشن المشهد.
 */
export type PcrPhase = 'denaturation' | 'annealing' | 'extension';

const PHASES: PcrPhase[] = ['denaturation', 'annealing', 'extension'];

/** ألوان القواعد النيتروجينية */
const BASE_COLORS: Record<string, number> = {
  A: 0x4ade80, // أخضر — Adenine
  T: 0xef4444, // أحمر — Thymine
  G: 0x3b82f6, // أزرق — Guanine
  C: 0xfacc15, // أصفر — Cytosine
};

/** تسلسل DNA الهدف (20 قاعدة) */
const TARGET_SEQUENCE = 'ATGCGATTCGATCGATGCTA';

/** طول الشريط */
const STRAND_LENGTH = TARGET_SEQUENCE.length;
/** المسافة بين قاعدتين متجاورتين */
const SPACING = 0.45;
/** نصف قطر لولب DNA */
const HELIX_RADIUS = 0.7;
const auxPos = new THREE.Vector3();

interface Nucleotide {
  mesh: THREE.Mesh;
  base: string;
  strand: 0 | 1;
  index: number;
  /** الموضع الأساسي على اللولب */
  basePos: THREE.Vector3;
  /** الموضع عند الانفصال */
  separatedPos: THREE.Vector3;
}

interface Primer {
  mesh: THREE.Mesh;
  strand: 0 | 1;
  startIndex: number;
  length: number;
}

interface NewStrand {
  nucleotides: THREE.Mesh[];
  strand: 0 | 1;
  revealed: number;
}

export function usePcr3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentPhaseIndex = ref(0);
  const cycleCount = ref(1);
  const isRunning = ref(false);
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const autoRotate = ref(false);
  const temperature = ref(95);

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let clock: THREE.Clock | null = null;

  let dnaGroup: THREE.Group | null = null;
  let strand0Nucleotides: Nucleotide[] = [];
  let strand1Nucleotides: Nucleotide[] = [];
  let backbone0: THREE.Mesh | null = null;
  let backbone1: THREE.Mesh | null = null;
  let primers: Primer[] = [];
  let newStrands: NewStrand[] = [];
  let temperatureBar: THREE.Mesh | null = null;

  /** علم إلغاء لدورة runCycle عند unmount/reset */
  let runCancelled = false;
  /** معرّفات setTimeout قابلة للإلغاء */
  let pendingTimers: ReturnType<typeof setTimeout>[] = [];

  /** عامل الانفصال: 0 = ملتصق، 1 = منفصل تماماً */
  let separationFactor = 0;
  /** عامل الـ primer: 0 = بعيد، 1 = مرتبط */
  let primerFactor = 0;
  /** عامل الامتداد: 0 = لم يبدأ، 1 = اكتمل */
  let extensionFactor = 0;
  /** انتقال سلس بين المراحل */
  let phaseProgress = 0;

  /** يبني قاعدة نيتروجينية واحدة */
  const buildNucleotide = (base: string, strand: 0 | 1, index: number): Nucleotide => {
    const color = BASE_COLORS[base] ?? 0x94a3b8;
    const geo = new THREE.SphereGeometry(0.18, 18, 18);
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.3,
      metalness: 0.1,
      emissive: color,
      emissiveIntensity: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);

    // موضع اللولب
    const angle = (index / STRAND_LENGTH) * Math.PI * 4; // لولبان كاملان تقريباً
    const dir = strand === 0 ? 1 : -1;
    const basePos = new THREE.Vector3(
      Math.cos(angle) * HELIX_RADIUS * dir,
      (index - STRAND_LENGTH / 2) * SPACING,
      Math.sin(angle) * HELIX_RADIUS * dir,
    );
    // موضع الانفصال — كل شريط يبتعد عن الآخر
    const separatedPos = new THREE.Vector3(
      basePos.x + (strand === 0 ? -2.5 : 2.5),
      basePos.y,
      basePos.z,
    );

    mesh.position.copy(basePos);
    return { mesh, base, strand, index, basePos, separatedPos };
  };

  /** يبني العمود الفقري (sugar-phosphate backbone) كأنبوب */
  const buildBackbone = (nucleotides: Nucleotide[], strand: 0 | 1): THREE.Mesh => {
    const points = nucleotides.map((n) => n.basePos.clone());
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 80, 0.06, 8, false);
    const mat = new THREE.MeshPhysicalMaterial({
      color: strand === 0 ? 0x64748b : 0x94a3b8,
      roughness: 0.4,
      metalness: 0.1,
    });
    return new THREE.Mesh(geo, mat);
  };

  /** يبني جزيء primer قصير */
  const buildPrimer = (strand: 0 | 1, startIndex: number, length: number): Primer => {
    const geo = new THREE.CapsuleGeometry(0.08, length * SPACING * 0.9, 4, 12);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    // يبدأ قرب نهاية الشريط
    const y = (startIndex + length / 2 - STRAND_LENGTH / 2) * SPACING;
    const offset = strand === 0 ? -1.0 : 1.0;
    mesh.position.set(offset, y, 0);
    mesh.rotation.z = Math.PI / 2;
    return { mesh, strand, startIndex, length };
  };

  /** يبني الشريط الجديد المتكون أثناء الامتداد */
  const buildNewStrand = (strand: 0 | 1): NewStrand => {
    const nucleotides: THREE.Mesh[] = [];
    for (let i = 0; i < STRAND_LENGTH; i += 1) {
      const base = TARGET_SEQUENCE[i];
      const color = BASE_COLORS[base] ?? 0x94a3b8;
      const geo = new THREE.SphereGeometry(0.16, 14, 14);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.3,
        emissive: color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / STRAND_LENGTH) * Math.PI * 4;
      const dir = strand === 0 ? -1 : 1;
      mesh.position.set(
        Math.cos(angle) * HELIX_RADIUS * dir + (strand === 0 ? -2.5 : 2.5),
        (i - STRAND_LENGTH / 2) * SPACING,
        Math.sin(angle) * HELIX_RADIUS * dir,
      );
      nucleotides.push(mesh);
    }
    return { nucleotides, strand, revealed: 0 };
  };

  /** يبني عمود حرارة جانبي */
  const buildTemperatureBar = (): THREE.Mesh => {
    const geo = new THREE.BoxGeometry(0.3, 4, 0.3);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      roughness: 0.3,
      emissive: 0xef4444,
      emissiveIntensity: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(-4.5, 0, 0);
    return mesh;
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 14);

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
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.4;

    addLights(scene);
    clock = new THREE.Clock();

    // بناء DNA
    dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    strand0Nucleotides = [];
    strand1Nucleotides = [];
    for (let i = 0; i < STRAND_LENGTH; i += 1) {
      const base = TARGET_SEQUENCE[i];
      const n0 = buildNucleotide(base, 0, i);
      const n1 = buildNucleotide(complement(base), 1, i);
      dnaGroup.add(n0.mesh);
      dnaGroup.add(n1.mesh);
      strand0Nucleotides.push(n0);
      strand1Nucleotides.push(n1);
    }

    backbone0 = buildBackbone(strand0Nucleotides, 0);
    backbone1 = buildBackbone(strand1Nucleotides, 1);
    dnaGroup.add(backbone0);
    dnaGroup.add(backbone1);

    // primers (تظهر في مرحلة التلدين)
    primers = [
      buildPrimer(0, 0, 6),
      buildPrimer(1, STRAND_LENGTH - 6, 6),
    ];
    primers.forEach((p) => {
      p.mesh.visible = false;
      dnaGroup!.add(p.mesh);
    });

    // أشرطة جديدة (تتكون في الامتداد)
    newStrands = [buildNewStrand(0), buildNewStrand(1)];
    newStrands.forEach((ns) => {
      ns.nucleotides.forEach((m) => dnaGroup!.add(m));
    });

    // عمود الحرارة
    temperatureBar = buildTemperatureBar();
    scene.add(temperatureBar);

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      controls?.update();
      updateScene();
      renderer?.render(scene!, camera!);
    };
    animate();
  };

  /** القاعدة المكملة */
  function complement(base: string): string {
    const map: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
    return map[base] ?? 'A';
  }

  /** يحدّد عوامل الأنيميشن حسب المرحلة */
  const updatePhaseFactors = (): void => {
    const phase = PHASES[currentPhaseIndex.value];
    const t = phaseProgress;

    if (phase === 'denaturation') {
      // الشريطان ينفصلان تدريجياً
      separationFactor = Math.min(1, t * 1.5);
      primerFactor = 0;
      extensionFactor = 0;
      temperature.value = 95;
    } else if (phase === 'annealing') {
      // الشريطان منفصلان، primers ترتبط
      separationFactor = 1;
      primerFactor = Math.max(0, Math.min(1, (t - 0.3) * 2));
      extensionFactor = 0;
      temperature.value = 55;
    } else if (phase === 'extension') {
      // primers مرتبطة، شريط جديد يتكون
      separationFactor = 1;
      primerFactor = 1;
      extensionFactor = Math.max(0, Math.min(1, (t - 0.2) * 1.3));
      temperature.value = 72;
    }
  };

  const updateScene = (): void => {
    if (!clock || !dnaGroup) return;
    const time = clock.getElapsedTime();

    // تحديث عوامل المراحل
    phaseProgress = Math.min(1, phaseProgress + 0.012);
    updatePhaseFactors();

    // تحريك النيوكليوتيدات بين الموضع الملتصق والمنفصل
    for (const n of [...strand0Nucleotides, ...strand1Nucleotides]) {
      auxPos.copy(n.basePos).lerp(n.separatedPos, separationFactor);
      // اهتزاز خفيف عند الحرارة العالية
      if (temperature.value > 80) {
        auxPos.x += Math.sin(time * 8 + n.index) * 0.03 * separationFactor;
        auxPos.y += Math.cos(time * 6 + n.index) * 0.02 * separationFactor;
      }
      n.mesh.position.lerp(auxPos, 0.15);
    }

    // تحديث العمود الفقري — تحديث الشفافية فقط بدلاً من إعادة بناء المواد كل إطار
    const backboneOpacity = 1 - separationFactor * 0.3;
    if (backbone0) {
      const mat = backbone0.material as THREE.MeshPhysicalMaterial;
      mat.transparent = true;
      mat.opacity = backboneOpacity;
    }
    if (backbone1) {
      const mat = backbone1.material as THREE.MeshPhysicalMaterial;
      mat.transparent = true;
      mat.opacity = backboneOpacity;
    }

    // إظهار وتحريك primers
    for (const primer of primers) {
      if (separationFactor > 0.5) {
        primer.mesh.visible = true;
        // يتحرك نحو الشريط المناسب
        const strandNucs = primer.strand === 0 ? strand0Nucleotides : strand1Nucleotides;
        const targetNuc = strandNucs[primer.startIndex];
        if (targetNuc) {
          const targetPos = targetNuc.mesh.position;
          const offset = primer.strand === 0 ? 0.35 : -0.35;
          const startX = targetPos.x + offset * 3 * (1 - primerFactor);
          const endX = targetPos.x + offset;
          const lerpX = startX + (endX - startX) * primerFactor;
          primer.mesh.position.lerp(auxPos.set(lerpX, targetPos.y, targetPos.z), 0.12);
          primer.mesh.rotation.z = Math.PI / 2;
          (primer.mesh.material as THREE.MeshPhysicalMaterial).opacity = primerFactor;
        }
      } else {
        primer.mesh.visible = false;
      }
    }

    // إظهار الأشرطة الجديدة أثناء الامتداد
    for (const ns of newStrands) {
      const revealCount = Math.floor(extensionFactor * STRAND_LENGTH);
      for (let i = 0; i < ns.nucleotides.length; i += 1) {
        const mat = ns.nucleotides[i].material as THREE.MeshPhysicalMaterial;
        if (i < revealCount) {
          mat.opacity = Math.min(1, mat.opacity + 0.05);
          // يتحرك نحو الشريط الأصلي (يعيد بناء اللولب)
          const strandNucs = ns.strand === 0 ? strand0Nucleotides : strand1Nucleotides;
          const targetNuc = strandNucs[i];
          if (targetNuc) {
            const target = targetNuc.basePos.clone();
            ns.nucleotides[i].position.lerp(target, 0.1);
          }
        } else {
          mat.opacity = Math.max(0, mat.opacity - 0.02);
        }
      }
    }

    // عمود الحرارة — يتغير لونه وارتفاعه
    if (temperatureBar) {
      const tempRatio = (temperature.value - 20) / 80;
      const color = temperature.value > 80 ? 0xef4444 : temperature.value > 60 ? 0xfacc15 : 0x22c55e;
      (temperatureBar.material as THREE.MeshPhysicalMaterial).color.setHex(color);
      (temperatureBar.material as THREE.MeshPhysicalMaterial).emissive.setHex(color);
      temperatureBar.scale.y = 0.3 + tempRatio * 1.5;
      // نبض خفيف
      const pulse = 1 + Math.sin(time * 4) * 0.03;
      temperatureBar.scale.y *= pulse;
    }

    // دوران تلقائي للمجموعة
    if (autoRotate.value && dnaGroup) {
      dnaGroup.rotation.y += 0.005;
    }
  };

  const setPhase = (index: number): void => {
    currentPhaseIndex.value = Math.max(0, Math.min(PHASES.length - 1, index));
    phaseProgress = 0;
  };

  const nextPhase = (): void => setPhase(currentPhaseIndex.value + 1);
  const previousPhase = (): void => setPhase(currentPhaseIndex.value - 1);

  /** يشغّل دورة كاملة (تمسخ → تلدين → امتداد) */
  const runCycle = async (): Promise<void> => {
    if (isRunning.value) return;
    isRunning.value = true;
    runCancelled = false;
    for (let i = 0; i < PHASES.length; i += 1) {
      if (runCancelled) return;
      setPhase(i);
      await new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          pendingTimers = pendingTimers.filter((t) => t !== id);
          resolve();
        }, 2500);
        pendingTimers.push(id);
      });
    }
    if (runCancelled) return;
    cycleCount.value += 1;
    // إعادة تعيين للدورة التالية
    setPhase(0);
    isRunning.value = false;
  };

  const resetSimulation = (): void => {
    cycleCount.value = 1;
    setPhase(0);
    separationFactor = 0;
    primerFactor = 0;
    extensionFactor = 0;
    for (const ns of newStrands) {
      for (const m of ns.nucleotides) {
        (m.material as THREE.MeshPhysicalMaterial).opacity = 0;
      }
    }
  };

  const toggleAutoRotate = (): void => {
    autoRotate.value = !autoRotate.value;
  };

  const resetCamera = (): void => {
    if (controls) controls.reset();
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

  const resize = (): void => {
    if (!containerRef.value || !camera || !renderer) return;
    const w = containerRef.value.clientWidth;
    const h = containerRef.value.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  let resizeObserver: ResizeObserver | null = null;

  const dispose = (): void => {
    cancelAnimationFrame(animationId);
    runCancelled = true;
    pendingTimers.forEach((id) => clearTimeout(id));
    pendingTimers = [];
    controls?.dispose();
    dnaGroup?.traverse((child) => {
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
    dnaGroup = null;
  };

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
    currentPhaseIndex,
    cycleCount,
    isRunning,
    error,
    isLoading,
    autoRotate,
    temperature,
    setPhase,
    nextPhase,
    previousPhase,
    runCycle,
    resetSimulation,
    toggleAutoRotate,
    resetCamera,
    screenshot,
  };
}
