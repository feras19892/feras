import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { ModelPart } from './useGLBModel';

export function findObjectByName(root: THREE.Object3D, name: string): THREE.Object3D | null {
  if (root.name === name) return root;
  for (const child of root.children) {
    const found = findObjectByName(child, name);
    if (found) return found;
  }
  return null;
}

export function buildPartMeshMap(
  loadedModel: THREE.Object3D,
  parts: ModelPart[],
  partMeshes: Map<string, THREE.Mesh[]>,
  allMeshes: THREE.Mesh[],
): void {
  partMeshes.clear();
  allMeshes.length = 0;

  loadedModel.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => m.clone());
    } else {
      mesh.material = mesh.material.clone();
    }
    allMeshes.push(mesh);
  });

  if (parts.length === 0) return;

  for (const part of parts) {
    const meshes: THREE.Mesh[] = [];
    const seen = new Set<THREE.Mesh>();

    if (part.groupNames) {
      for (const gName of part.groupNames) {
        const group = findObjectByName(loadedModel, gName);
        if (group) {
          group.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh && !seen.has(mesh)) {
              seen.add(mesh);
              meshes.push(mesh);
            }
          });
        }
      }
    }

    if (part.meshNames) {
      for (const name of part.meshNames) {
        for (const mesh of allMeshes) {
          if (mesh.name === name && !seen.has(mesh)) {
            seen.add(mesh);
            meshes.push(mesh);
          }
        }
      }
    }

    if (part.namePatterns) {
      const exclude = part.excludePatterns ?? [];
      const includeRegexes = part.namePatterns
        .map((p) => { try { return new RegExp(p, 'i'); } catch { return null; } })
        .filter((re): re is RegExp => re !== null);
      const excludeRegexes = exclude
        .map((p) => { try { return new RegExp(p, 'i'); } catch { return null; } })
        .filter((re): re is RegExp => re !== null);
      for (const mesh of allMeshes) {
        if (seen.has(mesh)) continue;
        const name = mesh.name;
        const matches = includeRegexes.some((re) => re.test(name));
        const excluded = excludeRegexes.some((re) => re.test(name));
        if (matches && !excluded) {
          seen.add(mesh);
          meshes.push(mesh);
        }
      }
    }

    if (meshes.length > 0) {
      partMeshes.set(part.id, meshes);
    }
  }

  const partMeshSet = new Set<THREE.Mesh>();
  partMeshes.forEach((meshes) => meshes.forEach((m) => partMeshSet.add(m)));
  for (const mesh of allMeshes) {
    if (!partMeshSet.has(mesh)) {
      mesh.visible = false;
    }
  }
}

export function scaleAndCenterModel(model: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim === 0 || !Number.isFinite(maxDim)) return;
  const scale = 8 / maxDim;
  model.scale.set(scale, scale, scale);
  model.position.sub(center.clone().multiplyScalar(scale));
  model.position.y += 2;
}

export function loadModel(
  scene: THREE.Scene,
  modelPath: string,
  parts: ModelPart[],
  partMeshes: Map<string, THREE.Mesh[]>,
  allMeshes: THREE.Mesh[],
  onLoad: () => void,
  onError: (msg: string) => void,
  onModelLoaded?: (model: THREE.Object3D) => void,
  modelGenerator?: () => THREE.Object3D,
  modelEnhancer?: (model: THREE.Object3D) => void,
  onProgress?: (ratio: number) => void,
): void {
  if (modelGenerator) {
    const loadedModel = modelGenerator();
    scaleAndCenterModel(loadedModel);
    scene.add(loadedModel);
    buildPartMeshMap(loadedModel, parts, partMeshes, allMeshes);
    onModelLoaded?.(loadedModel);
    onProgress?.(1);
    onLoad();
    return;
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    modelPath,
    (gltf) => {
      const loadedModel = gltf.scene;
      if (modelEnhancer) modelEnhancer(loadedModel);
      scaleAndCenterModel(loadedModel);
      scene.add(loadedModel);
      buildPartMeshMap(loadedModel, parts, partMeshes, allMeshes);
      onModelLoaded?.(loadedModel);
      onProgress?.(1);
      onLoad();
      dracoLoader.dispose();
    },
    (evt) => {
      // total قد يكون 0 إذا غاب Content-Length — نتجاهل حينها لتجنب NaN
      if (onProgress && evt.total > 0) {
        onProgress(Math.min(1, evt.loaded / evt.total));
      }
    },
    (err) => {
      onError(`Failed to load model: ${err instanceof Error ? err.message : String(err)}`);
      dracoLoader.dispose();
    },
  );
}
