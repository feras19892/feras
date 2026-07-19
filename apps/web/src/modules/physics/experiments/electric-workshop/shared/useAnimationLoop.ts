import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import type { useWorkshop } from './useWorkshop'

type Workshop = ReturnType<typeof useWorkshop>

export function useAnimationLoop(
  workshop: Workshop,
  redraw: () => void,
  runStartTime: Ref<number>,
  animTime?: Ref<number>,
) {
  const elapsedSeconds = ref(0)
  let animFrame = 0

  const energyKWh = computed(() => {
    if (!workshop.running.value || elapsedSeconds.value === 0) return 0
    const hours = elapsedSeconds.value / 3600
    return workshop.totalPower.value * hours / 1000
  })

  function animLoop() {
    if (workshop.running.value) {
      if (animTime) animTime.value = Date.now() / 1000
      redraw()
      elapsedSeconds.value = Math.floor((Date.now() - runStartTime.value) / 1000)
    }
    animFrame = requestAnimationFrame(animLoop)
  }

  function toggleRun() {
    if (workshop.running.value) {
      workshop.stop()
      elapsedSeconds.value = 0
    } else {
      workshop.run()
      runStartTime.value = Date.now()
    }
    redraw()
  }

  onMounted(() => { animLoop() })
  onUnmounted(() => { cancelAnimationFrame(animFrame) })

  return { elapsedSeconds, energyKWh, toggleRun }
}
