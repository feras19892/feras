/**
 * Real DFT (O(N²)) — accurate and simple for N ≤ 2048
 * Returns { freqs, amplitudes, dominantFreq }
 */
export function fft(signal: number[], sampleRate: number) {
  const n = signal.length;
  if (n === 0) return null;
  const N = n;
  const half = Math.floor(N / 2) + 1;
  const freqs: number[] = [];
  const amplitudes: number[] = [];
  let maxAmp = 0;
  let domIdx = 0;
  const df = sampleRate / N;

  for (let k = 0; k < half; k++) {
    let re = 0, im = 0;
    const ang = (-2 * Math.PI * k) / N;
    for (let t = 0; t < N; t++) {
      const cos = Math.cos(ang * t);
      const sin = Math.sin(ang * t);
      re += signal[t] * cos;
      im += signal[t] * sin;
    }
    const amp = Math.sqrt(re * re + im * im) / N;
    freqs.push(k * df);
    amplitudes.push(amp);
    if (amp > maxAmp && k > 0) {
      maxAmp = amp;
      domIdx = k;
    }
  }

  return { freqs, amplitudes, dominantFreq: domIdx * df };
}

export function applyHannWindow(arr: number[]) {
  const n = arr.length;
  if (n < 2) return arr;
  return arr.map((v, i) => v * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1))));
}
