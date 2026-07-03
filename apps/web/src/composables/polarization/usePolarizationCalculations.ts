export function degToRad(deg: number): number { return deg * (Math.PI / 180) }
export function radToDeg(rad: number): number { return rad * (180 / Math.PI) }
export function malusLaw(I0: number, thetaDeg: number): number {
  return I0 * Math.pow(Math.cos(degToRad(thetaDeg)), 2)
}
