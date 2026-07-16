import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const partColors: Record<string, number> = {
  left_atrium: 0xcc2222,
  left_ventricle: 0xb91c1c,
  right_atrium: 0x3b5bdb,
  right_ventricle: 0x2563eb,
  septum: 0x9f2b2b,
  aortic_valve: 0xfca5a5,
  mitral_valve: 0xfca5a5,
  pulmonary_valve: 0x93c5fd,
  tricuspid_valve: 0x93c5fd,
};

export interface HeartLoadResult {
  heartModelRef: THREE.Group | null;
  heartMeshes: THREE.Mesh[];
  baseScale: number;
}

export const loadHeartModel = (
  scene: THREE.Scene,
  callbacks?: {
    onLoad?: (result: HeartLoadResult) => void;
    onError?: (message: string) => void;
  }
): void => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    '/models/heart-hubmap.glb',
    (gltf) => {
      const heartModel = gltf.scene as THREE.Group;

      const box = new THREE.Box3().setFromObject(heartModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = 8 / maxDim;
      heartModel.scale.set(baseScale, baseScale, baseScale);
      heartModel.position.sub(center.clone().multiplyScalar(baseScale));
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

      const heartMeshes: THREE.Mesh[] = [];
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
        heartMeshes.push(mesh);
      });

      callbacks?.onLoad?.({ heartModelRef: heartModel, heartMeshes, baseScale });
    },
    undefined,
    (err) => {
      callbacks?.onError?.(
        `Failed to load heart model from /models/heart-hubmap.glb. (${err instanceof Error ? err.message : String(err)})`
      );
    }
  );
};
