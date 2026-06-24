export interface Mark { y: number; value: number; type: 'major' | 'mid' | 'minor'; label?: string }

export function useBeakerScale(maxVolume: number): Mark[] {
  const marks: Mark[] = [];
  const minorStep = maxVolume >= 500 ? 10 : maxVolume >= 250 ? 5 : 5;
  const majorStep = maxVolume >= 500 ? 50 : maxVolume >= 250 ? 25 : 10;
  for (let v = minorStep; v <= maxVolume; v += minorStep) {
    const pct = v / maxVolume;
    const y = 160 - pct * 125;
    const isMajor = v % majorStep === 0;
    const isMid = v % (majorStep / 2) === 0;
    marks.push({ y, value: v, type: isMajor ? 'major' : isMid ? 'mid' : 'minor', label: isMajor ? String(v) : undefined });
  }
  return marks;
}
