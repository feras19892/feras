import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addLights } from './biology-geometry';

const STAGE_NAMES = ['unzipping', 'basePairing', 'twoStrands'] as const;
export type DNAReplicationStageName = (typeof STAGE_NAMES)[number];

const COLORS = {
  strandA: 0x60a5fa,
  strandB: 0xa78bfa,
  rungAT: 0xfb923c,
  rungGC: 0x2dd4bf,
  newA: 0x34d399,
  newB: 0xf472b6,
  daughterRung: 0x94a3b8,
} as const;

const HELIX_RADIUS = 0.9;
const HELIX_HEIGHT = 6.2;
const HELIX_TURNS = 2.5;
const POINTS = 36;
const UP = new THREE.Vector3(0, 1, 0);
const auxScale = new THREE.Vector3();

interface Segment {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  sign: number;
}

interface Rung {
  mesh: THREE.Mesh;
  y: number;
}

interface Nucleotide {
  mesh: THREE.Mesh;
  baseX: number;
  y: number;
  baseZ: number;
  sign: number;
}

function helixPoint(i: number, phase: number): THREE.Vector3 {
  const t = i / POINTS;
  const angle = t * HELIX_TURNS * Math.PI * 2 + phase;
  const y = -HELIX_HEIGHT / 2 + t * HELIX_HEIGHT;
  return new THREE.Vector3(Math.cos(angle) * HELIX_RADIUS, y, Math.sin(angle) * HELIX_RADIUS);
}

export function useDNAReplication3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentStageIndex = ref(0);
  const error = ref<string | null>(null);
  const isLoading = ref(true);
  const autoRotate = ref(false);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let splitCurrent = HELIX_HEIGHT / 2;
  let segments: Segment[] = [];
  let rungs: Rung[] = [];
  let nucleotides: Nucleotide[] = [];
  let daughters: THREE.Group | null = null;

  function buildBackbones(): void {
    const up = new THREE.Vector3(0, 1, 0);
    for (const [phase, color, sign] of [
      [0, COLORS.strandA, 1],
      [Math.PI, COLORS.strandB, -1],
    ] as const) {
      for (let i = 0; i < POINTS - 1; i += 1) {
        const p1 = helixPoint(i, phase);
        const p2 = helixPoint(i + 1, phase);
        const dir = p2.clone().sub(p1).normalize();
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 1, 8),
          new THREE.MeshPhysicalMaterial({ color, roughness: 0.35 })
        );
        seg.quaternion.setFromUnitVectors(up, dir);
        seg.scale.y = p1.distanceTo(p2) * 1.15;
        seg.position.copy(p1).add(p2).multiplyScalar(0.5);
        segments.push({ mesh: seg, baseX: seg.position.x, baseY: seg.position.y, baseZ: seg.position.z, sign });
        scene?.add(seg);
      }
    }
  }

  function buildRungs(): void {
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < POINTS - 1; i += 2) {
      const pa = helixPoint(i, 0);
      const pb = helixPoint(i, Math.PI);
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 1, 8),
        new THREE.MeshPhysicalMaterial({
          color: i % 4 === 0 ? COLORS.rungAT : COLORS.rungGC,
          roughness: 0.4, transparent: true, opacity: 0.9,
        })
      );
      rung.quaternion.setFromUnitVectors(up, pa.clone().sub(pb).normalize());
      rung.scale.y = pa.distanceTo(pb);
      rung.position.copy(mid);
      rungs.push({ mesh: rung, y: mid.y });
      scene?.add(rung);
    }
  }

  function buildNucleotides(): void {
    const geometry = new THREE.SphereGeometry(0.1, 12, 12);
    for (let i = 0; i < POINTS - 1; i += 2) {
      const pa = helixPoint(i, 0);
      const pb = helixPoint(i, Math.PI);
      for (const [p, sign, color] of [
        [pa, 1, COLORS.newA],
        [pb, -1, COLORS.newB],
      ] as const) {
        const nuc = new THREE.Mesh(
          geometry,
          new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, transparent: true, opacity: 0 })
        );
        nuc.position.copy(p);
        nucleotides.push({ mesh: nuc, baseX: p.x, y: p.y, baseZ: p.z, sign });
        scene?.add(nuc);
      }
    }
  }

  function buildMiniHelix(x: number, color1: number, color2: number): THREE.Group {
    const group = new THREE.Group();
    const r = 0.55;
    const h = 5.6;
    const turns = 2.5;
    for (const [phase, color] of [
      [0, color1],
      [Math.PI, color2],
    ] as const) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 40; i += 1) {
        const t = i / 40;
        const angle = t * turns * Math.PI * 2 + phase;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, -h / 2 + t * h, Math.sin(angle) * r));
      }
      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.055, 8, false),
        new THREE.MeshPhysicalMaterial({ color, roughness: 0.35 })
      ));
    }
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 1; i < 24; i += 2) {
      const t = i / 24;
      const angle = t * turns * Math.PI * 2;
      const pa = new THREE.Vector3(Math.cos(angle) * r, -h / 2 + t * h, Math.sin(angle) * r);
      const pb = new THREE.Vector3(-pa.x, pa.y, -pa.z);
      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 1, 8),
        new THREE.MeshPhysicalMaterial({ color: COLORS.daughterRung, roughness: 0.4 })
      );
      rung.quaternion.setFromUnitVectors(up, pa.clone().sub(pb).normalize());
      rung.scale.y = pa.distanceTo(pb);
      rung.position.copy(pa).add(pb).multiplyScalar(0.5);
      group.add(rung);
    }
    group.position.x = x;
    group.scale.setScalar(0.01);
    return group;
  }
  function lerpOpacity(material: THREE.Material | THREE.Material[], target: number): void {
    const mats = Array.isArray(material) ? material : [material];
    for (const m of mats) m.opacity += (target - m.opacity) * 0.08;
  }

  const updateScene = (): void => {
    // سحّاب الفك: ينزل تدريجياً عند المرحلة الأولى ويبقى مفتوحاً بعدها
    const splitTarget = -HELIX_HEIGHT / 2;
    splitCurrent += (splitTarget - splitCurrent) * 0.02;

    // انفصال قطاعات العمود الفقري فوق نقطة الفك
    for (const seg of segments) {
      const off = seg.baseY > splitCurrent ? (seg.baseY - splitCurrent) * 0.55 : 0;
      seg.mesh.position.set(seg.baseX + seg.sign * off, seg.baseY, seg.baseZ);
    }

    // سلالم القواعد: تنكسر في المنطقة المفتوحة
    for (const rung of rungs) {
      const open = rung.y > splitCurrent;
      lerpOpacity(rung.mesh.material, open ? 0 : 0.9);
    }

    // نوكليوتيدات حرة ترتبط بالقواعد المكملة في المنطقة المفتوحة (المرحلة 2+)
    for (const nuc of nucleotides) {
      const off = nuc.y > splitCurrent ? (nuc.y - splitCurrent) * 0.55 : 0;
      nuc.mesh.position.set(nuc.baseX + nuc.sign * off, nuc.y, nuc.baseZ);
      lerpOpacity(nuc.mesh.material, currentStageIndex.value >= 1 ? 1 : 0);
    }

    // النسختان الابنتان تظهران جنباً إلى جنب (المرحلة 3) ويخفت الأصل
    const parentOpacity = currentStageIndex.value === 2 ? 0.12 : 1;
    for (const seg of segments) lerpOpacity(seg.mesh.material, parentOpacity);
    if (daughters) {
      const dTarget = currentStageIndex.value === 2 ? 1 : 0.01;
      for (const d of daughters.children) {
        d.scale.lerp(auxScale.set(dTarget, dTarget, dTarget), 0.06);
      }
    }
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10.5);

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
    buildBackbones();
    buildRungs();
    buildNucleotides();
    daughters = new THREE.Group();
    daughters.add(buildMiniHelix(-2.5, COLORS.strandA, COLORS.newA));
    daughters.add(buildMiniHelix(2.5, COLORS.strandB, COLORS.newB));
    scene?.add(daughters);

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
    segments = [];
    rungs = [];
    nucleotides = [];
    daughters = null;
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
    splitCurrent = HELIX_HEIGHT / 2;
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
