const THREE = require('three');

// Polyfill FileReader for Node.js
if (typeof global.FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
      });
    }
    readAsDataURL(blob) {
      blob.text().then(text => {
        this.result = 'data:application/octet-stream;base64,' + Buffer.from(text).toString('base64');
        if (this.onload) this.onload({ target: this });
      });
    }
    readAsText(blob) {
      blob.text().then(text => {
        this.result = text;
        if (this.onload) this.onload({ target: this });
      });
    }
  };
}

// Polyfill Blob if needed
if (typeof global.Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(parts) {
      this._parts = parts;
    }
    async arrayBuffer() {
      const bufs = this._parts.map(p => p instanceof ArrayBuffer ? p : Buffer.from(p));
      return Buffer.concat(bufs).buffer;
    }
    async text() {
      return this._parts.map(p => p.toString()).join('');
    }
  };
}

const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
const fs = require('fs');
const path = require('path');

const scene = new THREE.Scene();

// Lights (only directional/point/spot supported by GLTFExporter)
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(5, 8, 5);
scene.add(dir);
const fill = new THREE.DirectionalLight(0x93c5fd, 0.4);
fill.position.set(-5, -3, -5);
scene.add(fill);

// === mRNA strand ===
const mrnaGroup = new THREE.Group();
mrnaGroup.name = 'mRNA';

const sequence = 'AUGUUUUUAG';
const codonColors = { A: 0x22c55e, U: 0xfacc15, G: 0xef4444 };
const startX = -((sequence.length - 1) * 0.42) / 2;

for (let i = 0; i < sequence.length; i++) {
  const base = sequence[i];
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 24),
    new THREE.MeshStandardMaterial({ color: codonColors[base] || 0x3b82f6, roughness: 0.3 })
  );
  sphere.position.set(startX + i * 0.42, 0, 0);
  sphere.name = `mRNA_base_${i}`;
  mrnaGroup.add(sphere);
}

// mRNA backbone
const points = [];
for (let i = 0; i < sequence.length; i++) {
  points.push(new THREE.Vector3(startX + i * 0.42, 0, 0));
}
const curve = new THREE.CatmullRomCurve3(points);
const backbone = new THREE.Mesh(
  new THREE.TubeGeometry(curve, 32, 0.06, 8, false),
  new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 })
);
backbone.name = 'mRNA_backbone';
mrnaGroup.add(backbone);

scene.add(mrnaGroup);

// === Ribosome (two subunits) ===
const ribosomeGroup = new THREE.Group();
ribosomeGroup.name = 'Ribosome';

const smallSubunit = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.35 })
);
smallSubunit.scale.set(1.6, 0.55, 1);
smallSubunit.position.set(0, -0.55, 0);
smallSubunit.name = 'ribosome_small_subunit';
ribosomeGroup.add(smallSubunit);

const largeSubunit = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.35 })
);
largeSubunit.scale.set(1.8, 0.75, 1.1);
largeSubunit.position.set(0, 0.65, 0);
largeSubunit.name = 'ribosome_large_subunit';
ribosomeGroup.add(largeSubunit);

ribosomeGroup.position.set(-0.63, 0, 0);
scene.add(ribosomeGroup);

// === tRNA molecules ===
const trnaColors = [0xfacc15, 0x22c55e, 0x3b82f6];
const trnaPositions = [
  [-0.63, -0.2, 0.5],
  [0.63, -0.2, 0.5],
  [1.89, -0.2, 0.5],
];
for (let i = 0; i < 3; i++) {
  const trna = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 20),
    new THREE.MeshStandardMaterial({ color: trnaColors[i], roughness: 0.3, transparent: true, opacity: 0.9 })
  );
  trna.scale.set(1, 1.5, 0.5);
  trna.position.set(...trnaPositions[i]);
  trna.name = `tRNA_${i}`;
  scene.add(trna);
}

// === Amino acids / polypeptide chain ===
const aaColors = [0xf59e0b, 0x22c55e, 0x3b82f6];
for (let i = 0; i < 3; i++) {
  const aa = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 24),
    new THREE.MeshStandardMaterial({ color: aaColors[i], roughness: 0.25, metalness: 0.1 })
  );
  aa.position.set(-0.4 + i * 0.5, 1.1, 0);
  aa.name = `amino_acid_${i}`;
  scene.add(aa);
}

// === Codon markers ===
const codonColorsList = [0xfacc15, 0x22c55e, 0x3b82f6, 0xef4444];
const codonNames = ['AUG', 'UUU', 'UUA', 'UAG'];
for (let i = 0; i < 4; i++) {
  const centerX = startX + i * 1.26 + 0.42;
  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.05, 0.35),
    new THREE.MeshStandardMaterial({ color: codonColorsList[i], transparent: true, opacity: 0.3 })
  );
  marker.position.set(centerX, -0.15, 0);
  marker.name = `codon_${codonNames[i]}`;
  scene.add(marker);
}

// Export
const exporter = new GLTFExporter();
const keepAlive = setInterval(() => {}, 100);
exporter.parse(
  scene,
  (result) => {
    const buffer = Buffer.from(result);
    const outPath = path.join(__dirname, 'protein-synthesis.glb');
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
    clearInterval(keepAlive);
  },
  (err) => {
    console.error('Export error:', err);
    clearInterval(keepAlive);
  },
  { binary: true }
);
