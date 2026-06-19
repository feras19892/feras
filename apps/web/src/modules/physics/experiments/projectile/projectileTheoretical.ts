export function calcFlightTime(v0: number, angleRad: number, g: number) {
  return (2 * v0 * Math.sin(angleRad)) / g
}

export function calcMaxHeight(v0: number, angleRad: number, g: number) {
  return (Math.pow(v0 * Math.sin(angleRad), 2)) / (2 * g)
}

export function calcRange(v0: number, angleRad: number, g: number) {
  return (Math.pow(v0, 2) * Math.sin(2 * angleRad)) / g
}
