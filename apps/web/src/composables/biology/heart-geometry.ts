import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export const createHeartGeometry = (scale = 1): THREE.BufferGeometry => {
  const heartSurface = (u: number, v: number, target: THREE.Vector3): void => {
    const uRad = u * Math.PI;
    const vRad = v * Math.PI * 2;
    const sinU = Math.sin(uRad);
    const x = 16 * sinU ** 3 * Math.cos(vRad) * scale;
    const y = (13 * Math.cos(uRad) - 5 * Math.cos(2 * uRad) - 2 * Math.cos(3 * uRad) - Math.cos(4 * uRad)) * scale;
    const z = 9 * sinU ** 3 * Math.sin(vRad) * scale;
    target.set(x, y, z);
  };
  return new ParametricGeometry(heartSurface, 48, 48);
};

export const createAortaGeometry = (radius = 0.35): THREE.BufferGeometry => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 8, 0),
    new THREE.Vector3(0, 11, 0),
    new THREE.Vector3(3, 12, 0),
    new THREE.Vector3(6, 10, 0),
  ]);
  return new THREE.TubeGeometry(curve, 32, radius, 12, false);
};

export const createHeartMaterial = (color: string, opacity = 1): THREE.Material =>
  new THREE.MeshPhysicalMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    roughness: 0.4,
    metalness: 0.05,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });
