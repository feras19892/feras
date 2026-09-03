<script setup lang="ts">
import GLBExperiment from '../../../modules/biology/components/GLBExperiment.vue';
import type { ModelPart } from '../../../composables/biology/useGLBModel';

const plantCellParts: ModelPart[] = [
  {
    id: 'cellWall',
    nameKey: 'biology.plantOrganelle.cellWall.name',
    descriptionKey: 'biology.plantOrganelle.cellWall.description',
    longDescriptionKey: 'biology.plantOrganelle.cellWall.longDescription',
    factsKeys: [
      'biology.plantOrganelle.cellWall.fact1',
      'biology.plantOrganelle.cellWall.fact2',
      'biology.plantOrganelle.cellWall.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['cellWall'],
    dimOpacity: 0.08,
  },
  {
    id: 'membrane',
    nameKey: 'biology.plantOrganelle.membrane.name',
    descriptionKey: 'biology.plantOrganelle.membrane.description',
    longDescriptionKey: 'biology.plantOrganelle.membrane.longDescription',
    factsKeys: [
      'biology.plantOrganelle.membrane.fact1',
      'biology.plantOrganelle.membrane.fact2',
      'biology.plantOrganelle.membrane.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['membrane'],
    dimOpacity: 0.08,
  },
  {
    id: 'cytoplasm',
    nameKey: 'biology.plantOrganelle.cytoplasm.name',
    descriptionKey: 'biology.plantOrganelle.cytoplasm.description',
    longDescriptionKey: 'biology.plantOrganelle.cytoplasm.longDescription',
    factsKeys: [
      'biology.plantOrganelle.cytoplasm.fact1',
      'biology.plantOrganelle.cytoplasm.fact2',
      'biology.plantOrganelle.cytoplasm.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['cytoplasm'],
    dimOpacity: 0.08,
  },
  {
    id: 'centralVacuole',
    nameKey: 'biology.plantOrganelle.centralVacuole.name',
    descriptionKey: 'biology.plantOrganelle.centralVacuole.description',
    longDescriptionKey: 'biology.plantOrganelle.centralVacuole.longDescription',
    factsKeys: [
      'biology.plantOrganelle.centralVacuole.fact1',
      'biology.plantOrganelle.centralVacuole.fact2',
      'biology.plantOrganelle.centralVacuole.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['vacuole'],
  },
  {
    id: 'nucleus',
    nameKey: 'biology.plantOrganelle.nucleus.name',
    descriptionKey: 'biology.plantOrganelle.nucleus.description',
    longDescriptionKey: 'biology.plantOrganelle.nucleus.longDescription',
    factsKeys: [
      'biology.plantOrganelle.nucleus.fact1',
      'biology.plantOrganelle.nucleus.fact2',
      'biology.plantOrganelle.nucleus.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['nucleus', 'nucleolus'],
  },
  {
    id: 'chloroplasts',
    nameKey: 'biology.plantOrganelle.chloroplast.name',
    descriptionKey: 'biology.plantOrganelle.chloroplast.description',
    longDescriptionKey: 'biology.plantOrganelle.chloroplast.longDescription',
    factsKeys: [
      'biology.plantOrganelle.chloroplast.fact1',
      'biology.plantOrganelle.chloroplast.fact2',
      'biology.plantOrganelle.chloroplast.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['chloroplast_0', 'chloroplast_1', 'chloroplast_2', 'chloroplast_3', 'chloroplast_4'],
  },
  {
    id: 'mitochondria',
    nameKey: 'biology.plantOrganelle.mitochondrion.name',
    descriptionKey: 'biology.plantOrganelle.mitochondrion.description',
    longDescriptionKey: 'biology.plantOrganelle.mitochondrion.longDescription',
    factsKeys: [
      'biology.plantOrganelle.mitochondrion.fact1',
      'biology.plantOrganelle.mitochondrion.fact2',
      'biology.plantOrganelle.mitochondrion.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['mitochondrion', 'mitochondrion_1'],
  },
  {
    id: 'golgi',
    nameKey: 'biology.plantOrganelle.golgi.name',
    descriptionKey: 'biology.plantOrganelle.golgi.description',
    longDescriptionKey: 'biology.plantOrganelle.golgi.longDescription',
    factsKeys: [
      'biology.plantOrganelle.golgi.fact1',
      'biology.plantOrganelle.golgi.fact2',
      'biology.plantOrganelle.golgi.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['golgi'],
  },
  {
    id: 'endoplasmicReticulum',
    nameKey: 'biology.plantOrganelle.er.name',
    descriptionKey: 'biology.plantOrganelle.er.description',
    longDescriptionKey: 'biology.plantOrganelle.er.longDescription',
    factsKeys: [
      'biology.plantOrganelle.er.fact1',
      'biology.plantOrganelle.er.fact2',
      'biology.plantOrganelle.er.fact3',
    ],
    position: [0, 0, 0],
    groupNames: ['endoplasmicReticulum'],
  },
];
</script>

<template>
  <GLBExperiment
    model-path="/models/plant-cell.glb"
    title-key="biology.plantCellTitle"
    subtitle-key="biology.plantCellSubtitle"
    back-route="/biology/cell"
    back-label-key="biology.backToCellSection"
    :parts="plantCellParts"
  />
</template>
