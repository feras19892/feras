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

// ── Brain ──────────────────────────────────────────────
export const brainData: AnatomyOrganData = {
  id: 'brain',
  titleKey: 'biology.anatomy.brain.title',
  subtitleKey: 'biology.anatomy.brain.subtitle',
  sketchfabUid: '28c8971e11334e8b97a2a0d6235992e8',
  parts: [
    {
      id: 'cerebrum',
      titleKey: 'biology.anatomy.brain.cerebrum.title',
      descriptionKey: 'biology.anatomy.brain.cerebrum.description',
      longDescriptionKey: 'biology.anatomy.brain.cerebrum.longDescription',
      factsKeys: [
        'biology.anatomy.brain.cerebrum.fact1',
        'biology.anatomy.brain.cerebrum.fact2',
        'biology.anatomy.brain.cerebrum.fact3',
      ],
    },
    {
      id: 'cerebellum',
      titleKey: 'biology.anatomy.brain.cerebellum.title',
      descriptionKey: 'biology.anatomy.brain.cerebellum.description',
      longDescriptionKey: 'biology.anatomy.brain.cerebellum.longDescription',
      factsKeys: [
        'biology.anatomy.brain.cerebellum.fact1',
        'biology.anatomy.brain.cerebellum.fact2',
        'biology.anatomy.brain.cerebellum.fact3',
      ],
    },
    {
      id: 'brainstem',
      titleKey: 'biology.anatomy.brain.brainstem.title',
      descriptionKey: 'biology.anatomy.brain.brainstem.description',
      longDescriptionKey: 'biology.anatomy.brain.brainstem.longDescription',
      factsKeys: [
        'biology.anatomy.brain.brainstem.fact1',
        'biology.anatomy.brain.brainstem.fact2',
        'biology.anatomy.brain.brainstem.fact3',
      ],
    },
    {
      id: 'lobes',
      titleKey: 'biology.anatomy.brain.lobes.title',
      descriptionKey: 'biology.anatomy.brain.lobes.description',
      longDescriptionKey: 'biology.anatomy.brain.lobes.longDescription',
      factsKeys: [
        'biology.anatomy.brain.lobes.fact1',
        'biology.anatomy.brain.lobes.fact2',
        'biology.anatomy.brain.lobes.fact3',
      ],
    },
  ],
};

// ── Lungs ──────────────────────────────────────────────
export const lungsData: AnatomyOrganData = {
  id: 'lungs',
  titleKey: 'biology.anatomy.lungs.title',
  subtitleKey: 'biology.anatomy.lungs.subtitle',
  sketchfabUid: 'dd1631a75cf34ed29aa294ac2450b52d',
  parts: [
    {
      id: 'trachea',
      titleKey: 'biology.anatomy.lungs.trachea.title',
      descriptionKey: 'biology.anatomy.lungs.trachea.description',
      longDescriptionKey: 'biology.anatomy.lungs.trachea.longDescription',
      factsKeys: [
        'biology.anatomy.lungs.trachea.fact1',
        'biology.anatomy.lungs.trachea.fact2',
        'biology.anatomy.lungs.trachea.fact3',
      ],
    },
    {
      id: 'bronchi',
      titleKey: 'biology.anatomy.lungs.bronchi.title',
      descriptionKey: 'biology.anatomy.lungs.bronchi.description',
      longDescriptionKey: 'biology.anatomy.lungs.bronchi.longDescription',
      factsKeys: [
        'biology.anatomy.lungs.bronchi.fact1',
        'biology.anatomy.lungs.bronchi.fact2',
        'biology.anatomy.lungs.bronchi.fact3',
      ],
    },
    {
      id: 'alveoli',
      titleKey: 'biology.anatomy.lungs.alveoli.title',
      descriptionKey: 'biology.anatomy.lungs.alveoli.description',
      longDescriptionKey: 'biology.anatomy.lungs.alveoli.longDescription',
      factsKeys: [
        'biology.anatomy.lungs.alveoli.fact1',
        'biology.anatomy.lungs.alveoli.fact2',
        'biology.anatomy.lungs.alveoli.fact3',
      ],
    },
    {
      id: 'pleura',
      titleKey: 'biology.anatomy.lungs.pleura.title',
      descriptionKey: 'biology.anatomy.lungs.pleura.description',
      longDescriptionKey: 'biology.anatomy.lungs.pleura.longDescription',
      factsKeys: [
        'biology.anatomy.lungs.pleura.fact1',
        'biology.anatomy.lungs.pleura.fact2',
        'biology.anatomy.lungs.pleura.fact3',
      ],
    },
  ],
};

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

// ── Kidney ─────────────────────────────────────────────
export const kidneyData: AnatomyOrganData = {
  id: 'kidney',
  titleKey: 'biology.anatomy.kidney.title',
  subtitleKey: 'biology.anatomy.kidney.subtitle',
  sketchfabUid: 'd3dc9bcc490c42f7a3bd9176de169e00',
  parts: [
    {
      id: 'cortex',
      titleKey: 'biology.anatomy.kidney.cortex.title',
      descriptionKey: 'biology.anatomy.kidney.cortex.description',
      longDescriptionKey: 'biology.anatomy.kidney.cortex.longDescription',
      factsKeys: [
        'biology.anatomy.kidney.cortex.fact1',
        'biology.anatomy.kidney.cortex.fact2',
        'biology.anatomy.kidney.cortex.fact3',
      ],
    },
    {
      id: 'medulla',
      titleKey: 'biology.anatomy.kidney.medulla.title',
      descriptionKey: 'biology.anatomy.kidney.medulla.description',
      longDescriptionKey: 'biology.anatomy.kidney.medulla.longDescription',
      factsKeys: [
        'biology.anatomy.kidney.medulla.fact1',
        'biology.anatomy.kidney.medulla.fact2',
        'biology.anatomy.kidney.medulla.fact3',
      ],
    },
    {
      id: 'nephron',
      titleKey: 'biology.anatomy.kidney.nephron.title',
      descriptionKey: 'biology.anatomy.kidney.nephron.description',
      longDescriptionKey: 'biology.anatomy.kidney.nephron.longDescription',
      factsKeys: [
        'biology.anatomy.kidney.nephron.fact1',
        'biology.anatomy.kidney.nephron.fact2',
        'biology.anatomy.kidney.nephron.fact3',
      ],
    },
    {
      id: 'ureter',
      titleKey: 'biology.anatomy.kidney.ureter.title',
      descriptionKey: 'biology.anatomy.kidney.ureter.description',
      longDescriptionKey: 'biology.anatomy.kidney.ureter.longDescription',
      factsKeys: [
        'biology.anatomy.kidney.ureter.fact1',
        'biology.anatomy.kidney.ureter.fact2',
        'biology.anatomy.kidney.ureter.fact3',
      ],
    },
  ],
};

// ── Eye ────────────────────────────────────────────────
export const eyeData: AnatomyOrganData = {
  id: 'eye',
  titleKey: 'biology.anatomy.eye.title',
  subtitleKey: 'biology.anatomy.eye.subtitle',
  sketchfabUid: '4bf3236c8fe2407ea3f494a93b8f5aa2',
  parts: [
    {
      id: 'cornea',
      titleKey: 'biology.anatomy.eye.cornea.title',
      descriptionKey: 'biology.anatomy.eye.cornea.description',
      longDescriptionKey: 'biology.anatomy.eye.cornea.longDescription',
      factsKeys: [
        'biology.anatomy.eye.cornea.fact1',
        'biology.anatomy.eye.cornea.fact2',
        'biology.anatomy.eye.cornea.fact3',
      ],
    },
    {
      id: 'lens',
      titleKey: 'biology.anatomy.eye.lens.title',
      descriptionKey: 'biology.anatomy.eye.lens.description',
      longDescriptionKey: 'biology.anatomy.eye.lens.longDescription',
      factsKeys: [
        'biology.anatomy.eye.lens.fact1',
        'biology.anatomy.eye.lens.fact2',
        'biology.anatomy.eye.lens.fact3',
      ],
    },
    {
      id: 'retina',
      titleKey: 'biology.anatomy.eye.retina.title',
      descriptionKey: 'biology.anatomy.eye.retina.description',
      longDescriptionKey: 'biology.anatomy.eye.retina.longDescription',
      factsKeys: [
        'biology.anatomy.eye.retina.fact1',
        'biology.anatomy.eye.retina.fact2',
        'biology.anatomy.eye.retina.fact3',
      ],
    },
    {
      id: 'opticNerve',
      titleKey: 'biology.anatomy.eye.opticNerve.title',
      descriptionKey: 'biology.anatomy.eye.opticNerve.description',
      longDescriptionKey: 'biology.anatomy.eye.opticNerve.longDescription',
      factsKeys: [
        'biology.anatomy.eye.opticNerve.fact1',
        'biology.anatomy.eye.opticNerve.fact2',
        'biology.anatomy.eye.opticNerve.fact3',
      ],
    },
  ],
};

// ── Ear ────────────────────────────────────────────────
export const earData: AnatomyOrganData = {
  id: 'ear',
  titleKey: 'biology.anatomy.ear.title',
  subtitleKey: 'biology.anatomy.ear.subtitle',
  sketchfabUid: 'a2b214b1799c49cbaa0911cfc8d78802',
  parts: [
    {
      id: 'outerEar',
      titleKey: 'biology.anatomy.ear.outer.title',
      descriptionKey: 'biology.anatomy.ear.outer.description',
      longDescriptionKey: 'biology.anatomy.ear.outer.longDescription',
      factsKeys: [
        'biology.anatomy.ear.outer.fact1',
        'biology.anatomy.ear.outer.fact2',
        'biology.anatomy.ear.outer.fact3',
      ],
    },
    {
      id: 'middleEar',
      titleKey: 'biology.anatomy.ear.middle.title',
      descriptionKey: 'biology.anatomy.ear.middle.description',
      longDescriptionKey: 'biology.anatomy.ear.middle.longDescription',
      factsKeys: [
        'biology.anatomy.ear.middle.fact1',
        'biology.anatomy.ear.middle.fact2',
        'biology.anatomy.ear.middle.fact3',
      ],
    },
    {
      id: 'innerEar',
      titleKey: 'biology.anatomy.ear.inner.title',
      descriptionKey: 'biology.anatomy.ear.inner.description',
      longDescriptionKey: 'biology.anatomy.ear.inner.longDescription',
      factsKeys: [
        'biology.anatomy.ear.inner.fact1',
        'biology.anatomy.ear.inner.fact2',
        'biology.anatomy.ear.inner.fact3',
      ],
    },
    {
      id: 'cochlea',
      titleKey: 'biology.anatomy.ear.cochlea.title',
      descriptionKey: 'biology.anatomy.ear.cochlea.description',
      longDescriptionKey: 'biology.anatomy.ear.cochlea.longDescription',
      factsKeys: [
        'biology.anatomy.ear.cochlea.fact1',
        'biology.anatomy.ear.cochlea.fact2',
        'biology.anatomy.ear.cochlea.fact3',
      ],
    },
  ],
};
