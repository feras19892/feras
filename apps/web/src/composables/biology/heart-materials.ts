import * as THREE from 'three';

export const applyMaterialState = (
  heartMeshes: THREE.Mesh[],
  selectedPartId: string | null,
  hoveredPartId: string | null,
  xRayMode: boolean,
  crossSectionMode: boolean,
  clipPlane: THREE.Plane | null
): void => {
  for (const mesh of heartMeshes) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      const material = mat as THREE.MeshPhysicalMaterial;
      const isSelected = mesh.name === selectedPartId;
      const isHovered = mesh.name === hoveredPartId;
      if (isSelected) {
        material.emissive.setHex(0xff6600);
        material.emissiveIntensity = 0.5;
      } else if (isHovered) {
        material.emissive.setHex(0x444444);
        material.emissiveIntensity = 0.25;
      } else {
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }

      if (xRayMode) {
        material.transparent = true;
        material.opacity = 0.35;
        material.depthWrite = false;
      } else {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
      }

      material.clippingPlanes = crossSectionMode && clipPlane ? [clipPlane] : [];
    }
  }
};
