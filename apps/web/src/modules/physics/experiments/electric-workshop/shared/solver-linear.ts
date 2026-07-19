import type { Complex } from './types'

export function cAdd(a: Complex, b: Complex): Complex { return { re: a.re + b.re, im: a.im + b.im } }
export function cSub(a: Complex, b: Complex): Complex { return { re: a.re - b.re, im: a.im - b.im } }
export function cMul(a: Complex, b: Complex): Complex { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re } }
export function cDiv(a: Complex, b: Complex): Complex { const d = b.re * b.re + b.im * b.im; return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d } }
export function cAbs(a: Complex): number { return Math.sqrt(a.re * a.re + a.im * a.im) }
export function cArg(a: Complex): number { return Math.atan2(a.im, a.re) }

export function solveLinear(A: number[], b: number[], n: number): number[] | null {
  const M = [...A]
  const x = [...b]

  for (let col = 0; col < n; col++) {
    let maxRow = col
    let maxVal = Math.abs(M[col * n + col])
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(M[row * n + col])
      if (val > maxVal) {
        maxVal = val
        maxRow = row
      }
    }
    if (maxVal < 1e-15) continue

    if (maxRow !== col) {
      for (let j = 0; j < n; j++) {
        const tmp = M[col * n + j]
        M[col * n + j] = M[maxRow * n + j]
        M[maxRow * n + j] = tmp
      }
      const tmp = x[col]; x[col] = x[maxRow]; x[maxRow] = tmp
    }

    const pivot = M[col * n + col]
    for (let row = col + 1; row < n; row++) {
      const factor = M[row * n + col] / pivot
      for (let j = col; j < n; j++) {
        M[row * n + j] -= factor * M[col * n + j]
      }
      x[row] -= factor * x[col]
    }
  }

  for (let row = n - 1; row >= 0; row--) {
    let sum = x[row]
    for (let j = row + 1; j < n; j++) {
      sum -= M[row * n + j] * x[j]
    }
    const diag = M[row * n + row]
    if (Math.abs(diag) < 1e-15) {
      x[row] = 0
    } else {
      x[row] = sum / diag
    }
  }

  return x
}

export interface ComplexSolution { re: number[]; im: number[] }

export function solveComplexLinear(Are: number[], Aim: number[], bre: number[], bim: number[], n: number): ComplexSolution | null {
  const re = [...Are]
  const im = [...Aim]
  const xr = [...bre]
  const xi = [...bim]

  for (let col = 0; col < n; col++) {
    let maxVal = 0
    let pivot = col
    for (let row = col; row < n; row++) {
      const val = Math.abs(re[row * n + col]) + Math.abs(im[row * n + col])
      if (val > maxVal) { maxVal = val; pivot = row }
    }
    if (maxVal < 1e-15) continue

    if (pivot !== col) {
      for (let j = 0; j < n; j++) {
        [re[col * n + j], re[pivot * n + j]] = [re[pivot * n + j], re[col * n + j]]
        ;[im[col * n + j], im[pivot * n + j]] = [im[pivot * n + j], im[col * n + j]]
      }
      ;[xr[col], xr[pivot]] = [xr[pivot], xr[col]]
      ;[xi[col], xi[pivot]] = [xi[pivot], xi[col]]
    }

    const pre = re[col * n + col]
    const pim = im[col * n + col]
    const pdenom = pre * pre + pim * pim
    if (pdenom < 1e-30) continue

    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const fre = re[row * n + col]
      const fim = im[row * n + col]
      const factorRe = (fre * pre + fim * pim) / pdenom
      const factorIm = (fim * pre - fre * pim) / pdenom
      for (let j = col; j < n; j++) {
        const are = re[col * n + j], aim = im[col * n + j]
        re[row * n + j] -= factorRe * are - factorIm * aim
        im[row * n + j] -= factorRe * aim + factorIm * are
      }
      xr[row] -= factorRe * xr[col] - factorIm * xi[col]
      xi[row] -= factorRe * xi[col] + factorIm * xr[col]
    }
  }

  for (let i = 0; i < n; i++) {
    const pre = re[i * n + i]
    const pim = im[i * n + i]
    const pdenom = pre * pre + pim * pim
    if (pdenom < 1e-30) { xr[i] = 0; xi[i] = 0; continue }
    const xrVal = xr[i]
    const xiVal = xi[i]
    xr[i] = (xrVal * pre + xiVal * pim) / pdenom
    xi[i] = (xiVal * pre - xrVal * pim) / pdenom
  }

  return { re: xr, im: xi }
}
