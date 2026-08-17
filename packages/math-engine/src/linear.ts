import type { Complex, ComplexSolution } from './types.js'

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
      return null
    }
    x[row] = sum / diag
  }

  return x
}

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

export interface LUFactor {
  luG: number[]
  pivots: Int32Array
  size: number
}

export function factorLU(G: number[], size: number): LUFactor {
  const luG = [...G]
  const pivots = new Int32Array(size)
  for (let col = 0; col < size; col++) {
    let maxVal = 0
    let pivot = col
    for (let row = col; row < size; row++) {
      if (Math.abs(luG[row * size + col]) > maxVal) {
        maxVal = Math.abs(luG[row * size + col])
        pivot = row
      }
    }
    if (maxVal < 1e-15) {
      pivots[col] = col
      luG[col * size + col] = 1
      continue
    }
    pivots[col] = pivot
    if (pivot !== col) {
      for (let j = 0; j < size; j++) {
        [luG[col * size + j], luG[pivot * size + j]] = [luG[pivot * size + j], luG[col * size + j]]
      }
    }
    const diag = luG[col * size + col]
    for (let row = col + 1; row < size; row++) {
      const factor = luG[row * size + col] / diag
      luG[row * size + col] = factor
      for (let j = col + 1; j < size; j++) {
        luG[row * size + j] -= factor * luG[col * size + j]
      }
    }
  }
  return { luG, pivots, size }
}

export function solveLU(lu: LUFactor, rhs: number[]): number[] {
  const { luG, pivots, size } = lu
  const b = [...rhs]
  const x = new Array(size).fill(0)
  for (let i = 0; i < size; i++) {
    const p = pivots[i]
    ;[b[i], b[p]] = [b[p], b[i]]
    x[i] = b[i]
    for (let j = 0; j < i; j++) {
      x[i] -= luG[i * size + j] * x[j]
    }
  }
  for (let i = size - 1; i >= 0; i--) {
    for (let j = i + 1; j < size; j++) {
      x[i] -= luG[i * size + j] * x[j]
    }
    x[i] /= luG[i * size + i]
  }
  return x
}
