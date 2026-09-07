/**
 * معلومات تفصيلية عن كل كائن في السلاسل الغذائية.
 * مفاتيحها مغطاة في biology-{ar,en,es}_b.ts ضمن حقل ecology
 * (كائنات orgXxxInfo + حقول info/long/fact1..3).
 */
export interface OrganismDetail {
  infoKey: string;
  longInfoKey: string;
  factsKeys: string[];
}

export const organismDetails: Record<string, OrganismDetail> = {
  sun: {
    infoKey: 'biology.orgSunInfo.info',
    longInfoKey: 'biology.orgSunInfo.long',
    factsKeys: ['biology.orgSunInfo.fact1', 'biology.orgSunInfo.fact2', 'biology.orgSunInfo.fact3'],
  },
  grass: {
    infoKey: 'biology.orgGrassInfo.info',
    longInfoKey: 'biology.orgGrassInfo.long',
    factsKeys: ['biology.orgGrassInfo.fact1', 'biology.orgGrassInfo.fact2', 'biology.orgGrassInfo.fact3'],
  },
  grasshopper: {
    infoKey: 'biology.orgGrasshopperInfo.info',
    longInfoKey: 'biology.orgGrasshopperInfo.long',
    factsKeys: ['biology.orgGrasshopperInfo.fact1', 'biology.orgGrasshopperInfo.fact2', 'biology.orgGrasshopperInfo.fact3'],
  },
  frog: {
    infoKey: 'biology.orgFrogInfo.info',
    longInfoKey: 'biology.orgFrogInfo.long',
    factsKeys: ['biology.orgFrogInfo.fact1', 'biology.orgFrogInfo.fact2', 'biology.orgFrogInfo.fact3'],
  },
  snake: {
    infoKey: 'biology.orgSnakeInfo.info',
    longInfoKey: 'biology.orgSnakeInfo.long',
    factsKeys: ['biology.orgSnakeInfo.fact1', 'biology.orgSnakeInfo.fact2', 'biology.orgSnakeInfo.fact3'],
  },
  phytoplankton: {
    infoKey: 'biology.orgPhytoplanktonInfo.info',
    longInfoKey: 'biology.orgPhytoplanktonInfo.long',
    factsKeys: ['biology.orgPhytoplanktonInfo.fact1', 'biology.orgPhytoplanktonInfo.fact2', 'biology.orgPhytoplanktonInfo.fact3'],
  },
  krill: {
    infoKey: 'biology.orgKrillInfo.info',
    longInfoKey: 'biology.orgKrillInfo.long',
    factsKeys: ['biology.orgKrillInfo.fact1', 'biology.orgKrillInfo.fact2', 'biology.orgKrillInfo.fact3'],
  },
  'small-fish': {
    infoKey: 'biology.orgSmallFishInfo.info',
    longInfoKey: 'biology.orgSmallFishInfo.long',
    factsKeys: ['biology.orgSmallFishInfo.fact1', 'biology.orgSmallFishInfo.fact2', 'biology.orgSmallFishInfo.fact3'],
  },
  tuna: {
    infoKey: 'biology.orgTunaInfo.info',
    longInfoKey: 'biology.orgTunaInfo.long',
    factsKeys: ['biology.orgTunaInfo.fact1', 'biology.orgTunaInfo.fact2', 'biology.orgTunaInfo.fact3'],
  },
  cactus: {
    infoKey: 'biology.orgCactusInfo.info',
    longInfoKey: 'biology.orgCactusInfo.long',
    factsKeys: ['biology.orgCactusInfo.fact1', 'biology.orgCactusInfo.fact2', 'biology.orgCactusInfo.fact3'],
  },
  'desert-hare': {
    infoKey: 'biology.orgDesertHareInfo.info',
    longInfoKey: 'biology.orgDesertHareInfo.long',
    factsKeys: ['biology.orgDesertHareInfo.fact1', 'biology.orgDesertHareInfo.fact2', 'biology.orgDesertHareInfo.fact3'],
  },
  rattlesnake: {
    infoKey: 'biology.orgRattlesnakeInfo.info',
    longInfoKey: 'biology.orgRattlesnakeInfo.long',
    factsKeys: ['biology.orgRattlesnakeInfo.fact1', 'biology.orgRattlesnakeInfo.fact2', 'biology.orgRattlesnakeInfo.fact3'],
  },
  'desert-hawk': {
    infoKey: 'biology.orgDesertHawkInfo.info',
    longInfoKey: 'biology.orgDesertHawkInfo.long',
    factsKeys: ['biology.orgDesertHawkInfo.fact1', 'biology.orgDesertHawkInfo.fact2', 'biology.orgDesertHawkInfo.fact3'],
  },
  'arctic-willow': {
    infoKey: 'biology.orgArcticWillowInfo.info',
    longInfoKey: 'biology.orgArcticWillowInfo.long',
    factsKeys: ['biology.orgArcticWillowInfo.fact1', 'biology.orgArcticWillowInfo.fact2', 'biology.orgArcticWillowInfo.fact3'],
  },
  lemming: {
    infoKey: 'biology.orgLemmingInfo.info',
    longInfoKey: 'biology.orgLemmingInfo.long',
    factsKeys: ['biology.orgLemmingInfo.fact1', 'biology.orgLemmingInfo.fact2', 'biology.orgLemmingInfo.fact3'],
  },
  'arctic-fox': {
    infoKey: 'biology.orgArcticFoxInfo.info',
    longInfoKey: 'biology.orgArcticFoxInfo.long',
    factsKeys: ['biology.orgArcticFoxInfo.fact1', 'biology.orgArcticFoxInfo.fact2', 'biology.orgArcticFoxInfo.fact3'],
  },
  'snowy-owl': {
    infoKey: 'biology.orgSnowyOwlInfo.info',
    longInfoKey: 'biology.orgSnowyOwlInfo.long',
    factsKeys: ['biology.orgSnowyOwlInfo.fact1', 'biology.orgSnowyOwlInfo.fact2', 'biology.orgSnowyOwlInfo.fact3'],
  },
  'oak-tree': {
    infoKey: 'biology.orgOakTreeInfo.info',
    longInfoKey: 'biology.orgOakTreeInfo.long',
    factsKeys: ['biology.orgOakTreeInfo.fact1', 'biology.orgOakTreeInfo.fact2', 'biology.orgOakTreeInfo.fact3'],
  },
  caterpillar: {
    infoKey: 'biology.orgCaterpillarInfo.info',
    longInfoKey: 'biology.orgCaterpillarInfo.long',
    factsKeys: ['biology.orgCaterpillarInfo.fact1', 'biology.orgCaterpillarInfo.fact2', 'biology.orgCaterpillarInfo.fact3'],
  },
  'blue-jay': {
    infoKey: 'biology.orgBlueJayInfo.info',
    longInfoKey: 'biology.orgBlueJayInfo.long',
    factsKeys: ['biology.orgBlueJayInfo.fact1', 'biology.orgBlueJayInfo.fact2', 'biology.orgBlueJayInfo.fact3'],
  },
  'forest-hawk': {
    infoKey: 'biology.orgForestHawkInfo.info',
    longInfoKey: 'biology.orgForestHawkInfo.long',
    factsKeys: ['biology.orgForestHawkInfo.fact1', 'biology.orgForestHawkInfo.fact2', 'biology.orgForestHawkInfo.fact3'],
  },
  acacia: {
    infoKey: 'biology.orgAcaciaInfo.info',
    longInfoKey: 'biology.orgAcaciaInfo.long',
    factsKeys: ['biology.orgAcaciaInfo.fact1', 'biology.orgAcaciaInfo.fact2', 'biology.orgAcaciaInfo.fact3'],
  },
  termite: {
    infoKey: 'biology.orgTermiteInfo.info',
    longInfoKey: 'biology.orgTermiteInfo.long',
    factsKeys: ['biology.orgTermiteInfo.fact1', 'biology.orgTermiteInfo.fact2', 'biology.orgTermiteInfo.fact3'],
  },
  aardvark: {
    infoKey: 'biology.orgAardvarkInfo.info',
    longInfoKey: 'biology.orgAardvarkInfo.long',
    factsKeys: ['biology.orgAardvarkInfo.fact1', 'biology.orgAardvarkInfo.fact2', 'biology.orgAardvarkInfo.fact3'],
  },
  lion: {
    infoKey: 'biology.orgLionInfo.info',
    longInfoKey: 'biology.orgLionInfo.long',
    factsKeys: ['biology.orgLionInfo.fact1', 'biology.orgLionInfo.fact2', 'biology.orgLionInfo.fact3'],
  },
  coral: {
    infoKey: 'biology.orgCoralInfo.info',
    longInfoKey: 'biology.orgCoralInfo.long',
    factsKeys: ['biology.orgCoralInfo.fact1', 'biology.orgCoralInfo.fact2', 'biology.orgCoralInfo.fact3'],
  },
  parrotfish: {
    infoKey: 'biology.orgParrotfishInfo.info',
    longInfoKey: 'biology.orgParrotfishInfo.long',
    factsKeys: ['biology.orgParrotfishInfo.fact1', 'biology.orgParrotfishInfo.fact2', 'biology.orgParrotfishInfo.fact3'],
  },
  grouper: {
    infoKey: 'biology.orgGrouperInfo.info',
    longInfoKey: 'biology.orgGrouperInfo.long',
    factsKeys: ['biology.orgGrouperInfo.fact1', 'biology.orgGrouperInfo.fact2', 'biology.orgGrouperInfo.fact3'],
  },
  'reef-shark': {
    infoKey: 'biology.orgReefSharkInfo.info',
    longInfoKey: 'biology.orgReefSharkInfo.long',
    factsKeys: ['biology.orgReefSharkInfo.fact1', 'biology.orgReefSharkInfo.fact2', 'biology.orgReefSharkInfo.fact3'],
  },
  'water-lily': {
    infoKey: 'biology.orgWaterLilyInfo.info',
    longInfoKey: 'biology.orgWaterLilyInfo.long',
    factsKeys: ['biology.orgWaterLilyInfo.fact1', 'biology.orgWaterLilyInfo.fact2', 'biology.orgWaterLilyInfo.fact3'],
  },
  tadpole: {
    infoKey: 'biology.orgTadpoleInfo.info',
    longInfoKey: 'biology.orgTadpoleInfo.long',
    factsKeys: ['biology.orgTadpoleInfo.fact1', 'biology.orgTadpoleInfo.fact2', 'biology.orgTadpoleInfo.fact3'],
  },
  'water-snake': {
    infoKey: 'biology.orgWaterSnakeInfo.info',
    longInfoKey: 'biology.orgWaterSnakeInfo.long',
    factsKeys: ['biology.orgWaterSnakeInfo.fact1', 'biology.orgWaterSnakeInfo.fact2', 'biology.orgWaterSnakeInfo.fact3'],
  },
  heron: {
    infoKey: 'biology.orgHeronInfo.info',
    longInfoKey: 'biology.orgHeronInfo.long',
    factsKeys: ['biology.orgHeronInfo.fact1', 'biology.orgHeronInfo.fact2', 'biology.orgHeronInfo.fact3'],
  },
  'prairie-dog': {
    infoKey: 'biology.orgPrairieDogInfo.info',
    longInfoKey: 'biology.orgPrairieDogInfo.long',
    factsKeys: ['biology.orgPrairieDogInfo.fact1', 'biology.orgPrairieDogInfo.fact2', 'biology.orgPrairieDogInfo.fact3'],
  },
  coyote: {
    infoKey: 'biology.orgCoyoteInfo.info',
    longInfoKey: 'biology.orgCoyoteInfo.long',
    factsKeys: ['biology.orgCoyoteInfo.fact1', 'biology.orgCoyoteInfo.fact2', 'biology.orgCoyoteInfo.fact3'],
  },
  'golden-eagle': {
    infoKey: 'biology.orgGoldenEagleInfo.info',
    longInfoKey: 'biology.orgGoldenEagleInfo.long',
    factsKeys: ['biology.orgGoldenEagleInfo.fact1', 'biology.orgGoldenEagleInfo.fact2', 'biology.orgGoldenEagleInfo.fact3'],
  },
  palm: {
    infoKey: 'biology.orgPalmInfo.info',
    longInfoKey: 'biology.orgPalmInfo.long',
    factsKeys: ['biology.orgPalmInfo.fact1', 'biology.orgPalmInfo.fact2', 'biology.orgPalmInfo.fact3'],
  },
  'howler-monkey': {
    infoKey: 'biology.orgHowlerMonkeyInfo.info',
    longInfoKey: 'biology.orgHowlerMonkeyInfo.long',
    factsKeys: ['biology.orgHowlerMonkeyInfo.fact1', 'biology.orgHowlerMonkeyInfo.fact2', 'biology.orgHowlerMonkeyInfo.fact3'],
  },
  boa: {
    infoKey: 'biology.orgBoaInfo.info',
    longInfoKey: 'biology.orgBoaInfo.long',
    factsKeys: ['biology.orgBoaInfo.fact1', 'biology.orgBoaInfo.fact2', 'biology.orgBoaInfo.fact3'],
  },
  jaguar: {
    infoKey: 'biology.orgJaguarInfo.info',
    longInfoKey: 'biology.orgJaguarInfo.long',
    factsKeys: ['biology.orgJaguarInfo.fact1', 'biology.orgJaguarInfo.fact2', 'biology.orgJaguarInfo.fact3'],
  },
  'stream-algae': {
    infoKey: 'biology.orgStreamAlgaeInfo.info',
    longInfoKey: 'biology.orgStreamAlgaeInfo.long',
    factsKeys: ['biology.orgStreamAlgaeInfo.fact1', 'biology.orgStreamAlgaeInfo.fact2', 'biology.orgStreamAlgaeInfo.fact3'],
  },
  mayfly: {
    infoKey: 'biology.orgMayflyInfo.info',
    longInfoKey: 'biology.orgMayflyInfo.long',
    factsKeys: ['biology.orgMayflyInfo.fact1', 'biology.orgMayflyInfo.fact2', 'biology.orgMayflyInfo.fact3'],
  },
  trout: {
    infoKey: 'biology.orgTroutInfo.info',
    longInfoKey: 'biology.orgTroutInfo.long',
    factsKeys: ['biology.orgTroutInfo.fact1', 'biology.orgTroutInfo.fact2', 'biology.orgTroutInfo.fact3'],
  },
  'river-otter': {
    infoKey: 'biology.orgRiverOtterInfo.info',
    longInfoKey: 'biology.orgRiverOtterInfo.long',
    factsKeys: ['biology.orgRiverOtterInfo.fact1', 'biology.orgRiverOtterInfo.fact2', 'biology.orgRiverOtterInfo.fact3'],
  },
};
