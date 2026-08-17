// Polyfills for Node.js environment
global.FileReader = class FileReader {
  constructor() {
    this.result = null;
    this.readyState = 0;
    this.onload = null;
    this.onerror = null;
  }
  readAsArrayBuffer(blob) {
    this.readyState = 2;
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
    }).catch(err => {
      if (this.onerror) this.onerror(err);
    });
  }
  readAsText(blob) {
    this.readyState = 2;
    blob.text().then(text => {
      this.result = text;
      if (this.onload) this.onload({ target: this });
    });
  }
};

global.Blob = class Blob {
  constructor(parts = []) {
    this._parts = parts;
    this.size = parts.reduce((s, p) => s + (p.byteLength || p.length || 0), 0);
    this.type = '';
  }
  async arrayBuffer() {
    const chunks = [];
    for (const part of this._parts) {
      if (part instanceof ArrayBuffer) chunks.push(new Uint8Array(part));
      else if (part instanceof Uint8Array) chunks.push(part);
      else if (typeof part === 'string') chunks.push(new TextEncoder().encode(part));
      else chunks.push(new Uint8Array(part));
    }
    let total = 0;
    for (const c of chunks) total += c.length;
    const result = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) { result.set(c, offset); offset += c.length; }
    return result.buffer;
  }
  async text() {
    const buf = await this.arrayBuffer();
    return new TextDecoder().decode(buf);
  }
};

global.window = global;
global.self = global;
global.document = {
  createElement: () => ({ style: {}, getContext: () => null }),
  createElementNS: () => ({ style: {}, getContext: () => null }),
};

const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'models');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createMaterial(color, roughness = 0.6, metalness = 0.1) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
  });
}

function addMesh(group, geometry, color, name, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, createMaterial(color));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}

// ── Brain ──────────────────────────────────────────────
function createBrain() {
  const group = new THREE.Group();

  // Cerebrum - left hemisphere
  addMesh(group,
    new THREE.SphereGeometry(2.5, 32, 24),
    0xf4a4c0, 'cerebrum_left',
    [-1.3, 0, 0]
  );
  // Cerebrum - right hemisphere
  addMesh(group,
    new THREE.SphereGeometry(2.5, 32, 24),
    0xf4a4c0, 'cerebrum_right',
    [1.3, 0, 0]
  );
  // Cerebellum
  addMesh(group,
    new THREE.SphereGeometry(1.3, 24, 20),
    0xe890b0, 'cerebellum',
    [0, -1.2, -1.8]
  );
  // Brainstem
  addMesh(group,
    new THREE.CylinderGeometry(0.5, 0.4, 2.5, 16),
    0xddb090, 'brainstem',
    [0, -2.8, -0.8], [0.3, 0, 0]
  );

  // Frontal lobe marker
  addMesh(group,
    new THREE.SphereGeometry(1.2, 20, 16),
    0xff9ec0, 'frontal_lobe',
    [0, 0.5, 2.2]
  );
  // Temporal lobe
  addMesh(group,
    new THREE.SphereGeometry(0.9, 20, 16),
    0xffb0d0, 'temporal_lobe',
    [-2.8, -0.5, 0.5]
  );
  // Parietal lobe
  addMesh(group,
    new THREE.SphereGeometry(1.0, 20, 16),
    0xffa0c8, 'parietal_lobe',
    [0, 1.8, -0.5]
  );
  // Occipital lobe
  addMesh(group,
    new THREE.SphereGeometry(0.9, 20, 16),
    0xff98c0, 'occipital_lobe',
    [0, 0, -2.8]
  );

  return group;
}

// ── Lungs (detailed) ───────────────────────────────────
function createLungs() {
  const group = new THREE.Group();

  // ── Trachea with cartilage rings ──
  const tracheaMat = createMaterial(0xd8c8b8, 0.4, 0.0);
  const tracheaGeo = new THREE.CylinderGeometry(0.38, 0.42, 3.2, 24, 1, true);
  const tracheaMesh = new THREE.Mesh(tracheaGeo, tracheaMat);
  tracheaMesh.name = 'trachea';
  tracheaMesh.position.set(0, 3.0, 0);
  group.add(tracheaMesh);

  // Cartilage rings (C-shaped)
  const ringMat = createMaterial(0xe8d8c8, 0.35, 0.0);
  for (let i = 0; i < 8; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.06, 8, 20, Math.PI * 1.4),
      ringMat
    );
    ring.name = `trachea_ring_${i}`;
    ring.position.set(0, 1.8 + i * 0.35, 0);
    ring.rotation.y = Math.PI * 0.3;
    group.add(ring);
  }

  // ── Bronchial tree (left) ──
  const bronchusMat = createMaterial(0xd4c0b0, 0.4, 0.0);

  function addBronchus(parent, points, radius, name) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const geo = new THREE.TubeGeometry(curve, 20, radius, 8, false);
    const mesh = new THREE.Mesh(geo, bronchusMat);
    mesh.name = name;
    parent.add(mesh);
    return mesh;
  }

  // Main left bronchus
  addBronchus(group, [
    [0, 1.4, 0], [-0.3, 1.1, 0], [-0.8, 0.7, 0.2], [-1.3, 0.3, 0.3]
  ], 0.28, 'left_main_bronchus');

  // Left lobar bronchi (3 branches)
  addBronchus(group, [
    [-1.3, 0.3, 0.3], [-1.6, 0.6, 0.4], [-1.9, 0.9, 0.5]
  ], 0.18, 'left_upper_bronchus');

  addBronchus(group, [
    [-1.3, 0.3, 0.3], [-1.5, -0.1, 0.2], [-1.7, -0.5, 0.1]
  ], 0.18, 'left_lower_bronchus');

  // Sub-branches left
  addBronchus(group, [
    [-1.9, 0.9, 0.5], [-2.2, 1.1, 0.6], [-2.5, 1.2, 0.5]
  ], 0.10, 'left_apical_bronchus');

  addBronchus(group, [
    [-1.7, -0.5, 0.1], [-2.0, -0.9, 0.0], [-2.3, -1.2, -0.1]
  ], 0.10, 'left_basal_bronchus');

  addBronchus(group, [
    [-1.7, -0.5, 0.1], [-1.9, -0.8, 0.4], [-2.1, -1.0, 0.6]
  ], 0.08, 'left_lateral_bronchus');

  // ── Bronchial tree (right) ──
  addBronchus(group, [
    [0, 1.4, 0], [0.3, 1.1, 0], [0.8, 0.7, -0.2], [1.3, 0.3, -0.3]
  ], 0.28, 'right_main_bronchus');

  // Right lobar bronchi (3 branches)
  addBronchus(group, [
    [1.3, 0.3, -0.3], [1.6, 0.7, -0.4], [1.9, 1.0, -0.5]
  ], 0.18, 'right_upper_bronchus');

  addBronchus(group, [
    [1.3, 0.3, -0.3], [1.5, 0.1, -0.2], [1.7, -0.2, -0.1]
  ], 0.16, 'right_middle_bronchus');

  addBronchus(group, [
    [1.3, 0.3, -0.3], [1.5, -0.2, -0.4], [1.7, -0.7, -0.5]
  ], 0.18, 'right_lower_bronchus');

  // Sub-branches right
  addBronchus(group, [
    [1.9, 1.0, -0.5], [2.2, 1.2, -0.6], [2.5, 1.3, -0.5]
  ], 0.10, 'right_apical_bronchus');

  addBronchus(group, [
    [1.7, -0.7, -0.5], [2.0, -1.1, -0.6], [2.3, -1.4, -0.7]
  ], 0.10, 'right_basal_bronchus');

  addBronchus(group, [
    [1.7, -0.2, -0.1], [2.0, -0.3, 0.2], [2.2, -0.4, 0.4]
  ], 0.08, 'right_lateral_bronchus');

  // ── Left Lung Lobes (upper + lower) ──
  const lungTissueMat = createMaterial(0xd4707a, 0.5, 0.0);
  const lungInnerMat = createMaterial(0xc25a64, 0.45, 0.0);

  // Left upper lobe — organic shape using LatheGeometry
  const leftUpperProfile = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const r = Math.sin(t * Math.PI) * (1.6 - t * 0.3) * (1 + Math.sin(t * 8) * 0.05);
    leftUpperProfile.push(new THREE.Vector2(Math.max(r, 0.01), t * 2.2));
  }
  const leftUpperGeo = new THREE.LatheGeometry(leftUpperProfile, 24);
  const leftUpper = new THREE.Mesh(leftUpperGeo, lungTissueMat);
  leftUpper.name = 'left_lung_upper_lobe';
  leftUpper.position.set(-2.0, 0.2, 0.2);
  leftUpper.rotation.z = 0.3;
  leftUpper.scale.set(1.0, 1.0, 0.65);
  group.add(leftUpper);

  // Left lower lobe
  const leftLowerProfile = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const r = Math.sin(t * Math.PI) * (1.4 - t * 0.2) * (1 + Math.sin(t * 6) * 0.06);
    leftLowerProfile.push(new THREE.Vector2(Math.max(r, 0.01), t * 2.0));
  }
  const leftLowerGeo = new THREE.LatheGeometry(leftLowerProfile, 24);
  const leftLower = new THREE.Mesh(leftLowerGeo, lungInnerMat);
  leftLower.name = 'left_lung_lower_lobe';
  leftLower.position.set(-1.8, -1.8, 0.1);
  leftLower.rotation.z = 0.35;
  leftLower.scale.set(1.0, 1.0, 0.7);
  group.add(leftLower);

  // ── Right Lung Lobes (upper, middle, lower) ──
  // Right upper lobe
  const rightUpperProfile = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const r = Math.sin(t * Math.PI) * (1.5 - t * 0.25) * (1 + Math.sin(t * 7) * 0.05);
    rightUpperProfile.push(new THREE.Vector2(Math.max(r, 0.01), t * 2.0));
  }
  const rightUpperGeo = new THREE.LatheGeometry(rightUpperProfile, 24);
  const rightUpper = new THREE.Mesh(rightUpperGeo, lungTissueMat);
  rightUpper.name = 'right_lung_upper_lobe';
  rightUpper.position.set(2.0, 0.4, -0.2);
  rightUpper.rotation.z = -0.3;
  rightUpper.scale.set(1.0, 1.0, 0.65);
  group.add(rightUpper);

  // Right middle lobe (smaller)
  const rightMidProfile = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const r = Math.sin(t * Math.PI) * 1.0 * (1 + Math.sin(t * 6) * 0.06);
    rightMidProfile.push(new THREE.Vector2(Math.max(r, 0.01), t * 1.3));
  }
  const rightMidGeo = new THREE.LatheGeometry(rightMidProfile, 20);
  const rightMid = new THREE.Mesh(rightMidGeo, lungInnerMat);
  rightMid.name = 'right_lung_middle_lobe';
  rightMid.position.set(1.8, -0.8, 0.0);
  rightMid.rotation.z = -0.4;
  rightMid.scale.set(1.0, 1.0, 0.7);
  group.add(rightMid);

  // Right lower lobe
  const rightLowerProfile = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const r = Math.sin(t * Math.PI) * (1.5 - t * 0.2) * (1 + Math.sin(t * 6) * 0.06);
    rightLowerProfile.push(new THREE.Vector2(Math.max(r, 0.01), t * 2.2));
  }
  const rightLowerGeo = new THREE.LatheGeometry(rightLowerProfile, 24);
  const rightLower = new THREE.Mesh(rightLowerGeo, lungInnerMat);
  rightLower.name = 'right_lung_lower_lobe';
  rightLower.position.set(1.9, -2.0, -0.1);
  rightLower.rotation.z = -0.35;
  rightLower.scale.set(1.0, 1.0, 0.7);
  group.add(rightLower);

  // ── Hilum (where bronchi enter lungs) ──
  const hilumMat = createMaterial(0xa04050, 0.5, 0.0);
  const leftHilum = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), hilumMat);
  leftHilum.name = 'left_hilum';
  leftHilum.position.set(-1.3, 0.3, 0.3);
  group.add(leftHilum);

  const rightHilum = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), hilumMat);
  rightHilum.name = 'right_hilum';
  rightHilum.position.set(1.3, 0.3, -0.3);
  group.add(rightHilum);

  return group;
}

// ── Skeleton ───────────────────────────────────────────
function createSkeleton() {
  const group = new THREE.Group();

  // Skull
  addMesh(group,
    new THREE.SphereGeometry(1.5, 24, 20),
    0xf0e8d8, 'skull',
    [0, 5.5, 0]
  );
  // Jaw
  addMesh(group,
    new THREE.BoxGeometry(1.8, 0.5, 1.2),
    0xe8e0d0, 'jaw',
    [0, 4.2, 0.3]
  );
  // Spine - cervical
  addMesh(group,
    new THREE.CylinderGeometry(0.3, 0.3, 1.5, 12),
    0xf0e8d8, 'cervical_spine',
    [0, 3.5, 0]
  );
  // Spine - thoracic
  addMesh(group,
    new THREE.CylinderGeometry(0.35, 0.35, 2.5, 12),
    0xf0e8d8, 'thoracic_spine',
    [0, 1.5, 0]
  );
  // Spine - lumbar
  addMesh(group,
    new THREE.CylinderGeometry(0.4, 0.4, 1.5, 12),
    0xf0e8d8, 'lumbar_spine',
    [0, -0.5, 0]
  );
  // Rib cage - left
  for (let i = 0; i < 6; i++) {
    const angle = -0.3 + i * 0.25;
    addMesh(group,
      new THREE.TorusGeometry(1.8, 0.08, 8, 20, Math.PI * 0.7),
      0xf0e8d8, `rib_left_${i}`,
      [0, 2.2 - i * 0.4, 0], [0, 0, angle]
    );
  }
  // Rib cage - right
  for (let i = 0; i < 6; i++) {
    const angle = 0.3 - i * 0.25;
    addMesh(group,
      new THREE.TorusGeometry(1.8, 0.08, 8, 20, Math.PI * 0.7),
      0xf0e8d8, `rib_right_${i}`,
      [0, 2.2 - i * 0.4, 0], [0, Math.PI, angle]
    );
  }
  // Left arm - humerus
  addMesh(group,
    new THREE.CylinderGeometry(0.18, 0.15, 2.5, 10),
    0xf0e8d8, 'left_humerus',
    [-2.5, 1.5, 0], [0, 0, 0.2]
  );
  // Left arm - radius/ulna
  addMesh(group,
    new THREE.CylinderGeometry(0.14, 0.12, 2.2, 10),
    0xf0e8d8, 'left_forearm',
    [-3.2, -1, 0], [0, 0, 0.15]
  );
  // Right arm - humerus
  addMesh(group,
    new THREE.CylinderGeometry(0.18, 0.15, 2.5, 10),
    0xf0e8d8, 'right_humerus',
    [2.5, 1.5, 0], [0, 0, -0.2]
  );
  // Right arm - radius/ulna
  addMesh(group,
    new THREE.CylinderGeometry(0.14, 0.12, 2.2, 10),
    0xf0e8d8, 'right_forearm',
    [3.2, -1, 0], [0, 0, -0.15]
  );
  // Left leg - femur
  addMesh(group,
    new THREE.CylinderGeometry(0.22, 0.18, 3, 10),
    0xf0e8d8, 'left_femur',
    [-0.8, -2.8, 0]
  );
  // Left leg - tibia/fibula
  addMesh(group,
    new THREE.CylinderGeometry(0.16, 0.13, 2.8, 10),
    0xf0e8d8, 'left_tibia',
    [-0.8, -5.8, 0]
  );
  // Right leg - femur
  addMesh(group,
    new THREE.CylinderGeometry(0.22, 0.18, 3, 10),
    0xf0e8d8, 'right_femur',
    [0.8, -2.8, 0]
  );
  // Right leg - tibia/fibula
  addMesh(group,
    new THREE.CylinderGeometry(0.16, 0.13, 2.8, 10),
    0xf0e8d8, 'right_tibia',
    [0.8, -5.8, 0]
  );
  // Pelvis
  addMesh(group,
    new THREE.TorusGeometry(1.2, 0.3, 10, 24),
    0xf0e8d8, 'pelvis',
    [0, -1.8, 0], [Math.PI / 2, 0, 0]
  );

  return group;
}

// ── Digestive System ───────────────────────────────────
function createDigestive() {
  const group = new THREE.Group();

  // Esophagus
  addMesh(group,
    new THREE.CylinderGeometry(0.3, 0.3, 3, 12),
    0xe8b8a0, 'esophagus',
    [0, 3, 0]
  );
  // Stomach
  const stomachGeo = new THREE.SphereGeometry(1.5, 24, 20);
  stomachGeo.scale(1.3, 1, 0.8);
  addMesh(group, stomachGeo, 0xf0c0a0, 'stomach', [0.5, 0.5, 0], [0, 0, 0.5]);
  // Small intestine - coiled tube
  const smallIntPath = [];
  for (let i = 0; i < 80; i++) {
    const t = i / 80;
    const angle = t * Math.PI * 12;
    const r = 1.5 - t * 0.8;
    smallIntPath.push(new THREE.Vector3(
      Math.cos(angle) * r,
      -1.5 - t * 2,
      Math.sin(angle) * r * 0.5
    ));
  }
  const smallIntCurve = new THREE.CatmullRomCurve3(smallIntPath);
  addMesh(group,
    new THREE.TubeGeometry(smallIntCurve, 100, 0.35, 10, false),
    0xf8d0a8, 'small_intestine',
    [0, 0, 0]
  );
  // Large intestine
  const largeIntPath = [
    new THREE.Vector3(-2, -4, 0),
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(-2, 0.5, 0),
    new THREE.Vector3(0, 0.8, 0),
    new THREE.Vector3(2, 0.5, 0),
    new THREE.Vector3(2, 0, 0),
    new THREE.Vector3(2, -4, 0),
    new THREE.Vector3(1, -4.5, 0),
  ];
  const largeIntCurve = new THREE.CatmullRomCurve3(largeIntPath);
  addMesh(group,
    new THREE.TubeGeometry(largeIntCurve, 60, 0.5, 10, false),
    0xe8c8b0, 'large_intestine',
    [0, 0, 0]
  );
  // Liver
  const liverGeo = new THREE.SphereGeometry(1.8, 24, 20);
  liverGeo.scale(1.5, 0.9, 0.8);
  addMesh(group, liverGeo, 0xc08060, 'liver', [-1.5, 1.8, 0.3], [0, 0, -0.3]);
  // Pancreas
  addMesh(group,
    new THREE.CapsuleGeometry(0.3, 1.5, 4, 10),
    0xf0d0a0, 'pancreas',
    [1, 1.5, 0], [0, 0, 1.2]
  );

  return group;
}

// ── Kidney ─────────────────────────────────────────────
function createKidney() {
  const group = new THREE.Group();

  // Left kidney
  const leftKidneyGeo = new THREE.SphereGeometry(1.5, 24, 20);
  leftKidneyGeo.scale(0.8, 1.3, 0.9);
  addMesh(group, leftKidneyGeo, 0xb0605a, 'left_kidney', [-2, 0, 0]);
  // Right kidney
  const rightKidneyGeo = new THREE.SphereGeometry(1.5, 24, 20);
  rightKidneyGeo.scale(0.8, 1.3, 0.9);
  addMesh(group, rightKidneyGeo, 0xb0605a, 'right_kidney', [2, 0, 0]);
  // Cortex layer (left)
  const leftCortexGeo = new THREE.SphereGeometry(1.55, 24, 20);
  leftCortexGeo.scale(0.83, 1.35, 0.93);
  addMesh(group, leftCortexGeo, 0xd08070, 'left_cortex', [-2, 0, 0]);
  // Cortex layer (right)
  const rightCortexGeo = new THREE.SphereGeometry(1.55, 24, 20);
  rightCortexGeo.scale(0.83, 1.35, 0.93);
  addMesh(group, rightCortexGeo, 0xd08070, 'right_cortex', [2, 0, 0]);
  // Medulla (left)
  addMesh(group,
    new THREE.SphereGeometry(0.9, 20, 16),
    0xe0a090, 'left_medulla',
    [-2, 0, 0]
  );
  // Medulla (right)
  addMesh(group,
    new THREE.SphereGeometry(0.9, 20, 16),
    0xe0a090, 'right_medulla',
    [2, 0, 0]
  );
  // Renal pelvis (left)
  addMesh(group,
    new THREE.SphereGeometry(0.5, 16, 12),
    0xf0d0c0, 'left_pelvis',
    [-2, -0.8, 0]
  );
  // Renal pelvis (right)
  addMesh(group,
    new THREE.SphereGeometry(0.5, 16, 12),
    0xf0d0c0, 'right_pelvis',
    [2, -0.8, 0]
  );
  // Left ureter
  addMesh(group,
    new THREE.CylinderGeometry(0.15, 0.15, 2.5, 10),
    0xe8c0b0, 'left_ureter',
    [-2, -2.5, 0]
  );
  // Right ureter
  addMesh(group,
    new THREE.CylinderGeometry(0.15, 0.15, 2.5, 10),
    0xe8c0b0, 'right_ureter',
    [2, -2.5, 0]
  );
  // Bladder
  addMesh(group,
    new THREE.SphereGeometry(0.8, 20, 16),
    0xf0d0c0, 'bladder',
    [0, -4.5, 0]
  );

  return group;
}

// ── Eye ────────────────────────────────────────────────
function createEye() {
  const group = new THREE.Group();

  // Sclera (white of eye)
  addMesh(group,
    new THREE.SphereGeometry(2, 32, 24),
    0xf8f8f0, 'sclera',
    [0, 0, 0]
  );
  // Cornea
  addMesh(group,
    new THREE.SphereGeometry(0.8, 24, 20, 0, Math.PI * 2, 0, Math.PI / 2.5),
    0xa0d0f0, 'cornea',
    [0, 0, 1.8]
  );
  // Iris
  addMesh(group,
    new THREE.RingGeometry(0.4, 0.7, 24),
    0x4080c0, 'iris',
    [0, 0, 1.6], [Math.PI / 2, 0, 0]
  );
  // Pupil
  addMesh(group,
    new THREE.CircleGeometry(0.35, 20),
    0x101010, 'pupil',
    [0, 0, 1.62], [Math.PI / 2, 0, 0]
  );
  // Lens
  addMesh(group,
    new THREE.SphereGeometry(0.6, 24, 20),
    0xb0e0f0, 'lens',
    [0, 0, 1.2]
  );
  // Retina
  const retinaGeo = new THREE.SphereGeometry(1.95, 32, 24, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.7);
  addMesh(group, retinaGeo, 0xd04040, 'retina', [0, 0, 0]);
  // Optic nerve
  addMesh(group,
    new THREE.CylinderGeometry(0.2, 0.2, 3, 12),
    0xe0e0d0, 'optic_nerve',
    [0, 0, -3.5], [Math.PI / 2, 0, 0]
  );
  // Vitreous humor
  addMesh(group,
    new THREE.SphereGeometry(1.5, 20, 16),
    0xd0f0f8, 'vitreous',
    [0, 0, 0]
  );

  return group;
}

// ── Ear ────────────────────────────────────────────────
function createEar() {
  const group = new THREE.Group();

  // Outer ear (pinna)
  const pinnaGeo = new THREE.TorusGeometry(1, 0.4, 10, 20, Math.PI * 1.3);
  addMesh(group, pinnaGeo, 0xf0c0a8, 'pinna', [0, 0, 2], [0, Math.PI / 2, 0.3]);
  // Ear canal
  addMesh(group,
    new THREE.CylinderGeometry(0.3, 0.25, 2, 12),
    0xe8b898, 'ear_canal',
    [0, 0, 1], [Math.PI / 2, 0, 0]
  );
  // Tympanic membrane (eardrum)
  addMesh(group,
    new THREE.CircleGeometry(0.3, 16),
    0xe0d0b0, 'eardrum',
    [0, 0, 0], [Math.PI / 2, 0, 0]
  );
  // Malleus (hammer)
  addMesh(group,
    new THREE.CapsuleGeometry(0.06, 0.4, 4, 8),
    0xf0e0d0, 'malleus',
    [-0.2, 0.1, -0.3], [0.3, 0, 0]
  );
  // Incus (anvil)
  addMesh(group,
    new THREE.CapsuleGeometry(0.06, 0.3, 4, 8),
    0xf0e0d0, 'incus',
    [-0.4, -0.1, -0.4], [0.5, 0, 0.3]
  );
  // Stapes (stirrup)
  addMesh(group,
    new THREE.TorusGeometry(0.1, 0.03, 6, 10),
    0xf0e0d0, 'stapes',
    [-0.6, 0, -0.5], [0, Math.PI / 2, 0]
  );
  // Cochlea
  const cochleaGeo = new THREE.TorusGeometry(0.4, 0.2, 8, 16, Math.PI * 2.5);
  addMesh(group, cochleaGeo, 0xf0c0c0, 'cochlea', [-1, -0.3, -0.8], [0.5, 0.3, 0]);
  // Semicircular canals
  addMesh(group,
    new THREE.TorusGeometry(0.5, 0.08, 6, 16),
    0xe0b0b0, 'semicircular_canals',
    [-1, 0.5, -0.8], [0.3, 0, 0]
  );
  // Auditory nerve
  addMesh(group,
    new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8),
    0xe8d8c8, 'auditory_nerve',
    [-1.8, 0, -1], [0, 0, 0.5]
  );

  return group;
}

// ── Export function ────────────────────────────────────
function exportGLB(model, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    // Add lights
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 5);
    model.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xb4c6ef, 0.5);
    fillLight.position.set(-5, 2, -5);
    model.add(fillLight);

    exporter.parse(
      model,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const outPath = path.join(OUTPUT_DIR, filename);
          fs.writeFileSync(outPath, Buffer.from(result));
          const stats = fs.statSync(outPath);
          console.log(`✓ ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
          resolve();
        } else {
          // JSON glTF
          const outPath = path.join(OUTPUT_DIR, filename.replace('.glb', '.gltf'));
          fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
          console.log(`✓ ${filename.replace('.glb', '.gltf')} (JSON)`);
          resolve();
        }
      },
      (err) => {
        console.error(`✗ Error exporting ${filename}:`, err);
        reject(err);
      },
      { binary: true }
    );
  });
}

// ── Main ───────────────────────────────────────────────
async function main() {
  ensureDir(OUTPUT_DIR);

  const targetModel = process.argv[2] || 'brain';
  const allModels = [
    { name: 'brain.glb', fn: createBrain },
    { name: 'lungs.glb', fn: createLungs },
    { name: 'skeleton.glb', fn: createSkeleton },
    { name: 'digestive.glb', fn: createDigestive },
    { name: 'kidney.glb', fn: createKidney },
    { name: 'eye.glb', fn: createEye },
    { name: 'ear.glb', fn: createEar },
  ];
  const models = allModels.filter(m => m.name.startsWith(targetModel));

  for (const model of models) {
    const group = model.fn();
    try {
      await exportGLB(group, model.name);
    } catch (err) {
      console.error(`Failed to export ${model.name}:`, err);
    }
  }

  console.log('\nDone! All GLB files generated.');
}

// Keep alive to prevent premature exit
const keepAlive = setInterval(() => {}, 1000);

main().then(() => {
  clearInterval(keepAlive);
  setTimeout(() => process.exit(0), 500);
}).catch((err) => {
  console.error('Fatal error:', err);
  clearInterval(keepAlive);
  process.exit(1);
});
