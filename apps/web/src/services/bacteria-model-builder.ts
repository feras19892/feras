import * as THREE from 'three';

// أبعاد الجسم الأساسي (عصية — شكل قضيب)
const BODY_RADIUS = 1.1;
const BODY_LENGTH = 2.6;

/** كبسولة ممتدة على المحور X (محور الجسم البكتيري) */
function capsuleMesh(radius: number, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, BODY_LENGTH, 8, 32),
    material,
  );
  mesh.rotation.z = Math.PI / 2;
  return mesh;
}

/**
 * يبني نموذج خلية بكتيرية إجرائياً بمجموعات مسمّاة تتوافق مع
 * نظام خرائط الأجزاء في GLBExperiment (groupNames) — بدون أي ملف GLB خارجي.
 */
export function buildBacteriaModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ── السيتوبلازم: الحشوة الداخلية ──
  const cytoplasm = new THREE.Group();
  cytoplasm.name = 'cytoplasm';
  cytoplasm.add(capsuleMesh(
    BODY_RADIUS - 0.28,
    new THREE.MeshPhysicalMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.35, roughness: 0.45 }),
  ));
  root.add(cytoplasm);

  // ── الحمض النووي: حلقة نويد متلوية + بلازميدان ──
  const dna = new THREE.Group();
  dna.name = 'dna';
  const loopPoints: THREE.Vector3[] = [];
  for (let i = 0; i < 14; i += 1) {
    const a = (i / 14) * Math.PI * 2;
    loopPoints.push(new THREE.Vector3(
      Math.cos(a) * 1.0,
      Math.sin(a * 2) * 0.38,
      Math.sin(a) * 0.5,
    ));
  }
  const loopCurve = new THREE.CatmullRomCurve3(loopPoints, true, 'catmullrom', 0.9);
  dna.add(new THREE.Mesh(
    new THREE.TubeGeometry(loopCurve, 220, 0.06, 8, true),
    new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.3, emissive: 0x713f12, emissiveIntensity: 0.3 }),
  ));
  const plasmidGeometry = new THREE.TorusGeometry(0.2, 0.035, 10, 32);
  const plasmidMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfde047, roughness: 0.3 });
  for (let i = 0; i < 2; i += 1) {
    const plasmid = new THREE.Mesh(plasmidGeometry, plasmidMaterial);
    plasmid.position.set(i === 0 ? 0.45 : -0.5, i === 0 ? 0.35 : -0.3, 0.25);
    plasmid.rotation.set(0.8, 1.9, 0);
    dna.add(plasmid);
  }
  root.add(dna);

  // ── الريبوسومات: حبيبات متناثرة ──
  const ribosomes = new THREE.Group();
  ribosomes.name = 'ribosomes';
  const dotGeometry = new THREE.SphereGeometry(0.065, 8, 8);
  const dotMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf472b6, roughness: 0.35 });
  for (let i = 0; i < 70; i += 1) {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    const x = (Math.random() * 2 - 1) * (BODY_LENGTH / 2 - 0.15);
    const dir = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    const r = Math.random() * (BODY_RADIUS - 0.45);
    dot.position.set(x, dir.y * r, dir.z * r);
    ribosomes.add(dot);
  }
  root.add(ribosomes);
  // ── الغشاء البلازمي ──
  const membrane = new THREE.Group();
  membrane.name = 'membrane';
  membrane.add(capsuleMesh(
    BODY_RADIUS - 0.12,
    new THREE.MeshPhysicalMaterial({ color: 0x86efac, transparent: true, opacity: 0.3, roughness: 0.35, side: THREE.DoubleSide }),
  ));
  root.add(membrane);

  // ── الجدار الخلوي ──
  const cellWall = new THREE.Group();
  cellWall.name = 'cellWall';
  cellWall.add(capsuleMesh(
    BODY_RADIUS,
    new THREE.MeshPhysicalMaterial({ color: 0x4ade80, transparent: true, opacity: 0.32, roughness: 0.5, side: THREE.DoubleSide }),
  ));
  root.add(cellWall);

  // ── المحفظة الهلامية (الطبقة الخارجية) ──
  const capsule = new THREE.Group();
  capsule.name = 'capsule';
  capsule.add(capsuleMesh(
    BODY_RADIUS + 0.25,
    new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.16, roughness: 0.2, side: THREE.DoubleSide }),
  ));
  root.add(capsule);

  // ── السوط: خيط حلزوني خلفي يدور كالمروحة ──
  const flagellum = new THREE.Group();
  flagellum.name = 'flagellum';
  const helixPoints: THREE.Vector3[] = [];
  const startX = -(BODY_LENGTH / 2 + BODY_RADIUS - 0.05);
  for (let i = 0; i <= 70; i += 1) {
    const s = i / 70;
    helixPoints.push(new THREE.Vector3(
      startX - s * 2.3,
      Math.sin(s * Math.PI * 6) * 0.2 * (1 - s * 0.4),
      Math.cos(s * Math.PI * 6) * 0.2 * (1 - s * 0.4),
    ));
  }
  flagellum.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPoints), 160, 0.045, 8, false),
    new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, roughness: 0.4 }),
  ));
  root.add(flagellum);

  // ── الأهداب: خيوط قصيرة موزعة حول الجسم ──
  const pili = new THREE.Group();
  pili.name = 'pili';
  const pilusGeometry = new THREE.CylinderGeometry(0.022, 0.03, 0.55, 6);
  const pilusMaterial = new THREE.MeshPhysicalMaterial({ color: 0xcbd5e1, roughness: 0.4 });
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (0.4 + Math.random() * (BODY_LENGTH / 2 - 0.6));
    // حامل يوجّه الخيط نحو الخارج شعاعياً في مستوى YZ
    const holder = new THREE.Group();
    const strand = new THREE.Mesh(pilusGeometry, pilusMaterial);
    strand.position.y = 0.275;
    holder.add(strand);
    holder.position.set(x, Math.cos(a) * BODY_RADIUS, Math.sin(a) * BODY_RADIUS);
    holder.rotation.x = a;
    pili.add(holder);
  }
  root.add(pili);

  return root;
}
