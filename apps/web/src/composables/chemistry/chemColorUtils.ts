function hex2rgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgb2hex(r: number, g: number, b: number) {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixColor(c1: string, vol1: number, c2: string, vol2: number): string {
  const rgb1 = hex2rgb(c1);
  const rgb2 = hex2rgb(c2);
  const total = vol1 + vol2;
  const r = (rgb1.r * vol1 + rgb2.r * vol2) / total;
  const g = (rgb1.g * vol1 + rgb2.g * vol2) / total;
  const b = (rgb1.b * vol1 + rgb2.b * vol2) / total;
  return rgb2hex(r, g, b);
}
