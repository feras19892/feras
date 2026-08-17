export interface AnatomyOrganPart {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey?: string;
  factsKeys?: string[];
}

export interface AnatomyOrganData {
  id: string;
  titleKey: string;
  subtitleKey: string;
  sketchfabUid: string;
  parts: AnatomyOrganPart[];
}

// ── Skeleton ───────────────────────────────────────────
export const skeletonData: AnatomyOrganData = {
  id: 'skeleton',
  titleKey: 'biology.anatomy.skeleton.title',
  subtitleKey: 'biology.anatomy.skeleton.subtitle',
  sketchfabUid: '9b0b079953b840bc9a13f524b60041e4',
  parts: [
    {
      id: 'skull',
      titleKey: 'biology.anatomy.skeleton.skull.title',
      descriptionKey: 'biology.anatomy.skeleton.skull.description',
      longDescriptionKey: 'biology.anatomy.skeleton.skull.longDescription',
      factsKeys: [
        'biology.anatomy.skeleton.skull.fact1',
        'biology.anatomy.skeleton.skull.fact2',
        'biology.anatomy.skeleton.skull.fact3',
      ],
    },
    {
      id: 'spine',
      titleKey: 'biology.anatomy.skeleton.spine.title',
      descriptionKey: 'biology.anatomy.skeleton.spine.description',
      longDescriptionKey: 'biology.anatomy.skeleton.spine.longDescription',
      factsKeys: [
        'biology.anatomy.skeleton.spine.fact1',
        'biology.anatomy.skeleton.spine.fact2',
        'biology.anatomy.skeleton.spine.fact3',
      ],
    },
    {
      id: 'ribs',
      titleKey: 'biology.anatomy.skeleton.ribs.title',
      descriptionKey: 'biology.anatomy.skeleton.ribs.description',
      longDescriptionKey: 'biology.anatomy.skeleton.ribs.longDescription',
      factsKeys: [
        'biology.anatomy.skeleton.ribs.fact1',
        'biology.anatomy.skeleton.ribs.fact2',
        'biology.anatomy.skeleton.ribs.fact3',
      ],
    },
    {
      id: 'limbs',
      titleKey: 'biology.anatomy.skeleton.limbs.title',
      descriptionKey: 'biology.anatomy.skeleton.limbs.description',
      longDescriptionKey: 'biology.anatomy.skeleton.limbs.longDescription',
      factsKeys: [
        'biology.anatomy.skeleton.limbs.fact1',
        'biology.anatomy.skeleton.limbs.fact2',
        'biology.anatomy.skeleton.limbs.fact3',
      ],
    },
  ],
};

// ── Digestive System ───────────────────────────────────
export const digestiveData: AnatomyOrganData = {
  id: 'digestive',
  titleKey: 'biology.anatomy.digestive.title',
  subtitleKey: 'biology.anatomy.digestive.subtitle',
  sketchfabUid: '2412d3f9bf17412db96b0718931a4efe',
  parts: [
    {
      id: 'stomach',
      titleKey: 'biology.anatomy.digestive.stomach.title',
      descriptionKey: 'biology.anatomy.digestive.stomach.description',
      longDescriptionKey: 'biology.anatomy.digestive.stomach.longDescription',
      factsKeys: [
        'biology.anatomy.digestive.stomach.fact1',
        'biology.anatomy.digestive.stomach.fact2',
        'biology.anatomy.digestive.stomach.fact3',
      ],
    },
    {
      id: 'smallIntestine',
      titleKey: 'biology.anatomy.digestive.smallIntestine.title',
      descriptionKey: 'biology.anatomy.digestive.smallIntestine.description',
      longDescriptionKey: 'biology.anatomy.digestive.smallIntestine.longDescription',
      factsKeys: [
        'biology.anatomy.digestive.smallIntestine.fact1',
        'biology.anatomy.digestive.smallIntestine.fact2',
        'biology.anatomy.digestive.smallIntestine.fact3',
      ],
    },
    {
      id: 'largeIntestine',
      titleKey: 'biology.anatomy.digestive.largeIntestine.title',
      descriptionKey: 'biology.anatomy.digestive.largeIntestine.description',
      longDescriptionKey: 'biology.anatomy.digestive.largeIntestine.longDescription',
      factsKeys: [
        'biology.anatomy.digestive.largeIntestine.fact1',
        'biology.anatomy.digestive.largeIntestine.fact2',
        'biology.anatomy.digestive.largeIntestine.fact3',
      ],
    },
    {
      id: 'liver',
      titleKey: 'biology.anatomy.digestive.liver.title',
      descriptionKey: 'biology.anatomy.digestive.liver.description',
      longDescriptionKey: 'biology.anatomy.digestive.liver.longDescription',
      factsKeys: [
        'biology.anatomy.digestive.liver.fact1',
        'biology.anatomy.digestive.liver.fact2',
        'biology.anatomy.digestive.liver.fact3',
      ],
    },
  ],
};
