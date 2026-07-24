let _cachedG: number[] | null = null
let _cachedRHS: number[] | null = null
let _cachedSize = 0

export function getMatrixBuffers(size: number): { G: number[]; RHS: number[] } {
  if (_cachedG && _cachedRHS && _cachedSize === size) {
    _cachedG.fill(0)
    _cachedRHS.fill(0)
    return { G: _cachedG, RHS: _cachedRHS }
  }
  _cachedG = new Array(size * size).fill(0)
  _cachedRHS = new Array(size).fill(0)
  _cachedSize = size
  return { G: _cachedG, RHS: _cachedRHS }
}
