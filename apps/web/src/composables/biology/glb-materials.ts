import * as THREE from 'three';

export const applyXRay = (model: THREE.Object3D, enabled: boolean): void => {
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material || mesh.userData.skipMaterialEffects) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      const material = mat as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
      if (!('transparent' in material)) continue;
      if (enabled) {
        material.userData.originalOpacity = material.opacity;
        material.userData.originalTransparent = material.transparent;
        material.transparent = true;
        material.opacity = 0.25;
        material.depthWrite = false;
      } else {
        material.opacity = material.userData.originalOpacity ?? 1;
        material.transparent = material.userData.originalTransparent ?? false;
        material.depthWrite = true;
      }
    }
  });
};

export const applyCrossSection = (
  model: THREE.Object3D,
  clipPlane: THREE.Plane,
  active: boolean,
  offset: number
): void => {
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material || mesh.userData.skipMaterialEffects) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      if ('clippingPlanes' in mat) {
        (mat as THREE.MeshStandardMaterial).clippingPlanes = active ? [clipPlane] : [];
      }
    }
  });
  clipPlane.constant = active ? offset : 100;
};
