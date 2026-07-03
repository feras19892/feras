export const SPECIFIC_HEAT_WATER = 4186 // J/(kg·K)
export const SPECIFIC_HEAT_ALUMINUM = 900 // J/(kg·K)
export const SPECIFIC_HEAT_COPPER = 385  // J/(kg·K)
export const SPECIFIC_HEAT_IRON = 450   // J/(kg·K)

export function heatMass(m: number, c: number, deltaT: number): number {
  return m * c * deltaT
}

export function finalTemp(
  mWater: number, tWater: number,
  mMetal: number, tMetal: number,
  cMetal: number,
  mCup: number, cCup: number = SPECIFIC_HEAT_ALUMINUM
): number {
  const qWater = SPECIFIC_HEAT_WATER * mWater
  const qCup = cCup * mCup
  const qMetal = cMetal * mMetal
  const numerator = qWater * tWater + qCup * tWater + qMetal * tMetal
  const denominator = qWater + qCup + qMetal
  return numerator / denominator
}

export function findCMetal(
  mWater: number, tWater: number,
  mMetal: number, tMetal: number,
  tf: number,
  mCup: number, cCup: number = SPECIFIC_HEAT_ALUMINUM
): number {
  const qGained = (mWater * SPECIFIC_HEAT_WATER + mCup * cCup) * (tf - tWater)
  const qLost = mMetal * (tMetal - tf)
  return qGained / qLost
}
