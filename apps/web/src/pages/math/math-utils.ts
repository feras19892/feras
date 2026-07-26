export function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function normalizeNumerals(input: string): string {
  if (!input) return input;
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(ARABIC_DIGITS[i], 'g'), String(i));
    result = result.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), String(i));
  }
  result = result.replace(/[٫,]/g, '.');
  return result;
}

export function parseNumbers(input: string): number[] {
  return normalizeNumerals(input)
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export interface RelatedExperiment {
  id: string;
  name: string;
  route: string;
  context?: string;
}

export function related(branchId: string, expId: string, name: string, context: string): RelatedExperiment {
  return { id: expId, name, route: `/physics/${branchId}/${expId}`, context };
}

export function formatMath(text: string): string {
  return text
    .replace(/\*\*/g, '^')
    .replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>')
    .replace(/\^([a-zA-Z0-9]+)/g, '<sup>$1</sup>')
    .replace(/\*/g, '×');
}
