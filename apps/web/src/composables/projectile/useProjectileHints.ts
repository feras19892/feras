import { useI18n } from '../../composables/useI18n'

export function useProjectileHints() {
  const { t } = useI18n()

  function getHint(v0: number, angleDeg: number, g: number, targetX: number) {
    const rad = (angleDeg * Math.PI) / 180
    const R = (v0 * v0 * Math.sin(2 * rad)) / g
    const diff = R - targetX
    const sin2 = Math.sin(2 * rad)

    let message = ''
    let tip = ''
    let strategy = ''

    if (Math.abs(diff) < 2) {
      message = t('experiments.projHintRangeClose')
      tip = t('experiments.projHintLaunchAndSee')
      strategy = t('experiments.projHintReady')
    } else if (diff > 0) {
      // Reaches too far
      message = t('experiments.projHintTooFar')
      if (angleDeg > 45) {
        tip = t('experiments.projHintAngleGt45')
        strategy = t('experiments.projHintCloserTo45')
      } else if (angleDeg < 45) {
        tip = t('experiments.projHintAngleLt45')
        strategy = t('experiments.projHintTryReduceSpeed')
      } else {
        tip = t('experiments.projHintAngle45ReduceSpeed')
        strategy = t('experiments.projHintV0ControlsRange')
      }
    } else {
      // Falls short
      message = t('experiments.projHintWontReach')
      if (angleDeg < 45) {
        tip = t('experiments.projHintAngleLt45Increase')
        strategy = t('experiments.projHintCloserTo45MoreRange')
      } else if (angleDeg > 45) {
        tip = t('experiments.projHintAngleGt45OrSpeed')
        strategy = t('experiments.projHint45MaxRangeForSpeed')
      } else {
        tip = t('experiments.projHintAngle45NeedSpeed')
        strategy = t('experiments.projHintSmallV0Increase')
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
    if (Math.abs(diff) < 2) return t('experiments.projHintExcellent')
    if (diff > 0) {
      if (studentAngle > 45) return t('experiments.projHintTooFarReduceAngle')
      return t('experiments.projHintTooFarReduceSpeed')
    }
    if (studentAngle < 45) return t('experiments.projHintTooShortIncreaseAngle')
    return t('experiments.projHintTooShortIncreaseSpeed')
  }

  return { getHint, checkStudentGuess }
}
