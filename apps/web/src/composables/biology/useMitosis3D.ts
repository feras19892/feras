import { onMounted, onUnmounted, type Ref, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const STAGE_NAMES = ['prophase', 'metaphase', 'anaphase', 'telophase'] as const;
export type MitosisStageName = (typeof STAGE_NAMES)[number];

interface ChromosomeMesh {
  mesh: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  centromere: THREE.Mesh;
  baseAngle: number;
}

export function useMitosis3D(containerRef: Ref<HTMLDivElement | null>) {
  const currentStageIndex = ref(0);
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let animationId = 0;
  let nucleusMembrane: THREE.Mesh | null = null;
  let cellMembrane: THREE.Mesh | null = null;
  let spindleGroup: THREE.Group | null = null;
  const chromosomes: ChromosomeMesh[] = [];
  const chromosomeTargets = new Map<string, THREE.Vector3[]>();

  const addLights = (s: THREE.Scene): void => {
    s.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(5, 8, 5);
    s.add(key);
    const fill = new THREE.DirectionalLight(0xb4c6ef, 0.5);
    fill.position.set(-5, 2, -5);
    s.add(fill);
  };

  const createChromosome = (angle: number, color: number): ChromosomeMesh => {
    const group = new THREE.Group();
    const armGeometry = new THREE.CapsuleGeometry(0.12, 0.5, 4, 12);
    const material = new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, metalness: 0.05 });
    const centromereMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.35 });

    const leftArm = new THREE.Mesh(armGeometry, material);
    leftArm.position.set(-0.22, 0.25, 0);
    leftArm.rotation.z = Math.PI / 6;

    const rightArm = new THREE.Mesh(armGeometry, material);
    rightArm.position.set(0.22, 0.25, 0);
    rightArm.rotation.z = -Math.PI / 6;

    const centromere = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), centromereMaterial);
    centromere.position.set(0, 0, 0);

    group.add(leftArm, rightArm, centromere);
    group.rotation.y = angle;
    return { mesh: group, leftArm, rightArm, centromere, baseAngle: angle };
  };

  const buildSpindleFiber = (start: THREE.Vector3, end: THREE.Vector3): THREE.Line => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 });
    return new THREE.Line(geometry, material);
  };

  const updateSpindleFibers = (): void => {
    if (!spindleGroup || !scene) return;
    spindleGroup.clear();
    const stage = STAGE_NAMES[currentStageIndex.value];
    if (stage === 'prophase') return;

    const poles = [new THREE.Vector3(0, 4, 0), new THREE.Vector3(0, -4, 0)];
    for (const chromosome of chromosomes) {
      const worldPos = new THREE.Vector3();
      chromosome.centromere.getWorldPosition(worldPos);
      const start = poles[0];
      const end = poles[1];
      if (stage === 'metaphase' || stage === 'anaphase') {
        spindleGroup.add(buildSpindleFiber(start, worldPos));
        spindleGroup.add(buildSpindleFiber(end, worldPos));
      } else if (stage === 'telophase') {
        const poleOffset = worldPos.y > 0 ? 0.8 : -0.8;
        spindleGroup.add(buildSpindleFiber(new THREE.Vector3(0, worldPos.y + poleOffset, 0), worldPos));
      }
    }
  };

  const computeTargets = (stage: MitosisStageName): void => {
    chromosomeTargets.clear();
    for (let i = 0; i < chromosomes.length; i += 1) {
      const angle = (i / chromosomes.length) * Math.PI * 2;
      const targets: THREE.Vector3[] = [];
      if (stage === 'prophase') {
        targets.push(new THREE.Vector3(Math.cos(angle) * 0.6, Math.sin(angle) * 0.4, Math.sin(angle) * 0.6));
      } else if (stage === 'metaphase') {
        targets.push(new THREE.Vector3(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5));
      } else if (stage === 'anaphase') {
        const direction = i % 2 === 0 ? 1 : -1;
        targets.push(new THREE.Vector3(Math.cos(angle) * 0.35, direction * 1.8, Math.sin(angle) * 0.35));
      } else {
        const direction = i % 2 === 0 ? 1 : -1;
        targets.push(new THREE.Vector3(Math.cos(angle) * 0.45, direction * 2.4, Math.sin(angle) * 0.45));
      }
      chromosomeTargets.set(chromosomes[i].mesh.uuid, targets);
    }
  };

  const animateToStage = (stage: MitosisStageName): void => {
    if (!scene) return;
    computeTargets(stage);
    if (nucleusMembrane) {
      nucleusMembrane.visible = stage === 'prophase' || stage === 'telophase';
      nucleusMembrane.scale.setScalar(stage === 'prophase' ? 1 : 0.6);
    }
    updateSpindleFibers();
  };

  const init = (): void => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    addLights(scene);

    const cellGeometry = new THREE.SphereGeometry(4.2, 48, 48);
    const cellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    cellMembrane = new THREE.Mesh(cellGeometry, cellMaterial);
    scene.add(cellMembrane);

    const nucleusGeometry = new THREE.SphereGeometry(2.4, 32, 32);
    const nucleusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    nucleusMembrane = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleusMembrane);

    const colors = [0x22c55e, 0xef4444, 0x3b82f6, 0xf59e0b];
    for (let i = 0; i < 4; i += 1) {
      const chromosome = createChromosome((i / 4) * Math.PI * 2, colors[i]);
      chromosomes.push(chromosome);
      scene.add(chromosome.mesh);
    }

    spindleGroup = new THREE.Group();
    scene.add(spindleGroup);

    animateToStage(STAGE_NAMES[0]);

    const animate = (): void => {
      animationId = requestAnimationFrame(animate);
      controls?.update();

      for (const chromosome of chromosomes) {
        const targets = chromosomeTargets.get(chromosome.mesh.uuid);
        if (targets && targets.length > 0) {
          chromosome.mesh.position.lerp(targets[0], 0.08);
        }
      }

      renderer?.render(scene!, camera!);
    };
    animate();
  };

  const dispose = (): void => {
    cancelAnimationFrame(animationId);
    controls?.dispose();
    renderer?.dispose();
    if (renderer?.domElement && containerRef.value) {
      containerRef.value.removeChild(renderer.domElement);
    }
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
    animateToStage(STAGE_NAMES[currentStageIndex.value]);
  };

  onMounted(() => {
    init();
    window.addEventListener('resize', resize);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    dispose();
  });

  return {
    currentStageIndex,
    setStage,
  };
}
