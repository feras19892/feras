export function useProjectileHints() {
  function getHint(v0: number, angleDeg: number, g: number, targetX: number) {
    const rad = (angleDeg * Math.PI) / 180
    const R = (v0 * v0 * Math.sin(2 * rad)) / g
    const diff = R - targetX
    const sin2 = Math.sin(2 * rad)

    let message = ''
    let tip = ''
    let strategy = ''

    if (Math.abs(diff) < 2) {
      message = '✅ المدى قريب جداً من الهدف!'
      tip = 'أطلق وشاهد النتيجة.'
      strategy = 'جاهز للتجربة!'
    } else if (diff > 0) {
      // Reaches too far
      message = '⚠️ المقذوف سيصل أبعد من الهدف.'
      if (angleDeg > 45) {
        tip = '💡 الزاوية > 45°: قلّل الزاوية قليلاً (تقليل sin(2θ) يقلل المدى).'
        strategy = 'أقرب زاوية إلى 45° = أقصى مدى.'
      } else if (angleDeg < 45) {
        tip = '💡 الزاوية < 45°: يمكنك قلّل v₀ أو زيادة الزاوية قليلاً نحو 45°.'
        strategy = 'جرب تقليل السرعة أولاً.'
      } else {
        tip = '💡 الزاوية = 45° (أقصى مدى): قلّل السرعة فقط.'
        strategy = 'v₀ مباشرةً تتحكم بالمدى عند 45°.'
      }
    } else {
      // Falls short
      message = '⚠️ المقذوف لن يصل للهدف.'
      if (angleDeg < 45) {
        tip = '💡 الزاوية < 45°: زد الزاوية نحو 45° (يزيد sin(2θ) وبالتالي المدى).'
        strategy = 'كلما اقتربت من 45° → مدى أكبر.'
      } else if (angleDeg > 45) {
        tip = '💡 الزاوية > 45°: قلّل الزاوية نحو 45° أو زِد السرعة.'
        strategy = '45° تعطي أقصى مدى لمسرعة معينة.'
      } else {
        tip = '💡 الزاوية = 45° (أقصى مدى): يجب زيادة السرعة فقط.'
        strategy = 'عند 45°: المدى ∝ v₀² → زيادة بسيطة في v₀ تكفي.'
      }
    }

    return {
      equation: `R = v₀² · sin(2×${angleDeg}°) / g = ${R.toFixed(1)}m`,
      targetX: targetX.toFixed(1),
      sin2theta: `sin(2×${angleDeg}°) = ${sin2.toFixed(3)}`,
      message,
      tip,
      strategy,
    }
  }

  function checkStudentGuess(studentV0: number, studentAngle: number, g: number, targetX: number) {
    const rad = (studentAngle * Math.PI) / 180
    const R = (studentV0 * studentV0 * Math.sin(2 * rad)) / g
    const diff = R - targetX
    if (Math.abs(diff) < 2) return '✅ ممتاز! تحقق الآن بالإطلاق.'
    if (diff > 0) {
      if (studentAngle > 45) return `⚠️ سيصل أبعد. قلّل الزاوية نحو 45°.`
      return `⚠️ سيصل أبعد. قلّل السرعة.`
    }
    if (studentAngle < 45) return `⚠️ أقصر. زِد الزاوية نحو 45° أو زِد السرعة.`
    return `⚠️ أقصر. زِد السرعة.`
  }

  return { getHint, checkStudentGuess }
}
