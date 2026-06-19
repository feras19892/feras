export function useProjectileHints() {
  function getHint(v0: number, angleDeg: number, g: number, targetX: number) {
    const rad = (angleDeg * Math.PI) / 180
    const R = (v0 * v0 * Math.sin(2 * rad)) / g
    const diff = R - targetX

    let direction = ''
    if (Math.abs(diff) < 2) {
      direction = '✅ قريب جداً! جرب الإطلاق وتحقق.'
    } else if (diff > 0) {
      direction = '⚠️ المقذوف سيصل أبعد من الهدف. فكّر: ماذا يقلل المدى؟'
    } else {
      direction = '⚠️ المقذوف لن يصل للهدف. فكّر: ماذا يزيد المدى؟'
    }

    return {
      equation: 'R = v₀² · sin(2θ) / g',
      currentRange: '',
      targetX: targetX.toFixed(1),
      diff: '',
      percent: '',
      neededV0: '',
      message: direction,
    }
  }

  function checkStudentGuess(studentV0: number, studentAngle: number, g: number, targetX: number) {
    const rad = (studentAngle * Math.PI) / 180
    const R = (studentV0 * studentV0 * Math.sin(2 * rad)) / g
    const diff = R - targetX
    if (Math.abs(diff) < 2) return '✅ ممتاز! تحقق الآن بالإطلاق.'
    if (diff > 0) return '⚠️ سيصل أبعد من الهدف. قلّل السرعة أو الزاوية.'
    return '⚠️ لن يصل للهدف. زِد السرعة أو الزاوية.'
  }

  return { getHint, checkStudentGuess }
}
