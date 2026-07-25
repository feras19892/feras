// Polyfills for Node.js
global.FileReader = class FileReader {
  constructor() { this.result = null; this.readyState = 0; this.onload = null; this.onerror = null; }
  readAsArrayBuffer(blob) {
    this.readyState = 2;
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
    }).catch(err => { if (this.onerror) this.onerror(err); });
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
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { DRACOLoader } = require('three/examples/jsm/loaders/DRACOLoader.js');

const file = process.argv[2] || 'brain';
const filePath = path.join(__dirname, `${file}.glb`);

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const data = fs.readFileSync(filePath);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.parse(
  data.buffer,
  '',
  (gltf) => {
    const meshNames = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        meshNames.push({
          name: child.name,
          position: [child.position.x, child.position.y, child.position.z],
          vertexCount: child.geometry?.attributes?.position?.count || 0,
        });
      }
    });
    console.log(`\n=== ${file}.glb: ${meshNames.length} meshes ===\n`);
    meshNames.forEach((m, i) => {
      console.log(`${i + 1}. "${m.name}" — ${m.vertexCount} vertices @ (${m.position.map(v => v.toFixed(2)).join(', ')})`);
    });
    process.exit(0);
  },
  (err) => {
    console.error('Error parsing GLB:', err);
    process.exit(1);
  }
);

const keepAlive = setInterval(() => {}, 1000);
process.on('exit', () => clearInterval(keepAlive));
