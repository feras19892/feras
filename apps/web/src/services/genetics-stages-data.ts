export interface GeneticsStage {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
}

function stage(
  id: string,
  base: string,
): GeneticsStage {
  return {
    id,
    titleKey: `biology.${base}.title`,
    descriptionKey: `biology.${base}.description`,
    longDescriptionKey: `biology.${base}.longDescription`,
    factsKeys: [
      `biology.${base}.fact1`,
      `biology.${base}.fact2`,
      `biology.${base}.fact3`,
    ],
  };
}

// ── الانقسام المتساوي (Mitosis): خلية 2n → خليتان 2n متماثلتان ──
export const mitosisStages: GeneticsStage[] = [
  stage('prophase', 'mitosis.prophase'),
  stage('metaphase', 'mitosis.metaphase'),
  stage('anaphase', 'mitosis.anaphase'),
  stage('telophase', 'mitosis.telophase'),
  stage('cytokinesis', 'mitosis.cytokinesis'),
];

export const mitosisExperiment = {
  id: 'mitosis',
  titleKey: 'biology.mitosisTitle',
  subtitleKey: 'biology.mitosisSubtitle',
  icon: '🔢',
  stages: mitosisStages,
};

// ── الانقسام المنصف (Meiosis): خلية 2n → 4 أمشاج n مختلفة وراثياً ──
export const meiosisStages: GeneticsStage[] = [
  stage('pairing', 'meiosis.pairing'),
  stage('divisionOne', 'meiosis.divisionOne'),
  stage('divisionTwo', 'meiosis.divisionTwo'),
  stage('gametes', 'meiosis.gametes'),
];

export const meiosisExperiment = {
  id: 'meiosis',
  titleKey: 'biology.meiosisTitle',
  subtitleKey: 'biology.meiosisSubtitle',
  icon: '➗',
  stages: meiosisStages,
};

// ── تضاعف DNA: جزيء واحد → نسختان متطابقتان (نسخ شبه محافظ) ──
export const dnaReplicationStages: GeneticsStage[] = [
  stage('unzipping', 'dnaReplication.unzipping'),
  stage('basePairing', 'dnaReplication.basePairing'),
  stage('twoStrands', 'dnaReplication.twoStrands'),
];

export const dnaReplicationExperiment = {
  id: 'dna-replication',
  titleKey: 'biology.dnaReplicationTitle',
  subtitleKey: 'biology.dnaReplicationSubtitle',
  icon: '🧬',
  stages: dnaReplicationStages,
};
