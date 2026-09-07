import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

export type CrisprStageName = 'guide' | 'scan' | 'cut' | 'repair';
const STAGES: CrisprStageName[] = ['guide', 'scan', 'cut', 'repair'];

const BASE_COLORS: Record<string, number> = {
  A: 0x4ade80, T: 0xef4444, G: 0x3b82f6, C: 0xfacc15,
};

const TARGET_SEQUENCE = 'ATGCGATTCGATCGATGCTA';
const STRAND_LENGTH = TARGET_SEQUENCE.length;
const SPACING = 0.42;
const HELIX_RADIUS = 0.65;
/** موضع القص (PAM site) */
const CUT_INDEX = 10;
const auxPos = new THREE.Vector3();

interface DnaBase {
  mesh: THREE.Mesh;
  base: string;
  strand: 0 | 1;
  index: number;
  basePos: THREE.Vector3;
}

export function useCrispr3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentStageIndex = ref(0);
  const isRunning = ref(false);
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const autoRotate = ref(false);

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let clock: THREE.Clock | null = null;

  let dnaGroup: THREE.Group | null = null;
  let bases: DnaBase[] = [];
  let backbone0: THREE.Mesh | null = null;
  let backbone1: THREE.Mesh | null = null;
  let cas9Group: THREE.Group | null = null;
  let grnaMesh: THREE.Mesh | null = null;
  let cutEffectGroup: THREE.Group | null = null;
  let repairMesh: THREE.Mesh | null = null;

  let stageProgress = 0;
  let scanOffset = 0;

  /** علم إلغاء لـ runFullSequence عند unmount/reset */
  let runCancelled = false;
  let pendingTimers: ReturnType<typeof setTimeout>[] = [];

  function complement(base: string): string {
    const map: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
    return map[base] ?? 'A';
  }

  const buildBase = (base: string, strand: 0 | 1, index: number): DnaBase => {
    const color = BASE_COLORS[base] ?? 0x94a3b8;
    const geo = new THREE.SphereGeometry(0.16, 16, 16);
    const mat = new THREE.MeshPhysicalMaterial({
      color, roughness: 0.3, emissive: color, emissiveIntensity: 0.12,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (index / STRAND_LENGTH) * Math.PI * 3;
    const dir = strand === 0 ? 1 : -1;
    const basePos = new THREE.Vector3(
      Math.cos(angle) * HELIX_RADIUS * dir,
      (index - STRAND_LENGTH / 2) * SPACING,
      Math.sin(angle) * HELIX_RADIUS * dir,
    );
    mesh.position.copy(basePos);
    return { mesh, base, strand, index, basePos };
  };

  const buildBackbone = (strandBases: DnaBase[], strand: 0 | 1): THREE.Mesh => {
    const points = strandBases.map((b) => b.basePos.clone());
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 60, 0.05, 8, false);
    const mat = new THREE.MeshPhysicalMaterial({
      color: strand === 0 ? 0x64748b : 0x94a3b8, roughness: 0.4,
    });
    return new THREE.Mesh(geo, mat);
  };

  /** يبني بروتين Cas9 — شكل بيضاوي مع فجوة لاحتضانة DNA */
  const buildCas9 = (): THREE.Group => {
    const group = new THREE.Group();
    // الجسم الرئيسي
    const bodyGeo = new THREE.SphereGeometry(1.2, 32, 24);
    bodyGeo.scale(1.3, 1.0, 1.1);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6, roughness: 0.25, metalness: 0.15,
      emissive: 0x8b5cf6, emissiveIntensity: 0.1, clearcoat: 0.5,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // فجوة (groove) لاحتضانة DNA
    const grooveGeo = new THREE.TorusGeometry(0.7, 0.25, 12, 32);
    const grooveMat = new THREE.MeshPhysicalMaterial({
      color: 0xa78bfa, roughness: 0.3, transparent: true, opacity: 0.6,
    });
    const groove = new THREE.Mesh(grooveGeo, grooveMat);
    groove.rotation.y = Math.PI / 2;
    groove.scale.set(1.4, 1, 1);
    group.add(groove);

    // نطاقات بروتينية (REC lobe)
    const lobeGeo = new THREE.SphereGeometry(0.5, 20, 16);
    const lobeMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c3aed, roughness: 0.3, emissive: 0x7c3aed, emissiveIntensity: 0.08,
    });
    const lobe1 = new THREE.Mesh(lobeGeo, lobeMat);
    lobe1.position.set(0.8, 0.6, 0.3);
    group.add(lobe1);
    const lobe2 = new THREE.Mesh(lobeGeo, lobeMat);
    lobe2.position.set(-0.8, -0.4, -0.3);
    group.add(lobe2);

    // HNH و RuvC (نطاقات القص)
    const nucGeo = new THREE.SphereGeometry(0.3, 16, 12);
    const nucMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444, roughness: 0.2, emissive: 0xef4444, emissiveIntensity: 0.2,
    });
    const hnh = new THREE.Mesh(nucGeo, nucMat);
    hnh.position.set(0.5, -0.5, 0.6);
    hnh.name = 'HNH';
    group.add(hnh);
    const ruvc = new THREE.Mesh(nucGeo, nucMat);
    ruvc.position.set(-0.5, 0.5, -0.6);
    ruvc.name = 'RuvC';
    group.add(ruvc);

    return group;
  };

  /** يبني gRNA — خيط ملوّن */
  const buildGrna = (): THREE.Mesh => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i += 1) {
      points.push(new THREE.Vector3(
        Math.sin(i * 0.5) * 0.3,
        (i - 10) * 0.15,
        Math.cos(i * 0.5) * 0.3,
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 40, 0.06, 8, false);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4, roughness: 0.25, emissive: 0x06b6d4, emissiveIntensity: 0.3,
    });
    return new THREE.Mesh(geo, mat);
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

    addLights(scene);
    clock = new THREE.Clock();

    dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    bases = [];
    for (let i = 0; i < STRAND_LENGTH; i += 1) {
      const b0 = buildBase(TARGET_SEQUENCE[i], 0, i);
      const b1 = buildBase(complement(TARGET_SEQUENCE[i]), 1, i);
      dnaGroup.add(b0.mesh, b1.mesh);
      bases.push(b0, b1);
    }
    const strand0 = bases.filter((b) => b.strand === 0);
    const strand1 = bases.filter((b) => b.strand === 1);
    backbone0 = buildBackbone(strand0, 0);
    backbone1 = buildBackbone(strand1, 1);
    dnaGroup.add(backbone0, backbone1);

    // Cas9
    cas9Group = buildCas9();
    cas9Group.position.set(6, 0, 0);
    cas9Group.visible = false;
    scene.add(cas9Group);

    // gRNA
    grnaMesh = buildGrna();
    grnaMesh.position.set(6, 0, 0);
    grnaMesh.visible = false;
    scene.add(grnaMesh);

    // تأثير القص
    cutEffectGroup = new THREE.Group();
    scene.add(cutEffectGroup);

    // إصلاح
    repairMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0x22c55e, roughness: 0.2, emissive: 0x22c55e, emissiveIntensity: 0.3,
        transparent: true, opacity: 0,
      }),
    );
    scene.add(repairMesh);

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      controls?.update();
      updateScene();
      renderer?.render(scene!, camera!);
    };
    animate();
  };

  const updateScene = (): void => {
    if (!clock || !dnaGroup) return;
    const time = clock.getElapsedTime();
    const stage = STAGES[currentStageIndex.value];
    stageProgress = Math.min(1, stageProgress + 0.01);

    // دوران DNA خفيف دائم
    dnaGroup.rotation.y += 0.002;

    if (stage === 'guide') {
      // Cas9 + gRNA يظهران ويدوران حول DNA
      if (cas9Group) {
        cas9Group.visible = true;
        const angle = time * 0.4;
        cas9Group.position.set(
          Math.cos(angle) * 5,
          Math.sin(angle * 0.7) * 1.5,
          Math.sin(angle) * 5,
        );
        cas9Group.rotation.y = angle;
      }
      if (grnaMesh) {
        grnaMesh.visible = true;
        grnaMesh.position.copy(cas9Group!.position);
        grnaMesh.rotation.y = time * 0.5;
      }
    } else if (stage === 'scan') {
      // Cas9 يقترب من DNA ويمسح على طوله
      if (cas9Group) {
        cas9Group.visible = true;
        scanOffset = Math.sin(time * 0.8) * (STRAND_LENGTH * SPACING * 0.4);
        cas9Group.position.lerp(auxPos.set(2.5, scanOffset, 0), 0.05);
        cas9Group.rotation.y += 0.01;
      }
      if (grnaMesh) {
        grnaMesh.visible = true;
        grnaMesh.position.copy(cas9Group!.position);
      }
      // توهج القاعدة المستهدفة
      const targetBase = bases.find((b) => b.index === CUT_INDEX && b.strand === 0);
      if (targetBase) {
        const mat = targetBase.mesh.material as THREE.MeshPhysicalMaterial;
        mat.emissiveIntensity = 0.3 + Math.sin(time * 6) * 0.2;
      }
    } else if (stage === 'cut') {
      // Cas9 يحتضن موقع القص، الشريطان ينقطعان
      if (cas9Group) {
        cas9Group.visible = true;
        const targetX = (CUT_INDEX - STRAND_LENGTH / 2) * SPACING;
        cas9Group.position.lerp(auxPos.set(targetX, 0, 1.5), 0.08);
      }
      if (grnaMesh) {
        grnaMesh.visible = true;
        grnaMesh.position.copy(cas9Group!.position);
      }
      // فصل القواعد عند موقع القص
      const cutProgress = Math.min(1, stageProgress * 1.5);
      for (const b of bases) {
        if (b.index >= CUT_INDEX - 1 && b.index <= CUT_INDEX + 1) {
          const offset = b.strand === 0 ? -1 : 1;
          b.mesh.position.x = b.basePos.x + offset * cutProgress * 0.8;
          b.mesh.position.z = b.basePos.z + (b.strand === 0 ? -1 : 1) * cutProgress * 0.5;
        }
      }
      // وميض نطاقات القص — تحديث emissiveIntensity فقط بدلاً من إنشاء مواد جديدة كل إطار
      if (cas9Group) {
        const hnh = cas9Group.getObjectByName('HNH');
        const ruvc = cas9Group.getObjectByName('RuvC');
        const flash = 0.3 + Math.sin(time * 10) * 0.3;
        if (hnh) {
          const mat = (hnh as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
          mat.emissiveIntensity = flash;
        }
        if (ruvc) {
          const mat = (ruvc as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
          mat.emissiveIntensity = flash;
        }
      }
      // جزيئات تأثير القص
      if (cutEffectGroup && cutEffectGroup.children.length < 8) {
        for (let i = 0; i < 4; i += 1) {
          const p = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 }),
          );
          p.position.set(
            (CUT_INDEX - STRAND_LENGTH / 2) * SPACING,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
          );
          p.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
          );
          p.userData.life = 1;
          cutEffectGroup.add(p);
        }
      }
    } else if (stage === 'repair') {
      // Cas9 يبتعد، الإصلاح يظهر
      if (cas9Group) {
        cas9Group.position.lerp(auxPos.set(6, 0, 0), 0.05);
        cas9Group.visible = stageProgress < 0.5;
      }
      if (grnaMesh) grnaMesh.visible = stageProgress < 0.5;
      // إعادة ربط القواعد
      for (const b of bases) {
        if (b.index >= CUT_INDEX - 1 && b.index <= CUT_INDEX + 1) {
          b.mesh.position.lerp(b.basePos, 0.08);
        }
      }
      // إظهار الإصلاح
      if (repairMesh) {
        const targetX = (CUT_INDEX - STRAND_LENGTH / 2) * SPACING;
        repairMesh.position.set(targetX, 0, 0);
        const mat = repairMesh.material as THREE.MeshPhysicalMaterial;
        mat.opacity = Math.min(0.8, mat.opacity + 0.02);
        const pulse = 1 + Math.sin(time * 3) * 0.15;
        repairMesh.scale.setScalar(pulse * stageProgress);
      }
    }

    // تحديث جزيئات القص
    if (cutEffectGroup) {
      for (let i = cutEffectGroup.children.length - 1; i >= 0; i -= 1) {
        const p = cutEffectGroup.children[i] as THREE.Mesh;
        const vel = p.userData.velocity as THREE.Vector3;
        p.position.add(vel);
        p.userData.life -= 0.02;
        (p.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.userData.life);
        if (p.userData.life <= 0) {
          cutEffectGroup.remove(p);
          p.geometry.dispose();
          (p.material as THREE.Material).dispose();
        }
      }
    }

    if (autoRotate.value && dnaGroup) {
      dnaGroup.rotation.y += 0.005;
    }
  };

  const setStage = (index: number): void => {
    currentStageIndex.value = Math.max(0, Math.min(STAGES.length - 1, index));
    stageProgress = 0;
    // تنظيف تأثيرات القص عند تغيير المرحلة
    if (cutEffectGroup) {
      while (cutEffectGroup.children.length > 0) {
        const p = cutEffectGroup.children[0] as THREE.Mesh;
        cutEffectGroup.remove(p);
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      }
    }
    if (repairMesh) {
      (repairMesh.material as THREE.MeshPhysicalMaterial).opacity = 0;
    }
  };

  const nextStage = (): void => setStage(currentStageIndex.value + 1);
  const previousStage = (): void => setStage(currentStageIndex.value - 1);

  const runFullSequence = async (): Promise<void> => {
    if (isRunning.value) return;
    isRunning.value = true;
    runCancelled = false;
    for (let i = 0; i < STAGES.length; i += 1) {
      if (runCancelled) return;
      setStage(i);
      await new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          pendingTimers = pendingTimers.filter((t) => t !== id);
          resolve();
        }, 3000);
        pendingTimers.push(id);
      });
    }
    if (runCancelled) return;
    setStage(0);
    isRunning.value = false;
  };

  const resetSimulation = (): void => {
    setStage(0);
    for (const b of bases) {
      b.mesh.position.copy(b.basePos);
    }
  };

  const toggleAutoRotate = (): void => { autoRotate.value = !autoRotate.value; };
  const resetCamera = (): void => { if (controls) controls.reset(); };

  const screenshot = (): string | null => {
    if (!renderer || !scene || !camera) return null;
    try {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    } catch { return null; }
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
    scene = null; camera = null; renderer = null; controls = null; clock = null;
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
    currentStageIndex,
    isRunning,
    error,
    isLoading,
    autoRotate,
    setStage,
    nextStage,
    previousStage,
    runFullSequence,
    resetSimulation,
    toggleAutoRotate,
    resetCamera,
    screenshot,
  };
}
