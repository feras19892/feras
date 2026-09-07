/**
 * صفات وراثية مندلية حقيقية — 4 من صفات مندل السبع في البازلاء
 * + صفتان بشريتان شائعتان في مناهج الوراثة.
 * المهيمن يظهر في المتخالف (Rr) والمتنحي لا يظهر إلا متماثلاً (rr).
 */
export interface MendelTrait {
  id: string;
  icon: string;
  nameKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
  /** أليل مهيمن (حرف كبير) */
  dominantAllele: string;
  /** أليل متنحٍ (حرف صغير) */
  recessiveAllele: string;
  /** اسم النمط الظاهري المهيمن */
  phenotypeDomKey: string;
  /** اسم النمط الظاهري المتنحي */
  phenotypeRecKey: string;
}

export const mendelTraits: MendelTrait[] = [
  {
    id: 'seed-shape',
    icon: '🫛',
    nameKey: 'biology.mendel.trait.seedShape.name',
    descriptionKey: 'biology.mendel.trait.seedShape.description',
    longDescriptionKey: 'biology.mendel.trait.seedShape.longDescription',
    factsKeys: [
      'biology.mendel.trait.seedShape.fact1',
      'biology.mendel.trait.seedShape.fact2',
      'biology.mendel.trait.seedShape.fact3',
    ],
    dominantAllele: 'R',
    recessiveAllele: 'r',
    phenotypeDomKey: 'biology.mendel.pheno.seedShape.dom',
    phenotypeRecKey: 'biology.mendel.pheno.seedShape.rec',
  },
  {
    id: 'seed-color',
    icon: '🌱',
    nameKey: 'biology.mendel.trait.seedColor.name',
    descriptionKey: 'biology.mendel.trait.seedColor.description',
    longDescriptionKey: 'biology.mendel.trait.seedColor.longDescription',
    factsKeys: [
      'biology.mendel.trait.seedColor.fact1',
      'biology.mendel.trait.seedColor.fact2',
      'biology.mendel.trait.seedColor.fact3',
    ],
    dominantAllele: 'Y',
    recessiveAllele: 'y',
    phenotypeDomKey: 'biology.mendel.pheno.seedColor.dom',
    phenotypeRecKey: 'biology.mendel.pheno.seedColor.rec',
  },
  {
    id: 'plant-height',
    icon: '📏',
    nameKey: 'biology.mendel.trait.plantHeight.name',
    descriptionKey: 'biology.mendel.trait.plantHeight.description',
    longDescriptionKey: 'biology.mendel.trait.plantHeight.longDescription',
    factsKeys: [
      'biology.mendel.trait.plantHeight.fact1',
      'biology.mendel.trait.plantHeight.fact2',
      'biology.mendel.trait.plantHeight.fact3',
    ],
    dominantAllele: 'T',
    recessiveAllele: 't',
    phenotypeDomKey: 'biology.mendel.pheno.plantHeight.dom',
    phenotypeRecKey: 'biology.mendel.pheno.plantHeight.rec',
  },
  {
    id: 'flower-color',
    icon: '🌸',
    nameKey: 'biology.mendel.trait.flowerColor.name',
    descriptionKey: 'biology.mendel.trait.flowerColor.description',
    longDescriptionKey: 'biology.mendel.trait.flowerColor.longDescription',
    factsKeys: [
      'biology.mendel.trait.flowerColor.fact1',
      'biology.mendel.trait.flowerColor.fact2',
      'biology.mendel.trait.flowerColor.fact3',
    ],
    dominantAllele: 'P',
    recessiveAllele: 'p',
    phenotypeDomKey: 'biology.mendel.pheno.flowerColor.dom',
    phenotypeRecKey: 'biology.mendel.pheno.flowerColor.rec',
  },
  {
    id: 'freckles',
    icon: '😊',
    nameKey: 'biology.mendel.trait.freckles.name',
    descriptionKey: 'biology.mendel.trait.freckles.description',
    longDescriptionKey: 'biology.mendel.trait.freckles.longDescription',
    factsKeys: [
      'biology.mendel.trait.freckles.fact1',
      'biology.mendel.trait.freckles.fact2',
      'biology.mendel.trait.freckles.fact3',
    ],
    dominantAllele: 'F',
    recessiveAllele: 'f',
    phenotypeDomKey: 'biology.mendel.pheno.freckles.dom',
    phenotypeRecKey: 'biology.mendel.pheno.freckles.rec',
  },
  {
    id: 'tongue-rolling',
    icon: '😛',
    nameKey: 'biology.mendel.trait.tongueRolling.name',
    descriptionKey: 'biology.mendel.trait.tongueRolling.description',
    longDescriptionKey: 'biology.mendel.trait.tongueRolling.longDescription',
    factsKeys: [
      'biology.mendel.trait.tongueRolling.fact1',
      'biology.mendel.trait.tongueRolling.fact2',
      'biology.mendel.trait.tongueRolling.fact3',
    ],
    dominantAllele: 'R',
    recessiveAllele: 'r',
    phenotypeDomKey: 'biology.mendel.pheno.tongueRolling.dom',
    phenotypeRecKey: 'biology.mendel.pheno.tongueRolling.rec',
  },
];
