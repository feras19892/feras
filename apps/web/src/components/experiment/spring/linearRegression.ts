export function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let ssxx = 0, ssxy = 0, ssyy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    ssxx += dx * dx;
    ssxy += dx * dy;
    ssyy += dy * dy;
  }
  if (Math.abs(ssxx) < 1e-12) return null;
  const slope = ssxy / ssxx;
  const intercept = my - slope * mx;
  const r2 = ssyy > 1e-12 ? (ssxy * ssxy) / (ssxx * ssyy) : 0;
  return { slope, intercept, r2 };
}
