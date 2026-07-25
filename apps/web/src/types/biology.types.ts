import type { Vector3 } from 'three';

export interface Organelle3D {
  id: string;
  nameKey: string;
  descriptionKey: string;
  /** Optional longer explanation translation key for deeper theory. */
  longDescriptionKey?: string;
  /** Optional list of key facts translation keys. */
  factsKeys?: string[];
  /** Geometry type for MVP; external GLTF assets can be added later. */
  geometry: 'sphere' | 'capsule' | 'torus' | 'box' | 'roundedBox' | 'tube' | 'particles';
  /** Size relative to the cell scene. */
  size: number;
  /** Position inside the cell. */
  position: [number, number, number];
  /** Rotation in radians. */
  rotation?: [number, number, number];
  /** Base color as hex string. */
  color: string;
  /** Opacity between 0 and 1. */
  opacity: number;
  /** Direction and distance this organelle moves when exploded. */
  explodeVector: [number, number, number];
  /** Position where the hotspot marker floats above the organelle. */
  hotspotPosition: [number, number, number];
  /** Optional custom curve path for tube geometry (array of [x,y,z]). */
  path?: [number, number, number][];
  /** Whether the organelle can be selected via hotspots or clicking. */
  selectable?: boolean;
  /** If true, the mesh still renders but is ignored by 3D click raycasting. */
  blocksRaycast?: boolean;
  /** Visual style: solid fill or wireframe outline. */
  renderMode?: 'solid' | 'wireframe';
}

export interface BiologyExperiment {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  organelles: Organelle3D[];
}

export interface BiologySection {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  route?: string;
  available: boolean;
}

export interface BiologyTopic {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  route?: string;
  available: boolean;
}

export interface HotspotState {
  partId: string;
  label: string;
  description: string;
  longDescription?: string;
  facts?: string[];
  position: Vector3;
}

export interface ExplodeState {
  enabled: boolean;
  progress: number;
}
