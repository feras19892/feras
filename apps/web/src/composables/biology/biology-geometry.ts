import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Organelle3D } from '../../types/biology.types';

export const buildGeometry = (
  type: Organelle3D['geometry'],
  size: number,
  path?: Organelle3D['path']
): THREE.BufferGeometry => {
  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(size, 32, 32);
    case 'capsule': {
      const radius = size * 0.4;
      const length = size * 1.6;
      return new THREE.CapsuleGeometry(radius, length, 4, 12);
    }
    case 'torus':
      return new THREE.TorusGeometry(size, size * 0.25, 16, 48);
    case 'box':
      return new THREE.BoxGeometry(size, size, size);
    case 'roundedBox': {
      const radius = size * 0.12;
      return new RoundedBoxGeometry(size, size * 0.85, size * 0.85, 4, radius);
    }
    case 'tube': {
      if (path && path.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(path.map((p) => new THREE.Vector3(...p)));
        return new THREE.TubeGeometry(curve, 64, size, 12, false);
      }
      const fallback = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-size * 2, 0, 0),
        new THREE.Vector3(-size, size, 0),
        new THREE.Vector3(size, -size, 0),
        new THREE.Vector3(size * 2, 0, 0),
      ]);
      return new THREE.TubeGeometry(fallback, 32, size * 0.3, 12, false);
    }
    case 'particles':
      return new THREE.IcosahedronGeometry(size, 1);
    default:
      return new THREE.SphereGeometry(size, 16, 16);
  }
};

export const createMaterial = (
  color: string,
  opacity: number,
  renderMode?: 'solid' | 'wireframe'
): THREE.Material => {
  const isWireframe = renderMode === 'wireframe';
  return new THREE.MeshPhysicalMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    wireframe: isWireframe,
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: opacity < 1 ? 0.4 : 0.1,
    side: opacity < 1 || isWireframe ? THREE.DoubleSide : THREE.FrontSide,
  });
};

export const addLights = (scene: THREE.Scene): void => {
  const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x1a1a2e, 0.7);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.4);
  keyLight.position.set(6, 10, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x88aaff, 0.6);
  fillLight.position.set(-6, 4, -4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffccaa, 0.5);
  rimLight.position.set(0, -2, -8);
  scene.add(rimLight);

  const sideLight = new THREE.DirectionalLight(0xffffff, 0.4);
  sideLight.position.set(8, 2, -2);
  scene.add(sideLight);
};
