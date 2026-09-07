/** كائن في سلسلة غذائية — يُرتّب حسب مستواه في انتقال الطاقة */
export interface ChainOrganism {
  id: string;
  icon: string;
  nameKey: string;
  roleKey: string;
  /** 0 = الشمس، 1 = منتج، 2 = مستهلك أول ... */
  level: number;
  /** نسبة الطاقة المتبقية (قاعدة 10%) */
  energy: number;
}

export interface FoodChain {
  id: string;
  icon: string;
  nameKey: string;
  organisms: ChainOrganism[];
}

const sun: ChainOrganism = { id: 'sun', icon: '☀️', nameKey: 'biology.orgSun', roleKey: 'biology.roleSun', level: 0, energy: 100 };

export const foodChains: FoodChain[] = [
  {
    id: 'terrestrial',
    icon: '🌿',
    nameKey: 'biology.chainTerrestrial',
    organisms: [
      sun,
      { id: 'grass', icon: '🌿', nameKey: 'biology.orgGrass', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'grasshopper', icon: '🦗', nameKey: 'biology.orgGrasshopper', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'frog', icon: '🐸', nameKey: 'biology.orgFrog', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'snake', icon: '🐍', nameKey: 'biology.orgSnake', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'marine',
    icon: '🌊',
    nameKey: 'biology.chainMarine',
    organisms: [
      sun,
      { id: 'phytoplankton', icon: '🦠', nameKey: 'biology.orgPhytoplankton', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'krill', icon: '🦐', nameKey: 'biology.orgKrill', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'small-fish', icon: '🐟', nameKey: 'biology.orgSmallFish', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'tuna', icon: '🐠', nameKey: 'biology.orgTuna', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'desert',
    icon: '🏜️',
    nameKey: 'biology.chainDesert',
    organisms: [
      sun,
      { id: 'cactus', icon: '🌵', nameKey: 'biology.orgCactus', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'desert-hare', icon: '🐇', nameKey: 'biology.orgDesertHare', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'rattlesnake', icon: '🐍', nameKey: 'biology.orgRattlesnake', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'desert-hawk', icon: '🦅', nameKey: 'biology.orgDesertHawk', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'arctic',
    icon: '❄️',
    nameKey: 'biology.chainArctic',
    organisms: [
      sun,
      { id: 'arctic-willow', icon: '🌿', nameKey: 'biology.orgArcticWillow', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'lemming', icon: '🐁', nameKey: 'biology.orgLemming', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'arctic-fox', icon: '🦊', nameKey: 'biology.orgArcticFox', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'snowy-owl', icon: '🦉', nameKey: 'biology.orgSnowyOwl', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'forest',
    icon: '🌲',
    nameKey: 'biology.chainForest',
    organisms: [
      sun,
      { id: 'oak-tree', icon: '🌳', nameKey: 'biology.orgOakTree', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'caterpillar', icon: '🐛', nameKey: 'biology.orgCaterpillar', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'blue-jay', icon: '🐦', nameKey: 'biology.orgBlueJay', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'forest-hawk', icon: '🦅', nameKey: 'biology.orgForestHawk', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'savanna',
    icon: '🦒',
    nameKey: 'biology.chainSavanna',
    organisms: [
      sun,
      { id: 'acacia', icon: '🌳', nameKey: 'biology.orgAcacia', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'termite', icon: '🐜', nameKey: 'biology.orgTermite', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'aardvark', icon: '🐽', nameKey: 'biology.orgAardvark', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'lion', icon: '🦁', nameKey: 'biology.orgLion', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'coral-reef',
    icon: '🪸',
    nameKey: 'biology.chainCoralReef',
    organisms: [
      sun,
      { id: 'coral', icon: '🪸', nameKey: 'biology.orgCoral', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'parrotfish', icon: '🐠', nameKey: 'biology.orgParrotfish', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'grouper', icon: '🐟', nameKey: 'biology.orgGrouper', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'reef-shark', icon: '🦈', nameKey: 'biology.orgReefShark', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'pond',
    icon: '💧',
    nameKey: 'biology.chainPond',
    organisms: [
      sun,
      { id: 'water-lily', icon: '🪷', nameKey: 'biology.orgWaterLily', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'tadpole', icon: '🐸', nameKey: 'biology.orgTadpole', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'water-snake', icon: '🐍', nameKey: 'biology.orgWaterSnake', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'heron', icon: '🦢', nameKey: 'biology.orgHeron', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'grassland',
    icon: '🌾',
    nameKey: 'biology.chainGrassland',
    organisms: [
      sun,
      { id: 'grass', icon: '🌿', nameKey: 'biology.orgGrass', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'prairie-dog', icon: '🐿️', nameKey: 'biology.orgPrairieDog', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'coyote', icon: '🐺', nameKey: 'biology.orgCoyote', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'golden-eagle', icon: '🦅', nameKey: 'biology.orgGoldenEagle', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'rainforest',
    icon: '🌴',
    nameKey: 'biology.chainRainforest',
    organisms: [
      sun,
      { id: 'palm', icon: '🌴', nameKey: 'biology.orgPalm', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'howler-monkey', icon: '🐵', nameKey: 'biology.orgHowlerMonkey', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'boa', icon: '🐍', nameKey: 'biology.orgBoa', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'jaguar', icon: '🐆', nameKey: 'biology.orgJaguar', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
  {
    id: 'mountain-stream',
    icon: '⛰️',
    nameKey: 'biology.chainMountainStream',
    organisms: [
      sun,
      { id: 'stream-algae', icon: '🌿', nameKey: 'biology.orgStreamAlgae', roleKey: 'biology.roleProducer', level: 1, energy: 10 },
      { id: 'mayfly', icon: '🦟', nameKey: 'biology.orgMayfly', roleKey: 'biology.rolePrimary', level: 2, energy: 1 },
      { id: 'trout', icon: '🐟', nameKey: 'biology.orgTrout', roleKey: 'biology.roleSecondary', level: 3, energy: 0.1 },
      { id: 'river-otter', icon: '🦦', nameKey: 'biology.orgRiverOtter', roleKey: 'biology.roleTertiary', level: 4, energy: 0.01 },
    ],
  },
];

/** مرحلة في دورة الماء */
export interface EcologyStage {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  factsKeys: string[];
}

export const waterCycleStages: EcologyStage[] = [
  {
    id: 'evaporation',
    titleKey: 'biology.waterCycle.evaporation.title',
    descriptionKey: 'biology.waterCycle.evaporation.description',
    longDescriptionKey: 'biology.waterCycle.evaporation.longDescription',
    factsKeys: [
      'biology.waterCycle.evaporation.fact1',
      'biology.waterCycle.evaporation.fact2',
      'biology.waterCycle.evaporation.fact3',
    ],
  },
  {
    id: 'condensation',
    titleKey: 'biology.waterCycle.condensation.title',
    descriptionKey: 'biology.waterCycle.condensation.description',
    longDescriptionKey: 'biology.waterCycle.condensation.longDescription',
    factsKeys: [
      'biology.waterCycle.condensation.fact1',
      'biology.waterCycle.condensation.fact2',
      'biology.waterCycle.condensation.fact3',
    ],
  },
  {
    id: 'precipitation',
    titleKey: 'biology.waterCycle.precipitation.title',
    descriptionKey: 'biology.waterCycle.precipitation.description',
    longDescriptionKey: 'biology.waterCycle.precipitation.longDescription',
    factsKeys: [
      'biology.waterCycle.precipitation.fact1',
      'biology.waterCycle.precipitation.fact2',
      'biology.waterCycle.precipitation.fact3',
    ],
  },
  {
    id: 'collection',
    titleKey: 'biology.waterCycle.collection.title',
    descriptionKey: 'biology.waterCycle.collection.description',
    longDescriptionKey: 'biology.waterCycle.collection.longDescription',
    factsKeys: [
      'biology.waterCycle.collection.fact1',
      'biology.waterCycle.collection.fact2',
      'biology.waterCycle.collection.fact3',
    ],
  },
];

export const waterCycleExperiment = {
  id: 'water-cycle',
  titleKey: 'biology.waterCycleTitle',
  subtitleKey: 'biology.waterCycleSubtitle',
  icon: '💧',
  stages: waterCycleStages,
};
