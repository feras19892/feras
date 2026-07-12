function hex2rgb(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return { r: isNaN(r) ? 59 : r, g: isNaN(g) ? 130 : g, b: isNaN(b) ? 246 : b };
}

export function hexToRgb(hex: string) {
  return hex2rgb(hex);
}

function rgb2hex(r: number, g: number, b: number) {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixColor(c1: string, vol1: number, c2: string, vol2: number): string {
  const rgb1 = hex2rgb(c1);
  const rgb2 = hex2rgb(c2);
  const total = vol1 + vol2;
  if (total <= 0) return c1;
  const r = (rgb1.r * vol1 + rgb2.r * vol2) / total;
  const g = (rgb1.g * vol1 + rgb2.g * vol2) / total;
  const b = (rgb1.b * vol1 + rgb2.b * vol2) / total;
  return rgb2hex(r, g, b);
}
