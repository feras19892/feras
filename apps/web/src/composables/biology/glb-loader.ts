import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { ModelPart } from './useGLBModel';

export interface GLBLoadResult {
  partMeshes: Map<string, THREE.Mesh>;
  loadedModel: THREE.Object3D | null;
}

export const loadGLBModel = (
  scene: THREE.Scene,
  modelPath: string,
  parts: ModelPart[],
  modelColor?: string,
  callbacks?: {
    onStart?: () => void;
    onLoad?: () => void;
    onError?: (message: string) => void;
  }
): GLBLoadResult => {
  callbacks?.onStart?.();

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);
  const result: GLBLoadResult = { partMeshes: new Map(), loadedModel: null };

  loader.load(
    modelPath,
    (gltf) => {
      const loadedModel = gltf.scene;
      result.loadedModel = loadedModel;

      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 8 / maxDim;
      loadedModel.scale.set(scale, scale, scale);
      loadedModel.position.sub(center.clone().multiplyScalar(scale));
      loadedModel.position.y += 2;

      scene.add(loadedModel);

      if (modelColor) {
        loadedModel.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.material) return;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) {
            if ('color' in mat) (mat as THREE.MeshStandardMaterial).color.set(modelColor);
          }
        });
      }

      for (const part of parts) {
        const geometry = new THREE.SphereGeometry(0.3, 20, 20);
        const material = new THREE.MeshPhysicalMaterial({
          color: '#4ade80',
          transparent: true,
          opacity: 0.6,
          emissive: 0x000000,
          roughness: 0.2,
          clearcoat: 0.5,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...part.position);
        mesh.userData.partId = part.id;
        scene.add(mesh);
        result.partMeshes.set(part.id, mesh);
      }

      callbacks?.onLoad?.();
    },
    undefined,
    (err) => {
      callbacks?.onError?.(
        `Failed to load model from ${modelPath}. (${err instanceof Error ? err.message : String(err)})`
      );
    }
  );

  return result;
};
