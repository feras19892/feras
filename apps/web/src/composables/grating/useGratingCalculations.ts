export function wavelengthToColor(nm: number): string {
  if (nm < 400) return '#8B00FF'
  if (nm < 450) return '#4B0082'
  if (nm < 490) return '#0000FF'
  if (nm < 520) return '#00FF00'
  if (nm < 570) return '#FFFF00'
  if (nm < 590) return '#FF7F00'
  if (nm < 620) return '#FF0000'
  return '#8B0000'
}
