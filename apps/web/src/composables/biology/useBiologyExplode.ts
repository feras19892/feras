import { ref, computed } from 'vue';

export function useBiologyExplode() {
  const targetProgress = ref(0);
  const currentProgress = ref(0);
  let animationId = 0;

  const isExploded = computed(() => targetProgress.value > 0.5);

  const animate = (): void => {
    const diff = targetProgress.value - currentProgress.value;
    if (Math.abs(diff) < 0.005) {
      currentProgress.value = targetProgress.value;
      return;
    }
    currentProgress.value += diff * 0.12;
    animationId = requestAnimationFrame(animate);
  };

  const toggle = (): void => {
    targetProgress.value = targetProgress.value > 0.5 ? 0 : 1;
    cancelAnimationFrame(animationId);
    animate();
  };

  const reset = (): void => {
    targetProgress.value = 0;
    cancelAnimationFrame(animationId);
    currentProgress.value = 0;
  };

  return {
    progress: currentProgress,
    isExploded,
    toggle,
    reset,
  };
}
