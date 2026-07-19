import type { Complex } from './types.js'

export function cAdd(a: Complex, b: Complex): Complex { return { re: a.re + b.re, im: a.im + b.im } }
export function cSub(a: Complex, b: Complex): Complex { return { re: a.re - b.re, im: a.im - b.im } }
export function cMul(a: Complex, b: Complex): Complex { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re } }
export function cDiv(a: Complex, b: Complex): Complex { const d = b.re * b.re + b.im * b.im; return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d } }
export function cAbs(a: Complex): number { return Math.sqrt(a.re * a.re + a.im * a.im) }
export function cArg(a: Complex): number { return Math.atan2(a.im, a.re) }
