import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { partColors, explodeVectors } from './heart-flow';

export interface LoadModelDeps {
  isLoading: { value: boolean };
  error: { value: string | null };
  heartModelRef: { current: THREE.Group | null };
  baseScale: { current: number };
  heartMeshes: { current: THREE.Mesh[] };
  applyMaterialState: () => void;
  applyExplode: () => void;
}

export function loadHeartModel(
  scene: THREE.Scene,
  deps: LoadModelDeps,
): void {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    '/models/heart-hubmap.glb',
    (gltf) => {
      deps.isLoading.value = false;
      const heartModel = gltf.scene;
      deps.heartModelRef.current = heartModel;

      const box = new THREE.Box3().setFromObject(heartModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      deps.baseScale.current = 8 / maxDim;
      heartModel.scale.set(deps.baseScale.current, deps.baseScale.current, deps.baseScale.current);
      heartModel.position.sub(center.clone().multiplyScalar(deps.baseScale.current));
      heartModel.position.y += 2;

      scene.add(heartModel);

      heartModel.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh || !mesh.material) return;
        const baseColor = partColors[mesh.name] ?? 0xb83a3a;
        const sourceMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mesh.material = sourceMats.map((mat) => {
          const source = mat as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
          return new THREE.MeshPhysicalMaterial({
            color: baseColor,
            emissive: 0x000000,
            emissiveIntensity: 0,
            map: source.map ?? undefined,
            roughness: 0.45,
            metalness: 0.02,
            clearcoat: 0.08,
            clearcoatRoughness: 0.25,
            side: THREE.DoubleSide,
          });
        });
        if (Array.isArray(mesh.material) && mesh.material.length === 1) {
          mesh.material = mesh.material[0];
        }
      });

      deps.heartMeshes.current = [];
      heartModel.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh || !mesh.geometry) return;
        mesh.geometry.computeBoundingBox();
        const boundingBox = mesh.geometry.boundingBox;
        if (!boundingBox) return;
        const meshCenter = new THREE.Vector3();
        boundingBox.getCenter(meshCenter);
        mesh.userData.originalPosition = mesh.position.clone();
        mesh.userData.explodeCenter = meshCenter;
        deps.heartMeshes.current.push(mesh);
      });
      deps.applyExplode();
      deps.applyMaterialState();
    },
    undefined,
    (err) => {
      deps.isLoading.value = false;
      deps.error.value = `Failed to load heart model from /models/heart-hubmap.glb. (${err instanceof Error ? err.message : String(err)})`;
    }
  );
}

export { explodeVectors };
