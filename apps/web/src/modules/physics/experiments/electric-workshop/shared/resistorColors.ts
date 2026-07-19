export const RESISTOR_COLORS: Record<string, string> = {
  black: '#1a1a1a',
  brown: '#8B4513',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#facc15',
  green: '#22c55e',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  gray: '#9ca3af',
  white: '#f5f5f5',
  gold: '#d4af37',
  silver: '#c0c0c0',
}

const DIGIT_COLORS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'gray', 'white']
const MULTIPLIER_COLORS: { color: string; mult: number }[] = [
  { color: 'black', mult: 1 },
  { color: 'brown', mult: 10 },
  { color: 'red', mult: 100 },
  { color: 'orange', mult: 1000 },
  { color: 'yellow', mult: 10000 },
  { color: 'green', mult: 100000 },
  { color: 'blue', mult: 1000000 },
  { color: 'violet', mult: 10000000 },
  { color: 'gold', mult: 0.1 },
  { color: 'silver', mult: 0.01 },
]

export function valueToResistorBands(value: number): string[] {
  const absVal = Math.abs(value)
  if (absVal === 0) return ['black', 'black', 'black', 'gold']

  let d1 = 0, d2 = 0, multiplier = 1

  if (absVal >= 1) {
    const str = absVal.toFixed(0)
    if (str.length >= 2) {
      d1 = parseInt(str[0])
      d2 = parseInt(str[1])
      const remainingDigits = str.length - 2
      const targetMult = Math.pow(10, remainingDigits)
      const found = MULTIPLIER_COLORS.find(m => m.mult === targetMult)
      if (found) {
        multiplier = found.mult
      } else {
        d1 = parseInt(str[0])
        d2 = 0
        const targetMult2 = Math.pow(10, str.length - 1)
        const found2 = MULTIPLIER_COLORS.find(m => m.mult === targetMult2)
        multiplier = found2 ? found2.mult : 1
      }
    } else {
      d1 = parseInt(str[0])
      d2 = 0
      multiplier = 1
    }
  } else {
    d1 = parseInt(absVal.toFixed(2).replace('0.', '')[0])
    d2 = parseInt(absVal.toFixed(2).replace('0.', '')[1] || '0')
    multiplier = 0.1
  }

  return [DIGIT_COLORS[d1] || 'black', DIGIT_COLORS[d2] || 'black', multiplierToColor(multiplier), 'gold']
}

function multiplierToColor(mult: number): string {
  const found = MULTIPLIER_COLORS.find(m => m.mult === mult)
  return found ? found.color : 'black'
}

export function getResistorBandColors(value: number): string[] {
  const bands = valueToResistorBands(value)
  return bands.map(b => RESISTOR_COLORS[b] || '#000')
}
