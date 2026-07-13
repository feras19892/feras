import type { BiologyExperiment, Organelle3D } from '../types/biology.types';

const HELIX_RADIUS = 2.2;
const HELIX_HEIGHT = 8;
const TURNS = 1.5;
const BACKBONE_SEGMENTS = 40;

interface HelixPoint {
  x: number;
  y: number;
  z: number;
  angle: number;
}

const helixPoint = (phase: number, t: number): HelixPoint => {
  const angle = t * TURNS * Math.PI * 2 + phase;
  const y = (t - 0.5) * HELIX_HEIGHT;
  return {
    x: HELIX_RADIUS * Math.cos(angle),
    y,
    z: HELIX_RADIUS * Math.sin(angle),
    angle,
  };
};

const createHelixPath = (phase: number): [number, number, number][] => {
  const path: [number, number, number][] = [];
  for (let i = 0; i <= BACKBONE_SEGMENTS; i += 1) {
    const t = i / BACKBONE_SEGMENTS;
    const point = helixPoint(phase, t);
    path.push([point.x, point.y, point.z]);
  }
  return path;
};

const createBackbone = (id: string, phase: number, color: string): Organelle3D => ({
  id,
  nameKey: `biology.dna.${id}.name`,
  descriptionKey: `biology.dna.${id}.description`,
  geometry: 'tube',
  size: 0.12,
  position: [0, 0, 0],
  color,
  opacity: 1,
  explodeVector: [0, 0, 0],
  hotspotPosition: [0, 0, 0],
  path: createHelixPath(phase),
  selectable: false,
  blocksRaycast: true,
});

interface BasePairConfig {
  id: string;
  nameKey: string;
  descriptionKey: string;
  longDescriptionKey?: string;
  factsKeys?: string[];
  left: string;
  right: string;
  leftColor: string;
  rightColor: string;
}

const basePairConfigs: BasePairConfig[] = [
  { id: 'base-pair-1', nameKey: 'biology.dna.basePair1.name', descriptionKey: 'biology.dna.basePair1.description', longDescriptionKey: 'biology.dna.at.longDescription', factsKeys: ['biology.dna.at.fact1', 'biology.dna.at.fact2', 'biology.dna.at.fact3'], left: 'A', right: 'T', leftColor: '#22c55e', rightColor: '#facc15' },
  { id: 'base-pair-2', nameKey: 'biology.dna.basePair2.name', descriptionKey: 'biology.dna.basePair2.description', longDescriptionKey: 'biology.dna.cg.longDescription', factsKeys: ['biology.dna.cg.fact1', 'biology.dna.cg.fact2', 'biology.dna.cg.fact3'], left: 'C', right: 'G', leftColor: '#3b82f6', rightColor: '#ef4444' },
  { id: 'base-pair-3', nameKey: 'biology.dna.basePair3.name', descriptionKey: 'biology.dna.basePair3.description', longDescriptionKey: 'biology.dna.at.longDescription', factsKeys: ['biology.dna.at.fact1', 'biology.dna.at.fact2', 'biology.dna.at.fact3'], left: 'A', right: 'T', leftColor: '#22c55e', rightColor: '#facc15' },
  { id: 'base-pair-4', nameKey: 'biology.dna.basePair4.name', descriptionKey: 'biology.dna.basePair4.description', longDescriptionKey: 'biology.dna.cg.longDescription', factsKeys: ['biology.dna.cg.fact1', 'biology.dna.cg.fact2', 'biology.dna.cg.fact3'], left: 'C', right: 'G', leftColor: '#3b82f6', rightColor: '#ef4444' },
  { id: 'base-pair-5', nameKey: 'biology.dna.basePair5.name', descriptionKey: 'biology.dna.basePair5.description', longDescriptionKey: 'biology.dna.at.longDescription', factsKeys: ['biology.dna.at.fact1', 'biology.dna.at.fact2', 'biology.dna.at.fact3'], left: 'A', right: 'T', leftColor: '#22c55e', rightColor: '#facc15' },
  { id: 'base-pair-6', nameKey: 'biology.dna.basePair6.name', descriptionKey: 'biology.dna.basePair6.description', longDescriptionKey: 'biology.dna.cg.longDescription', factsKeys: ['biology.dna.cg.fact1', 'biology.dna.cg.fact2', 'biology.dna.cg.fact3'], left: 'C', right: 'G', leftColor: '#3b82f6', rightColor: '#ef4444' },
];

const createBasePair = (config: BasePairConfig, index: number): Organelle3D[] => {
  const t = (index + 1) / 7;
  const pointA = helixPoint(0, t);
  const pointB = helixPoint(Math.PI, t);
  const centerX = (pointA.x + pointB.x) / 2;
  const centerY = (pointA.y + pointB.y) / 2;
  const centerZ = (pointA.z + pointB.z) / 2;

  const rung: Organelle3D = {
    id: config.id,
    nameKey: config.nameKey,
    descriptionKey: config.descriptionKey,
    longDescriptionKey: config.longDescriptionKey,
    factsKeys: config.factsKeys,
    geometry: 'capsule',
    size: 0.22,
    position: [centerX, centerY, centerZ],
    rotation: [0, -pointA.angle, Math.PI / 2],
    color: '#a855f7',
    opacity: 1,
    explodeVector: [0, 0, 0],
    hotspotPosition: [centerX * 1.35, centerY + 0.9, centerZ * 1.35],
  };

  const leftNucleotide: Organelle3D = {
    id: `${config.id}-left`,
    nameKey: config.nameKey,
    descriptionKey: config.descriptionKey,
    geometry: 'sphere',
    size: 0.18,
    position: [pointA.x, pointA.y, pointA.z],
    color: config.leftColor,
    opacity: 1,
    explodeVector: [0, 0, 0],
    hotspotPosition: [pointA.x, pointA.y, pointA.z],
    selectable: false,
    blocksRaycast: true,
  };

  const rightNucleotide: Organelle3D = {
    id: `${config.id}-right`,
    nameKey: config.nameKey,
    descriptionKey: config.descriptionKey,
    geometry: 'sphere',
    size: 0.18,
    position: [pointB.x, pointB.y, pointB.z],
    color: config.rightColor,
    opacity: 1,
    explodeVector: [0, 0, 0],
    hotspotPosition: [pointB.x, pointB.y, pointB.z],
    selectable: false,
    blocksRaycast: true,
  };

  return [leftNucleotide, rightNucleotide, rung];
};

export const dnaStructureExperiment: BiologyExperiment = {
  id: 'dna-structure',
  titleKey: 'biology.dnaStructureTitle',
  subtitleKey: 'biology.dnaStructureSubtitle',
  icon: '🧪',
  organelles: [
    createBackbone('backboneA', 0, '#60a5fa'),
    createBackbone('backboneB', Math.PI, '#f87171'),
    ...basePairConfigs.flatMap((config, index) => createBasePair(config, index)),
  ],
};
