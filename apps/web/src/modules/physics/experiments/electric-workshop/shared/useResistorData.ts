import { computed } from 'vue'
import type { Ref } from 'vue'
import { getResistorBandColors, valueToResistorBands, RESISTOR_COLORS } from './resistorColors'
import type { WorkshopComponent } from './types'

export function useResistorData(editingComp: Ref<WorkshopComponent | null>) {
  const resistorBandPreview = computed(() => {
    if (!editingComp.value) return []
    return getResistorBandColors(editingComp.value.value)
  })

  const resistorBandExplanation = computed(() => {
    if (!editingComp.value) return ''
    const bands = valueToResistorBands(editingComp.value.value)
    const colorNames: Record<string, string> = {
      black: 'أسود', brown: 'بني', red: 'أحمر', orange: 'برتقالي',
      yellow: 'أصفر', green: 'أخضر', blue: 'أزرق', violet: 'بنفسجي',
      gray: 'رمادي', white: 'أبيض', gold: 'ذهبي', silver: 'فضي',
    }
    const val = editingComp.value.value
    const parts = [
      `${colorNames[bands[0]] || bands[0]}`,
      ` (${bands[0] === 'black' ? 0 : bands[0] === 'brown' ? 1 : bands[0] === 'red' ? 2 : bands[0] === 'orange' ? 3 : bands[0] === 'yellow' ? 4 : bands[0] === 'green' ? 5 : bands[0] === 'blue' ? 6 : bands[0] === 'violet' ? 7 : bands[0] === 'gray' ? 8 : 9})`,
      ` → ${colorNames[bands[1]] || bands[1]}`,
      ` → ${colorNames[bands[2]] || bands[2]} (مضاعف)`,
      ` → ${colorNames[bands[3]] || bands[3]} (تفاوت ±5%)`,
      ` = ${val}Ω`,
    ]
    return parts.join('')
  })

  const resistorColorChart = [
    { name: 'أسود', hex: RESISTOR_COLORS.black, digit: 0, multiplier: '×1', tolerance: null },
    { name: 'بني', hex: RESISTOR_COLORS.brown, digit: 1, multiplier: '×10', tolerance: 1 },
    { name: 'أحمر', hex: RESISTOR_COLORS.red, digit: 2, multiplier: '×100', tolerance: 2 },
    { name: 'برتقالي', hex: RESISTOR_COLORS.orange, digit: 3, multiplier: '×1K', tolerance: null },
    { name: 'أصفر', hex: RESISTOR_COLORS.yellow, digit: 4, multiplier: '×10K', tolerance: null },
    { name: 'أخضر', hex: RESISTOR_COLORS.green, digit: 5, multiplier: '×100K', tolerance: 0.5 },
    { name: 'أزرق', hex: RESISTOR_COLORS.blue, digit: 6, multiplier: '×1M', tolerance: 0.25 },
    { name: 'بنفسجي', hex: RESISTOR_COLORS.violet, digit: 7, multiplier: '×10M', tolerance: 0.1 },
    { name: 'رمادي', hex: RESISTOR_COLORS.gray, digit: 8, multiplier: null, tolerance: 0.05 },
    { name: 'أبيض', hex: RESISTOR_COLORS.white, digit: 9, multiplier: null, tolerance: null },
    { name: 'ذهبي', hex: RESISTOR_COLORS.gold, digit: null, multiplier: '×0.1', tolerance: 5 },
    { name: 'فضي', hex: RESISTOR_COLORS.silver, digit: null, multiplier: '×0.01', tolerance: 10 },
  ]

  return { resistorBandPreview, resistorBandExplanation, resistorColorChart }
}
